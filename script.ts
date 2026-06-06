import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/components/AdminPanel.tsx');
let content = fs.readFileSync(file, 'utf8');

// Header Banner
content = content.replace(
  'className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 pb-6"',
  'className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6"'
);

// Navigation tabs wrapper
content = content.replace(
  'className="grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap border border-slate-200 bg-slate-50 rounded-apple p-1 max-w-4xl gap-1"',
  'className="flex flex-wrap border border-slate-200/80 bg-slate-50/80 rounded-apple-xl p-1.5 w-full gap-1 shadow-sm"'
);

// Top level small quick stats cards
content = content.replace(
  /className="p-4 bg-slate-50 border border-slate-200 rounded text-center min-w-\[110px\]"/g,
  'className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]"'
);

// Replace button classes
for (let i=0; i<30; i++) {
content = content.replace(
  /className=\{\`py-2 px-2\.5 text-\[9\.5px\] font-extrabold uppercase tracking-widest transition-all rounded (relative )?text-center \$\{\n\s+activeAdminSubTab === '[^']+' \? 'bg-white text-emerald-60[05] shadow-sm' : 'text-slate-500 hover:text-slate-950'\n\s+\} sm:flex-1\`\}/,
  (match, p1) => match.replace('py-2 px-2.5', 'py-3 px-4 shrink-0').replace('rounded', 'rounded-lg hover:bg-slate-100')
)
}

// Global rounded-apple to rounded-apple-2xl replacements for general sections
content = content.replace(/border-slate-200/g, 'border-slate-200/80');
content = content.replace(/bg-white border border-slate-200\/80 rounded-apple\b/g, 'bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm');
content = content.replace(/bg-white border border-slate-200\/80 rounded-apple-xl\b/g, 'bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm');

// Fix specific layout grids inside User tab
content = content.replace(
  /className="bg-white border border-slate-200\/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-6 animate-in fade-in duration-300"/g,
  'className="flex flex-col gap-8 animate-in fade-in duration-300"\n          ><div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-8 md:p-10 space-y-8 flex flex-col"'
);

fs.writeFileSync(file, content);
console.log('Done!');
