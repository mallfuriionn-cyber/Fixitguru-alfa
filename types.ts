
export enum AgentId {
  KAJA = 'kaja',
  LUCKA = 'lucka',
  DASA = 'dasa',
  FRANTA = 'franta'
}

export interface Agent {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  icon: string;
  systemInstruction: string;
  color: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppState {
  currentAgent: Agent | null;
  history: Message[];
  isMenuOpen: boolean;
  activeModal: string | null;
}
