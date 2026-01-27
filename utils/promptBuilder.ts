
import { Agent, Language } from '../types';
import { getFullLanguageName } from './locale.ts';

export const buildSystemInstruction = (agent: Agent, lang: Language): string => {
  const langName = getFullLanguageName(lang);

  const baseRules = `
    - ALWAYS respond in the user's preferred language: ${langName}.
    - If the user switches language mid-conversation, follow their lead but stay professional.
    - Context: Household repairs, electronics, mechanical work, sustainability, and circular economy.
    - Tone: Helpful, expert, friendly. Accessible for non-technical users but accurate for professionals.
    - Formatting: Use markdown (bold, lists, code blocks).
    - Safety: Always prioritize safety advice when dealing with high voltage or dangerous tools.
  `;

  return `${agent.systemInstruction[lang]}\n\nGlobal System Rules:\n${baseRules}`;
};
