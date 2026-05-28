import React, { useState } from 'react';
import { api } from '../utils/api';
import { LogIn, UserPlus, ShieldAlert, Sparkles, KeyRound, Mail, User } from 'lucide-react';

export default function AuthCard({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await api.login(username, password);
        onAuthSuccess();
      } else {
        if (password !== passwordConfirm) {
          throw new Error('Passwords do not match.');
        }
        await api.register(username, email, password, passwordConfirm);
        setSuccessMessage('Registration successful! Please log in below.');
        setIsLogin(true);
        // Clean fields
        setPassword('');
        setPasswordConfirm('');
      }
    } catch (err) {
      try {
        const parsedError = JSON.parse(err.message);
        if (typeof parsedError === 'object') {
          // Flatten standard Django validation errors
          const messages = Object.entries(parsedError)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' | ');
          setError(messages);
        } else {
          setError(err.message);
        }
      } catch {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 mb-4 glow-accent">
          <Sparkles className="h-8 w-8 text-brand-accent animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-accent bg-clip-text text-transparent">
          Antigravity Write
        </h1>
        <p className="mt-2 text-sm text-brand-textSecondary">
          AI-Powered Writing Assistant & Summary Engine
        </p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="glass-panel rounded-3xl p-8 glow-accent relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-accent/15 rounded-full blur-3xl" />

        {/* Tab Buttons */}
        <div className="flex p-1 bg-brand-bg/60 rounded-xl border border-brand-border/40 mb-8 relative z-10">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isLogin
                ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20'
                : 'text-brand-textSecondary hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              !isLogin
                ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20'
                : 'text-brand-textSecondary hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Register
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs relative z-10">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Authentication Error</span>
              {error}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs relative z-10">
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Success</span>
              {successMessage}
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer_shubh"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-brand-textMuted"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-brand-textMuted"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-brand-textMuted"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-brand-textSecondary uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMuted" />
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-brand-textMuted"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-brand-accent to-purple-600 hover:from-brand-accentHover hover:to-purple-700 disabled:from-brand-textMuted disabled:to-brand-textMuted text-white py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce typing-dot" />
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce typing-dot" />
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce typing-dot" />
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <Sparkles className="h-4 w-4 text-purple-200 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
