export interface User {
  id: string;
  email: string;
  name: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'optimization' | 'info';
}

export interface AppState {
  user: User | null;
  transactions: Transaction[];
  insights: AiInsight[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
}
