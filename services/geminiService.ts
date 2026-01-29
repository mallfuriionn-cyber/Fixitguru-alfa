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

// Hierarchie jader pro zajištění kontinuity služby při vyčerpání kvót (429)
const MODEL_LADDER = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

export class GeminiService {
  /**
   * Identifikuje, zda jde o chybu vyčerpání kvóty (Rate Limit / Quota).
   */
  private isQuotaError(error: any): boolean {
    const msg = JSON.stringify(error).toLowerCase();
    const code = error?.status || error?.error?.code || error?.code;
    return (
      code === 429 || 
      msg.includes('429') || 
      msg.includes('quota') || 
      msg.includes('limit') || 
      msg.includes('exhausted') ||
      msg.includes('resource_exhausted')
    );
  }

  /**
   * Streamování zpráv s automatickou kaskádou při selhání primárního jádra.
   * Optimalizováno: Historie je omezena na posledních 20 zpráv pro výkon.
   */
  async *streamMessage(
    agent: Agent,
    history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: any }[] }[],
    currentParts: { text?: string; inlineData?: any }[],
    lang: Language,
    tools?: any[]
  ): AsyncGenerator<StreamChunk> {
    const instruction = buildSystemInstruction(agent, lang);
    const textContent = currentParts.map(p => p.text || '').join(' ');
    
    // Synthesis Safety Intercept
    const safetyWarning = getSafetyWarning(textContent);
    if (safetyWarning) {
      yield { text: safetyWarning + "\n\n" };
    }

    // Optimalizace: Pruning historie na posledních 20 záznamů
    const prunedHistory = history.slice(-20);

    // Pokus o doručení skrze hierarchii modelů (LADDER)
    for (let i = 0; i < MODEL_LADDER.length; i++) {
      const modelName = MODEL_LADDER[i];
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Google Search je dostupný pouze pro Pro modely
        const activeTools = modelName.includes('pro') ? tools : undefined;

        const result = await ai.models.generateContentStream({
          model: modelName,
          contents: [...prunedHistory, { role: 'user', parts: currentParts }],
          config: {
            systemInstruction: instruction,
            temperature: 0.7,
            tools: activeTools
          },
        });

        yield { activeModel: modelName };

        for await (const chunk of result) {
          const response = chunk as GenerateContentResponse;
          if (response.text) {
            yield { 
              text: response.text, 
              grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
            };
          }
        }
        
        return; 

      } catch (error: any) {
        console.warn(`Synthesis Core Cascade [Attempt ${i+1}/${MODEL_LADDER.length}]: ${modelName} failed. Reason: ${error.message}`);
        
        if (this.isQuotaError(error)) {
          if (i < MODEL_LADDER.length - 1) {
            const nextModel = MODEL_LADDER[i+1];
            const fallbackMsg = lang === 'cs' 
              ? `\n\n*⚠️ Jádro ${modelName.split('-')[1].toUpperCase()} dosáhlo limitu. Přepínám na záložní okruh ${nextModel.split('-')[1].toUpperCase()}...*\n\n`
              : `\n\n*⚠️ Core ${modelName.split('-')[1].toUpperCase()} limit reached. Cascading to ${nextModel.split('-')[1].toUpperCase()}...*\n\n`;
            yield { text: fallbackMsg };
            continue; 
          }
        }
        
        yield { 
          text: "\n\n❌ **Critical Synthesis Error**: Spojení s Jádrem bylo přerušeno. Zkuste to prosím za minutu.", 
          error: error.message 
        };
        return;
      }
    }
  }

  /**
   * Jednorázová zpráva s kaskádou.
   */
  async sendMessage(
    agent: Agent,
    history: any[],
    currentParts: any[],
    lang: Language
  ): Promise<{ text: string; activeModel: string }> {
    const instruction = buildSystemInstruction(agent, lang);
    const prunedHistory = history.slice(-20);
    
    for (const modelName of MODEL_LADDER) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [...prunedHistory, { role: 'user', parts: currentParts }],
          config: { 
            systemInstruction: instruction,
            temperature: 0.7 
          }
        });
        return { text: response.text || "", activeModel: modelName };
      } catch (error) {
        if (this.isQuotaError(error)) {
          console.warn(`Core Quota reached for ${modelName}, cascading...`);
          continue;
        }
        throw error;
      }
    }
    return { text: "Synthesis Core Failure: No engines available.", activeModel: "none" };
  }
}

export const gemini = new GeminiService();