import React, { useState, useMemo } from 'react';
import { Calculator, IndianRupee, Percent, Clock, AlertCircle } from 'lucide-react';

export const EmiCalculatorPage: React.FC = () => {
  const [principal, setPrincipal] = useState<string>('100000');
  const [interestRate, setInterestRate] = useState<string>('10.5');
  const [tenureYears, setTenureYears] = useState<string>('5');

  const { emi, totalInterest, totalAmount, principalRatio, interestRatio } = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const t = parseFloat(tenureYears);

    if (!p || !r || !t || p <= 0 || r <= 0 || t <= 0) {
      return { emi: 0, totalInterest: 0, totalAmount: 0, principalRatio: 0, interestRatio: 0 };
    }

    const rMonthly = r / 12 / 100;
    const n = t * 12; // Total number of months

    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emiCalc = (p * rMonthly * Math.pow(1 + rMonthly, n)) / (Math.pow(1 + rMonthly, n) - 1);
    const totalAmt = emiCalc * n;
    const totalInt = totalAmt - p;

    const pRatio = (p / totalAmt) * 100;
    const iRatio = (totalInt / totalAmt) * 100;

    return {
      emi: emiCalc,
      totalInterest: totalInt,
      totalAmount: totalAmt,
      principalRatio: pRatio,
      interestRatio: iRatio,
    };
  }, [principal, interestRate, tenureYears]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">EMI Calculator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Calculate your equated monthly installments for loans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500" />
            Loan Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Loan Amount (Principal)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pl-11 p-3 transition-colors"
                  placeholder="e.g. 500000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Interest Rate (Annual)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Percent className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.1"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pl-11 p-3 transition-colors"
                  placeholder="e.g. 8.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Loan Tenure (Years)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pl-11 p-3 transition-colors"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            
            {(!principal || !interestRate || !tenureYears) && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-700/50 rounded-xl text-amber-700 dark:text-amber-500 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Please fill in all fields to calculate your EMI.</span>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/30 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-700/30 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-center space-y-2 mb-10">
            <h3 className="text-indigo-200 font-medium text-sm tracking-wide uppercase">Your Monthly EMI</h3>
            <div className="text-5xl md:text-6xl font-bold tracking-tight">
              {emi > 0 ? formatCurrency(emi) : '₹0'}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-indigo-700/40 dark:bg-indigo-800/60 backdrop-blur-sm rounded-2xl p-5 border border-indigo-500/20">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Total Interest</p>
              <p className="text-2xl font-bold">{totalInterest > 0 ? formatCurrency(totalInterest) : '₹0'}</p>
            </div>
            <div className="bg-indigo-700/40 dark:bg-indigo-800/60 backdrop-blur-sm rounded-2xl p-5 border border-indigo-500/20">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Total Payment</p>
              <p className="text-2xl font-bold">{totalAmount > 0 ? formatCurrency(totalAmount) : '₹0'}</p>
            </div>
          </div>

          {emi > 0 && (
            <div className="relative z-10 mt-auto">
              <div className="flex justify-between text-xs font-medium text-indigo-200 mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span>Principal ({principalRatio.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <span>Interest ({interestRatio.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-indigo-950/50 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000 ease-out" 
                  style={{ width: `${principalRatio}%` }}
                ></div>
                <div 
                  className="h-full bg-rose-400 transition-all duration-1000 ease-out" 
                  style={{ width: `${interestRatio}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
