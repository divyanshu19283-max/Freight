import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

const FALLBACKS = [
  'Demo mode is active. I can explain the bundled freight forecasts, charter choices, vessel fit, congestion and optimization logic.',
  'For the current demo corridor, compare forecast rate, confidence, congestion exposure and delivered cost before chartering.',
  'The dashboard uses deterministic bundled SIH-style data. Values shown in the dashboard are demonstration values, not a live market feed.',
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: FALLBACKS[0] },
  ]);

  const send = async () => {
    const question = input.trim();
    if (!question) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: question }]);

    // Optional LLM proxy. Keep secrets server-side; never put an API key in Vite.
    const url = import.meta.env.VITE_LLM_API_URL as string | undefined;
    if (url) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question }),
        });
        if (response.ok) {
          const data = await response.json();
          setMessages((m) => [...m, { role: 'assistant', text: String(data.answer ?? data.message ?? 'LLM response received.') }]);
          return;
        }
      } catch {
        // Deterministic fallback below keeps the demo usable.
      }
    }

    setMessages((m) => [...m, { role: 'assistant', text: FALLBACKS[Math.abs(question.length) % FALLBACKS.length] }]);
  };

  return <>
    {open ? <div className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-accent-300" /><span className="text-sm font-semibold text-white">Freight AI Assistant</span></div>
        <button onClick={() => setOpen(false)} aria-label="Close AI assistant"><X className="h-4 w-4 text-slate-400" /></button>
      </div>
      <div className="max-h-80 space-y-3 overflow-y-auto p-3">
        {messages.map((m, i) => <div key={i} className={`rounded-xl p-3 text-xs leading-relaxed ${m.role === 'user' ? 'ml-8 bg-accent-500/10 text-accent-100' : 'mr-5 bg-white/[0.04] text-slate-300'}`}>{m.text}</div>)}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about freight, vessel or chartering…" className="input flex-1" />
        <button onClick={send} className="btn-primary px-3" aria-label="Send"><Send className="h-4 w-4" /></button>
      </div>
    </div> : <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-accent-500/30 bg-ink-900 px-4 py-3 text-xs font-semibold text-white shadow-xl hover:bg-ink-800"><Bot className="h-4 w-4 text-accent-300" />AI Assistant</button>}
  </>;
}
