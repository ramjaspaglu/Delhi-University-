import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace hover:scale-105 with hover:scale-105 active:scale-95
content = content.replace(/hover:scale-105/g, 'hover:scale-105 active:scale-95');

// Make standard buttons responsive to touch
content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-indigo-700 active:scale-95');
content = content.replace(/hover:bg-slate-800/g, 'hover:bg-slate-800 active:scale-[0.98]');
content = content.replace(/hover:bg-white/g, 'hover:bg-white active:scale-[0.98]');
content = content.replace(/cursor-pointer/g, 'cursor-pointer active:scale-[0.98]');

// Also ensure cards that are cursor-pointer get a touch state
fs.writeFileSync('src/App.tsx', content);

console.log("Button active states applied!");
