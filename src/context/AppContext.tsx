import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, ChatMessage, AiInsight } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AppContextProps {
  user: User | null;
  transactions: Transaction[];
  insights: AiInsight[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  parseNaturalLanguageTransaction: (text: string) => Promise<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
  sendChatMessage: (text: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || 'User',
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || 'User',
        });
      } else {
        setUser(null);
        setTransactions([]);
        setChatHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchChatHistory();
    }
  }, [user]);

  // Recalculate insights when transactions change
  useEffect(() => {
    recalculateInsights(transactions);
  }, [transactions]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transactions.');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        if (data.length === 0) {
          // Provide welcome message if empty
          setChatHistory([{
            id: 'welcome-msg',
            user_id: user?.id || '',
            role: 'ai',
            content: `Hello! I'm your AI Financial Assistant. I can help you understand your spending habits, analyze your cash flow, or record your expenses using natural language. Try typing: "Spent 45 dollars on petrol today" or "Show me my budget stats".`,
          }]);
        } else {
          setChatHistory(data);
        }
      }
    } catch (err) {
      toast.error('Failed to load chat history.');
    }
  };

  const recalculateInsights = (txList: Transaction[]) => {
    const freshInsights: AiInsight[] = [];
    const expenses = txList.filter(t => t.type === 'expense');
    
    // Insight 1: Dining Out Warning/Insight
    const diningOut = expenses.filter(t => t.category === 'Dining Out');
    const totalDining = diningOut.reduce((sum, t) => sum + t.amount, 0);
    if (totalDining > 100) {
      freshInsights.push({
        id: 'ins-dining',
        title: 'Dining Out Outliers Detected',
        description: `Your restaurant and coffee expenditures sum up to ₹${totalDining.toFixed(2)} list-wide. Consolidating your coffee runs could save you up to ₹45/month.`,
        type: 'warning',
      });
    }

    // Insight 2: Subscriptions Optimization
    const subs = expenses.filter(t => t.category === 'Subscriptions');
    const totalSubs = subs.reduce((sum, t) => sum + t.amount, 0);
    if (totalSubs > 50) {
      freshInsights.push({
        id: 'ins-subs',
        title: 'Subscription Audit Suggested',
        description: `You are spending ₹${totalSubs.toFixed(2)} on active subscriptions. Consider auditing Netflix/Spotify to cancel any inactive services.`,
        type: 'optimization',
      });
    } else {
      freshInsights.push({
        id: 'ins-subs-good',
        title: 'Subscription Control',
        description: 'Excellent subscription discipline! Your recurrent digital service spending represents less than 2% of budget.',
        type: 'info',
      });
    }

    // Insight 3: General Savings Rate
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsPercentage = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    if (savingsPercentage > 25) {
      freshInsights.push({
        id: 'ins-savings',
        title: 'Healthy Savings Rate',
        description: `Stellar work! Your current net savings rate is ${savingsPercentage.toFixed(1)}% (₹${netSavings.toFixed(2)}), which is well above the recommended 20% benchmark.`,
        type: 'info',
      });
    } else if (savingsPercentage > 0) {
      freshInsights.push({
        id: 'ins-savings',
        title: 'Savings Optimization Recommended',
        description: `Your savings rate is ${savingsPercentage.toFixed(1)}% (₹${netSavings.toFixed(2)}). Trimming utilities or random retail expenses could push you towards the standard 20% healthy target.`,
        type: 'optimization',
      });
    } else {
      freshInsights.push({
        id: 'ins-savings',
        title: 'Overspending Alert',
        description: `Your expenses currently exceed or equal your total recognized income of ₹${totalIncome.toFixed(2)}. We recommend establishing a strict ₹100 emergency spending buffer immediately.`,
        type: 'warning',
      });
    }

    setInsights(freshInsights);
  };

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error("Password is required for Supabase Auth.");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string, password?: string) => {
    if (!password) throw new Error("Password is required for Supabase Auth.");
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...tx, user_id: user.id }])
        .select()
        .single();
        
      if (error) throw error;
      if (data) {
        setTransactions(prev => [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const parseNaturalLanguageTransaction = async (text: string): Promise<Omit<Transaction, 'id' | 'user_id' | 'created_at'>> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { text }
      });
      if (error) throw error;
      return data; // Returns the parsed JSON from the edge function
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!user) return;
    
    // 1. Optimistic UI update & DB Insert for User Message
    const userMessage = {
      user_id: user.id,
      role: 'user' as const,
      content: text,
    };
    
    try {
      const { data: savedUserMsg, error: userMsgErr } = await supabase
        .from('chat_messages')
        .insert([userMessage])
        .select()
        .single();
        
      if (userMsgErr) throw userMsgErr;
      
      setChatHistory(prev => [...prev, savedUserMsg]);

      // 2. Call Edge Function to get AI response
      const { data: aiResponseData, error: aiErr } = await supabase.functions.invoke('ai-financial-assistant', {
        body: { prompt: text, transactions }
      });
      
      if (aiErr) throw aiErr;

      // 3. Insert AI response into DB
      const aiMessage = {
        user_id: user.id,
        role: 'ai' as const,
        content: aiResponseData?.text || 'I encountered an error analyzing your request.',
      };

      const { data: savedAiMsg, error: aiInsertErr } = await supabase
        .from('chat_messages')
        .insert([aiMessage])
        .select()
        .single();

      if (aiInsertErr) throw aiInsertErr;
      
      setChatHistory(prev => [...prev, savedAiMsg]);

    } catch (error) {
      console.error(error);
      throw error; // Let the UI catch and toast
    }
  };

  const clearChatHistory = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      setChatHistory([{
        id: 'welcome-msg',
        user_id: user.id,
        role: 'ai',
        content: `Hello! Chat log has been cleared. I am ready to assist you again.`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        insights,
        chatHistory,
        isLoading,
        login,
        signup,
        logout,
        addTransaction,
        deleteTransaction,
        parseNaturalLanguageTransaction,
        sendChatMessage,
        clearChatHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
