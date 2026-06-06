import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace rounded-* with rounded-apple
content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-apple');
content = content.replace(/rounded-\[3rem\]/g, 'rounded-apple-xl');
content = content.replace(/rounded-\[2rem\]/g, 'rounded-apple');
content = content.replace(/rounded-3xl/g, 'rounded-apple');
content = content.replace(/rounded-2xl/g, 'rounded-apple');
content = content.replace(/rounded-xl/g, 'rounded-apple');
content = content.replace(/rounded-lg/g, 'rounded-apple');

// Fix the blur utilities for mobile performance
content = content.replace(/blur-3xl/g, 'blur-3xl hidden md:block');
content = content.replace(/blur-2xl/g, 'blur-2xl hidden md:block');
content = content.replace(/hidden md:block hidden md:block/g, 'hidden md:block'); // in case of duplicate

fs.writeFileSync('src/App.tsx', content);

console.log("Replaced successfully!");
