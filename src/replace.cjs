const fs = require('fs');
let content = fs.readFileSync('src/components/DeepResearchLabs.tsx', 'utf-8');

// Colors & Borders
content = content.replace(/bg-\[\#fcfbf9\]/g, 'bg-slate-50');
content = content.replace(/bg-stone-950/g, 'bg-slate-950');
content = content.replace(/bg-stone-900/g, 'bg-slate-900');
content = content.replace(/bg-stone-850/g, 'bg-slate-800');
content = content.replace(/bg-stone-800/g, 'bg-slate-800');
content = content.replace(/bg-stone-150/g, 'bg-slate-200');
content = content.replace(/bg-stone-100/g, 'bg-slate-100');
content = content.replace(/bg-stone-50/g, 'bg-slate-50');

content = content.replace(/text-stone-950/g, 'text-slate-950');
content = content.replace(/text-stone-900/g, 'text-slate-900');
content = content.replace(/text-stone-800/g, 'text-slate-800');
content = content.replace(/text-stone-700/g, 'text-slate-600');
content = content.replace(/text-stone-600/g, 'text-slate-500');
content = content.replace(/text-stone-500/g, 'text-slate-400');
content = content.replace(/text-stone-400/g, 'text-slate-300');
content = content.replace(/text-stone-300/g, 'text-slate-200');
content = content.replace(/text-stone-200/g, 'text-slate-100');

content = content.replace(/border-stone-950/g, 'border-slate-300');
content = content.replace(/border-stone-900/g, 'border-slate-200');
content = content.replace(/border-stone-800/g, 'border-slate-300');
content = content.replace(/border-stone-200/g, 'border-slate-100');

content = content.replace(/text-emerald-400/g, 'text-emerald-600');

// Borders thickness
content = content.replace(/border-4 border-slate-200/g, 'border border-slate-100');
content = content.replace(/border-2 border-slate-200/g, 'border border-slate-200');
content = content.replace(/border-4 border-stone-900/g, 'border border-slate-100');
content = content.replace(/border-2 border-stone-900/g, 'border border-slate-200');
content = content.replace(/border border-stone-900/g, 'border border-slate-200');

// Shape
content = content.replace(/rounded-none/g, 'rounded-apple');

// Shadows
content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');

// Fonts
content = content.replace(/font-mono/g, '');

// Special specific sections 
// 1. the main container
content = content.replace(
  'id="firecrawl_labs_panel" className="w-full bg-slate-50 text-slate-900 border border-slate-100 p-4 sm:p-6 md:p-8 select-text rounded-apple font-sans mb-12 shadow-sm"',
  'id="firecrawl_labs_panel" className="w-full bg-slate-50 text-slate-900 border border-slate-100 p-4 sm:p-6 md:p-8 select-text rounded-apple-2xl font-sans mb-12 shadow-sm relative"'
);

// 2. The title
content = content.replace(/text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter/g, 'text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase');

// 3. Tab select class
content = content.replace(/\? "bg-stone-900 text-\[\#fcfbf9\] shadow-none translate-x-1 translate-y-1"/g, '? "bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-apple-xl shadow-sm"');
content = content.replace(/: "bg-white text-stone-900 shadow-\[4px_4px_0px_0px_rgba\(28,25,23,1\)\] hover:shadow-none hover:translate-x-1 hover:translate-y-1"/g, ': "bg-white text-slate-900 hover:border-emerald-600 border border-slate-100 rounded-apple-xl shadow-sm hover:bg-emerald-50 transition-all"');
content = content.replace(/bg-stone-900 text-\[\#fcfbf9\]/g, 'bg-emerald-600 text-white');
content = content.replace(/bg-stone-850 text-emerald-400/g, 'bg-emerald-50 text-emerald-600 border-none');

// 4. Primary Run Button
content = content.replace(/bg-stone-900 hover:bg-stone-850 disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-wider rounded-none hover:shadow-\[3px_3px_0px_0px_rgba\(10,10,10,0\.15\)\] transition-all flex/g, 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-apple shadow-emerald-sm transition-all flex');

// 5. Check circles
content = content.replace(/text-emerald-400/g, 'text-emerald-500');

fs.writeFileSync('src/components/DeepResearchLabs.tsx', content);
console.log('Replacements done!');
