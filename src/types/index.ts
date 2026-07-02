export interface User {
  id: string;
  email: string;
  name: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at?: string;
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

export interface Group {
  id: string;
  name: string;
  room_code?: string;
  created_at?: string;
  members?: GroupMember[];
  expenses?: GroupExpense[];
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at?: string;
  member_name?: string;
  user?: User;
}

export interface GroupExpense {
  id: string;
  group_id: string;
  creator_id: string;
  description: string;
  total_amount: number; // in cents
  date: string;
  category?: string;
  payments?: ExpensePayment[];
  splits?: ExpenseSplit[];
}

export interface ExpensePayment {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number; // in cents
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  type: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  amount: number; // in cents
  split_value?: number;
}

export interface Settlement {
  debtor: string;
  creditor: string;
  amount: number; // in cents
}
