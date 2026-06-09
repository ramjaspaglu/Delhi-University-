const fs = require('fs');
const path = require('path');

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // We want to avoid doubling up our classes if we run multiple times.
  // We'll revert our previous border replacement just in case
  content = content.replace(/border-y border-x-0 sm:border sm:border-x/g, 'border');
  content = content.replace(/rounded-none sm:rounded-apple-2xl/g, 'rounded-apple-2xl');
  content = content.replace(/rounded-none sm:rounded-apple-xl/g, 'rounded-apple-xl');
  content = content.replace(/rounded-none sm:rounded-apple/g, 'rounded-apple');

  content = content.replace(/px-4 sm:px-8 py-4 sm:py-8 md:px-10 md:py-10 h-full/g, 'p-4 sm:p-8 md:p-10 h-full');
  
  // Re-apply safely:
  content = content.replace(/rounded-apple-2xl/g, 'rounded-none sm:rounded-apple-2xl');
  content = content.replace(/rounded-apple-xl/g, 'rounded-none sm:rounded-apple-xl');
  content = content.replace(/rounded-apple/g, 'rounded-none sm:rounded-apple');
  
  content = content.replace(/(?<!-)\bborder\b(?!-)/g, 'border-y border-x-0 sm:border sm:border-x');

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

const files = getFilesRecursively('src');
for (const file of files) {
  processFile(file);
}
