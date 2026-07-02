import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Group } from '../types';
import { X, IndianRupee, Users, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddSplitExpenseModalProps {
  group: Group;
  onClose: () => void;
}

export const AddSplitExpenseModal: React.FC<AddSplitExpenseModalProps> = ({ group, onClose }) => {
  const { user, createGroupExpense } = useApp();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Others');

  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE'>('EQUAL');

  const members = group.members || [];
  
  const [payerId, setPayerId] = useState(user?.id || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    // Single payer upfront for this simple UI
    const payments = [{ user_id: payerId, amount: amountInCents }];
    
    // Splits
    let splits: any[] = [];
    if (splitType === 'EQUAL') {
      const perPerson = Math.floor(amountInCents / members.length);
      let remainder = amountInCents % members.length;
      
      splits = members.map(m => {
        let memberAmount = perPerson;
        if (remainder > 0 && m.user_id === payerId) {
          memberAmount += remainder; // Give remainder to payer
          remainder = 0;
        } else if (remainder > 0) {
          memberAmount += 1;
          remainder -= 1;
        }
        return {
          user_id: m.user_id,
          type: 'EQUAL',
          amount: memberAmount
        };
      });
    } else {
      // Stub for EXACT and PERCENTAGE
      toast.error('Only EQUAL splits are fully wired up in this demo UI.');
      return;
    }

    await createGroupExpense(group.id, description, amountInCents, category, payments, splits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add an expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧾</span>
            </div>
            <input
              type="text"
              placeholder="Enter a description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 focus:border-indigo-500 focus:outline-none text-2xl font-bold text-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Paid by</span>
              <select 
                value={payerId}
                onChange={e => setPayerId(e.target.value)}
                className="bg-transparent font-medium text-indigo-600 dark:text-indigo-400 focus:outline-none text-right"
              >
                {members.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user_id === user?.id ? 'You' : (m.member_name || `User (${m.user_id.slice(0,4)})`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Split</span>
              <select 
                value={splitType}
                onChange={e => setSplitType(e.target.value as any)}
                className="bg-transparent font-medium text-indigo-600 dark:text-indigo-400 focus:outline-none text-right"
              >
                <option value="EQUAL">Equally ({members.length} people)</option>
                <option value="EXACT">Exact amounts</option>
                <option value="PERCENTAGE">Percentages</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl shadow-md">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
