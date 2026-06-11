import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  LayoutDashboard, 
  Receipt, 
  Bot, 
  LogOut, 
  Menu, 
  X, 
  Wallet, 
  Sparkles,
  User
} from 'lucide-react';

interface NavigationProps {
  currentPage: 'dashboard' | 'transactions' | 'ai-assistant';
  setCurrentPage: (page: 'dashboard' | 'transactions' | 'ai-assistant') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as const, label: 'Transactions', icon: Receipt },
    { id: 'ai-assistant' as const, label: 'AI Assistant', icon: Bot },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Top Navbar for Mobile */}
      <header className="lg:hidden h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white ">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Expendo</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`
        lg:hidden fixed top-16 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-50 p-4 flex flex-col justify-between transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-y-full -translate-x-full pointer-events-none'}
      `}>
        <div className="space-y-6">
          {user && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl flex items-center justify-center font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl font-sans font-medium text-sm transition-all
                    ${isActive 
                      ? 'bg-indigo-600 text-white ' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-sans font-medium text-sm text-rose-600 hover:bg-rose-50/60 dark:hover:bg-rose-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 fixed top-0 left-0 z-30 transition-colors">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white ">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight block">Expendo</span>
              <span className="font-sans text-xs text-slate-400 font-medium block">Fintech Hub</span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="font-sans text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm transition-all
                    ${isActive 
                      ? 'bg-indigo-600 text-white ' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-sm text-rose-600 hover:bg-rose-50/60 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100/30 dark:hover:border-rose-900/30"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
