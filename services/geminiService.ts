
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Agent } from "../types";
import { buildSystemInstruction } from "../utils/promptBuilder";
import { getSafetyWarning } from "../utils/safetyCheck";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(
    agent: Agent,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    try {
      const instruction = buildSystemInstruction(agent);
      const safetyWarning = getSafetyWarning(message);

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: instruction,
          temperature: 0.7,
        },
      });

      let responseText = response.text || "Omlouvám se, ale nepodařilo se mi vygenerovat odpověď.";
      
      // Pokud máme bezpečnostní varování a model ho nezahrnul (heuristika), přidáme ho na začátek.
      if (safetyWarning && !responseText.includes("⚠️")) {
        responseText = `${safetyWarning}\n\n${responseText}`;
      }

      return responseText;
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
         return "Chyba: API klíč nebyl nalezen nebo je neplatný. Zkontrolujte nastavení.";
      }
      return "Došlo k chybě při komunikaci s AI modulem FixIt Guru.";
    }
  }
}

export const gemini = new GeminiService();
