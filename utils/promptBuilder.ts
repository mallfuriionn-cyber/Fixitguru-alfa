
import { Agent } from '../types';

/**
 * Skládá finální systémovou instrukci pro AI model.
 */
export const buildSystemInstruction = (agent: Agent): string => {
  const baseRules = `
    - Striktně česky.
    - Odpovídej v kontextu oprav a udržitelnosti.
    - Používej markdown pro formátování.
    - Pokud uživatel zmíní nebezpečné téma, zahrň varování.
  `;

  return `${agent.systemInstruction}\n\nGlobální pravidla Synthesis:\n${baseRules}`;
};
