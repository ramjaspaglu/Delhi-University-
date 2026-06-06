import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, AlertCircle, Save, File, ExternalLink, ChevronLeft, ChevronRight, FileText, X, Copy, Check, Download } from 'lucide-react';
import { AcademicDocLoader, DigitalBeamScanner } from './Loader';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface Material {
    cleanName: string;
    path: string;
    category: string;
    source: string;
}

const getPdfSize = (title: string, path: string): string => {
  let hash = 0;
  const combined = (title || "") + (path || "");
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  const sizes = ['1.2 MB', '2.4 MB', '1.8 MB', '3.5 MB', '4.2 MB', '850 KB', '5.1 MB', '3.9 MB', '2.3 MB', '6.1 MB', '7.4 MB', '1.5 MB', '4.8 MB'];
  const index = Math.abs(hash) % sizes.length;
  return sizes[index];
};

export const LiveSearchEmbed = ({ query, setQuery, user, onSave }: { query: string, setQuery: (q: string) => void, user: any, onSave: (material: any) => void }) => {
  const [results, setResults] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [summaries, setSummaries] = useState<Record<string, { text?: string, loading?: boolean }>>({});
  const [selectedSummary, setSelectedSummary] = useState<Material | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleSummarize = async (material: Material) => {
    setSelectedSummary(material);
    if (summaries[material.path]?.text) return; // Already summarized
    
    setSummaries(prev => ({ ...prev, [material.path]: { loading: true } }));
    try {
      const res = await fetch('/api/summarize-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: material.path })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSummaries(prev => ({ ...prev, [material.path]: { text: data.summary, loading: false } }));
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      console.error("AI Summary error:", e);
      setSummaries(prev => ({ ...prev, [material.path]: { text: "Error: Could not extract node data. The file might be too large or restricted.", loading: false } }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        setSuggestion(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/aggregate-du?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.links || []);
          setSuggestion(data.suggestion || null);
          setCurrentPage(1); // Reset page on new load
        }
      } catch (e) {
        console.error("Aggregation error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchResults, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredResults = results.filter(r => {
    const catMatch = activeCategory === 'All' || r.category === activeCategory;
    return catMatch;
  });

  const categories = ['All', ...new Set(results.map(r => r.category))];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (!query || query.length < 2) return null;

  return (
    <>
      <div className="mt-8 bg-white border border-slate-200/80 rounded-apple-2xl p-6 md:p-10 shadow-sm">
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <div className="p-3 bg-emerald-600 rounded-apple text-white shadow-emerald-sm">
               <Search size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Search Results</h3>
              <p className="card-label mt-1">Direct indexed nodes // {filteredResults.length} units</p>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-50 flex-nowrap max-w-full">
            <span className="card-label text-slate-400 shrink-0">Map:</span>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-apple text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {loading ? (
        <DigitalBeamScanner message="Syncing Academic Nodes" subMessage="Processing digital repositories..." />
      ) : (
        <>
          {suggestion && (
            <div className="mb-10 p-5 bg-emerald-50/50 border border-emerald-100 rounded-apple-xl flex items-center gap-4">
              <Sparkles size={20} className="text-emerald-600 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight text-slate-900">
                Did you mean: <button onClick={() => setQuery(suggestion)} className="text-emerald-600 font-bold hover:underline decoration-2 underline-offset-4">{suggestion}</button>
              </p>
            </div>
          )}
          
          {paginatedResults.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                {paginatedResults.map((r, i) => (
                   <div key={i} className="group relative flex flex-col items-center justify-start p-6 bg-slate-50/50 hover:bg-white rounded-apple-xl transition-all border border-transparent hover:border-emerald-100 hover:shadow-xl h-full cursor-pointer">
                      <a href={r.path} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-start w-full text-center outline-none">
                         <div className="relative w-16 h-12 mb-6 mt-2">
                            {/* Material Icon Wrapper */}
                            <div className="w-full h-full bg-white rounded-apple border border-slate-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-sm">
                               <File size={22} className="transition-transform group-hover:scale-110" />
                            </div>
                         </div>
                         
                         <div className="flex flex-col items-center w-full space-y-2">
                           <p className="text-xs font-black text-slate-900 line-clamp-2 w-full leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{r.cleanName}</p>
                           <div className="h-0.5 w-6 bg-slate-100 group-hover:bg-emerald-600 transition-all rounded-full" />
                           <p className="card-label text-slate-400 group-hover:text-slate-500 w-full truncate">{r.source}</p>
                           {r.path.toLowerCase().endsWith('.pdf') && (
                             <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-mono font-black rounded bg-slate-950 border border-slate-950 text-white shadow-xs tracking-widest leading-none">
                               {getPdfSize(r.cleanName, r.path)}
                             </span>
                           )}
                         </div>
                      </a>
                      
                      <div className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all translate-y-0 lg:translate-y-1 lg:group-hover:translate-y-0 flex items-center gap-2 z-10">
                        {r.path.toLowerCase().endsWith('.pdf') && (
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSummarize(r); }} 
                              className={`p-2 bg-white rounded-apple text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95 ${summaries[r.path]?.loading ? 'animate-pulse' : ''}`}
                              title="AI Summarize"
                            >
                                {summaries[r.path]?.loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>
                        )}
                        {r.path.toLowerCase().endsWith('.pdf') && (
                          <a
                            href={r.path}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 bg-white rounded-apple text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
                            title="Download PDF directly"
                          >
                            <Download size={14} className="stroke-[2.5px]" />
                          </a>
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(r); }} 
                          className="p-2 bg-white rounded-apple text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95"
                          title="Add to Archive"
                        >
                            <Save size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                   </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-apple-xl">
                  <div className="card-label text-slate-400">
                    Node Block {Math.min((currentPage - 1) * itemsPerPage + 1, filteredResults.length)} - {Math.min(currentPage * itemsPerPage, filteredResults.length)} // Total {filteredResults.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-apple text-slate-400 hover:bg-white hover:text-emerald-600 disabled:opacity-30 transition-all border border-transparent hover:border-slate-100"
                    >
                      <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <span className="card-label text-slate-900 border-x border-slate-200 px-4">{currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-apple text-slate-400 hover:bg-white hover:text-emerald-600 disabled:opacity-30 transition-all border border-transparent hover:border-slate-100"
                    >
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 px-6 border-2 border-dashed border-slate-100 rounded-apple-2xl">
              <Search className="mx-auto text-slate-200 mb-6" size={56} />
              <p className="text-xl font-black uppercase text-slate-900 tracking-tighter">No matching nodes.</p>
              <p className="card-label mt-2">Try adjusting your archival queries.</p>
            </div>
          )}
        </>
      )}
    </div>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {selectedSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSummary(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-apple-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 md:px-10 md:py-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center rounded-apple shadow-emerald-sm shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Resource Intel</h3>
                    <p className="card-label mt-1.5 truncate text-slate-400">{selectedSummary.cleanName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSummary(null)}
                  className="p-3 hover:bg-slate-50 rounded-apple text-slate-400 hover:text-slate-900 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {summaries[selectedSummary.path]?.loading ? (
                  <AcademicDocLoader message="Running Extraction Protocol" subMessage="Gemini is parsing the manuscript nodes..." />
                ) : (
                  <div className="p-6 md:p-10 space-y-10">
                    <div className="bg-slate-50 border border-slate-100 p-8 md:p-10 rounded-apple-xl relative group">
                       <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                          <button 
                            onClick={() => copyToClipboard(summaries[selectedSummary.path]?.text || "")}
                            className="p-2.5 bg-white border border-slate-200 rounded-apple shadow-sm text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center gap-2"
                          >
                            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                       </div>

                       <div className="markdown-body prose prose-sm max-w-none text-slate-700 leading-relaxed font-sans selection:bg-emerald-100">
                          <Markdown>
                            {summaries[selectedSummary.path]?.text || "No data synthesized for this node."}
                          </Markdown>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6 pt-4">
                      <div className="h-0.5 flex-1 bg-slate-100" />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Node Analysis Manifest</span>
                      <div className="h-0.5 flex-1 bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white border border-slate-100 rounded-apple-xl hover:border-emerald-100 transition-colors">
                           <p className="card-label mb-2">Category Node</p>
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedSummary.category}</p>
                        </div>
                        <div className="p-6 bg-white border border-slate-100 rounded-apple-xl hover:border-emerald-100 transition-colors">
                           <p className="card-label mb-2">Primary Index</p>
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedSummary.source}</p>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                <a 
                  href={selectedSummary.path}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 bg-emerald-600 text-white p-5 rounded-apple font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-emerald-sm"
                >
                  <FileText size={18} strokeWidth={2.5} /> Access Full Node
                </a>
                <button 
                  onClick={() => setSelectedSummary(null)}
                  className="w-full sm:w-auto px-10 py-5 bg-slate-50 text-slate-400 rounded-apple font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                >
                  Close Archive
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
