import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { 
  Plus, 
  Trash2, 
  Filter, 
  Sparkles, 
  Search, 
  X, 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownRight,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Inbox,
  Mic,
  MicOff,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Housing',
  'Groceries',
  'Dining Out',
  'Utilities',
  'Transport',
  'Subscriptions',
  'Entertainment',
  'Shopping',
  'Salary',
  'Freelance',
  'Others'
];

export const TransactionsPage: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, parseNaturalLanguageTransaction, isLoading } = useApp();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [naturalText, setNaturalText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [speechError, setSpeechError] = useState('');

  // Voice Processing Flow
  const handleVoiceProcess = async (transcribedText: string) => {
    if (!transcribedText.trim()) return;
    setIsVoiceProcessing(true);
    setSpeechError('');
    try {
      // 1. Parse via AI
      const parsed = await parseNaturalLanguageTransaction(transcribedText);
      
      // 2. Auto-commit to DB
      await addTransaction({
        title: parsed.title,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        date: parsed.date,
      });

      toast.success('Voice transaction auto-saved!');
      
      // 3. TTS Confirmation
      if ('speechSynthesis' in window) {
        const typeStr = parsed.type === 'income' ? 'income' : 'expense';
        const msg = new SpeechSynthesisUtterance(`Successfully added an ${typeStr} of ${parsed.amount} rupees for ${parsed.title}`);
        window.speechSynthesis.speak(msg);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to process voice transaction.');
      setSpeechError('Failed to understand. Please try again or type manually.');
      // If auto-commit fails, populate form as fallback
      setNaturalText(transcribedText);
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  const toggleListening = () => {
    // @ts-ignore - Vendor prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      // It will stop automatically due to onend, but we can force it
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
      setNaturalText('');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNaturalText(transcript);
      handleVoiceProcess(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setSpeechError('Microphone error or permission denied.');
      toast.error('Microphone error: ' + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };


  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Others');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Search & Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Others');
    setDate(new Date().toISOString().split('T')[0]);
    setNaturalText('');
    setSuccessMessage('');
  };

  // Handle AI Smart parsing
  const handleAiParse = async () => {
    if (!naturalText.trim()) return;
    setAiParsing(true);
    setSuccessMessage('');
    try {
      const parsed = await parseNaturalLanguageTransaction(naturalText);
      setTitle(parsed.title);
      setAmount(parsed.amount.toString());
      setType(parsed.type);
      setCategory(parsed.category);
      setDate(parsed.date);
      setSuccessMessage('AI processed successfully! Review populated fields below.');
      toast.success('AI successfully extracted data');
    } catch {
      setSuccessMessage('AI was unable to parse. Please fulfill manually.');
      toast.error('AI was unable to parse the transaction.');
    } finally {
      setAiParsing(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
      });
      toast.success('Transaction added successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Color badges helper
  const getBadgeStyles = (cat: string) => {
    const mappings: { [key: string]: string } = {
      'Housing': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-100',
      'Groceries': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-750 border-emerald-100',
      'Dining Out': 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 border-rose-100',
      'Utilities': 'bg-amber-50 text-amber-700 border-amber-100',
      'Transport': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'Subscriptions': 'bg-violet-50 text-violet-700 border-violet-100',
      'Entertainment': 'bg-pink-50 text-pink-700 border-pink-100',
      'Shopping': 'bg-teal-50 text-teal-700 border-teal-100',
      'Salary': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Freelance': 'bg-teal-100 text-teal-800 border-teal-200',
      'Others': 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800',
    };
    return mappings[cat] || 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800';
  };

  // 1. Filter Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // 2. Sort Logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  // 3. Paginate Logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Ledger Registry</h1>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Audit, purge, filter, or input transaction records.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-sm rounded-xl cursor-pointer flex items-center gap-2 "
        >
          <Plus className="w-4.5 h-4.5" />
          Add Transaction
        </button>
      </div>

      {/* Control panel (Filters + Sorting + Search) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by description or merchant..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm pl-10 pr-4 py-3 font-sans transition-colors"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value as TransactionType | 'all'); setCurrentPage(1); }}
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm px-4 py-3 font-sans cursor-pointer transition-colors"
            >
              <option value="all">All Flow Types</option>
              <option value="income">Incomes only (+)</option>
              <option value="expense">Expenses only (-)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm px-4 py-3 font-sans cursor-pointer transition-colors"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 pt-4 gap-4">
          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-450" />
            <span className="font-sans text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">Order By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc')}
              className="bg-transparent text-xs font-sans font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:text-indigo-400 focus:outline-hidden cursor-pointer"
            >
              <option value="date-desc">Newest Calendar Dates</option>
              <option value="date-asc">Oldest Calendar Dates</option>
              <option value="amount-desc">Highest Amount (₹)</option>
              <option value="amount-asc">Lowest Amount (₹)</option>
            </select>
          </div>

          {/* Records summary count */}
          <span className="font-sans text-xs text-slate-400 dark:text-slate-500">
            Yielded {sortedTransactions.length} records found in database
          </span>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table layout (shown on Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider">Date</th>
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider">Transaction Detail</th>
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider">Category</th>
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider">Flow Type</th>
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider text-right">Amount</th>
                <th className="p-4 font-sans text-xs font-bold text-slate-450 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{tx.date}</td>
                    <td className="p-4">
                      <p className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100">{tx.title}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-sans font-medium border ${getBadgeStyles(tx.category)}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 font-sans text-xs font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-550'}`}>
                        {isIncome ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isIncome ? 'Inflow' : 'Outflow'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-sm text-right">
                      <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}>
                        {isIncome ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={async () => { try { await deleteTransaction(tx.id); toast.success('Deleted successfully'); } catch(e) { toast.error('Failed to delete'); } }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100">No records found</h3>
                      <p className="text-slate-400 dark:text-slate-500 font-sans text-sm max-w-xs">
                        There are no transactions matching your current filters. Modify search strings or parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Layout (shown on Mobile) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {currentItems.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-50/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{tx.date}</span>
                  <button
                    onClick={async () => { try { await deleteTransaction(tx.id); toast.success('Deleted successfully'); } catch(e) { toast.error('Failed to delete'); } }}
                    className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100">{tx.title}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-medium border ${getBadgeStyles(tx.category)}`}>
                      {tx.category}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {isIncome ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {currentItems.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100">No records found</h3>
              <p className="text-slate-400 dark:text-slate-500 font-sans text-xs max-w-[200px]">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>

        {/* Pagination element */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 text-xs font-sans font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-lg disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 text-xs font-sans font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-lg disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Interactive Modal Form for Adding Transactions */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-sans text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Log Transaction Entry
                </h2>
                <p className="font-sans text-xs text-slate-400 dark:text-slate-500 mt-0.5">Choose modern Voice/Text scanning or manually compile fields.</p>
              </div>

              {/* SECTION A: AI smart parse bar */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100/30 rounded-2xl space-y-2.5">
                <label className="block text-xs font-sans font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
                  AI Natural Language Smart-Add Input
                </label>
                <div className="relative">
                  <textarea
                    placeholder="e.g., 'Spent 45 rupees on petrol today' or 'Earned ₹1200 on freelance design yesterday'"
                    className="w-full min-h-16 bg-white dark:bg-slate-900 border border-indigo-100 focus:border-indigo-600 focus:outline-hidden rounded-xl text-xs p-3 pr-12 font-sans transition-colors"
                    value={naturalText}
                    onChange={(e) => setNaturalText(e.target.value)}
                    disabled={isVoiceProcessing}
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isVoiceProcessing}
                    className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-rose-100 text-rose-600 animate-pulse' 
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                    } disabled:opacity-50`}
                    title="Use Voice Command"
                  >
                    {isVoiceProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
                {speechError && <p className="font-sans text-[10px] text-rose-600">{speechError}</p>}

                
                <div className="flex items-center justify-between gap-4">
                  <span className="font-sans text-[10px] text-slate-450 italic">AI extracts amounts, types, dates, and merchants</span>
                  <button
                    type="button"
                    onClick={handleAiParse}
                    disabled={aiParsing || isVoiceProcessing || !naturalText.trim()}
                    className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-[11px] rounded-lg tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {aiParsing ? 'Processing...' : 'Process with AI'}
                  </button>
                </div>

                {successMessage && (
                  <p className="font-sans font-medium text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20/30 px-2 py-1 rounded">
                    {successMessage}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative text-center">
                <hr className="border-slate-100 dark:border-slate-800" />
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-3 font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fulfillment Registry</span>
              </div>

              {/* SECTION B: Standard inputs form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Flow Type Selector */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">Transaction Type</label>
                    <div className="flex p-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 py-2 text-center text-xs font-sans font-semibold rounded-lg transition-all ${
                          type === 'expense'
                            ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Expense / Outflow (-)
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-2 text-center text-xs font-sans font-semibold rounded-lg transition-all ${
                          type === 'income'
                            ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Income / Inflow (+)
                      </button>
                    </div>
                  </div>

                  {/* Title / Merchant */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">Description / Merchant</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-xs px-3 py-2.5 font-sans transition-colors"
                      placeholder="e.g. Whole Foods Market"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-xs px-3 py-2.5 font-sans transition-colors"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">Calendar Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-xs px-3 py-2.5 font-sans transition-colors font-mono"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">Budget Category</label>
                    <select
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-xs px-3 py-2.5 font-sans cursor-pointer transition-colors"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-350 text-slate-750 text-xs font-sans font-bold rounded-xl cursor-pointer text-center transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-bold rounded-xl cursor-pointer text-center transition-colors flex justify-center items-center gap-2 disabled:opacity-75"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Commit Entry
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
