import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, Clock, UserCheck, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const PersonaBar: React.FC = () => {
  const {
    currentUser,
    registeredUsers,
    signInAsUser,
    signOut,
    simulateSessionExpired,
    isOffline,
    toggleOffline,
    isLoadingSkeleton,
    toggleLoadingSkeleton,
    resetAllData,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="PRD Persona Switcher" className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Persona Switcher:
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => signInAsUser('user-ayesha')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                currentUser?.id === 'user-ayesha'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              Ayesha (Lead/Owner)
            </button>

            <button
              onClick={() => signInAsUser('user-bilal')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                currentUser?.id === 'user-bilal'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              Bilal (Member)
            </button>

            <button
              onClick={() => signInAsUser('user-outsider')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                currentUser?.id === 'user-outsider'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              Sam (Outsider)
            </button>

            <button
              onClick={signOut}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                !currentUser
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              Signed Out
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick simulation controls */}
          <button
            onClick={toggleOffline}
            title="Toggle offline state (D25 test)"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isOffline
                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>{isOffline ? 'Offline Active' : 'Simulate Offline'}</span>
          </button>

          <button
            onClick={simulateSessionExpired}
            title="Test S10 expired session recovery"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Expire Session</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400"
            title="Toggle simulation tools"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded simulator panel */}
      {isExpanded && (
        <div className="border-t border-slate-800 px-4 py-2 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <div>
              <span className="text-slate-500 mr-1.5">Active Role:</span>
              <span className="text-slate-200 font-medium">
                {currentUser ? `${currentUser.name} (${currentUser.email})` : 'Anonymous (Signed Out)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">More Members:</span>
              {registeredUsers
                .filter((u) => !['user-ayesha', 'user-bilal', 'user-outsider'].includes(u.id))
                .slice(0, 3)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => signInAsUser(u.id)}
                    className="hover:text-white underline text-[11px]"
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLoadingSkeleton}
              className={`text-[11px] px-2 py-0.5 rounded ${
                isLoadingSkeleton ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              {isLoadingSkeleton ? 'Disable Skeletons' : 'Simulate Skeletons'}
            </button>

            <button
              onClick={resetAllData}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
