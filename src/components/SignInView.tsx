import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, ArrowRight, CheckCircle2, Shield, Users, Check } from 'lucide-react';

interface SignInViewProps {
  expired?: boolean;
  returnTo?: string;
}

export const SignInView: React.FC<SignInViewProps> = ({ expired, returnTo }) => {
  const { signIn, signInAsUser, isOffline } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isOffline) {
      setError('You appear to be offline. Please check your connection.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = signIn(email);
      setIsSubmitting(false);
      if (!res.success) {
        setError(res.error || "We couldn't sign you in. Please try again.");
      }
    }, 250);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand & Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-lg mb-4 shadow-sm">
            TF
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to TeamFlow
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
            A simple, private task board for small teams of 3–10 people.
          </p>
        </div>

        {/* Expired Session Notice (S10) */}
        {expired && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide text-amber-800">Session expired</p>
              <p className="mt-0.5 text-xs text-amber-900">Your session expired. Please sign in again.</p>
            </div>
          </div>
        )}

        {/* Deep Link Return-to Hint */}
        {returnTo && (
          <div className="mb-6 p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
            <span>You will return to your requested private link right after sign-in.</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Main Sign-In Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Quick Persona Sign In */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Fast Sign-In (Select Persona)
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => signInAsUser('user-ayesha')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    AK
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Ayesha Khan</div>
                    <div className="text-xs text-slate-500">Project Lead (Owner) · ayesha@university.edu</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => signInAsUser('user-bilal')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    BA
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Bilal Ahmed</div>
                    <div className="text-xs text-slate-500">Team Member · bilal@university.edu</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400">or sign in with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>

        {/* Security & Scope Guarantee */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Private by default</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Small teams 3–10</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero bloat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
