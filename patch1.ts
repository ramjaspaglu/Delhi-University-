import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const liveSearchEmbedCode = `
const LiveSearchEmbed = ({ query }: { query: string }) => {
  const [results, setResults] = useState<{name: string, path: string, source: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [kRes, mRes] = await Promise.all([
          fetch('/api/kalindi-papers').then(r => r.ok ? r.json() : {links: []}).catch(() => ({links: []})),
          fetch('/api/maitreyi-papers').then(r => r.ok ? r.json() : {links: []}).catch(() => ({links: []}))
        ]);
        
        let allLinks: {name: string, path: string, source: string}[] = [];
        if (kRes.links) allLinks = allLinks.concat(kRes.links.map((l: any) => ({...l, source: 'Kalindi'})));
        if (mRes.links) allLinks = allLinks.concat(mRes.links.map((l: any) => ({...l, source: 'Maitreyi'})));
        
        const q = query.toLowerCase();
        const filtered = allLinks.filter(l => !l.isDir && l.name.toLowerCase().includes(q));
        setResults(filtered.slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!query || query.length < 3) return null;
  
  return (
    <div className="mt-8 bg-white border border-gray-100 rounded-apple-xl p-6 shadow-apple">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="text-indigo-600" size={20} />
        <h3 className="font-bold text-lg">Live API Sync Matches</h3>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-black uppercase tracking-widest hidden sm:inline-block">Official</span>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
           <Loader2 className="animate-spin text-indigo-500" size={24} />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((r, i) => (
             <a key={i} href={r.path} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 rounded-apple transition-colors border border-gray-100 hover:border-indigo-200">
                <File className="text-indigo-500 shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{r.name}</p>
                  <p className="text-xs text-indigo-600 font-bold">{r.source}</p>
                </div>
             </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No live official papers found for "{query}".</p>
      )}
    </div>
  );
};

`;

content = content.replace(
  'const OfficialRepositoryBrowser = () => {', 
  liveSearchEmbedCode + 'const OfficialRepositoryBrowser = () => {'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Added LiveSearchEmbed!');
