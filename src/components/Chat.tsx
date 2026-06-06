import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: { role: 'user' | 'ai', content: string } = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      const aiMsg: { role: 'user' | 'ai', content: string } = { role: 'ai', content: data.response };
      setMessages([...newMessages, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 text-white rounded-apple-xl shadow-emerald-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          id="chat-trigger"
        >
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform sm:w-7 sm:h-7" />
        </button>
      )}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[75vh] min-h-[400px] max-h-[550px] bg-white rounded-apple-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300" id="chat-window">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-emerald-600 rounded-apple flex items-center justify-center text-white shadow-emerald-sm">
                  <MessageSquare size={16} />
               </div>
               <div>
                  <span className="font-black text-[11px] uppercase tracking-tighter text-slate-900 block leading-tight">Assistant Node</span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Live Link</span>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
            {messages.length === 0 && (
              <div className="py-20 text-center space-y-4">
                 <p className="card-label">Protocol Initialized</p>
                 <p className="text-xs font-bold text-slate-400 max-w-[200px] mx-auto leading-relaxed">ASK ANY QUESTION REGARDING THE ARCHIVE OR ACADEMIC GUIDANCE.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-apple-lg text-[11px] font-bold leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white shadow-emerald-sm' 
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-apple shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          <div className="p-6 bg-white border-t border-slate-100 flex gap-4 items-center">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 text-[11px] font-bold border border-slate-100 bg-slate-50 p-4 rounded-apple focus:border-emerald-600 focus:bg-white transition-all outline-none"
              placeholder="SYLLABUS, MATERIALS, GUIDANCE..."
              id="chat-input"
            />
            <button 
              onClick={sendMessage} 
              className="w-12 h-12 bg-emerald-600 text-white rounded-apple shadow-emerald-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              id="chat-send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
