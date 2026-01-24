
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Agent } from "../types.ts";
import { buildSystemInstruction } from "../utils/promptBuilder.ts";
import { getSafetyWarning } from "../utils/safetyCheck.ts";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing with process.env.API_KEY directly as per guidelines.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *streamMessage(
    agent: Agent,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    message: string
  ) {
    const instruction = buildSystemInstruction(agent);
    const safetyWarning = getSafetyWarning(message);

    if (safetyWarning) {
      yield safetyWarning + "\n\n";
    }

    try {
      const result = await this.ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: instruction,
          temperature: 0.7,
        },
      });

      for await (const chunk of result) {
        // Correctly accessing the .text property from GenerateContentResponse.
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      yield "Došlo k chybě při streamování odpovědi. Zkontrolujte prosím připojení.";
    }
  }

  // Původní metoda ponechána pro zpětnou kompatibilitu pokud by byla potřeba jinde
  async sendMessage(
    agent: Agent,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    const instruction = buildSystemInstruction(agent);
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
      },
    });
    // Accessing .text property instead of a method.
    return response.text || "";
  }
}

export const gemini = new GeminiService();
