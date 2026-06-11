import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, ChatMessage, AiInsight } from '../types';

interface AppContextProps {
  user: User | null;
  transactions: Transaction[];
  insights: AiInsight[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  parseNaturalLanguageTransaction: (text: string) => Promise<Omit<Transaction, 'id'>>;
  sendChatMessage: (text: string) => Promise<void>;
  clearChatHistory: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Generate relative dates based on current date (2026-06-09)
const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'chat-wel',
    sender: 'ai',
    text: `Hello! I'm your AI Financial Assistant. I can help you understand your spending habits, analyze your cash flow, or record your expenses using natural language. Try typing: "Spent 45 dollars on petrol today" or "Show me my budget stats". How can I guide you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ai_exp_transactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ai_exp_chathistory_v2');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_HISTORY;
  });
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ai_exp_user_v2');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ai_exp_transactions_v2', JSON.stringify(transactions));
    recalculateInsights(transactions);
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ai_exp_chathistory_v2', JSON.stringify(chatHistory));
  }, [chatHistory]);

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
        description: `Your restaurant and coffee expenditures sum up to $${totalDining.toFixed(2)} list-wide. Consolidating your coffee runs could save you up to $45/month.`,
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
        description: `You are spending $${totalSubs.toFixed(2)} on active subscriptions. Consider auditing Netflix/Spotify to cancel any inactive services.`,
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
        description: `Stellar work! Your current net savings rate is ${savingsPercentage.toFixed(1)}% ($${netSavings.toFixed(2)}), which is well above the recommended 20% benchmark.`,
        type: 'info',
      });
    } else if (savingsPercentage > 0) {
      freshInsights.push({
        id: 'ins-savings',
        title: 'Savings Optimization Recommended',
        description: `Your savings rate is ${savingsPercentage.toFixed(1)}% ($${netSavings.toFixed(2)}). Trimming utilities or random retail expenses could push you towards the standard 20% healthy target.`,
        type: 'optimization',
      });
    } else {
      freshInsights.push({
        id: 'ins-savings',
        title: 'Overspending Alert',
        description: `Your expenses currently exceed or equal your total recognized income of $${totalIncome}. We recommend establishing a strict $100 emergency spending buffer immediately.`,
        type: 'warning',
      });
    }

    setInsights(freshInsights);
  };

  const login = async (email: string, name?: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const normalizedName = name || email.split('@')[0];
    const loggedUser: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      name: normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1),
    };
    setUser(loggedUser);
    localStorage.setItem('ai_exp_user_v2', JSON.stringify(loggedUser));
    setIsLoading(false);
  };

  const signup = async (email: string, name: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const registeredUser: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      name: name,
    };
    setUser(registeredUser);
    localStorage.setItem('ai_exp_user_v2', JSON.stringify(registeredUser));
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser(null);
    localStorage.removeItem('ai_exp_user_v2');
    setIsLoading(false);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTx, ...prev]);
    setIsLoading(false);
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsLoading(false);
  };

  const parseNaturalLanguageTransaction = async (text: string): Promise<Omit<Transaction, 'id'>> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    
    const lower = text.toLowerCase();
    
    // 1. Detect Type (Income vs Expense)
    let type: 'income' | 'expense' = 'expense';
    const incomeKeywords = ['earned', 'received', 'salary', 'income', 'won', 'refund', 'paycheck', 'bonus', 'sold'];
    if (incomeKeywords.some(keyword => lower.includes(keyword))) {
      type = 'income';
    }

    // 2. Parse Amount
    let amount = 0;
    // Matches expressions like: "$45", "45.00", "45 dollars", "spent 23.5"
    const amountRegex = /(?:\$)?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks|usd|e)?/i;
    const matchAmount = text.match(/\$?([0-9]+(?:\.[0-9]{2})?)/) || text.match(/([0-9]+)\s*(?:dollars|bucks|spent|received)/i);
    if (matchAmount) {
      amount = parseFloat(matchAmount[1]);
    } else {
      // General digit extraction fallback
      const digits = text.match(/\d+(?:\.\d{1,2})?/);
      if (digits) {
        amount = parseFloat(digits[0]);
      }
    }
    if (isNaN(amount) || amount === 0) {
      amount = 25.00; // fallback default
    }

    // 3. Parse Category
    let category = type === 'income' ? 'Salary' : 'Others';
    const categoriesMapping: { [key: string]: string[] } = {
      'Groceries': ['grocery', 'groceries', 'supermarket', 'food', 'target', 'whole foods', 'trader joe', 'walmart', 'kroger', 'safeway', 'eat'],
      'Dining Out': ['starbucks', 'coffee', 'cafe', 'restaurant', 'mcdonald', 'burger', 'pizza', 'sushi', 'lunch', 'dinner', 'breakfast', 'subway', 'bar'],
      'Utilities': ['utility', 'utilities', 'electric', 'gas', 'water', 'internet', 'comcast', 'wifi', 'power', 'heating'],
      'Transport': ['uber', 'lyft', 'taxi', 'ride', 'gas', 'petrol', 'train', 'ticket', 'flight', 'airplane', 'subway', 'station', 'bus'],
      'Subscriptions': ['netflix', 'spotify', 'hulu', 'disney', 'youtube', 'gym', 'membership', 'cloud', 'aws', 'github', 'saas', 'recurrent'],
      'Entertainment': ['movie', 'cinema', 'game', 'xbox', 'playstation', 'steam', 'concert', 'museum', 'bowling', 'party', 'beer', 'club'],
      'Housing': ['rent', 'mortgage', 'landlord', 'apartment', 'housing', 'property'],
      'Shopping': ['clothes', 'amazon', 'shoes', 'apparel', 'mall', 'jacket', 'gadget', 'toy'],
      'Salary': ['salary', 'paycheck', 'wages', 'compensation'],
      'Freelance': ['freelance', 'contract', 'gigs', 'consulting', 'upwork', 'fiverr'],
    };

    for (const [catName, keywords] of Object.entries(categoriesMapping)) {
      if (keywords.some(kw => lower.includes(kw))) {
        category = catName;
        break;
      }
    }

    // 4. Parse Date
    let date = new Date().toISOString().split('T')[0];
    if (lower.includes('yesterday')) {
      const yes = new Date();
      yes.setDate(yes.getDate() - 1);
      date = yes.toISOString().split('T')[0];
    } else if (lower.includes('day before yesterday') || lower.includes('2 days ago')) {
      const other = new Date();
      other.setDate(other.getDate() - 2);
      date = other.toISOString().split('T')[0];
    }

    // 5. Build Title
    let title = '';
    // Strip out numbers, dollar signs and standard words to find merchant or activity
    const cleanWords = text
      .replace(/\$?([0-9]+(?:\.[0-9]{2})?)/g, '')
      .replace(/\d+(?:\.\d{1,2})?/g, '')
      .replace(/(spent|received|for|at|on|yesterday|today|dollars|bucks|usd)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanWords.length > 2) {
      // Capitalize first letters
      title = cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1);
    } else {
      title = type === 'income' ? 'Income Transaction' : `${category} Purchase`;
    }

    setIsLoading(false);
    return {
      title,
      amount,
      type,
      category,
      date,
    };
  };

  const sendChatMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: 'chat-' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMessage]);

    // Simulated AI response after typing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowercaseText = text.toLowerCase();
    let aiResponseText = '';

    // Calculate dynamic state context for intelligent answers
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = income.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalEarned - totalSpent;

    // Spending by Category
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    let highestCat = 'None';
    let highestAmt = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestAmt) {
        highestAmt = amt;
        highestCat = cat;
      }
    });

    if (lowercaseText.includes('how much') && (lowercaseText.includes('spent') || lowercaseText.includes('spend'))) {
      if (lowercaseText.includes('groceries') || lowercaseText.includes('grocery')) {
        const grocAmt = categoryTotals['Groceries'] || 0;
        aiResponseText = `You have spent **$${grocAmt.toFixed(2)}** on Groceries from your recorded history. That represents **${((grocAmt / (totalSpent || 1)) * 100).toFixed(1)}%** of your total expenses. Consider grocery planning to optimize this further!`;
      } else if (lowercaseText.includes('coffee') || lowercaseText.includes('dining')) {
        const diningAmt = categoryTotals['Dining Out'] || 0;
        aiResponseText = `Your Dining Out & Coffee expenditures sum up to **$${diningAmt.toFixed(2)}**. Eating out frequently could silently leak dollars; bringing lunches twice a week could save around $80/month.`;
      } else if (lowercaseText.includes('subscriptions') || lowercaseText.includes('netflix') || lowercaseText.includes('spotify')) {
        const subAmt = categoryTotals['Subscriptions'] || 0;
        aiResponseText = `Your active subscriptions total **$${subAmt.toFixed(2)}**. Make sure to verify if you use all of them regularly to avoid paying for dormant channels!`;
      } else {
        aiResponseText = `You have recorded total expenses of **$${totalSpent.toFixed(2)}** out of total earnings of **$${totalEarned.toFixed(2)}**. Your remaining spending budget is **$${balance.toFixed(2)}**.`;
      }
    } else if (lowercaseText.includes('salary') || lowercaseText.includes('income') || lowercaseText.includes('earn')) {
      aiResponseText = `Your total registered income is **$${totalEarned.toFixed(2)}**, with **$${(income.find(i => i.category === 'Salary')?.amount || 0).toFixed(2)}** coming from your main salary.`;
    } else if (lowercaseText.includes('goal') || lowercaseText.includes('track') || lowercaseText.includes('save') || lowercaseText.includes('savings')) {
      const rate = totalEarned > 0 ? (balance / totalEarned) * 100 : 0;
      if (rate > 20) {
        aiResponseText = `You're doing fantastic! You have saved **$${balance.toFixed(2)}** this period, which is a **${rate.toFixed(1)}%** savings rate. You are well on track for your long-term goals.`;
      } else if (rate > 0) {
        aiResponseText = `You have saved **$${balance.toFixed(2)}** (**${rate.toFixed(1)}%** of income). You're above water, but to reach the optimal 20% savings threshold, try cutting down on your highest expense category, which is **${highestCat}** ($${highestAmt.toFixed(2)}).`;
      } else {
        aiResponseText = `Warning: Your current savings rate is negative (**${rate.toFixed(1)}%**). You are spending more than you earn! Let's pause discretionary spending on things like **${highestCat}** ($${highestAmt.toFixed(2)}) and create an emergency safety budget.`;
      }
    } else if (lowercaseText.includes('highest') || lowercaseText.includes('most spent') || lowercaseText.includes('category')) {
      aiResponseText = `Your primary source of expenses is **${highestCat}**, where you have spent **$${highestAmt.toFixed(2)}**. Let's review if we can optimize any of these entries!`;
    } else if (lowercaseText.startsWith('spent ') || lowercaseText.includes('bought ') || lowercaseText.includes('paid ')) {
      // Natural language add directly via chatbot!
      const parsed = await parseNaturalLanguageTransaction(text);
      const newTx: Transaction = {
        ...parsed,
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
      };
      setTransactions(prev => [newTx, ...prev]);
      aiResponseText = `Perfect! I've automatically compiled that info and recorded it: **"${newTx.title}"** as a **$${newTx.amount.toFixed(2)}** ${newTx.type} in the **${newTx.category}** category. I've updated your metrics!`;
    } else if (lowercaseText.includes('hello') || lowercaseText.includes('hi') || lowercaseText.includes('hey')) {
      aiResponseText = `Hello there! Ready to whip your finances into shape? Ask me details like "How much did I spend this month?" or record a purchase by stating: "Spent $15 at Starbucks yesterday".`;
    } else {
      // Intelligent general response
      aiResponseText = `Based on your database of **${transactions.length} transactions**, your current health score is solid, but we noticed you've spent **$${(categoryTotals['Dining Out'] || 0).toFixed(2)}** on dining outings and **$${(categoryTotals['Subscriptions'] || 0).toFixed(2)}** on monthly memberships. Is there a specific financial goal or category you want to map out today?`;
    }

    const aiMessage: ChatMessage = {
      id: 'chat-' + Math.random().toString(36).substr(2, 9),
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, aiMessage]);
  };

  const clearChatHistory = () => {
    setChatHistory([
      {
        id: 'chat-wel-' + Date.now(),
        sender: 'ai',
        text: `Hello! Chat log has been cleared. I am ready to assist you again. What financial topics or logs can I help you compile today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
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
