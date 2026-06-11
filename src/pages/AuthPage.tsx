import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Mail, Lock, User, AlertCircle, Eye, EyeOff, DollarSign, Coins, Wallet, Banknote, PiggyBank, CreditCard, TrendingUp, Briefcase, Receipt, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthPage: React.FC = () => {
  const { login, signup, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (activeTab === 'signup' && !name) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const finalEmail = email.includes('@') ? email : `${email}@demo.com`;

    try {
      if (activeTab === 'login') {
        await login(finalEmail, password);
        toast.success('Successfully logged in!');
      } else {
        await signup(finalEmail, name, password);
        toast.success('Account created successfully!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDemoLogin = async (role: 'Aaryan' | 'Demo') => {
    const demoEmail = role === 'Aaryan' ? 'kochaleaaryan@gmail.com' : 'user@example.com';
    const demoName = role === 'Aaryan' ? 'Aaryan Kochale' : 'Sarah Jenkins';
    const demoPass = 'DemoPassword123!';

    try {
      // First try to login
      await login(demoEmail, demoPass);
      toast.success('Demo login successful!');
    } catch (err) {
      // If login fails (user doesn't exist), try to sign up
      try {
        await signup(demoEmail, demoName, demoPass);
        toast.success('Demo account created and logged in!');
      } catch (signupErr: any) {
        // If it's a rate limit error or email confirmation error, display it clearly
        const msg = signupErr?.message || 'Demo login failed.';
        setError(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 flex flex-col lg:flex-row">
      
      {/* Left panel: Visual, premium onboarding (Only shown on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />
        
        {/* Money Stickers Background - Positioned on the right/empty space */}
        {/* Top Right Cluster */}
        <Coins className="absolute top-12 right-12 w-28 h-28 text-indigo-400/10 rotate-12 pointer-events-none" />
        <TrendingUp className="absolute top-32 right-24 w-32 h-32 text-emerald-400/5 -rotate-12 pointer-events-none" />
        <PiggyBank className="absolute top-20 right-1/3 w-24 h-24 text-white/5 rotate-6 pointer-events-none" />
        
        {/* Middle Right Cluster */}
        <CreditCard className="absolute top-1/2 right-12 w-20 h-20 text-emerald-400/5 -rotate-6 pointer-events-none -translate-y-1/2" />
        <PieChart className="absolute top-1/2 right-1/4 w-24 h-24 text-white/5 rotate-12 pointer-events-none -translate-y-1/2" />
        <DollarSign className="absolute top-1/3 right-8 w-20 h-20 text-indigo-400/5 rotate-45 pointer-events-none" />
        
        {/* Bottom Right Cluster */}
        <Banknote className="absolute bottom-16 right-16 w-36 h-36 text-emerald-400/10 rotate-6 pointer-events-none" />
        <Briefcase className="absolute bottom-36 right-24 w-20 h-20 text-emerald-400/5 rotate-12 pointer-events-none" />
        <Wallet className="absolute bottom-56 right-12 w-28 h-28 text-indigo-400/5 -rotate-6 pointer-events-none" />
        
        {/* Bottom Center Cluster */}
        <Receipt className="absolute bottom-12 right-1/3 w-24 h-24 text-white/5 -rotate-12 pointer-events-none" />
        <DollarSign className="absolute bottom-24 right-1/2 w-32 h-32 text-emerald-400/10 -rotate-12 pointer-events-none" />
        
        {/* Subtle Left Side Additions */}
        <DollarSign className="absolute top-1/4 left-10 w-24 h-24 text-indigo-400/5 -rotate-12 pointer-events-none" />
        <Wallet className="absolute bottom-1/4 left-8 w-20 h-20 text-white/5 rotate-6 pointer-events-none" />
        <Coins className="absolute top-1/2 left-4 w-16 h-16 text-emerald-400/5 rotate-45 pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight">Expendo</span>
        </div>

        {/* Dynamic Mock Visuals */}
        <div className="my-auto max-w-md relative z-10 space-y-8">
          <h1 className="font-sans font-extrabold text-4xl leading-tight text-white tracking-tight">
            Take absolute control of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">financial stream</span>.
          </h1>
          <p className="font-sans text-slate-400 dark:text-slate-500 text-base leading-relaxed">
            Experience real-time budgetary foresight guided by bespoke AI suggestions. Understand trends, parse invoices in plain English, and converse with a personal financial consultant in seconds.
          </p>

          {/* Micro metric badges */}
          <div className="space-y-3 pt-4">
            <div className="bg-white dark:bg-slate-900/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ▲
                </div>
                <div>
                  <p className="font-sans text-xs text-slate-400 dark:text-slate-500">Regular Income detected</p>
                  <p className="font-sans text-sm font-semibold text-white">Apex Corp Salary +$5,200</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-md">Validated</span>
            </div>

            <div className="bg-white dark:bg-slate-900/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-sans text-xs text-slate-400 dark:text-slate-500">AI Optimization Tip</p>
                  <p className="font-sans text-sm font-semibold text-white">Cancel inactive subscriptions to save $45/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 relative z-10">
          &copy; 2026 Expendo Inc. Enterprise grade safety with bank-level encryption. All rights reserved.
        </div>
      </div>

      {/* Right panel: Modern Card Form System */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-sans font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">Expendo</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50">
            {/* Nav segment */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-8 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 text-center text-sm font-sans font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`flex-1 py-2.5 text-center text-sm font-sans font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {activeTab === 'login' ? 'Welcome Back!' : 'Get Started'}
              </h2>
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                {activeTab === 'login' 
                  ? 'Sign in to access your financial insights dashboard.' 
                  : 'Establish a new account to experience the next-gen tracking.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-sans font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm pl-9 pr-4 py-3 font-sans transition-colors"
                      placeholder="Jane Jackson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm pl-9 pr-4 py-3 font-sans transition-colors"
                    placeholder="example@finance.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:bg-white dark:bg-slate-900 focus:outline-hidden rounded-xl text-sm pl-9 pr-10 py-3 font-sans transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-sm rounded-xl  cursor-pointer flex items-center justify-center transition-colors disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing Process...
                  </span>
                ) : (
                  activeTab === 'login' ? 'Confirm & Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              <span className="block text-center text-xs font-sans font-medium text-slate-400 dark:text-slate-500 mb-3">Or quick sign-in via demo identities</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Aaryan')}
                  disabled={isLoading}
                  className="py-2.5 px-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-xl bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-800/50 font-sans text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                >
                  Aaryan Kochale
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Demo')}
                  disabled={isLoading}
                  className="py-2.5 px-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-xl bg-slate-50/20 hover:bg-slate-50 dark:bg-slate-800/50 font-sans text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                >
                  Sarah Jenkins
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
