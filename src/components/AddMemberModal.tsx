import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Group } from '../types';
import { X, UserPlus, Mail, User } from 'lucide-react';

interface AddMemberModalProps {
  group: Group;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ group, onClose }) => {
  const { addGroupGuestMember, addGroupMemberByEmail } = useApp();
  const [activeTab, setActiveTab] = useState<'guest' | 'registered'>('registered');
  const [inputValue, setInputValue] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (activeTab === 'guest') {
      await addGroupGuestMember(group.id, inputValue.trim());
    } else {
      await addGroupMemberByEmail(group.id, inputValue.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Group Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('registered'); setInputValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'registered' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <Mail className="w-4 h-4" /> Real User
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('guest'); setInputValue(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'guest' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
            >
              <User className="w-4 h-4" /> Guest
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <input
                type={activeTab === 'registered' ? 'email' : 'text'}
                placeholder={activeTab === 'registered' ? "Friend's Email Address" : "Friend's Name"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium"
                required
                autoFocus
              />
            </div>
            
            {activeTab === 'registered' && (
              <p className="text-xs text-slate-500 mt-2">
                They must have an Expendo account registered with this email.
              </p>
            )}

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                Cancel
              </button>
              <button type="submit" disabled={!inputValue.trim()} className="flex-1 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50">
                Add Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
