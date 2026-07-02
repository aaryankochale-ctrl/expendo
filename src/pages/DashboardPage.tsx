import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const DashboardPage: React.FC<{ setCurrentPage: (p: 'dashboard' | 'transactions' | 'ai-assistant') => void }> = ({ setCurrentPage }) => {
  const { transactions, insights, user } = useApp();

  // 1. Calculate General Metric Summaries
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const totalSavings = netBalance > 0 ? netBalance : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // 2. Generate Pie Chart (Expenses by Category)
  const categoryTotals: { [key: string]: number } = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  const COLORS = {
    'Housing': '#6366f1', // Indigo
    'Groceries': '#10b981', // Emerald
    'Dining Out': '#f43f5e', // Rose
    'Utilities': '#f59e0b', // Amber
    'Transport': '#06b6d4', // Cyan
    'Subscriptions': '#8b5cf6', // Violet
    'Entertainment': '#ec4899', // Pink
    'Shopping': '#14b8a6', // Teal
    'Others': '#64748b', // Slate
  };

  const getCategoryColor = (cat: string) => {
    return COLORS[cat as keyof typeof COLORS] || '#64748b';
  };

  // 3. Generate Area Chart (Trends - Grouped by past 7 days of dates)
  // Let's create an array of last 7 calendar days relative to today
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    // Format label (e.g. "Jun 05")
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Calculate sum of income and expenses on this specific date
    const incSum = transactions
      .filter(t => t.type === 'income' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const expSum = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      date: label,
      Income: parseFloat(incSum.toFixed(2)),
      Spending: parseFloat(expSum.toFixed(2)),
    };
  });

  // Calculate top spending category
  let topCategoryName = 'N/A';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > topCategoryAmount) {
      topCategoryAmount = val;
      topCategoryName = cat;
    }
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Hi, {user?.name || 'User'} 👋
          </h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            Spend wisely, invest early. Here is your AI automated budget diagnostics log.
          </p>
        </div>
        
        <button
          onClick={() => setCurrentPage('transactions')}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-sm rounded-xl cursor-pointer flex items-center gap-2  self-start md:self-auto transition-colors"
        >
          <Receipt className="w-4 h-4 text-white" />
          Add Transaction
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500 block tracking-wider uppercase">Total Income</span>
            <span className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-100">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-sans font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income logs clear</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500 block tracking-wider uppercase">Total Outflows</span>
            <span className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-100">₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs font-sans font-medium">
              <span>Primary: {topCategoryName}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500 block tracking-wider uppercase">Total Savings</span>
            <span className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-100">₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-sans font-medium">
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Rate: {savingsRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between opacity-100">
          <div className="space-y-2">
            <span className="font-sans text-xs font-semibold text-slate-400 dark:text-slate-500 block tracking-wider uppercase">Net Balance</span>
            <span className={`font-mono text-2xl font-bold ${netBalance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
              {netBalance < 0 ? '-' : ''}₹{Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 text-xs font-sans font-medium ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {netBalance >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{netBalance >= 0 ? 'Liquid positive' : 'Over budget limits'}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${netBalance >= 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-sans text-base font-bold text-slate-800 dark:text-slate-100">Dynamic Cash Flow</h2>
              <p className="font-sans text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tracking incomes vs. savings leakages across last 7 recorded days</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontStyle="italic" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Spending" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="font-sans text-base font-bold text-slate-800 dark:text-slate-100">Spend by Category</h2>
            <p className="font-sans text-xs text-slate-400 dark:text-slate-500 mt-0.5">Summary split of categoric outgoings</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center space-y-2 mt-4">
                <p className="text-sm font-sans text-slate-400 dark:text-slate-500">No recorded expenses yet.</p>
                <button 
                  onClick={() => setCurrentPage('transactions')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create transaction
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'AmountSpent']}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#fff',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Minimal legends */}
          <div className="grid grid-cols-2 gap-2 text-xs h-16 overflow-y-auto pr-1">
            {pieData.map((item, id) => (
              <div key={id} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(item.name) }} />
                <span className="font-sans font-medium text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">(₹{item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Quick Insights section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-sans text-base font-bold text-slate-800 dark:text-slate-100">AI Deep Diagnostic Insights</h2>
            <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500">Automated machine learning heuristics based on database triggers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins) => {
            const isWarning = ins.type === 'warning';
            const isOpt = ins.type === 'optimization';
            return (
              <div 
                key={ins.id}
                className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                  isWarning 
                    ? 'bg-rose-50/40 dark:bg-rose-500/10 border-rose-100/50 dark:border-rose-500/20 hover:bg-rose-50/70 dark:hover:bg-rose-500/20' 
                    : isOpt 
                    ? 'bg-amber-50/40 dark:bg-amber-500/10 border-amber-100/50 dark:border-amber-500/20 hover:bg-amber-50/70 dark:hover:bg-amber-500/20' 
                    : 'bg-indigo-50/30 dark:bg-indigo-500/10 border-indigo-100/40 dark:border-indigo-500/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
                  isWarning 
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' 
                    : isOpt 
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                    : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isOpt ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-xs text-slate-700 dark:text-slate-200">{ins.title}</h3>
                  <p className="font-sans text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 dark:text-slate-500">{ins.description}</p>
                </div>
              </div>
            );
          })}

          {insights.length === 0 && (
            <div className="col-span-3 text-center py-6 text-slate-400 dark:text-slate-500 font-sans text-xs">
              Calculating AI advice... Add more transactions to feed the heuristic pipeline logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
