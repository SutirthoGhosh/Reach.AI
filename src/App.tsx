import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Target, 
  Goal, 
  MessageSquare, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCcw,
  Settings,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  History as HistoryIcon,
  ChevronRight
} from 'lucide-react';
import { generateOutreachMessages, OutreachResponse } from './services/geminiService';

export default function App() {
  const [formData, setFormData] = useState({
    audience: '',
    goal: '',
    tone: 'professional'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OutreachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    } else {
      setShowSettings(true);
    }

    const savedHistory = localStorage.getItem('reach_ai_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('History parse error:', e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setIsKeySaved(!!apiKey);
    setShowSettings(false);
    showToast('API Key Saved');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tones = [
    { value: 'professional', label: 'Pro' },
    { value: 'casual', label: 'Casual' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'aggressive', label: 'Direct' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.audience || !formData.goal) return;
    if (!isKeySaved) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateOutreachMessages(formData, apiKey);
      setResults(data);
      
      const newHistoryItem = {
        id: Date.now(),
        input_text: JSON.stringify(formData),
        output_text: JSON.stringify(data),
        created_at: new Date().toISOString()
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
      setHistory(updatedHistory);
      localStorage.setItem('reach_ai_history', JSON.stringify(updatedHistory));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-bg-main text-zinc-400 font-sans overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 32, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed left-1/2 z-[60] px-6 py-3 bg-white text-black font-bold rounded-full shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-md glass-modal overflow-hidden p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-0.5">Configuration</h2>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">AI Orchestration</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gemini API Key</label>
                    <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${isKeySaved ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {isKeySaved ? 'Ready' : 'Cold'}
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="luxury-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </section>

                <section className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-zinc-300">
                    <Info className="w-3 h-3" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Onboarding</h3>
                  </div>
                  <ol className="space-y-2 text-[11px] text-zinc-500 font-medium">
                    <li className="flex gap-2">
                      <span className="text-zinc-700">01</span>
                      Visit Google AI Studio apikey panel.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-zinc-700">02</span>
                      Generate or copy an existing key.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-zinc-700">03</span>
                      Persist the key in this terminal.
                    </li>
                  </ol>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] font-bold text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-all uppercase tracking-widest"
                  >
                    Launch Studio
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </section>

                <button
                  onClick={handleSaveSettings}
                  className="luxury-button"
                >
                  Confirm Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="w-60 border-r border-border-subtle bg-bg-sidebar flex flex-col shrink-0">
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 mb-8 mt-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-white italic">Reach.AI</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left mb-2 ${
                showHistory ? 'bg-white text-black border-white' : 'bg-white/[0.02] border-white/[0.05] text-zinc-500 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">History</span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
            </button>

            {showHistory ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {history.length > 0 ? history.map((item) => {
                  const input = JSON.parse(item.input_text);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFormData(input);
                        setResults(JSON.parse(item.output_text));
                        setShowHistory(false);
                      }}
                      className="w-full p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-lg text-left group hover:bg-white/[0.04] transition-all"
                    >
                      <p className="text-[10px] font-bold text-white truncate group-hover:text-brand-accent transition-colors">
                        {input.audience}
                      </p>
                      <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-black mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  );
                }) : (
                  <p className="text-[9px] text-zinc-700 italic text-center py-10">No history yet.</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                    <Target className="w-3 h-3 opacity-40" />
                    Audience
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Market Segment"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="luxury-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1.5">
                    <Goal className="w-3 h-3 opacity-40" />
                    Objective
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Conversion Goal"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="luxury-input resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Voice</label>
                  <div className="grid grid-cols-2 gap-1">
                    {tones.map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tone: tone.value })}
                        className={`luxury-tab ${
                          formData.tone === tone.value
                            ? 'bg-white text-black'
                            : 'bg-white/[0.02] border border-white/[0.03] text-zinc-600 hover:text-white'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || !formData.audience || !formData.goal}
                    className="luxury-button disabled:opacity-20 group"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Deploy Synthesis
                        <RefreshCcw className="w-3 h-3 transition-transform group-hover:rotate-180 duration-700" />
                      </>
                    )}
                  </button>
                  {!isKeySaved && (
                    <p className="text-[8px] text-amber-500/40 font-black text-center mt-2 uppercase tracking-widest">
                      Key required
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="mt-auto p-5 border-t border-border-subtle group relative">
          <div className="p-2.5 bg-white/[0.01] border border-white/[0.02] rounded-lg flex items-center justify-between cursor-default">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">System Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-bg-main">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.01] blur-[100px] rounded-full pointer-events-none" />

        <header className="h-12 flex items-center justify-between px-6 z-10 border-b border-border-subtle bg-bg-main/40 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-semibold tracking-tight text-white flex items-center gap-2">
              <span className="text-zinc-700 font-bold uppercase text-[9px] tracking-widest">Workspace /</span>
              {formData.audience || 'Genesis'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="secondary-button"
            >
              <Settings className="w-2.5 h-2.5" />
              Config
            </button>
          </div>
        </header>

        <section className="p-6 flex-1 flex flex-col gap-5 overflow-hidden relative">
          <div className="flex items-end justify-between shrink-0">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-1">Concept Stream</p>
              <h3 className="text-lg font-bold tracking-tight text-white">Creative Variations</h3>
            </div>
            {results && (
              <div className="flex gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Confidence</span>
                  <span className="text-sm font-bold text-white tracking-tighter">8.4%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-12">
            <AnimatePresence mode="wait">
              {results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 gap-4"
                >
                  {results.messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="premium-card p-5 group"
                    >
                      <div className="absolute top-4 right-4 flex gap-2.5">
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-white text-black text-[8px] font-black rounded uppercase tracking-widest">
                            Best Performance
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(`${msg.subject ? `Subject: ${msg.subject}\n\n` : ''}${msg.content}`, idx)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                            copiedIndex === idx
                              ? 'bg-green-500 text-white'
                              : 'bg-white/[0.04] text-zinc-700 hover:bg-white/10 hover:text-zinc-400 border border-white/5 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {copiedIndex === idx ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                          {copiedIndex === idx ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="max-w-lg">
                        {msg.subject && (
                          <div className="mb-2.5">
                            <span className="text-[8px] font-black tracking-widest uppercase text-zinc-800 block mb-0.5">Subject</span>
                            <p className="text-xs font-bold text-zinc-200 tracking-tight">{msg.subject}</p>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-zinc-400 font-medium whitespace-pre-wrap italic">
                          "{msg.content}"
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center bg-white/[0.005] border border-white/[0.01] rounded-2xl border-dashed">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 text-white/5 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-3.5 h-3.5 text-zinc-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-tight text-white/60 uppercase tracking-widest">Neural Drafting</p>
                    <p className="text-[8px] text-zinc-800 uppercase tracking-[0.2em] font-black">Optimizing linguistic structures</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white/[0.005] border border-white/[0.01] rounded-2xl border-dashed">
                  <div className="w-10 h-10 bg-white/[0.01] border border-white/[0.02] rounded-xl flex items-center justify-center mb-5">
                    <MessageSquare className="w-4 h-4 text-zinc-800" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">Pure conversion.</h3>
                  <p className="text-[9px] text-zinc-700 max-w-[180px] leading-relaxed uppercase tracking-widest font-black">
                    Define metrics to initiate the synthesis process.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Action Summary Bar */}
        <div className="h-14 border-t border-border-subtle bg-bg-main/60 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest mb-0.5">Status</span>
              <span className={`text-[9px] font-bold flex items-center gap-1.5 ${isKeySaved ? 'text-green-500/70' : 'text-amber-500/70'}`}>
                <div className={`w-1 h-1 rounded-full ${isKeySaved ? 'bg-green-500' : 'bg-amber-500'}`} />
                {isKeySaved ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest mb-0.5">Model</span>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest">G-3.F PRE</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => setShowHistory(true)}
               className="secondary-button !border-zinc-800"
             >
               History
             </button>
             <button 
               onClick={() => results && handleCopy(JSON.stringify(results, null, 2), -1)}
               className="accent-button"
             >
               Export JSON
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}


