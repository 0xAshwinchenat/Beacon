'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Chrome, Mail, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err.message || 'Google Auth failed', type: 'error' });
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        text: 'Check your email inbox for the magic login link!',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({ text: err.message || 'Email sign-in failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Dynamic ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Track applications like a pro
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Beacon
          </h1>
          <p className="text-text-secondary text-sm">
            Chrome Extension + Supabase + Next.js Kanban Workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border border-border rounded-xl p-8 shadow-2xl relative">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border text-sm flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-success/15 border-success/30 text-success'
                  : 'bg-error/15 border-error/30 text-error'
              }`}
            >
              {message.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <span className="relative px-3 bg-[#0f172a] text-text-secondary text-xs uppercase tracking-wider">
                Or magic link
              </span>
            </div>

            {/* Email OTP Login */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-[#1e293b] border border-border focus:border-indigo-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition"
                  />
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send Magic Link
              </button>
            </form>
          </div>
        </div>

        {/* Feature Grid Quick Pitch */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-[#0f172a]/40 border border-border/40 rounded-lg">
            <h4 className="text-xs font-semibold text-white mb-1 flex items-center justify-center gap-1">
              <Chrome className="w-3.5 h-3.5 text-indigo-400" />
              MV3 Extension
            </h4>
            <p className="text-[10px] text-text-secondary">Scrape jobs from LinkedIn, Indeed, and track on click.</p>
          </div>
          <div className="p-3 bg-[#0f172a]/40 border border-border/40 rounded-lg">
            <h4 className="text-xs font-semibold text-white mb-1 flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
              Kanban Board
            </h4>
            <p className="text-[10px] text-text-secondary">Drag & drop jobs between stages, view stats & details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
