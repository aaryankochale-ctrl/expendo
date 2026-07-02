import React, { useState, useMemo } from 'react';
import { Group } from '../types';
import { ArrowLeft, Plus, Receipt, User as UserIcon, UserPlus, Hash, Copy, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { AddSplitExpenseModal } from '../components/AddSplitExpenseModal';
import { AddMemberModal } from '../components/AddMemberModal';
import { calculateSettleUp } from '../utils/splitwise';

interface GroupDetailsPageProps {
  group: Group;
  onBack: () => void;
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({ group, onBack }) => {
  const { user, fetchGroups } = useApp();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Compute settle up transactions
  const settlements = useMemo(() => {
    if (!group.expenses) return [];
    return calculateSettleUp(group.expenses);
  }, [group.expenses]);

  const handleCopyCode = () => {
    if (group.room_code) {
      navigator.clipboard.writeText(group.room_code);
      toast.success('Room code copied to clipboard!');
    }
  };

  const handleStartEditName = (memberId: string, currentName: string) => {
    setEditingMemberId(memberId);
    setEditNameValue(currentName || '');
  };

  const handleCancelEditName = () => {
    setEditingMemberId(null);
    setEditNameValue('');
  };

  const handleSaveName = async (memberId: string) => {
    if (editNameValue.trim() === '') return;
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ member_name: editNameValue.trim() })
        .eq('id', memberId);
        
      if (error) throw error;
      await fetchGroups();
      toast.success('Name updated!');
      setEditingMemberId(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update name');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">{group.name}</h1>
              {group.room_code && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase transition-colors"
                  title="Copy room code"
                >
                  <Hash className="w-3 h-3" />
                  {group.room_code}
                  <Copy className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Split expenses and settle up</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingExpense(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              Expenses
            </h2>
            
            {(!group.expenses || group.expenses.length === 0) ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {group.expenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{exp.description}</p>
                        <p className="text-xs text-slate-500">Paid by {exp.payments?.[0]?.user_id === user?.id ? 'You' : 'User'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-100">₹{(exp.total_amount / 100).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-emerald-500 text-xl">🤝</span>
              Settle Up
            </h2>
            
            {settlements.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-sm text-slate-500">You are all settled up in this group!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {settlements.map((tx, idx) => {
                  const isUserDebtor = tx.debtor === user?.id;
                  const isUserCreditor = tx.creditor === user?.id;
                  
                  return (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border-l-4 border-emerald-500">
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {isUserDebtor ? 'You' : group.members?.find(m => m.user_id === tx.debtor)?.member_name || `User (${tx.debtor.slice(0,4)})`}
                          </span>
                          {' owes '}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {isUserCreditor ? 'You' : group.members?.find(m => m.user_id === tx.creditor)?.member_name || `User (${tx.creditor.slice(0,4)})`}
                          </span>
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-md text-sm">
                        ₹{(tx.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-slate-500">Group Members</h2>
              <button onClick={() => setIsAddingMember(true)} className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {group.members?.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {editingMemberId === m.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName(m.id);
                            if (e.key === 'Escape') handleCancelEditName();
                          }}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button onClick={() => handleSaveName(m.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCancelEditName} className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {m.user_id === user?.id ? `You (${m.member_name || 'No Name'})` : (m.member_name || `User (${m.user_id.slice(0,4)})`)}
                        </span>
                        {m.user_id === user?.id && (
                          <button 
                            onClick={() => handleStartEditName(m.id, m.member_name || '')}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit my name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isAddingExpense && (
        <AddSplitExpenseModal group={group} onClose={() => setIsAddingExpense(false)} />
      )}
      {isAddingMember && (
        <AddMemberModal group={group} onClose={() => setIsAddingMember(false)} />
      )}
    </div>
  );
};
