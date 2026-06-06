import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// For Universal Search
content = content.replace(
  '{globalSearchResults.courses.length === 0 && globalSearchResults.subjects.length === 0 && (', 
  '<LiveSearchEmbed query={globalSearchQuery} />\n                  {globalSearchResults.courses.length === 0 && globalSearchResults.subjects.length === 0 && ('
);

// For AI Discovery
content = content.replace(
  '</div>\n\n                  {discoveryResults.length > 0 && (', 
  '</div>\n\n                  {discoveryResults.length > 0 && (\n                    <div className="w-full">'
);
content = content.replace(
  /{discoveryResults\.map\(\(res: any, i: number\) => \(/g, 
  `{discoveryResults.map((res: any, i: number) => (`
);

// I should inject the AI Discovery embed below the map
content = content.replace(
  /<\/div>\n                       <\/a>\n                     <\/motion\.div>\n                   \)\)}/g, 
  `</div>\n                       </a>\n                     </motion.div>\n                   ))}`
);

// Actually let's just append it after the whole block for discoveryResults
content = content.replace(
  '</motion.div>\n                  )}\n\n                  <div className="mt-20">',
  '</motion.div>\n                  )}\n                  <LiveSearchEmbed query={searchQuery} />\n\n                  <div className="mt-20">'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Added tags');
