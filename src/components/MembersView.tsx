import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, UserPlus, Trash2, AlertCircle, CheckCircle2, Shield, User as UserIcon } from 'lucide-react';

interface MembersViewProps {
  workspaceId: string;
}

export const MembersView: React.FC<MembersViewProps> = ({ workspaceId }) => {
  const {
    currentUser,
    workspaces,
    getUserById,
    addMember,
    removeMember,
    navigate,
    isOwner,
  } = useApp();

  const workspace = workspaces.find((w) => w.id === workspaceId);
  const isWorkspaceOwner = workspace ? isOwner(workspace.id) : false;

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Remove confirmation modal
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!workspace || !currentUser) {
    return null;
  }

  // Non-owner access prevention (D26)
  if (!isWorkspaceOwner) {
    navigate({ type: 'access-denied' });
    return null;
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Enter a valid email address.');
      return;
    }

    setIsAdding(true);
    try {
      const res = await addMember(workspaceId, cleanEmail);
      setIsAdding(false);
      if (res.success) {
        setEmail('');
        setSuccessMessage(`Added ${cleanEmail} to the workspace.`);
      } else {
        setError(res.error || 'Failed to add member.');
      }
    } catch {
      setIsAdding(false);
      setError('Failed to add member.');
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      const res = await removeMember(workspaceId, memberToRemove.id);
      setIsRemoving(false);
      if (res.success) {
        setMemberToRemove(null);
        setSuccessMessage(`Removed ${memberToRemove.name}. Their tasks are now Unassigned.`);
      } else {
        setError(res.error || 'Failed to remove member.');
      }
    } catch {
      setIsRemoving(false);
      setError('Failed to remove member.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate({ type: 'board', workspaceId })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {workspace.name}</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workspace Members
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage who has private access to this board ({workspace.members.length} of 25 seats used).
          </p>
        </div>

        <button
          onClick={() => navigate({ type: 'board', workspaceId })}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Return to board
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mt-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{successMessage}</p>
        </div>
      )}

      {/* Add Member Form (Owner only) */}
      <div className="mt-6 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-700" />
          <span>Add new member</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Enter the university email address of a registered teammate. They will gain immediate access to this board.
        </p>

        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              placeholder="e.g. farhan@university.edu or grace@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            {isAdding ? 'Adding...' : 'Add member'}
          </button>
        </form>
      </div>

      {/* Member List */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Active Members ({workspace.members.length})
          </h2>
          <span className="text-[11px] text-slate-400">Maximum 25 members</span>
        </div>

        <div className="divide-y divide-slate-100">
          {workspace.members.map((member) => {
            const user = getUserById(member.userId);
            if (!user) return null;
            const isSoleOwner = member.role === 'Owner' && workspace.members.filter((m) => m.role === 'Owner').length <= 1;

            return (
              <div
                key={member.userId}
                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      user.avatarColor || 'bg-slate-700'
                    }`}
                  >
                    {user.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {user.name}
                      </span>
                      {member.role === 'Owner' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          Owner
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded uppercase tracking-wider">
                          Member
                        </span>
                      )}
                    </div>
                    {/* D33: Owner sees emails */}
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>
                </div>

                {/* Remove button */}
                <div>
                  {isSoleOwner ? (
                    <span className="text-[11px] text-slate-400 italic">
                      Sole Owner
                    </span>
                  ) : (
                    <button
                      onClick={() => setMemberToRemove({ id: user.id, name: user.name })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog for Member Removal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Remove {memberToRemove.name}?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Their access will end immediately, and any tasks currently assigned to them will become{' '}
              <strong className="text-slate-900">Unassigned</strong>. No tasks will be deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={isRemoving}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-lg transition-colors"
              >
                {isRemoving ? 'Removing...' : 'Remove member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
