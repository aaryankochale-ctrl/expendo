import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  ArrowUpRight, 
  HelpCircle, 
  Volume2, 
  Bot, 
  User,
  Zap,
  RefreshCw,
  PiggyBank,
  Coffee,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AiAssistantPage: React.FC = () => {
  const { chatHistory, sendChatMessage, clearChatHistory } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const currentText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      await sendChatMessage(currentText);
    } catch {
      toast.error('Failed to communicate with AI');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = async (q: string) => {
    if (isTyping) return;
    setIsTyping(true);
    try {
      await sendChatMessage(q);
    } catch {
      toast.error('Failed to communicate with AI');
    } finally {
      setIsTyping(false);
    }
  };

  const PREMADE_QUESTIONS = [
    { text: 'Am I on track for my savings goal this month?', icon: PiggyBank },
    { text: 'How much did I spend on groceries?', icon: Sparkles },
    { text: 'Audit my active subscription services', icon: RefreshCw },
    { text: 'Find my highest expense category', icon: Coffee },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] min-h-[500px]">
      
      {/* Question Rail (Left on desktop, hidden or bottom on mobile) */}
      <div className="hidden lg:flex flex-col w-80 space-y-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Bot className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            AI Quick Diagnostics
          </h2>
          <p className="font-sans text-xs text-slate-400 dark:text-slate-500 mt-0.5">Click any standard analytical question to prompt the machine model:</p>
        </div>

        <div className="space-y-2.5">
          {PREMADE_QUESTIONS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q.text)}
                disabled={isTyping}
                className="w-full text-left p-3.5 border border-slate-100 dark:border-slate-800 hover:border-indigo-150 bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-sans text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:translate-x-1 flex items-start gap-2.5 disabled:opacity-50"
              >
                <Icon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>{q.text}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-4 bg-indigo-50/30 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100/20 space-y-1.5">
          <h3 className="font-sans text-xs font-bold text-indigo-950 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Natural Transaction Logs
          </h3>
          <p className="font-sans text-[10px] text-indigo-900 leading-relaxed">
            Did you know you can also parse transaction records directly via chat? Try entering: <span className="italic font-medium">"Spent ₹20 at McDonald's yesterday"</span>
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center  relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-sm text-slate-800 dark:text-slate-100">Expendo Intelligence</span>
                <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-[9px] text-indigo-600 dark:text-indigo-400 font-bold rounded-md uppercase tracking-wider">Expert</span>
              </div>
              <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500">Online &bull; Ready to interpret ledger analytics</span>
            </div>
          </div>

          <button
            onClick={clearChatHistory}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:bg-rose-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4.5 h-4.5" />
            <span className="hidden sm:inline font-sans text-xs font-semibold">Flush Log</span>
          </button>
        </div>

        {/* Message Log box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatHistory.map((msg) => {
            const isAi = msg.role === 'ai';
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}>
                {/* Profile icon */}
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                  isAi ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-850'
                }`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble card */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-xs leading-relaxed font-sans ${
                    isAi 
                      ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800/50 rounded-tl-sm' 
                      : 'bg-indigo-600 text-white rounded-tr-xs '
                  }`}>
                    {/* Render basic markdown/strong styling manually */}
                    <p style={{ whiteSpace: 'pre-line' }}>
                      {(msg.content || '').split('**').map((str, i) => (i % 2 === 1 ? <strong key={i} className="font-extrabold">{str}</strong> : str))}
                    </p>
                  </div>
                  <span className={`block font-mono text-[9px] text-slate-400 dark:text-slate-500 ${!isAi && 'text-right'}`}>
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing simulation view */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start mr-auto">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="py-3 px-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-3xl rounded-tl-xs flex items-center gap-1 h-10">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Invisible element to trigger scroll */}
          <div ref={scrollRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-50">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything, e.g., 'Am I spending too much on restaurants?'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-xs px-4 py-3 font-sans transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl shadow-md disabled:shadow-none flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
          
          <div className="flex items-center justify-between mt-2.5 px-1 md:hidden">
            <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500 italic">Converses client-side with full context-awareness</span>
          </div>
        </div>

      </div>

    </div>
  );
};
