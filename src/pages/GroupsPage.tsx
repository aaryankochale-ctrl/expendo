import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Group } from '../types';
import { Users, Plus, ChevronRight, Calculator, Hash, LogIn } from 'lucide-react';
import { GroupDetailsPage } from './GroupDetailsPage';

interface GroupsPageProps {
  setCurrentPage: (page: 'dashboard' | 'transactions' | 'ai-assistant' | 'groups') => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ setCurrentPage }) => {
  const { groups, createGroup, joinGroupByCode, user } = useApp();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await createGroup(newGroupName);
    setNewGroupName('');
    setIsCreatingGroup(false);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    await joinGroupByCode(joinCode.trim());
    if (!groups) {
      // If error it won't crash, toast handles it
    } else {
      setJoinCode('');
      setIsJoiningGroup(false);
    }
  };

  if (activeGroup) {
    return <GroupDetailsPage group={activeGroup} onBack={() => setActiveGroupId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Split Groups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage shared expenses and settle up</p>
        </div>
        <div className="flex gap-2">
            <button
              onClick={() => { setIsJoiningGroup(true); setIsCreatingGroup(false); }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center shadow-sm text-sm"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Join
            </button>
            <button
              onClick={() => { setIsCreatingGroup(true); setIsJoiningGroup(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Group</span>
            </button>
        </div>
      </div>

      {isCreatingGroup && (
        <form onSubmit={handleCreateGroup} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex gap-3">
          <input
            autoFocus
            type="text"
            placeholder="E.g., Goa Trip, Apartment 3B..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button type="button" onClick={() => setIsCreatingGroup(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
          <button type="submit" disabled={!newGroupName.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm disabled:opacity-50">Create</button>
        </form>
      )}

      {isJoiningGroup && (
        <form onSubmit={handleJoinGroup} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Enter 6-digit invite code..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="button" onClick={() => setIsJoiningGroup(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
          <button type="submit" disabled={!joinCode.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm disabled:opacity-50">Join</button>
        </form>
      )}

      {groups.length === 0 && !isCreatingGroup && !isJoiningGroup ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Groups Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mx-auto mt-2">
            Create a group to start splitting bills, rent, and trips with your friends.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> New Group
            </button>
            <button
              onClick={() => setIsJoiningGroup(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              <LogIn className="w-4 h-4" /> Join Group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className="flex flex-col text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {group.members?.length || 0} members
                      </div>
                      {group.room_code && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                          <Hash className="w-3 h-3" />
                          {group.room_code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">
                  {group.expenses?.length || 0} expenses logged
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
