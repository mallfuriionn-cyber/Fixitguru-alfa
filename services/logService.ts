
export interface LogEntry {
  id: number;
  timestamp: string;
  userRequest: string;
  implementation: string;
  filesChanged: string[];
}

export const fetchLogs = async (): Promise<LogEntry[]> => {
  // V reálném prostředí by zde byl fetch('/technical-log.json')
  // Pro účely této ukázky vracíme statická data, která by se jinak měnila s každou iterací.
  try {
    const response = await fetch('./technical-log.json');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
};
