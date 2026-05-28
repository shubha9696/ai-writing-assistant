import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  History, 
  LogOut, 
  User,
  ArrowRightLeft,
  BookOpen,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('rewrite'); // 'rewrite' or 'summarise'
  const [tone, setTone] = useState('default');
  const [length, setLength] = useState('same');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [error, setError] = useState('');
  const [mockMode, setMockMode] = useState(false);

  const username = api.getUsername();

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Pulsing loading messages sequence
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setError('');
    setOutput('');
    setLoading(true);

    try {
      const data = await api.rewrite(text, mode, tone, length);
      setOutput(data.output_text);
      if (data.note) {
        setMockMode(true);
      } else {
        setMockMode(false);
      }
      
      // Update local history by prepending the new record
      if (data.history) {
        setHistory((prev) => [data.history, ...prev]);
        setSelectedHistoryId(data.history.id);
      } else {
        fetchHistory();
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating text.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = (item) => {
    setText(item.original_text);
    setOutput(item.output_text);
    setMode(item.mode);
    setTone(item.tone || 'default');
    setLength(item.length || 'same');
    setSelectedHistoryId(item.id);
    setError('');
  };

  const loadingMessages = [
    "Analyzing syntax & structure...",
    "Consulting Claude's expert models...",
    "Adjusting style and parameters...",
    "Applying final stylistic polish..."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-100">
      {/* Premium Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-brand-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-accent/15 border border-brand-accent/25 glow-accent">
            <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-brand-accent bg-clip-text text-transparent">
              Antigravity Write
            </span>
            <span className="ml-2 text-xxs bg-brand-accent/10 border border-brand-accent/25 text-brand-accent px-2 py-0.5 rounded-full font-semibold">
              v1.0
            </span>
          </div>
        </div>

        {/* User Session Info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-brand-card/60 px-3.5 py-1.5 rounded-xl border border-brand-border/40">
            <User className="h-4 w-4 text-brand-textSecondary" />
            <span className="text-sm font-medium text-brand-textPrimary">{username}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 hover:bg-red-500/10 text-brand-textSecondary hover:text-red-400 border border-brand-border/40 hover:border-red-500/25 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Side: Input & Settings Form */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 lg:border-r lg:border-brand-border/30">
          <form onSubmit={handleProcess} className="space-y-6">
            
            {/* Input Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                <label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-accent" />
                  Source Text
                </label>
                <div className="flex items-center gap-4">
                  <span>{text.length} chars | {text.split(/\s+/).filter(Boolean).length} words</span>
                  {text && (
                    <button
                      type="button"
                      onClick={() => { setText(''); setSelectedHistoryId(null); setError(''); }}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>
              </div>
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here to begin perfecting it..."
                rows={8}
                className="w-full glass-input rounded-2xl p-4 text-sm leading-relaxed text-slate-100 placeholder-brand-textMuted resize-y min-h-[160px] font-sans"
              />
            </div>

            {/* AI Settings Controls */}
            <div className="glass-panel rounded-2xl p-5 border border-brand-border/30 grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Mode Control */}
              <div className="space-y-2.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Processing Mode
                </span>
                <div className="flex p-0.5 bg-brand-bg/85 rounded-xl border border-brand-border/50">
                  <button
                    type="button"
                    onClick={() => setMode('rewrite')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'rewrite'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Rewrite
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('summarise')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'summarise'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Summarize
                  </button>
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Style & Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 px-3 text-xs text-white"
                >
                  <option value="default">Default / Balanced</option>
                  <option value="professional">Professional & Crisp</option>
                  <option value="casual">Casual & Relatable</option>
                  <option value="academic">Academic & Exact</option>
                  <option value="creative">Creative & Fluid</option>
                  <option value="persuasive">Persuasive & Solid</option>
                </select>
              </div>

              {/* Length Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Output Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full glass-input rounded-xl py-2.5 px-3 text-xs text-white"
                >
                  <option value="same">Same as original</option>
                  <option value="shorter">Shorter & Concise</option>
                  <option value="longer">Longer & Detailed</option>
                </select>
              </div>

            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-brand-accent to-purple-600 hover:from-brand-accentHover hover:to-purple-700 disabled:from-brand-textMuted disabled:to-brand-textMuted text-white py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-accent/15 cursor-pointer flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 text-purple-200 animate-spin" />
                  Generating draft...
                </>
              ) : (
                <>
                  Perfect Writing
                  <Sparkles className="h-4 w-4 text-purple-200 transition-transform group-hover:scale-110" />
                </>
              )}
            </button>
          </form>

          {/* Results Box */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
              AI Generated Output
            </span>
            
            <div className="glass-panel rounded-2xl border border-brand-border/40 p-6 min-h-[180px] relative overflow-hidden flex flex-col justify-between">
              
              {/* Corner Mock Mode Tag */}
              {mockMode && !loading && (
                <div className="absolute top-3 right-3 text-xxs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                  MOCK MODE ACTIVE (Missing Claude Key)
                </div>
              )}

              {/* Content Panel */}
              <div className="space-y-4 flex-1">
                {error && (
                  <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs">
                    <span className="font-bold block mb-0.5">Generation Error</span>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="h-28 flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-brand-accent animate-bounce typing-dot" />
                      <span className="w-3.5 h-3.5 rounded-full bg-brand-accent animate-bounce typing-dot" />
                      <span className="w-3.5 h-3.5 rounded-full bg-brand-accent animate-bounce typing-dot" />
                    </div>
                    <p className="text-xs text-brand-textSecondary animate-pulse">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                ) : output ? (
                  <div className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap font-sans">
                    {output}
                  </div>
                ) : !error ? (
                  <div className="h-24 flex items-center justify-center text-sm text-brand-textMuted font-medium italic">
                    Type text above and click perfect to see AI improvement...
                  </div>
                ) : null}
              </div>

              {/* Output Actions */}
              {output && !loading && (
                <div className="flex items-center justify-between border-t border-brand-border/30 pt-4 mt-6">
                  <span className="text-xxs text-brand-textMuted">
                    {output.length} characters | {output.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-brand-card hover:bg-brand-border/60 hover:text-white border border-brand-border/40 text-brand-textSecondary py-2 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400 animate-scale" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Side: Collapsible History Sidebar */}
        <aside className="w-full lg:w-80 bg-brand-card/30 lg:overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
            <History className="h-4 w-4 text-brand-accent" />
            <h3>Your Perfecting History</h3>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-brand-textMuted italic bg-brand-card/40 rounded-2xl border border-brand-border/25">
                No past revisions found.
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleRestore(item)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 relative overflow-hidden group cursor-pointer ${
                    selectedHistoryId === item.id
                      ? 'bg-brand-accent/10 border-brand-accent/50'
                      : 'bg-brand-card/40 border-brand-border/30 hover:border-brand-border/60 hover:bg-brand-card/60'
                  }`}
                >
                  {/* Subtle hover gradient indicator */}
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-brand-textSecondary">
                    <span className="capitalize px-2 py-0.5 rounded bg-brand-bg border border-brand-border">
                      {item.mode}
                    </span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-brand-textPrimary font-semibold truncate">
                    {item.original_text}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-brand-textMuted group-hover:text-brand-accent transition-colors self-end mt-1 font-bold">
                    Restore Revision
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
