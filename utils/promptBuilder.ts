
import { Agent } from '../types';
import { getBrowserLanguage, getFullLanguageName } from './locale.ts';

/**
 * Skládá finální systémovou instrukci pro AI model s ohledem na lokalitu.
 */
export const buildSystemInstruction = (agent: Agent): string => {
  const locale = getBrowserLanguage();
  const langName = getFullLanguageName(locale);

  const baseRules = `
    - ALWAYS respond in the user's preferred language: ${langName}.
    - If the user uses a different language in the prompt, adapt and respond in that language.
    - Context: Maintenance, sustainability, high-end engineering, and circular economy.
    - Tone: Professional, expert, precise.
    - Formatting: Use markdown (bold, lists, code blocks).
    - Safety: If the topic involves danger (electricity, high pressure), include a prominent warning.
  `;

  return `${agent.systemInstruction}\n\nGlobal Synthesis Rules:\n${baseRules}`;
};
