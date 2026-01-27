
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Agent, Language } from "../types.ts";
import { buildSystemInstruction } from "../utils/promptBuilder.ts";
import { getSafetyWarning } from "../utils/safetyCheck.ts";

export interface StreamChunk {
  text?: string;
  grounding?: any[];
  activeModel?: string;
  error?: string;
}

const MODEL_LADDER = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

export class GeminiService {
  private isQuotaError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || "";
    const code = error?.status || error?.error?.code || error?.code;
    return code === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('limit') || msg.includes('exhausted');
  }

  async *streamMessage(
    agent: Agent,
    history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: any }[] }[],
    currentParts: { text?: string; inlineData?: any }[],
    lang: Language,
    tools?: any[]
  ): AsyncGenerator<StreamChunk> {
    const instruction = buildSystemInstruction(agent, lang);
    const textContent = currentParts.map(p => p.text || '').join(' ');
    const safetyWarning = getSafetyWarning(textContent);

    if (safetyWarning) {
      yield { text: safetyWarning + "\n\n" };
    }

    let retryAttempt = 0;
    
    for (const modelName of MODEL_LADDER) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const activeTools = modelName.includes('pro') ? tools : undefined;

        const result = await ai.models.generateContentStream({
          model: modelName,
          contents: [...history, { role: 'user', parts: currentParts }],
          config: {
            systemInstruction: instruction,
            temperature: 0.7,
            tools: activeTools
          },
        });

        // Pokud jsme se dostali sem, model odpověděl (zatím aspoň zahájil stream)
        yield { activeModel: modelName };

        for await (const chunk of result) {
          yield { 
            text: chunk.text, 
            grounding: chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
          };
        }
        return; // Úspěšně dokončeno
      } catch (error: any) {
        console.error(`Kernel Error [${modelName}]:`, error);
        
        if (this.isQuotaError(error)) {
          const fallbackMsg = lang === 'cs' 
            ? `\n\n*⚠️ Jádro ${modelName.split('-')[1].toUpperCase()} dosáhlo limitu. Přepínám okruh...*\n\n`
            : `\n\n*⚠️ Core ${modelName.split('-')[1].toUpperCase()} limit reached. Cascading to backup...*\n\n`;
          yield { text: fallbackMsg };
          continue; // Zkusíme další model v žebříčku
        }
        
        // Pokud je to jiná chyba (např. 500), zkusíme to taky přes fallback, ale jen jednou
        if (retryAttempt < 1) {
          retryAttempt++;
          continue;
        }

        yield { text: "\n\n❌ **Critical Synthesis Error**: Spojení s Jádrem bylo přerušeno. Zkuste to prosím později.", error: error.message };
        return;
      }
    }
  }

  async sendMessage(
    agent: Agent,
    history: any[],
    currentParts: any[],
    lang: Language
  ): Promise<{ text: string; activeModel: string }> {
    const instruction = buildSystemInstruction(agent, lang);
    for (const modelName of MODEL_LADDER) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [...history, { role: 'user', parts: currentParts }],
          config: { systemInstruction: instruction }
        });
        return { text: response.text || "", activeModel: modelName };
      } catch (error) {
        if (this.isQuotaError(error)) continue;
        throw error;
      }
    }
    return { text: "Error: No available core", activeModel: "none" };
  }
}

export const gemini = new GeminiService();
