import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, ChatMessage, AiInsight, Group, GroupExpense, GroupMember, ExpensePayment, ExpenseSplit } from '../types';
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  parseNaturalLanguageTransaction: (text: string) => Promise<any>;
  scanReceipt: (imageBase64: string) => Promise<any>;
  sendChatMessage: (text: string) => Promise<void>;
  clearChatHistory: () => Promise<void>;
  groups: Group[];
  fetchGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<void>;
  joinGroupByCode: (code: string) => Promise<void>;
  addGroupGuestMember: (groupId: string, name: string) => Promise<void>;
  addGroupMemberByEmail: (groupId: string, email: string) => Promise<void>;
  createGroupExpense: (groupId: string, description: string, totalAmount: number, category: string, payments: any[], splits: any[]) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
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
    }).catch((err) => {
      console.error("Failed to get session:", err);
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
        setGroups([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchChatHistory();
      fetchGroups();
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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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

  const parseNaturalLanguageTransaction = async (text: string): Promise<any> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { text }
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const scanReceipt = async (imageBase64: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: { imageBase64 }
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);
      return data;
    } catch (err: any) {
      throw err;
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
      
      if (aiErr) {
        if (aiErr.context) {
          try {
            const errData = await aiErr.context.json();
            throw new Error(errData.error || 'Failed to analyze request.');
          } catch (e) {
            // If response wasn't JSON
            if (e instanceof Error && e.message !== 'Failed to analyze request.') {
              throw e;
            }
            throw new Error('AI service returned an unexpected error.');
          }
        }
        throw aiErr;
      }

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

  const fetchGroups = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(*),
          expenses:group_expenses(*, payments:expense_payments(*), splits:expense_splits(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setGroups(data as unknown as Group[]);
    } catch (err) {
      console.error(err);
    }
  };

  const createGroup = async (name: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Call our robust Postgres RPC to generate the group with a unique room_code
      const { data: newGroupId, error: rpcErr } = await supabase
        .rpc('create_group_with_code', { group_name: name });
        
      if (rpcErr) throw rpcErr;
      if (!newGroupId) throw new Error('Failed to create group');

      const { error: memErr } = await supabase
        .from('group_members')
        .insert([{ 
          group_id: newGroupId, 
          user_id: user.id,
          member_name: user.name 
        }]);
        
      if (memErr) throw memErr;
      
      await fetchGroups();
      toast.success('Group created!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroupByCode = async (code: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const cleanCode = code.trim().toUpperCase();
      
      // Call the secure RPC function to bypass RLS and join the group
      const { error: joinErr } = await supabase.rpc('join_group_by_code', { join_code: cleanCode });

      if (joinErr) throw joinErr;

      await fetchGroups();
      toast.success('Joined group successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to join group');
    } finally {
      setIsLoading(false);
    }
  };

  const addGroupGuestMember = async (groupId: string, name: string) => {
    setIsLoading(true);
    try {
      // Generate a mock UUID for the offline friend
      const mockUserId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('group_members')
        .insert([{ 
          group_id: groupId, 
          user_id: mockUserId,
          member_name: name
        }]);
        
      if (error) throw error;
      
      await fetchGroups();
      toast.success(`${name} added to the group!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const addGroupMemberByEmail = async (groupId: string, email: string) => {
    setIsLoading(true);
    try {
      // 1. Search for the user by email in the public profiles table
      const { data: profile, error: searchErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', email)
        .single();
        
      if (searchErr || !profile) {
        throw new Error('User not found. Make sure they have registered an account.');
      }

      // 2. Check if they are already in the group
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', profile.id)
        .maybeSingle();
        
      if (existing) {
        throw new Error('User is already a member of this group.');
      }

      // 3. Insert their real user ID into group_members
      const { error: insertErr } = await supabase
        .from('group_members')
        .insert([{ 
          group_id: groupId, 
          user_id: profile.id,
          member_name: profile.full_name || email.split('@')[0]
        }]);
        
      if (insertErr) throw insertErr;
      
      await fetchGroups();
      toast.success(`${profile.full_name || email} added to the group!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const createGroupExpense = async (groupId: string, description: string, totalAmount: number, category: string, payments: any[], splits: any[]) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: expense, error: expErr } = await supabase
        .from('group_expenses')
        .insert([{ group_id: groupId, creator_id: user.id, description, total_amount: totalAmount, category }])
        .select()
        .single();
        
      if (expErr) throw expErr;

      const paymentsWithExp = payments.map(p => ({ ...p, expense_id: expense.id }));
      const { error: payErr } = await supabase.from('expense_payments').insert(paymentsWithExp);
      if (payErr) throw payErr;

      const splitsWithExp = splits.map(s => ({ ...s, expense_id: expense.id }));
      const { error: splitErr } = await supabase.from('expense_splits').insert(splitsWithExp);
      if (splitErr) throw splitErr;

      await fetchGroups();
      toast.success('Expense added!');
    } catch (err: any) {
      toast.error('Failed to add group expense');
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
        loginWithGoogle,
        logout,
        addTransaction,
        deleteTransaction,
        parseNaturalLanguageTransaction,
        scanReceipt,
        sendChatMessage,
        clearChatHistory,
        groups,
        fetchGroups,
        createGroup,
        joinGroupByCode,
        addGroupGuestMember,
        addGroupMemberByEmail,
        createGroupExpense,
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
