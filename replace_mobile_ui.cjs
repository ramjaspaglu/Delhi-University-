const fs = require('fs');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Change horizontal borders and rounded corners only
  content = content.replace(/rounded-apple-2xl/g, 'rounded-none sm:rounded-apple-2xl');
  content = content.replace(/rounded-apple-xl/g, 'rounded-none sm:rounded-apple-xl');
  content = content.replace(/rounded-apple/g, 'rounded-none sm:rounded-apple');
  
  content = content.replace(/border border-/g, 'border-y sm:border sm:border-x border-');
  content = content.replace(/border-y sm:border sm:border-x border-b/g, 'border-b'); // fix duplicate if any
  content = content.replace(/border-y sm:border sm:border-x border-t/g, 'border-t');
  
  // Actually, tailwind has `border border-slate-200`. 
  // Just border -> border-y border-x-0 sm:border sm:border-x
  // Wait, if I replace `border` alone it will ruin `border-b` etc.
  // Better use regex:
  content = content.replace(/(?<!-)\bborder\b(?!-)/g, 'border-y border-x-0 sm:border sm:border-x');

  fs.writeFileSync(filePath, content);
  console.log(`Processed ${filePath}`);
}

const files = [
  'src/App.tsx',
  'src/components/DeepResearchLabs.tsx',
  'src/components/AIFeatures.tsx',
  'src/components/AdminPanel.tsx',
  'src/components/AlgorithmAnalytics.tsx',
  'src/components/CollegesBrowser.tsx',
  'src/components/CourseMaterialsCount.tsx',
  'src/components/HealthPage.tsx',
  'src/components/LiveSearch.tsx',
  'src/components/MainFeaturesList.tsx',
  'src/components/Navbar.tsx',
  'src/components/NotificationsPage.tsx',
  'src/components/ProfilePage.tsx',
  'src/components/ReportIssueModal.tsx',
  'src/components/ResourceAggregator.tsx',
  'src/components/Roadmap.tsx'
];

for (const file of files) {
  processFile(file);
}
