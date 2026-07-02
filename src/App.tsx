/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { GroupsPage } from './pages/GroupsPage';
import { motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';

function AppShell() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'transactions' | 'ai-assistant' | 'groups'>('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  // Page switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'groups':
        return <GroupsPage setCurrentPage={setCurrentPage} />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 flex flex-col lg:flex-row transition-colors duration-300">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Container */}
      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {renderPage()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm', duration: 4000 }} />
      <AppShell />
    </AppProvider>
  );
}
