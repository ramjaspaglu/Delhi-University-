const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 min-\[420px\]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 md:gap-6">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*}\);\s*}\)\(\)}/m;

const match = regex.exec(content);
if (match) {
  // We'll replace it with a cleaner list UI
  const replacement = `<div className="flex flex-col gap-3">
                          {groupItems.map((m) => {
                            const isQuarantined = m.flags !== undefined && m.flags >= (moderationSettings.flagThreshold || 5);
                            if (isQuarantined) {
                              return (
                                <div 
                                  key={m.id}
                                  className="bg-slate-50 border border-slate-200 rounded-apple-xl flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 cursor-not-allowed select-none opacity-80"
                                >
                                  <div className="shrink-0 p-3 bg-slate-200 text-slate-500 rounded-apple border border-slate-300">
                                    <Lock size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Under Peer Review</span>
                                      <span className="text-[7.5px] font-black text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded uppercase tracking-widest">
                                        Quarantined
                                      </span>
                                    </div>
                                    <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest leading-normal truncate">
                                      {m.title}
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                      Hidden due to {m.flags} / {moderationSettings.flagThreshold || 5} community flags.
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <motion.div 
                                key={m.id}
                                variants={{
                                  hidden: { opacity: 0 },
                                  show: { opacity: 1 }
                                }}
                                className="group relative bg-white border border-slate-200 rounded-apple-xl hover:border-emerald-600 transition-all flex flex-col sm:flex-row sm:items-center p-4 gap-4 sm:gap-6 shadow-sm hover:shadow-md"
                              >
                                {/* Leading Icon */}
                                <div className="shrink-0 hidden sm:block">
                                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-apple flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                    {m.type === 'VIDEO' ? <Video size={24} /> : 
                                      m.type === 'PDF' ? <FileText size={24} /> : 
                                      <File size={24} />}
                                  </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <div className="card-label opacity-40 group-hover:opacity-100 group-hover:text-emerald-600 transition-colors hidden sm:block">
                                      Node // {m.type}
                                    </div>
                                    {(() => {
                                      const isOfficial = !m.tags?.some(tag => tag.toLowerCase().includes('community')) &&
                                                          (!m.submittedBy || m.submittedBy === 'System Seeder');
                                      return isOfficial ? (
                                        <span className="text-[8px] font-black text-sky-700 border border-sky-200 bg-sky-50 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
                                          <ShieldCheck size={9} className="stroke-[2.5px]" />
                                          <span>Official</span>
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-black text-amber-700 border border-amber-250 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
                                          <Users size={9} className="stroke-[2.5px]" />
                                          <span>Community</span>
                                        </span>
                                      );
                                    })()}
                                    {m.type === 'PDF' && (
                                       <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                                         <FileText size={9} className="stroke-[2.5px]" />
                                         <span>PDF</span>
                                       </span>
                                    )}
                                    {m.type === 'NOTES' && (
                                       <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
                                         <BookOpen size={9} className="stroke-[2.5px]" />
                                         <span>Notes</span>
                                       </span>
                                    )}
                                    {(m.type === 'PDF' || m.type === 'NOTES' || m.url.toLowerCase().endsWith('.pdf')) && (
                                      <span className="text-[8px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest shrink-0">
                                        {getPdfSize(m.title, m.id)}
                                      </span>
                                    )}
                                    {m.tags && m.tags.filter(t => t.toLowerCase() !== 'community').map(tag => (
                                      <span key={tag} className="text-[8px] font-black text-emerald-600 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        {tag}
                                      </span>
                                    ))}
                                    {m.flags !== undefined && m.flags > 0 && (
                                      <span className="text-[8px] font-black text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        Flagged ({m.flags})
                                      </span>
                                    )}
                                  </div>

                                  <a 
                                    href={m.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      trackMaterialInteraction(m.id, 'click');
                                      if (m.type === 'PDF' || m.type === 'NOTES' || m.url.toLowerCase().endsWith('.pdf')) {
                                        e.preventDefault();
                                        setPreviewMaterial(m);
                                      }
                                    }}
                                    className="block group/title"
                                  >
                                    <h4 className="text-[11px] md:text-xs font-black text-slate-700 group-hover/title:text-emerald-700 uppercase tracking-widest leading-normal line-clamp-2 transition-colors">
                                      {m.title}
                                    </h4>
                                  </a>
                                  
                                  <div className="mt-3 flex items-center gap-3">
                                    <RatingButtons material={m} user={user} compact />
                                    <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 text-[9px] font-bold text-slate-400 capitalize tracking-wider">
                                       <span className="flex items-center gap-1 font-mono" title={\`Downloads: \${m.downloads || 0}\`}>
                                         <Download size={10} /> {m.downloads || 0} DL
                                       </span>
                                       {calculateCtr(m.clicks, m.impressions) > 0 && (
                                         <span className="flex items-center gap-1 font-mono text-emerald-600">
                                           <MousePointer2 size={10} /> {calculateCtr(m.clicks, m.impressions).toFixed(0)}% CTR
                                         </span>
                                       )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="shrink-0 flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-none">
                                  <button 
                                    title="Report Integrity Loss"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const materialRef = doc(db, 'materials', m.id);
                                        const nextVal = (m.flags || 0) + 1;
                                        await updateDoc(materialRef, { flags: increment(1) });
                                        alert(\`Community flag registered on: "\${m.title}". Active threshold: \${moderationSettings.flagThreshold || 5}. Current flags: \${nextVal}\`);
                                      } catch (err) {
                                        alert(\`Reporting error: \${err.message}\`);
                                      }
                                    }}
                                    className="p-2 sm:p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-apple border border-slate-200 transition-colors shadow-sm"
                                  >
                                    <AlertCircle size={14} />
                                  </button>
                                  <button 
                                    title="Email via Gmail"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEmailMaterialId(m.id);
                                      if (user && user.email) setGmailRecipient(user.email);
                                      else setGmailRecipient("");
                                    }}
                                    className="p-2 sm:p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-apple border border-slate-200 transition-colors shadow-sm"
                                  >
                                    <Mail size={14} />
                                  </button>
                                  <button 
                                    title={bookmarkedMaterials.some(bm => bm.id === m.id) ? "Saved in Study Desk" : "Save to Study Desk"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBookmark(m);
                                    }}
                                    className={\`p-2 sm:p-2.5 rounded-apple border transition-all shadow-sm \${
                                      bookmarkedMaterials.some(bm => bm.id === m.id)
                                        ? 'bg-emerald-50 border-emerald-250 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                                    }\`}
                                  >
                                    <BookmarkCheck size={14} />
                                  </button>
                                  {(m.type === 'PDF' || m.type === 'NOTES' || m.url.toLowerCase().endsWith('.pdf')) ? (
                                    <a 
                                      href={m.url}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        trackMaterialInteraction(m.id, 'download');
                                      }}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 border border-slate-900 hover:bg-emerald-600 hover:border-emerald-600 text-white rounded-apple transition-colors text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0"
                                    >
                                      <Download size={13} className="stroke-[2.5px]" />
                                      <span className="sm:hidden">Get File</span>
                                    </a>
                                  ) : (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const shareData = { title: m.title, url: m.url };
                                        if (navigator.share) navigator.share(shareData).catch(console.error);
                                        else navigator.clipboard.writeText(m.url);
                                      }}
                                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] rounded-apple shadow-emerald-sm active:scale-95 transition-all shrink-0"
                                    >
                                      <Share2 size={13} className="stroke-[2.5px]" />
                                      <span className="sm:hidden">Share</span>
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}`;
  const newContent = content.substring(0, match.index) + replacement + content.substring(match.index + match[0].length);
  fs.writeFileSync('src/App.tsx', newContent);
  console.log("Replaced successfully!");
} else {
  console.log("No match found!");
}
