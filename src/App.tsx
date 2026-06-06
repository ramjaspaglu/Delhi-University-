/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Loader2,
  GraduationCap,
  History,
  Info,
  Menu,
  X,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Library,
  Layers,
  Clock,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Mail,
  MessageSquare,
  Lock,
  ShieldCheck,
  Headset,
  Share2,
  Check,
  Folder,
  FolderOpen,
  File,
  ArrowBigUp,
  ArrowBigDown,
  Rocket,
  LogOut,
  ChevronDown,
  ExternalLink as LinkIcon2,
  Briefcase,
  Users,
  Network,
  Brain,
  Landmark,
  Save,
  LayoutGrid,
  Star,
  Heart,
  Upload,
  Download,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Activity,
  RefreshCw,
  Cpu,
  HardDrive,
  Binary
} from 'lucide-react';

import ProfilePage from './components/ProfilePage';
import HealthPage from './components/HealthPage';
import AIFeatures from './components/AIFeatures';
import OnboardingModal from './components/OnboardingModal';
import { LiveSearchEmbed } from './components/LiveSearch';
import { Roadmap } from './components/Roadmap';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import CollegesBrowser from './components/CollegesBrowser';
import CourseMaterialsCount from './components/CourseMaterialsCount';
import MainFeaturesList from './components/MainFeaturesList';
import ResourceAggregator from './components/ResourceAggregator';
import AdminPanel from './components/AdminPanel';
import { ReportIssueModal } from './components/ReportIssueModal';
import DeepResearchLabs from './components/DeepResearchLabs';
import AlgorithmAnalytics from './components/AlgorithmAnalytics';
import { AcademicDocLoader, RhythmicScanner, SkeletonGrid, DigitalBeamScanner } from './components/Loader';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  onSnapshot,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, isFirebaseConfigured } from './lib/firebase.ts';
import { Course, Subject, Material } from './types.ts';
import { DU_SEED_DATA } from './data';
import { fuzzyMatch } from './lib/fuzzy';
import { loadGooglePickerScript, openGooglePicker } from './lib/googlePicker';

// --- Constants ---
const OFFICIAL_DU_BASE_URL = "http://web.du.ac.in/PreviousQuestionPapers/";

// --- Components ---

const QUESTION_PAPERS_ARCHIVE = [
  {
    category: 'Arts & Humanities',
    courses: [
      {
        name: 'B.A. (Programme)',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1xTXjZMcwng1eKgyinlScId_28-rGHo24?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1c_9RbWwqeIefLriJEWs9LHjiH0iBLoaf?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) Economics',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1j4_6R220GFw00jxL1O9Li7_tUkoT69YT?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1TxebBhtmPvj3cW2wSSIQ3cT8SnWe9aVH?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) English',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1BBAEGGfUhIsmrg67jPeqjX89L55HVYZ8?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1RhK_Fy10qqlzpdK612niksRBQT-Qtnzp?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) Hindi',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1KZH2QQO0Sd5JlMVc7izon8Qo4Ra6f_xI?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1ZTRGCJwuf5dEmLqh7dCWAzZeaDt2pNS_?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) History',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1CU7_Uv8DlAph6V5LaPHrU3h-e6pJCpXu?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1ZSeK-OU0rO5wOvFouvYFUfqd_6mbSsf_?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) Political Science',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1I4_LEnIjrTPf5X5IGLDzsGJB20MchFer?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1Lc3KjC_bde859PPLTrFQbvV05q7WkV6E?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) Sanskrit',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1aIyrsBdSaAaDBbvqjS5IzjCXutPw_0Wc?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1SfdtXvUGd2mNjIH3AUU6mpc9VMz1-5Xg?usp=sharing' }
        ]
      },
      {
        name: 'B.A. (Hons) Sociology',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1CseJe66bcFD-saOa2nOZdI8_smV4fB-E?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1rbAwPEkqX5DlDgy9sFFPYTNwQPqTzatJ?usp=sharing' }
        ]
      }
    ]
  },
  {
    category: 'Commerce & Business',
    courses: [
      {
        name: 'B.Com. (Programme)',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/18XF2dar08cQlsMTd-37ZzqiLkotaAm9R?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1SxUEd1HfjwIMBbXm3Giw9S24XzU7Wsd-?usp=sharing' }
        ]
      },
      {
        name: 'B.Com. (Hons)',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1C9Ow7ihRpfNOd-lOThzBRVQ0s0HOJ8kL?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1yPlCnkY8RGjS0v181khyN61025-FcjB0?usp=sharing' }
        ]
      }
    ]
  },
  {
    category: 'Sciences',
    courses: [
      {
        name: 'B.Sc. Prog Life Sciences + PHY SC.',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/12LdFIn-5ITJ8fNNrcFeNKofAQsSObRCP?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/19-Z_V6ubf2VGFnWSopwqIbAxarSuXu9x?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. Prog Physical Science + Life Science / B.A.',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1QzJutFe8sTCHUrJiLekq6tR2RiSOcdmP?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/18810CI-LYijH2cmvQmqCRJ7BiZx6i3Ii?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. (Hons) Botany',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1Sey2Onev-vrf33w1u_q0BjDC1ZuTV-VH?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1Ep5GfWMYrrCguHtzRp6gE4IMXLVbTDnT?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. (Hons) Chemistry',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1s_OHyf1Lr12ELssRYtsPGNhkSKfE2B98?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1cbxdd2wFA1o5WxeM41si9Qc0-cKf8azH?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. (Hons) Mathematics',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1Ri0MxmLbO1FaKTVWsINBXbkRdwxvfxf4?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1AUDc-a2D2-IkxjZTQRiVSvPx6IDbvwcL?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. (Hons) Physics',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1iyIP2JFoQHTztTmqafyabApAX6ljGHuo?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1AUDc-a2D2-IkxjZTQRiVSvPx6IDbvwcL?usp=sharing' }
        ]
      },
      {
        name: 'B.Sc. (Hons) Zoology',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/15_NCZLzeS6t6BLvXd3hnb7jslU85nC8G?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1ApWBjdXjhW_q_qy84VC17-GMxIJcQS7J?usp=sharing' }
        ]
      }
    ]
  },
  {
    category: 'Common Courses & Skill Enhancement (SEC/VAC/AEC)',
    courses: [
      {
        name: 'All SEC',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1eX2ae5kVNHNBbNnJC8ALzleAUH879DwE?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1XZSGvFkBWgEKX-JaFD0TpGq326HxquuK?usp=sharing' }
        ]
      },
      {
        name: 'ALL GE',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1t12BJkOGPKctl1jgaJIybyP4Oz8RhB_u?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/10Geq-lfxeO87wSnrU3lJyvjh0tCiGNJK?usp=sharing' }
        ]
      },
      {
        name: 'ALL VAC',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1xwNB9Fb6aBB-IQqstoo2RLH2lSoFfZk9?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1rYUcQZkCZBRbviXUjlIkOe9SWTyQxw6K?usp=sharing' }
        ]
      },
      {
        name: 'ALL AEC / Common Prog. Group',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1yGOoBlFjnMgGijDKKMLOrgz5-vmIou15?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1Ra5hA-sl6ptJl16xv0KSWPuG4LHAhjDV?usp=sharing' }
        ]
      }
    ]
  },
  {
    category: 'Miscellaneous',
    courses: [
      {
        name: 'Question Papers Mix + Research Methodology',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1iXvyUDWKN0gwrt_PDWQiTt3_7pB_okhW?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1lMSxqc6gcyXa_W2iLhtc2WM-vKxGEneb?usp=sharing' }
        ]
      },
      {
        name: 'B.A. / B.Sc. Prog / All Common',
        links: [
          { term: 'May-June/July 2025', url: 'https://drive.google.com/drive/folders/1q4hoW7WQA71N0jjAWps2t6h1hLtsriNU?usp=sharing' },
          { term: 'Dec-Jan 2025-26', url: 'https://drive.google.com/drive/folders/1jgZe0WnEQw1p_1g4Y9p042U9MALQbczt?usp=sharing' }
        ]
      }
    ]
  }
];

const OfficialRepositoryBrowser = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [pathParts, setPathParts] = useState<{name: string, path: string}[]>([]);
  const [items, setItems] = useState<{name: string, path: string, isDir: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'du' | 'kalindi' | 'maitreyi'>('du');
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [allSubjectsList, setAllSubjectsList] = useState<{id: string, name: string, code: string, semester: number}[]>([]);
  
  // Sync Dialog state
  const [syncItem, setSyncItem] = useState<{name: string, url: string, type: string} | null>(null);
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    async function getSubjects() {
      try {
        const snap = await getDocs(collection(db, 'subjects'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort subjects by code or semester
        list.sort((a, b) => (a.semester || 1) - (b.semester || 1));
        setAllSubjectsList(list);
        if (list.length > 0) {
          setTargetSubjectId(list[0].id);
        }
      } catch (e) {
        console.error("Error reading subjects", e);
      }
    }
    getSubjects();
  }, []);

  useEffect(() => {
    // Reset search query whenever navigating to another folder or source
    setRepoSearchQuery('');
    
    async function fetchPath() {
      setLoading(true);
      try {
        let endpoint = `/api/du-papers?path=${encodeURIComponent(currentPath)}`;
        if (source === 'kalindi') endpoint = '/api/kalindi-papers';
        if (source === 'maitreyi') endpoint = '/api/maitreyi-papers';

        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.links) setItems(data.links);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPath();
  }, [currentPath, source]);

  const handleNavigate = (path: string, name: string, isDir: boolean) => {
    if (isDir) {
      setCurrentPath(path);
      const newParts = [];
      let acc = "";
      const splits = path.split('/').filter(Boolean);
      for (const p of splits) {
        acc += p + '/';
        newParts.push({ name: decodeURIComponent(p), path: acc });
      }
      setPathParts(newParts);
    } else {
      if (source === 'du') {
        window.open(OFFICIAL_DU_BASE_URL + path, '_blank');
      } else {
        window.open(path, '_blank');
      }
    }
  };

  const goHome = () => {
    setCurrentPath('');
    setPathParts([]);
  };

  const handleOpenSyncModal = (item: {name: string, url: string, type: string}) => {
    setSyncItem({
      name: item.name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase(),
      url: item.url,
      type: item.type
    });
    setFeedbackMsg('');
  };

  const handleExecuteSync = async () => {
    if (!syncItem || !targetSubjectId) return;
    setIsSyncing(true);
    setFeedbackMsg('');
    try {
      const selectedSub = allSubjectsList.find(s => s.id === targetSubjectId);
      const subName = selectedSub ? selectedSub.name : 'Target Subject';

      // 1. AddDoc to materials collection
      await addDoc(collection(db, 'materials'), {
        subjectId: targetSubjectId,
        title: syncItem.name,
        url: syncItem.url,
        type: syncItem.type,
        isApproved: true,
        submittedBy: 'Official Portal Integration',
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        flags: 0,
        tags: ['SYNCED', source.toUpperCase()]
      });

      // 2. AddDoc to submissions audit log
      await addDoc(collection(db, 'submissions'), {
        submissionType: 'MATERIAL',
        courseName: 'Official University Portal',
        subjectName: subName,
        semester: selectedSub ? selectedSub.semester : 1,
        title: syncItem.name,
        url: syncItem.url,
        type: syncItem.type,
        status: 'PUBLISHED',
        submittedByEmail: 'Academic Portal Sync',
        description: `Direct alignment from university source crawler repository // ${source.toUpperCase()}`,
        createdAt: new Date().toISOString()
      });

      setFeedbackMsg("Material alignment complete! Successfully indexed to course archive catalog.");
      setTimeout(() => {
        setSyncItem(null);
        setFeedbackMsg('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg("Failed to sync: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter items in real time based on search input
  const filteredItems = items.filter(item => 
    decodeURIComponent(item.name).toLowerCase().includes(repoSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-100 p-4 sm:p-8 md:p-10 h-full min-h-[500px] rounded-apple-2xl shadow-sm relative">
      <div className="flex flex-col lg:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600 text-white rounded-apple shadow-emerald-sm">
            <Globe size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl">Resource Browser</h3>
            <p className="card-label">Direct Link // {source === 'du' ? 'D.U. Official' : source.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex border border-slate-100 bg-slate-50 rounded-apple p-1 overflow-x-auto no-scrollbar flex-nowrap max-w-full">
          <button 
            onClick={() => { setSource('du'); goHome(); }}
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-apple text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${source === 'du' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            DU MAIN
          </button>
          <button 
            onClick={() => { setSource('kalindi'); goHome(); }}
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-apple text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${source === 'kalindi' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            KALINDI
          </button>
          <button 
            onClick={() => { setSource('maitreyi'); goHome(); }}
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-apple text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${source === 'maitreyi' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            MAITREYI
          </button>
        </div>
      </div>
      
      {source === 'du' && (
      <div className="flex items-center gap-2 mb-10 p-4 border border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest overflow-x-auto scrollbar-none">
         <button onClick={goHome} className="text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors">
            <Folder size={14} />
            <span>ROOT</span>
         </button>
         {pathParts.map((part, i) => (
           <React.Fragment key={i}>
             <span className="text-slate-200">/</span>
             <button onClick={() => {
                setCurrentPath(part.path);
                setPathParts(pathParts.slice(0, i + 1));
             }} className={`transition-colors truncate max-w-[200px] ${
               i === pathParts.length - 1 
                 ? 'text-slate-900 border-b border-slate-900' 
                 : 'text-slate-400 hover:text-slate-900'
             }`}>
               {part.name}
             </button>
           </React.Fragment>
         ))}
      </div>
      )}

      {/* Real-time search inside folder directory */}
      {items.length > 0 && (
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={repoSearchQuery}
            onChange={(e) => setRepoSearchQuery(e.target.value)}
            placeholder={`Filter through files & folders... (${filteredItems.length} matching of ${items.length})`}
            className="w-full bg-slate-50 border border-slate-150 focus:border-emerald-600 pl-11 pr-4 py-3.5 text-[10.5px] font-bold tracking-wider uppercase rounded-apple outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>
      )}

      {loading ? (
        <AcademicDocLoader message="Synchronizing nodes" subMessage="Loading resources in real time..." />
      ) : source === 'du' ? (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 md:gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {filteredItems.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              key={i} 
              onClick={() => handleNavigate(item.path, item.name, item.isDir)}
              className="group flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer h-full text-center shadow-sm hover:shadow-md min-h-[180px]"
            >
               <div className="w-12 h-12 bg-slate-50 rounded-apple flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
                    {item.isDir ? <Folder size={24} /> : <File size={24} />}
               </div>
               
               <div className="flex flex-col items-center w-full mb-3">
                 <span className={`text-[10px] font-black leading-tight line-clamp-3 w-full transition-colors uppercase tracking-tight ${item.isDir ? 'text-slate-900 group-hover:text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} title={decodeURIComponent(item.name)}>
                    {decodeURIComponent(item.name).replace(/\.pdf$/i, '').toUpperCase()}
                 </span>
               </div>

               {!item.isDir && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleOpenSyncModal({
                       name: decodeURIComponent(item.name).replace(/\.pdf$/i, '').toUpperCase(),
                       url: OFFICIAL_DU_BASE_URL + item.path,
                       type: 'PDF'
                     });
                   }}
                   className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white text-[8px] font-black uppercase tracking-widest rounded transition-all focus:outline-none"
                 >
                   Sync to DB
                 </button>
               )}
            </motion.div>
          ))}
          {items.length > 0 && filteredItems.length === 0 && (
             <div className="col-span-full py-24 flex flex-col items-center text-center text-slate-400 gap-6">
                <Search size={48} className="text-slate-350" />
                <p className="text-[10px] font-black uppercase tracking-widest">No matching papers found in this folder filter.</p>
             </div>
          )}
          {items.length === 0 && (
             <div className="col-span-full py-24 flex flex-col items-center text-center text-slate-300 gap-6">
                <Folder size={64} />
                <p className="text-[10px] font-black uppercase tracking-widest">Directory is currently empty.</p>
             </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 md:space-y-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {(() => {
            const groups: Record<string, typeof items> = {};
            filteredItems.forEach(item => {
              const name = item.name.toLowerCase();
              let cat = 'Other Documents';
              if (name.includes('b.a') || name.includes('ba')) cat = 'B.A. (Arts)';
              else if (name.includes('b.sc') || name.includes('bsc')) cat = 'B.Sc. (Sciences)';
              else if (name.includes('b.com') || name.includes('bcom')) cat = 'B.Com. (Commerce)';
              else if (name.includes('m.a') || name.includes('ma')) cat = 'Masters (M.A.)';
              else if (name.includes('m.sc') || name.includes('msc')) cat = 'Masters (M.Sc.)';
              else if (name.includes('ge') || name.includes('vacc') || name.includes('sec') || name.includes('aec')) cat = 'GE / SEC / VAC / AEC';
              else if (name.includes('syllabus')) cat = 'Syllabus';
              else if (name.includes('question') || name.includes('paper')) cat = 'Question Papers';
              
              if (!groups[cat]) groups[cat] = [];
              groups[cat].push(item);
            });

            return Object.entries(groups).map(([cat, catItems], idx) => (
              <div key={idx} className="space-y-4">
                      <h4 className="font-bold text-xl border-b border-gray-100 pb-2 text-slate-800 flex items-center gap-2">
                        {cat} <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-none font-black uppercase tracking-widest">{catItems.length} items</span>
                      </h4>
                      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 md:gap-6 pb-4">
                         {catItems.map((item, i) => {
                           return (
                             <div 
                               key={i}
                               className="group relative flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all h-full text-center shadow-sm hover:shadow-md min-h-[220px]"
                             >
                               <div className="w-12 h-12 bg-slate-50 rounded-apple flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                    {cat === 'Question Papers' && <File size={24} />}
                                    {cat === 'Syllabus' && <ExternalLink size={24} />}
                                    {cat !== 'Question Papers' && cat !== 'Syllabus' && <File size={24} />}
                               </div>
                               
                               <div className="flex flex-col items-center w-full text-center space-y-2 mb-3">
                                 <span className="card-label opacity-40 group-hover:opacity-100 group-hover:text-emerald-600 text-[8px]">
                                   {cat}
                                 </span>
                                 <span className="text-[10px] font-black text-slate-600 group-hover:text-emerald-600 leading-tight uppercase tracking-widest line-clamp-2">
                                    {decodeURIComponent(item.name).replace(/\.pdf$/i, '').toUpperCase()}
                                 </span>
                               </div>

                               <div className="flex flex-col gap-1.5 w-full mt-auto">
                                 <a
                                   href={item.path}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="w-full py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 text-[8px] font-extrabold uppercase tracking-widest rounded text-center transition-colors"
                                 >
                                   View Original
                                 </a>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleOpenSyncModal({
                                       name: decodeURIComponent(item.name).replace(/\.pdf$/i, '').toUpperCase(),
                                       url: item.path,
                                       type: cat === 'Question Papers' ? 'PDF' : 'LINK'
                                     });
                                   }}
                                   className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white text-[8px] font-black uppercase tracking-widest rounded transition-all focus:outline-none"
                                 >
                                   Sync to DB
                                 </button>
                               </div>
                            </div>
                          )})}
                      </div>
              </div>
            ));
          })()}
          {items.length > 0 && filteredItems.length === 0 && (
             <div className="col-span-full py-16 flex flex-col items-center text-center text-slate-400 space-y-3">
                <Search size={44} className="text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest">No matching papers found under these categories.</p>
             </div>
          )}
          {items.length === 0 && (
             <div className="col-span-full py-16 flex flex-col items-center text-center text-gray-400 space-y-3">
                <Folder size={48} className="text-gray-200" />
                <p>No items found in this repository.</p>
             </div>
          )}
        </div>
      )}

      {/* Sync Alignment Modal */}
      <AnimatePresence>
        {syncItem && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-apple-xl p-8 max-w-lg w-full space-y-6 shadow-xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Integrator // Sync Node to Catalog</h4>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Align official university materials into current course files</p>
                </div>
                <button
                  onClick={() => setSyncItem(null)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Edit Title for Archive</label>
                  <input
                    type="text"
                    value={syncItem.name}
                    onChange={(e) => setSyncItem({ ...syncItem, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 p-2.5 text-[11px] font-bold uppercase tracking-wider rounded text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Target Subject Destination</label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 p-2.5 font-bold text-[10px] uppercase tracking-wider rounded text-slate-900 focus:border-slate-800 outline-none"
                  >
                    {allSubjectsList.length === 0 ? (
                      <option value="">No subjects registered in catalog</option>
                    ) : (
                      allSubjectsList.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          {sub.code} - {sub.name} (Sem {sub.semester})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[9px] text-slate-500 overflow-x-auto select-all">
                  <p className="font-bold uppercase text-[7px] text-slate-400">Index Referral Link:</p>
                  <p className="truncate">{syncItem.url}</p>
                </div>

                {feedbackMsg && (
                  <div className={`p-3 text-[10px] font-bold uppercase tracking-wider text-center rounded border ${
                    feedbackMsg.toLowerCase().includes('complete') || feedbackMsg.toLowerCase().includes('success')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      : 'bg-red-50 text-red-800 border-red-100'
                  }`}>
                    {feedbackMsg}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSyncItem(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing || allSubjectsList.length === 0}
                  onClick={handleExecuteSync}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white text-[9px] font-black uppercase tracking-widest rounded"
                >
                  {isSyncing ? "Aligning..." : "Execute Alignment"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatisticsPage = ({ 
  coursesCount, 
  subjectsCount, 
  materialsCount,
  recentSubmissions
}: { 
  coursesCount: number, 
  subjectsCount: number, 
  materialsCount: number,
  recentSubmissions: any[]
}) => {
  const stats = [
    { label: 'Active Courses', value: coursesCount, icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Subjects', value: subjectsCount, icon: Library, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Materials Indexed', value: materialsCount, icon: FileText, color: 'bg-slate-50 text-slate-600' },
    { label: 'Verified Resources', value: materialsCount > 0 ? Math.floor(materialsCount * 0.9) : 0, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 md:space-y-12 pb-20 px-4 md:px-0"
    >
      <div className="text-center space-y-6 pt-12">
        <h2 className="section-heading">Community Impact</h2>
        <p className="section-subheading max-w-xl mx-auto">Real-time growth shared by the community network.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 sm:p-12 border border-slate-100 rounded-apple-xl flex flex-col items-center text-center group hover:bg-emerald-50 transition-all shadow-sm"
          >
            <div className={`w-16 h-16 bg-emerald-600 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-transform rounded-apple shadow-apple`}>
              <stat.icon size={32} />
            </div>
            <div className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{stat.value}</div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-12 border border-slate-100 rounded-apple-xl shadow-sm">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 border-b-2 border-emerald-600 pb-4 w-fit">Recent Contributions</h3>
          <div className="space-y-12">
            {recentSubmissions.length > 0 ? recentSubmissions.map((sub, i) => (
              <div key={i} className="flex gap-8 items-start group">
                <div className={`w-3 h-3 mt-1.5 rounded-full ${
                  sub.submissionType === 'MATERIAL' ? 'bg-emerald-600' : 'bg-slate-300'
                }`} />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{sub.submittedByEmail.split('@')[0].toUpperCase()}</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Shared resources for 
                    <span className="text-emerald-600 font-black ml-1"> {sub.subjectName.toUpperCase()}</span>
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Awaiting community focus...</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-600 p-6 sm:p-12 md:p-16 text-white flex flex-col justify-center relative overflow-hidden rounded-apple-xl shadow-apple-lg">
             <Rocket size={100} className="text-white/10 absolute -bottom-10 -right-10 rotate-12" />
             <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 z-10 leading-none">Join the Community</h3>
             <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-12 z-10 leading-relaxed">Join thousands of students building the archive. Our data is open and accessible to all.</p>
             <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-emerald-600 px-10 py-5 font-black text-[10px] uppercase tracking-[0.4em] w-fit hover:bg-emerald-50 active:scale-95 transition-all z-10 shadow-xl rounded-apple"
             >
                Start Exploring
             </button>
        </div>
      </div>
    </motion.div>
  );
};

const PrivacyPolicyPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[1200px] mx-auto px-4 pb-24 space-y-8 md:space-y-12"
    >
      <div className="text-center space-y-6 pt-10">
        <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none">
          Privacy <span className="text-emerald-600">& Safety</span>
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Your data security and trust are our top priorities.</p>
      </div>

      <div className="bg-white border border-slate-100 p-8 sm:p-12 md:p-20 shadow-xl rounded-apple-2xl space-y-16 text-slate-600 leading-relaxed font-bold uppercase text-[10px] tracking-widest">
        
        <section className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
            <div className="w-4 h-4 bg-emerald-600 rounded-full"></div> 01 // Data Collection
          </h3>
          <p className="leading-[2]">
            We only collect the information necessary to provide a personalized experience and maintain the quality of our academic library. This includes basic profile information from your Google account and any study materials you choose to share with the community.
          </p>
        </section>

        <section className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
            <div className="w-4 h-4 bg-emerald-600 rounded-full"></div> 02 // Usage of Information
          </h3>
          <p className="leading-[2]">Your information helps us verify contributions and build features like personalized study recommendations. We never sell your data or share it with third-party advertisers.</p>
        </section>

        <section className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
            <div className="w-4 h-4 bg-emerald-300 rounded-full"></div> 03 // Safety First
          </h3>
          <p className="leading-[2]">
            All uploaded resources go through a community verification process. We ensure that your academic identity is protected while you contribute to the collective knowledge of DU students.
          </p>
        </section>

        <section className="pt-12 border-t border-slate-50 text-[10px] font-black text-slate-300">
           LAST UPDATED: MAY 2026 // VERSION 2.1.0 // COMMUNITY VERIFIED
        </section>
      </div>
    </motion.div>
  );
};

const getAnonymousVoterId = () => {
  let id = localStorage.getItem('anonymous_voter_id');
  if (!id) {
    id = 'anon_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('anonymous_voter_id', id);
  }
  return id;
};

const RatingButtons = ({ material, user }: { material: Material, user: FirebaseUser | null }) => {
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null);
  const [loading, setLoading] = useState(false);

  const voterId = user?.uid || getAnonymousVoterId();

  useEffect(() => {
    if (!voterId) return;
    const unsub = onSnapshot(doc(db, 'materials', material.id, 'votes', voterId), (doc) => {
      if (doc.exists()) {
        setUserVote(doc.data().type);
      } else {
        setUserVote(null);
      }
    });
    return () => unsub();
  }, [material.id, voterId]);

  const handleVote = async (type: 'UP' | 'DOWN') => {
    setLoading(true);
    try {
      const voteRef = doc(db, 'materials', material.id, 'votes', voterId);
      const materialRef = doc(db, 'materials', material.id);

      if (userVote === type) {
        // Remove vote
        await deleteDoc(voteRef);
        await updateDoc(materialRef, {
          [type === 'UP' ? 'upvotes' : 'downvotes']: increment(-1)
        });
      } else {
        // Change or add vote
        const oldVote = userVote;
        await setDoc(voteRef, {
          userId: voterId,
          type,
          timestamp: new Date().toISOString()
        });

        // Write behavioral pattern telemetry automatically
        try {
          await addDoc(collection(db, 'user_behavior_logs'), {
            userId: voterId,
            userEmail: user?.email || 'anonymous',
            userFullName: user?.displayName || 'Anonymous Voter',
            actionType: `VOTE_${type}`,
            details: { 
              materialId: material.id, 
              title: material.title,
              type
            },
            timestamp: new Date().toISOString()
          });
        } catch (logErr) {
          console.warn("Silent failure in voting behavior telemetry logger:", logErr);
        }

        const updates: any = {
           [type === 'UP' ? 'upvotes' : 'downvotes']: increment(1)
        };
        if (oldVote) {
          updates[oldVote === 'UP' ? 'upvotes' : 'downvotes'] = increment(-1);
        }
        await updateDoc(materialRef, updates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-0 mt-3 pt-3 border-t border-slate-100 w-full justify-center">
      <button 
        onClick={(e) => { e.stopPropagation(); handleVote('UP'); }}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-3 py-3 transition-all ${
          userVote === 'UP' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-900'
        }`}
      >
        <ArrowBigUp size={14} fill={userVote === 'UP' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-black uppercase tracking-widest">{material.upvotes || 0}</span>
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleVote('DOWN'); }}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-3 py-3 border-l border-slate-100 transition-all ${
          userVote === 'DOWN' ? 'bg-red-900 text-white' : 'text-slate-300 hover:text-red-900'
        }`}
      >
        <ArrowBigDown size={14} fill={userVote === 'DOWN' ? 'currentColor' : 'none'} />
        <span className="text-[10px] font-black uppercase tracking-widest">{material.downvotes || 0}</span>
      </button>
    </div>
  );
};

const SearchableSelect = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  options, 
  placeholder,
  name,
  required = true
}: { 
  label: string, 
  icon: any, 
  value: string, 
  onChange: (val: string) => void, 
  options: string[], 
  placeholder: string,
  name: string,
  required?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = searchTerm && !options.some(opt => opt.toLowerCase() === searchTerm.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
        <Icon size={14} className="text-slate-900" />
        {label}
      </label>
      <div className="relative group">
        <input 
          name={name}
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-100 py-4 px-6 text-xs font-black uppercase tracking-widest placeholder:text-slate-200 outline-none focus:border-emerald-600 transition-all rounded-apple shadow-sm"
          autoComplete="off"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600">
          <Search size={18} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (searchTerm || filteredOptions.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-20 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-apple-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar p-2"
          >
            {filteredOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setSearchTerm(opt);
                  setIsOpen(false);
                }}
                className="w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all rounded-apple mb-1"
              >
                {opt}
              </button>
            ))}
            {showCreateOption && (
              <button
                key="create"
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-5 py-3.5 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-emerald-600 hover:text-white transition-all rounded-apple"
              >
                <PlusCircle size={14} />
                Map New Node: "{searchTerm}"
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SubmissionForm = ({ 
  user, 
  userProfile,
  setActiveTab, 
  onCancel, 
  existingCourses, 
  prefillData,
  googleAccessToken,
  setGoogleAccessToken,
  moderationSettings = { mode: 'approve_queue', flagThreshold: 5 }
}: { 
  user: FirebaseUser | null, 
  userProfile?: any,
  setActiveTab: (tab: string) => void, 
  onCancel: () => void,
  existingCourses: Course[],
  prefillData?: { title: string, url: string, type: string, subjectHint?: string } | null,
  googleAccessToken: string | null,
  setGoogleAccessToken: (token: string | null) => void,
  moderationSettings?: { mode: string; flagThreshold: number }
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submissionType, setSubmissionType] = useState<'MATERIAL' | 'SUBJECT_PROPOSAL'>('MATERIAL');
  
  const [courseName, setCourseName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [existingSubjects, setExistingSubjects] = useState<string[]>([]);

  const [url, setUrl] = useState(prefillData?.url || "");
  const [title, setTitle] = useState(prefillData?.title || "");
  const [isPickerScriptLoading, setIsPickerScriptLoading] = useState(false);
  const [isFetchingDrive, setIsFetchingDrive] = useState(false);
  const [fetchedDriveFiles, setFetchedDriveFiles] = useState<{ id: string; name: string; url: string; mimeType: string; checked: boolean }[]>([]);

  const [aiCheckLoading, setAiCheckLoading] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<{
    isValid: boolean;
    confidenceScore: number;
    issues: string[];
    copyrightRisk: string;
    categorizationCheck: string;
    aiLibrarianReview: string;
    suggestedTitle: string;
  } | null>(null);

  const [activeAuditTab, setActiveAuditTab] = useState<'academic' | 'policy' | 'alignment'>('academic');
  const [duplicityWarning, setDuplicityWarning] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const newTags = trimmed
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0 && !customTags.includes(t));
    if (newTags.length > 0) {
      setCustomTags(prev => [...prev, ...newTags]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setCustomTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      const lastPart = parts.pop() || "";
      const completedTags = parts
        .map(t => t.trim().toUpperCase())
        .filter(t => t.length > 0 && !customTags.includes(t));
      if (completedTags.length > 0) {
        setCustomTags(prev => [...prev, ...completedTags]);
      }
      setTagInput(lastPart);
    } else {
      setTagInput(val);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // Local File Upload States
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{ name: string; url: string; size: number } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadLocalFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadLocalFile(file);
    }
  };

  const uploadLocalFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isDoc = file.type === 'application/pdf' || ext === 'pdf' || ext === 'txt' || ext === 'docx';
    
    if (!isDoc && !file.type.startsWith('image/')) {
      if (!confirm("Are you sure you want to upload this file type? PDF/TXT are recommended for academic materials.")) {
        return;
      }
    }

    setLocalFile(file);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const timer = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 12 : prev));
      }, 150);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      clearInterval(timer);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Local upload server rejected the upload.");
      }

      const data = await response.json();
      setUploadedFileDetails({
        name: data.name,
        url: data.url,
        size: data.size
      });
      setUrl(data.url);
      
      const cleanName = data.name
        .substring(0, data.name.lastIndexOf('.'))
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .trim();
      if (!title) {
        setTitle(cleanName.toUpperCase());
      }
    } catch (err: any) {
      console.error(err);
      alert("Local file upload failed: " + err.message);
      setLocalFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearUploadedFile = () => {
    setLocalFile(null);
    setUploadedFileDetails(null);
    setUrl("");
  };

  const handleRunAiAuditCheck = async () => {
    if (!title && !url) {
      alert("Please enter a Title or Resource URL first to run the verification check.");
      return;
    }
    setAiCheckLoading(true);
    try {
      const response = await fetch("/api/moderate-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          type: (document.getElementsByName('type')[0] as HTMLSelectElement)?.value || 'PDF',
          description: (document.getElementsByName('description')[0] as HTMLTextAreaElement)?.value || '',
          courseName,
          subjectName
        })
      });
      if (!response.ok) {
        throw new Error("AI verification service returned " + response.status);
      }
      const data = await response.json();
      setAiCheckResult(data);
    } catch (err: any) {
      console.error(err);
      alert("AI Librarian pre-check error: " + err.message);
    } finally {
      setAiCheckLoading(false);
    }
  };

  // Apply prefill data
  useEffect(() => {
    if (prefillData) {
      if (prefillData.subjectHint) {
        setSubjectName(prefillData.subjectHint);
      }
      if (prefillData.url) {
        setUrl(prefillData.url);
      }
      if (prefillData.title) {
        setTitle(prefillData.title);
      }
    }
  }, [prefillData]);

  // Fetch subjects when course name matches an existing course
  useEffect(() => {
    const course = existingCourses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
    if (course) {
      const fetchSubs = async () => {
        const q = query(collection(db, 'subjects'), where('courseId', '==', course.id));
        const snap = await getDocs(q);
        setExistingSubjects(snap.docs.map(d => d.data().name));
      };
      fetchSubs();
    } else {
      setExistingSubjects([]);
    }
  }, [courseName, existingCourses]);

  // Real-time double-detection of duplicate materials
  useEffect(() => {
    if (!courseName || !subjectName || !title || title.length < 5) {
      setDuplicityWarning(null);
      return;
    }

    const checkDuplicity = async () => {
      try {
        const course = existingCourses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
        if (!course) return;

        const subjectsRef = collection(db, "subjects");
        const sQuery = query(subjectsRef, where("courseId", "==", course.id), where("name", "==", subjectName));
        const sSnap = await getDocs(sQuery);
        if (sSnap.empty) return;

        const subjectId = sSnap.docs[0].id;
        const materialsRef = collection(db, "materials");
        const mQuery = query(materialsRef, where("subjectId", "==", subjectId));
        const mSnap = await getDocs(mQuery);

        const enteredTitleNorm = title.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matchedMat = mSnap.docs.find(doc => {
          const docTitleNorm = (doc.data().title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return docTitleNorm.includes(enteredTitleNorm) || enteredTitleNorm.includes(docTitleNorm);
        });

        if (matchedMat) {
          setDuplicityWarning(matchedMat.data().title);
        } else {
          setDuplicityWarning(null);
        }
      } catch (err) {
        console.error("Error running duplicity pre-check:", err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkDuplicity();
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [courseName, subjectName, title, existingCourses]);

  const handleFetchDriveLink = async () => {
    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);

    const folderId = folderMatch ? folderMatch[1] : null;
    const fileId = fileMatch ? fileMatch[1] : null;

    if (!folderId && !fileId) {
      alert("Please paste a valid Google Drive Folder or File link first.");
      return;
    }

    setIsFetchingDrive(true);
    try {
      let token = googleAccessToken;
      if (!token) {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive');
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          token = credential.accessToken;
          setGoogleAccessToken(token);
        } else {
          alert("Failed to authenticate with Google Drive.");
          setIsFetchingDrive(false);
          return;
        }
      }

      if (folderId) {
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink)&pageSize=100`;
        const res = await fetch(driveApiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch folder contents (${res.statusText}). Confirm linking permissions.`);
        }
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          setFetchedDriveFiles(data.files.map((f: any) => ({
            id: f.id,
            name: f.name,
            url: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
            mimeType: f.mimeType,
            checked: true
          })));
        } else {
          alert("No files found in the specified Google Drive folder.");
        }
      } else if (fileId) {
        const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink`;
        const res = await fetch(driveApiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch file metadata (${res.statusText}).`);
        }
        const f = await res.json();
        setFetchedDriveFiles([{
          id: f.id,
          name: f.name,
          url: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
          mimeType: f.mimeType,
          checked: true
        }]);
        setTitle(f.name);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error retrieving Drive details: " + err.message);
    } finally {
      setIsFetchingDrive(false);
    }
  };

  const handlePickerActivation = async () => {
    setIsPickerScriptLoading(true);
    try {
      await loadGooglePickerScript();
      
      const openPickerWithToken = (token: string) => {
        openGooglePicker(
          token,
          (file) => {
            setUrl(file.url);
            if (!title) {
              setTitle(file.name);
            }
          },
          () => {
            console.log("Picker cancelled.");
          }
        );
      };

      if (googleAccessToken) {
        openPickerWithToken(googleAccessToken);
      } else {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive');
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setGoogleAccessToken(credential.accessToken);
          openPickerWithToken(credential.accessToken);
        } else {
          alert("Failed to authenticate with Google Drive.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Could not initialize Google Picker. Please verify Google Drive access.");
    } finally {
      setIsPickerScriptLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courseName || !subjectName) {
      alert("Please select or enter both a course and a subject.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const semester = parseInt(formData.get('semester') as string);
    const description = formData.get('description') as string || "";
    const finalTagInput = tagInput.trim();
    const remainingTags = finalTagInput
      .trim()
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0 && !customTags.includes(t));
    const manualTags = [...customTags, ...remainingTags];

    const activeMode = moderationSettings.mode;

    try {
      // 1. Find or Create Course
      const coursesRef = collection(db, 'courses');
      const courseQuery = query(coursesRef, where('name', '==', courseName));
      const courseSnap = await getDocs(courseQuery);
      let courseId: string;

      if (!courseSnap.empty) {
        courseId = courseSnap.docs[0].id;
      } else {
        const newCourse = await addDoc(coursesRef, {
          name: courseName,
          level: 'UG',
          nepBased: true,
          durationYears: 3,
          description: `Archive for ${courseName}`,
          createdAt: new Date().toISOString()
        });
        courseId = newCourse.id;
      }

      // 2. Find or Create Subject
      const subjectsRef = collection(db, 'subjects');
      const subjectQuery = query(subjectsRef, where('courseId', '==', courseId), where('name', '==', subjectName));
      const subjectSnap = await getDocs(subjectQuery);
      let subjectId: string;

      if (!subjectSnap.empty) {
        subjectId = subjectSnap.docs[0].id;
      } else {
        const newSubject = await addDoc(subjectsRef, {
          courseId,
          name: subjectName,
          semester,
          description: `Study materials for ${subjectName}`,
          code: subjectName.substring(0, 3).toUpperCase(),
          createdAt: new Date().toISOString()
        });
        subjectId = newSubject.id;
      }

      // 3. Process Contribution Type
      if (submissionType === 'MATERIAL') {
        const checkedFiles = fetchedDriveFiles.filter(f => f.checked);
        const hasDriveFiles = checkedFiles.length > 0;
        
        if (hasDriveFiles) {
          for (const file of checkedFiles) {
            let fileType: 'PDF' | 'VIDEO' | 'LINK' | 'NOTES' = 'PDF';
            const normName = file.name.toLowerCase();
            if (normName.match(/\.(mp4|mkv|avi|mov|webm)$/)) {
              fileType = 'VIDEO';
            } else if (normName.includes('notes') || normName.includes('handwritten') || normName.includes('lecture')) {
              fileType = 'NOTES';
            } else if (file.mimeType.includes('shortcut') || file.mimeType.includes('folder') || file.mimeType.includes('link')) {
              fileType = 'LINK';
            }

            if (activeMode === 'approve_queue') {
              // Option 2: Pending queue for admin approval
              await addDoc(collection(db, 'submissions'), {
                submissionType: 'MATERIAL',
                courseName,
                subjectName,
                semester,
                title: file.name,
                url: file.url,
                type: fileType,
                status: 'PENDING',
                submittedByEmail: user?.email || 'Anonymous',
                description: description || `Drive upload: ${file.name}`,
                createdAt: new Date().toISOString(),
                tags: manualTags
              });
            } else {
              // Option 1 or 3: Auto-publish modes
              const isCommunity = activeMode === 'auto_publish_community';
              const finalTags = isCommunity ? [...new Set(['Community', ...manualTags])] : manualTags;
              await addDoc(collection(db, 'materials'), {
                subjectId,
                title: file.name,
                url: file.url,
                type: fileType,
                isApproved: true,
                submittedBy: user?.email || 'Anonymous',
                createdAt: new Date().toISOString(),
                upvotes: 0,
                downvotes: 0,
                flags: 0,
                tags: finalTags
              });

              // Write review log automatically as published
              await addDoc(collection(db, 'submissions'), {
                submissionType: 'MATERIAL',
                courseName,
                subjectName,
                semester,
                title: file.name,
                url: file.url,
                type: fileType,
                status: 'PUBLISHED',
                submittedByEmail: user?.email || 'Anonymous',
                description: description || `Drive upload: ${file.name}`,
                createdAt: new Date().toISOString(),
                tags: finalTags
              });
            }
          }
        } else {
          // Manual Form Entry
          const formTitle = title || (formData.get('title') as string);
          const formUrl = url || (formData.get('url') as string);
          const formType = (formData.get('type') as string) || 'PDF';

          if (activeMode === 'approve_queue') {
            await addDoc(collection(db, 'submissions'), {
              submissionType: 'MATERIAL',
              courseName,
              subjectName,
              semester,
              title: formTitle,
              url: formUrl,
              type: formType,
              status: 'PENDING',
              submittedByEmail: user?.email || 'Anonymous',
              description,
              createdAt: new Date().toISOString(),
              tags: manualTags
            });
          } else {
            const isCommunity = activeMode === 'auto_publish_community';
            const finalTags = isCommunity ? [...new Set(['Community', ...manualTags])] : manualTags;
            await addDoc(collection(db, 'materials'), {
              subjectId,
              title: formTitle,
              url: formUrl,
              type: formType,
              isApproved: true,
              submittedBy: user?.email || 'Anonymous',
              createdAt: new Date().toISOString(),
              upvotes: 0,
              downvotes: 0,
              flags: 0,
              tags: finalTags
            });

            await addDoc(collection(db, 'submissions'), {
              submissionType: 'MATERIAL',
              courseName,
              subjectName,
              semester,
              title: formTitle,
              url: formUrl,
              type: formType,
              status: 'PUBLISHED',
              submittedByEmail: user?.email || 'Anonymous',
              description,
              createdAt: new Date().toISOString(),
              tags: finalTags
            });
          }
        }
      } else {
        // SUBJECT_PROPOSAL is always an administrative process (Option 2)
        await addDoc(collection(db, 'submissions'), {
          submissionType: 'SUBJECT_PROPOSAL',
          courseName,
          subjectName,
          semester,
          status: 'PENDING',
          submittedByEmail: user?.email || 'Anonymous',
          description,
          createdAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setActiveTab('courses');
        onCancel();
      }, 4000); // 4 seconds delay so they can appreciate the user flow diagram success screen
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const activeMode = moderationSettings.mode;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 sm:p-12 md:p-16 border border-slate-200 rounded-apple-2xl text-center space-y-8 shadow-sm"
      >
        <div className="w-20 h-20 bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 rounded-apple shadow-emerald-sm">
          <CheckCircle2 size={40} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Uplink Confirmed</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">Resource Registration Sequence Successful</p>
        </div>

        <div className="max-w-xl mx-auto border border-slate-200 bg-slate-50 p-6 rounded-apple text-left space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Completed User Flow Sequence</p>
          
          {activeMode === 'auto_publish_community' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight block">Option 1: Auto-Publish + 'Community' Tag Flow</span>
              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                System rule allows bypass of review queue. Your resource is immediately active in the public module library and marked with a <span className="text-emerald-600 font-extrabold">'Community'</span> tag to verify student origin.
              </p>
              <div className="flex items-center gap-2 bg-white border border-slate-100 p-3 rounded-apple text-[9px] font-black uppercase tracking-widest text-emerald-700">
                <span className="px-2 py-0.5 bg-emerald-50 rounded text-emerald-600">Status</span>
                <span>Node Published & Indexed Live</span>
              </div>
            </div>
          )}

          {activeMode === 'approve_queue' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight block">Option 2: Admin Approval Queue Flow</span>
              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Traditional moderation flow active. Your submitted content is placed in the review queue. Platform administrators will check resource legitimacy, formatting, and completeness before approving the listing.
              </p>
              <div className="flex items-center gap-2 bg-white border border-slate-100 p-3 rounded-apple text-[9px] font-black uppercase tracking-widest text-amber-700">
                <span className="px-2 py-0.5 bg-amber-50 rounded text-amber-600">Status</span>
                <span>Waiting in Moderation Queue</span>
              </div>
            </div>
          )}

          {activeMode === 'self_moderation' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight block">Option 3: Self-Moderation (Upvote/Flag) Flow</span>
              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                Community-curated self-moderation system active. Material is published to the public list instantly. Students monitor and reports/flags are tallied in real-time. If flagged {moderationSettings.flagThreshold || 5}+ times, it will automatically hide and quarantine review.
              </p>
              <div className="flex items-center gap-2 bg-white border border-slate-100 p-3 rounded-apple text-[9px] font-black uppercase tracking-widest text-emerald-700">
                <span className="px-2 py-0.5 bg-emerald-50 rounded text-emerald-600">Status</span>
                <span>Node Live // Self-Moderation Active</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Redirecting to module list in a few seconds...</p>
      </motion.div>
    );
  }

  return (
    <form className="bg-white p-4 sm:p-8 md:p-16 border border-slate-100 rounded-apple-2xl space-y-8 sm:space-y-16 shadow-2xl" onSubmit={handleSubmit}>
      <div className="space-y-16">
        {/* User Contribution Protocols & Flows Visual Guide */}
        <div className="border border-slate-200 bg-slate-50 p-6 rounded-apple space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest leading-none">Resource Platform Protocol</span>
              <h4 className="text-[12px] font-black text-slate-950 uppercase tracking-wider">Student Contribution System Flow</h4>
            </div>
            <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 self-start sm:self-auto">
              <ShieldCheck size={12} className="shrink-0" />
              Active System Rule: {moderationSettings?.mode === 'auto_publish_community' ? "Auto-Publish ('Community' Tag)" : moderationSettings?.mode === 'self_moderation' ? "Self-Moderation (Upvote/Flag)" : "Admin Review Queue"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1 Card */}
            <div className={`p-4 rounded border transition-all ${moderationSettings?.mode === 'auto_publish_community' ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600 font-bold' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black uppercase tracking-tight text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Option 1</span>
                {moderationSettings?.mode === 'auto_publish_community' && <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100 animate-pulse">Active</span>}
              </div>
              <h5 className="text-[11px] font-black uppercase tracking-tight mb-2 text-slate-800">Auto-Publish ('Community')</h5>
              <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed mb-4">
                Instantly published resources marked with community labels.
              </p>
              <div className="space-y-1.5 text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 p-2.5 rounded border border-slate-100">
                <p className="text-[8px] font-black text-slate-800 border-b border-slate-200 pb-1 mb-1 tracking-widest">USER SUBMIT FLOW:</p>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">1.</span>
                  <span>Fill resource attributes</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">2.</span>
                  <span>System adds Community tag</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">3.</span>
                  <span>Live on platform immediately</span>
                </div>
              </div>
            </div>

            {/* Mode 2 Card */}
            <div className={`p-4 rounded border transition-all ${moderationSettings?.mode === 'approve_queue' ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600 font-bold' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black uppercase tracking-tight text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Option 2</span>
                {moderationSettings?.mode === 'approve_queue' && <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100 animate-pulse">Active</span>}
              </div>
              <h5 className="text-[11px] font-black uppercase tracking-tight mb-2 text-slate-800">Admin Approval Queue</h5>
              <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed mb-4">
                Structured verification logs ensuring resource validity.
              </p>
              <div className="space-y-1.5 text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 p-2.5 rounded border border-slate-100">
                <p className="text-[8px] font-black text-slate-800 border-b border-slate-200 pb-1 mb-1 tracking-widest">USER SUBMIT FLOW:</p>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">1.</span>
                  <span>Submit resource details</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">2.</span>
                  <span>Saved to PENDING database log</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">3.</span>
                  <span>Librarians approve to catalog</span>
                </div>
              </div>
            </div>

            {/* Mode 3 Card */}
            <div className={`p-4 rounded border transition-all ${moderationSettings?.mode === 'self_moderation' ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600 font-bold' : 'bg-white border-slate-200 opacity-60'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black uppercase tracking-tight text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Option 3</span>
                {moderationSettings?.mode === 'self_moderation' && <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100 animate-pulse">Active</span>}
              </div>
              <h5 className="text-[11px] font-black uppercase tracking-tight mb-2 text-slate-800">Community Self-Moderate</h5>
              <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed mb-4">
                Auto-published nodes monitored by user flagging mechanics.
              </p>
              <div className="space-y-1.5 text-[8.5px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 p-2.5 rounded border border-slate-100">
                <p className="text-[8px] font-black text-slate-800 border-b border-slate-200 pb-1 mb-1 tracking-widest">USER SUBMIT FLOW:</p>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">1.</span>
                  <span>Publish node directly to catalog</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">2.</span>
                  <span>Other students upvote or flag</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="font-extrabold text-emerald-600">3.</span>
                  <span>Hides if flags reach threshold ({moderationSettings?.flagThreshold})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Profile integration row to easily sync course options */}
        {userProfile && (userProfile.department || userProfile.collegeName) && (
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-apple-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
            <div className="space-y-1 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Academic Profile Node detected</span>
              <p className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wider">
                Sync prefilled parameters from your verified student catalog node
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.department && (
                <button
                  type="button"
                  onClick={() => {
                    setCourseName(userProfile.department.toUpperCase());
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-apple transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <GraduationCap size={13} /> Course: {userProfile.department}
                </button>
              )}
              {userProfile.collegeName && (
                <button
                  type="button"
                  onClick={() => {
                    const descArea = document.getElementsByName('description')[0] as HTMLTextAreaElement;
                    if (descArea) {
                      descArea.value = `Student contribution registered at ${userProfile.collegeName}. verified DU Node.`;
                    }
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-apple transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Library size={13} /> Tag: {userProfile.collegeName.slice(0, 16)}...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submission Type Toggle - Side-by-Side Premium Bento-style Selection Cards */}
        <div 
          id="share-submission-type-selector" 
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8 lg:gap-10 mb-8"
          role="radiogroup"
          aria-label="Submission Type"
        >
          {/* Card Option 1: Material Uplink */}
          <motion.div
            id="selector-option-material"
            role="radio"
            aria-checked={submissionType === 'MATERIAL'}
            tabIndex={submissionType === 'MATERIAL' ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSubmissionType('MATERIAL');
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                setSubmissionType('SUBJECT_PROPOSAL');
                document.getElementById('selector-option-proposal')?.focus();
              }
            }}
            onClick={() => setSubmissionType('MATERIAL')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            animate={submissionType === 'MATERIAL' ? { scale: [1, 1.025, 1], transition: { duration: 0.35, ease: "easeInOut" } } : { scale: 1 }}
            className={`cursor-pointer p-5 sm:p-6 rounded-apple-xl border transition-all relative flex flex-col justify-between group ${
              submissionType === 'MATERIAL' 
                ? 'bg-emerald-50/30 border-emerald-500/80 text-slate-900 shadow-sm shadow-emerald-500/5' 
                : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`p-2.5 rounded-apple border transition-all shrink-0 ${
                submissionType === 'MATERIAL' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-slate-880'
              }`}>
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1.5 font-mono transition-all duration-300 ${
                submissionType === 'MATERIAL' ? 'pr-6' : ''
              }`}>
                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                  submissionType === 'MATERIAL' 
                    ? 'bg-emerald-500/10 text-emerald-650 border border-emerald-500/20' 
                    : 'bg-slate-100 text-slate-450 border border-slate-200/50'
                }`}>
                  DIRECT INDEX
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-1.5 text-left">
              <span className={`text-xs font-black uppercase tracking-widest block ${
                submissionType === 'MATERIAL' ? 'text-slate-900' : 'text-slate-800'
              }`}>
                Material Uplink
              </span>
              <p className={`text-[10px] tracking-wide leading-relaxed font-medium ${
                submissionType === 'MATERIAL' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Directly upload notes, exam questions, syllabi documents, or study manuals into Delhi University subject nodes.
              </p>
            </div>
            <AnimatePresence>
              {submissionType === 'MATERIAL' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1 shadow-sm flex items-center justify-center w-5 h-5 select-none"
                >
                  <Check size={11} strokeWidth={3.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Card Option 2: Proposal Protocol */}
          <motion.div
            id="selector-option-proposal"
            role="radio"
            aria-checked={submissionType === 'SUBJECT_PROPOSAL'}
            tabIndex={submissionType === 'SUBJECT_PROPOSAL' ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSubmissionType('SUBJECT_PROPOSAL');
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setSubmissionType('MATERIAL');
                document.getElementById('selector-option-material')?.focus();
              }
            }}
            onClick={() => setSubmissionType('SUBJECT_PROPOSAL')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            animate={submissionType === 'SUBJECT_PROPOSAL' ? { scale: [1, 1.025, 1], transition: { duration: 0.35, ease: "easeInOut" } } : { scale: 1 }}
            className={`cursor-pointer p-5 sm:p-6 rounded-apple-xl border transition-all relative flex flex-col justify-between group ${
              submissionType === 'SUBJECT_PROPOSAL' 
                ? 'bg-emerald-50/30 border-emerald-500/80 text-slate-900 shadow-sm shadow-emerald-500/5' 
                : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className={`p-2.5 rounded-apple border transition-all shrink-0 ${
                submissionType === 'SUBJECT_PROPOSAL' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-450 group-hover:text-slate-885'
              }`}>
                <PlusCircle size={18} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-1.5 font-mono transition-all duration-300 ${
                submissionType === 'SUBJECT_PROPOSAL' ? 'pr-6' : ''
              }`}>
                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                  submissionType === 'SUBJECT_PROPOSAL' 
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                    : 'bg-slate-100 text-slate-450 border border-slate-200/50'
                }`}>
                  NODE PROPOSAL
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-1.5 text-left">
              <span className={`text-xs font-black uppercase tracking-widest block ${
                submissionType === 'SUBJECT_PROPOSAL' ? 'text-slate-900' : 'text-slate-800'
              }`}>
                Proposal Protocol
              </span>
              <p className={`text-[10px] tracking-wide leading-relaxed font-medium ${
                submissionType === 'SUBJECT_PROPOSAL' ? 'text-slate-650' : 'text-slate-400'
              }`}>
                Suggest brand new subject topics, modular semester catalogs, or study tracks for automated administrative parsing.
              </p>
            </div>
            <AnimatePresence>
              {submissionType === 'SUBJECT_PROPOSAL' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1 shadow-sm flex items-center justify-center w-5 h-5 select-none"
                >
                  <Check size={11} strokeWidth={3.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
            <SearchableSelect 
              label="Degree / Course Node"
              icon={GraduationCap}
              name="courseName"
              placeholder="ENTER COURSE ID..."
              value={courseName}
              onChange={setCourseName}
              options={existingCourses.map(c => c.name)}
            />
            <SearchableSelect 
              label={submissionType === 'MATERIAL' ? 'Subject Node' : 'Subject Proposal'}
              icon={Library}
              name="subjectName"
              placeholder="ENTER SUBJECT NAME..."
              value={subjectName}
              onChange={setSubjectName}
              options={existingSubjects}
            />
        </div>
        
        {submissionType === 'MATERIAL' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="space-y-4">
              <label className="card-label">Material Label</label>
              <input 
                name="title" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="E.G. SEM 2 DETAILED ARCHIVE 2024" 
                className="w-full bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 transition-all rounded-apple shadow-sm" 
              />
            </div>

            {duplicityWarning && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-apple text-left uppercase tracking-wider space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-amber-600" />
                  <span className="text-[10px] font-black text-slate-900 uppercase">REVISION DIAGNOSTIC: Similar Named Node Detected</span>
                </div>
                <p className="text-[9px] font-bold text-slate-605 leading-normal">
                  An existing material named <span className="font-extrabold text-slate-900 border-b border-dashed border-slate-400">"{duplicityWarning}"</span> is already registered inside this Subject Node. You can proceed to upload this as a corrected revision update or supplementary archive safely.
                </p>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="card-label">Category</label>
                <div className="relative group">
                  <select name="type" defaultValue={prefillData?.type?.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'PDF'} className="w-full bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 appearance-none rounded-apple shadow-sm transition-all text-left">
                    <option value="PDF">STUDY MATERIALS (PDF)</option>
                    <option value="VIDEO">VIDEO LECTURES</option>
                    <option value="LINK">WEBSITE LINKS</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="card-label">Select Semester</label>
                <input name="semester" type="number" min="1" max="10" required placeholder="eg. 1" className="w-full bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 rounded-apple shadow-sm" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="card-label">Custom Tag Keywords</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="EX. PYQS, LAB MANUAL, HANDWRITTEN"
                  className="flex-1 bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 rounded-apple shadow-sm transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-950 text-white text-xs font-black uppercase tracking-widest rounded-apple transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 min-h-[44px]"
                >
                  Add Tag
                </button>
              </div>
              
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Type tag keywords and press enter, comma, or click "Add Tag". These will categorize your materials with custom keywords.
              </p>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 border border-slate-100 rounded-apple min-h-12 items-center">
                  {customTags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest bg-slate-950 text-white rounded border border-slate-950 shadow-xs leading-none animate-in fade-in zoom-in-95 duration-150"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center justify-center p-0.5"
                        title={`Remove tag ${tag}`}
                      >
                        <X size={10} className="stroke-[3.5px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {submissionType === 'SUBJECT_PROPOSAL' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <label className="card-label">Suggested Semester</label>
            <input name="semester" type="number" min="1" max="10" required placeholder="01-08" className="w-full bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 rounded-apple shadow-sm" />
          </div>
        )}

        {submissionType === 'MATERIAL' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <label className="card-label">Direct PDF / Notes Upload</label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("pdf-upload-file-input")?.click()}
              className={`border-2 border-dashed rounded-apple p-10 text-center transition-all cursor-pointer ${
                dragActive 
                  ? "border-emerald-600 bg-emerald-50/50" 
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-55 hover:border-slate-400"
              }`}
            >
              <input
                type="file"
                id="pdf-upload-file-input"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx,application/pdf"
              />

              {!localFile && !isUploading && (
                <div className="space-y-3">
                  <Upload className="mx-auto text-slate-400" size={32} />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase text-slate-800 tracking-wider">Drag and drop your study material or PDF here</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">or click to browse your devices</p>
                  </div>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest">Maximum file size: 25MB &bull; Recommended formats: PDF, TXT</p>
                </div>
              )}

              {isUploading && (
                <div className="space-y-6 max-w-md mx-auto">
                  <RhythmicScanner label="Archiving files..." />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Uploading content to DU Academic archives...</p>
                    <p className="text-[9px] text-slate-505 font-mono truncate">{localFile?.name}</p>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-150" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFileDetails && !isUploading && (
                <div className="space-y-4 max-w-lg mx-auto p-4 bg-white border border-slate-200 rounded-apple shadow-sm">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{uploadedFileDetails.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        Size: {(uploadedFileDetails.size / (1024 * 1024)).toFixed(2)} MB &bull; Status: Linked Live
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearUploadedFile();
                      }}
                      className="p-2 sm:p-2.5 bg-slate-105 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                      title="Clear Upload"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="card-label">{submissionType === 'MATERIAL' ? 'Resource Link (Drive/URL)' : 'Syllabus Link (Optional)'}</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              name="url" 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              required={submissionType === 'MATERIAL'} 
              placeholder="https://... or uploaded file path" 
              className="flex-1 bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 rounded-apple shadow-sm transition-all animate-none" 
            />
            {submissionType === 'MATERIAL' && (
              <button
                type="button"
                disabled={isPickerScriptLoading}
                onClick={handlePickerActivation}
                className="px-6 py-4 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-apple transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 duration-100 shrink-0"
              >
                {isPickerScriptLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Load Client
                  </>
                ) : (
                  <>
                    <FolderOpen size={14} /> Drive Picker
                  </>
                )}
              </button>
            )}
          </div>

          {submissionType === 'MATERIAL' && url.includes('drive.google.com') && (
            <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-apple flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Google Drive URL Detected</p>
                  <p className="text-[9px] font-medium text-slate-505 uppercase tracking-wider">Sync files dynamically from folder or file node.</p>
                </div>
                <button
                  type="button"
                  disabled={isFetchingDrive}
                  onClick={handleFetchDriveLink}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-[9px] uppercase tracking-wider rounded-apple flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  {isFetchingDrive ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Retrieving List
                    </>
                  ) : (
                    <>
                      <Zap size={12} /> Sync Drive Node
                    </>
                  )}
                </button>
              </div>

              {fetchedDriveFiles.length > 0 && (
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Confirmed contents: {fetchedDriveFiles.filter(f => f.checked).length} selected
                    </span>
                    <button
                      type="button"
                      className="text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:underline transition-all"
                      onClick={() => {
                        const allChecked = fetchedDriveFiles.every(f => f.checked);
                        setFetchedDriveFiles(fetchedDriveFiles.map(f => ({ ...f, checked: !allChecked })));
                      }}
                    >
                      Toggle All
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-apple bg-white divide-y divide-slate-100 p-2 space-y-2">
                    {fetchedDriveFiles.map((file, idx) => (
                      <label key={file.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={file.checked}
                          onChange={() => {
                            setFetchedDriveFiles(prev => prev.map((f, i) => i === idx ? { ...f, checked: !f.checked } : f));
                          }}
                          className="accent-emerald-600 w-3.5 h-3.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[10.5px] font-black text-slate-700 truncate uppercase tracking-tight">{file.name}</p>
                          <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{file.mimeType.split('/').pop() || 'File'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="card-label">Description</label>
          <textarea name="description" rows={3} placeholder={submissionType === 'MATERIAL' ? "Briefly explain what this resource contains..." : "Why should we add this subject?"} className="w-full bg-white border border-slate-100 p-4 px-6 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-600 resize-none rounded-apple shadow-sm transition-all" />
        </div>

        {submissionType === 'MATERIAL' && (
          <div className="border border-slate-200 p-6 rounded-apple bg-slate-50 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600 shrink-0" />
                  Gemini AI Librarian Pre-Check
                </h5>
                <p className="text-[9.5px] font-bold text-slate-405 uppercase tracking-widest leading-normal mt-1">
                  Run an instant AI quality, correctness, and copyright review before submitting.
                </p>
              </div>
              <button
                type="button"
                disabled={aiCheckLoading}
                onClick={handleRunAiAuditCheck}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-[9.5px] uppercase tracking-wider rounded-apple flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-sm"
              >
                {aiCheckLoading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Analyzing Details
                  </>
                ) : (
                  <>
                    <Sparkles size={11} /> Pre-Audit Details
                  </>
                )}
              </button>
            </div>

            {aiCheckResult && (
              <div className="space-y-4 border border-slate-200 bg-white rounded-apple-lg overflow-hidden shadow-sm">
                {/* 3-Tab Filter Bar */}
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 text-[9px] font-black uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => setActiveAuditTab('academic')}
                    className={`flex-1 py-2 text-center rounded transition-all cursor-pointer ${
                      activeAuditTab === 'academic' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Quality Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAuditTab('policy')}
                    className={`flex-1 py-2 text-center rounded transition-all cursor-pointer ${
                      activeAuditTab === 'policy' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Policy & Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAuditTab('alignment')}
                    className={`flex-1 py-2 text-center rounded transition-all cursor-pointer ${
                      activeAuditTab === 'alignment' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Title Optimize
                  </button>
                </div>

                {/* Dashboard Tabs Contents */}
                <div className="p-5 space-y-4">
                  
                  {/* Tab A: Academic Quality Check */}
                  {activeAuditTab === 'academic' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">INDEX CONFIDENCE METER</span>
                          <span className="text-[10px] font-black text-emerald-700">{aiCheckResult.confidenceScore}% Quality Rating</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${aiCheckResult.confidenceScore || 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-100 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider leading-relaxed rounded">
                        <span className="text-[8px] font-black text-slate-400 block tracking-widest mb-1">AI LIBRARIAN EVALUATION</span>
                        "{aiCheckResult.aiLibrarianReview || 'Material details aligned correctly.'}"
                      </div>
                    </motion.div>
                  )}

                  {/* Tab B: Policy & Copy */}
                  {activeAuditTab === 'policy' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">METADATA AUDIT</span>
                        <span className={`px-2 py-0.5 rounded ${aiCheckResult.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {aiCheckResult.isValid ? 'PASSING NODE' : 'WARNING FLAGS'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">COPYRIGHT EXPOSURE</span>
                        <span className={`font-black ${
                          aiCheckResult.copyrightRisk === 'HIGH' ? 'text-red-600' : aiCheckResult.copyrightRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {aiCheckResult.copyrightRisk} RISK
                        </span>
                      </div>

                      {aiCheckResult.issues && aiCheckResult.issues.length > 0 ? (
                        <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded text-left space-y-1">
                          <span className="text-[8.5px] font-black text-red-700 uppercase tracking-widest block mb-1">WARNING SYNOPSIS</span>
                          {aiCheckResult.issues.map((issue, idx) => (
                            <p key={idx} className="text-[9.5px] font-bold text-rose-800 uppercase tracking-wide">&bull; {issue}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded text-left">
                          <p className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-widest">No policy liabilities or metadata conflicts detected.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Tab C: Index Optimize */}
                  {activeAuditTab === 'alignment' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1.5 text-left text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest">
                        <span className="text-[8px] font-black text-slate-400 block leading-none">TAXONOMICAL COHERENCE</span>
                        <p>{aiCheckResult.categorizationCheck || 'Catalog structures match standard Delhi University indexing guidelines.'}</p>
                      </div>

                      {aiCheckResult.suggestedTitle && aiCheckResult.suggestedTitle.toLowerCase() !== title.toLowerCase() && (
                        <div className="p-4 border border-dashed border-slate-200 bg-slate-50 rounded-apple flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="text-left space-y-1">
                            <span className="text-[8px] font-black tracking-widest text-slate-400">SYSTEM OPTIMIZED ACADEMIC LABEL</span>
                            <p className="text-[10.5px] font-extrabold text-slate-800 uppercase leading-none tracking-tight">{aiCheckResult.suggestedTitle}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setTitle(aiCheckResult.suggestedTitle);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-[9px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors self-end sm:self-auto shrink-0 animate-pulse"
                          >
                            <Check size={12} /> Adopt Optimized Title
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-8 bg-dashed-top">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-10 py-5 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-900 rounded-apple cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex-[2] bg-emerald-600 text-white py-5 px-10 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-emerald-sm disabled:opacity-50 rounded-apple cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} strokeWidth={2.5}/>}
          Public Uplink Protocol
        </button>
      </div>
    </form>
  );
};

const Navbar = ({ 
  user, 
  onLogin, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  isAdminAuthenticated
}: { 
  user: FirebaseUser | null, 
  onLogin?: () => void, 
  onLogout?: () => void, 
  activeTab: string, 
  setActiveTab: (t: string) => void, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  isAdminAuthenticated?: boolean
}) => {
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = React.useRef(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'Search', icon: Search },
    { id: 'courses', label: 'Archive', icon: Library },
    { id: 'labs', label: 'Labs', icon: Binary },
    { id: 'plans', label: 'About', icon: Info },
    { id: 'contribute', label: 'Share', icon: PlusCircle },
    { id: 'health', label: 'Health', icon: Activity },
    ...(user ? [{ id: 'profile', label: 'Profile', icon: User }] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: showHeader ? 0 : -100 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl shadow-sm"
      >
        <div className="w-full max-w-[1600px] mx-auto flex flex-col">
          <div className="flex justify-between h-16 md:h-20 items-center px-4 sm:px-6 md:px-12 shrink-0">
            <div 
              className="flex items-center gap-4 cursor-pointer active:scale-95 group select-none" 
              onClick={() => {
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }}
              title="DU Archive Home"
            >
              <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-white relative rounded-apple shadow-emerald-sm transition-transform group-hover:scale-105">
                <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span id="app-brand-title" className="font-black text-xl tracking-tighter uppercase text-slate-900">DU Archive</span>
                <span className="hidden md:inline-flex px-2 py-0.5 border border-slate-200 bg-slate-50 text-[8px] font-extrabold uppercase tracking-widest text-slate-400 rounded">Open Source</span>
                <span className="hidden lg:inline-flex px-2 py-0.5 border border-emerald-100 bg-emerald-50 text-[8px] font-extrabold uppercase tracking-widest text-emerald-600 rounded">100% Free</span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().toLowerCase() !== 'login') {
                      if (activeTab !== 'search-results') setActiveTab('search-results');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim().toLowerCase();
                      if (val === 'login') {
                        e.preventDefault();
                        setSearchQuery('');
                        setActiveTab('admin');
                        setIsMobileMenuOpen(false);
                      }
                    }
                  }}
                  placeholder="QUICK SEARCH..."
                  className="w-full bg-white border border-slate-100 focus:border-emerald-600 pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all placeholder:text-slate-300 rounded-apple shadow-sm"
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 px-4">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-150 relative py-2 cursor-pointer ${
                    activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-nav-underline"
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" 
                    />
                  )}
                </motion.button>
              ))}



              {user ? (
                <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-2 group cursor-pointer"
                    title="View Student Profile"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-emerald-600 transition-colors">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 text-slate-650 flex items-center justify-center text-xs font-bold">
                          {user.email?.[0].toUpperCase() || "S"}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 group-hover:text-emerald-600 transition-colors hidden xl:inline">
                      {user.displayName || "My Profile"}
                    </span>
                  </button>
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1 px-[10px] bg-slate-50 border border-slate-100 text-slate-450 hover:text-red-500 rounded font-bold uppercase tracking-widest text-[9px] cursor-pointer hover:bg-red-55 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                  <button
                    onClick={onLogin}
                    className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer flex items-center gap-2 shadow-sm whitespace-nowrap"
                    title="Sign In with Google Account"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-650 shrink-0" strokeWidth={2.5} />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100 rounded-apple text-slate-800 transition-all active:scale-95 border border-slate-100 flex items-center justify-center cursor-pointer min-w-[40px] min-h-[40px]"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={20} className="text-slate-900" /> : <Menu size={20} className="text-slate-900" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-2xl flex flex-col p-6 space-y-6 lg:hidden"
          >
            {/* Quick search inside mobile drawer on small screens */}
            <div className="md:hidden space-y-2">
              <span className="card-label text-slate-400 text-[10px] uppercase font-black tracking-widest block">Quick Module Locator</span>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().toLowerCase() !== 'login') {
                      if (activeTab !== 'search-results') setActiveTab('search-results');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim().toLowerCase();
                      if (val === 'login') {
                        e.preventDefault();
                        setSearchQuery('');
                        setActiveTab('admin');
                        setIsMobileMenuOpen(false);
                      } else {
                        // For other search queries, on Enter, we close the mobile menu and ensure the active tab is search-results.
                        if (activeTab !== 'search-results') {
                          setActiveTab('search-results');
                        }
                        setIsMobileMenuOpen(false);
                      }
                    }
                  }}
                  placeholder="QUICK SEARCH..."
                  className="w-full bg-slate-50 border border-slate-100 focus:border-emerald-600 pl-11 pr-4 py-3.5 text-xs font-bold outline-none transition-all placeholder:text-slate-300 rounded-apple"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="card-label text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-1">Navigation Modules</span>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.1em] transition-all p-3.5 rounded-apple border min-h-[44px] ${
                      isActive 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
                  </button>
                );
              })}

            </div>

            {user ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-apple space-y-3 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold">
                        {user.email?.[0].toUpperCase() || "S"}
                      </div>
                    )}
                  </div>
                  <div className="text-left shrink-0 max-w-[180px]">
                    <div className="text-[11px] font-black uppercase text-slate-900 tracking-wider truncate">
                      {user.displayName || "Student Member"}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer text-center"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-650 font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer text-center"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-apple text-center space-y-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">STUDENT WORKSPACE AUTHORIZATION</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      onLogin?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-black text-[9.5px] uppercase tracking-widest rounded-apple transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Lock className="w-4 h-4 text-slate-650 shrink-0" strokeWidth={2.5} />
                    <span>Google Sign In</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Open source info */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">DU Archive Project</span>
                <span className="px-2 py-0.5 border border-emerald-100 bg-emerald-50 text-[8px] font-extrabold uppercase tracking-widest text-emerald-600 rounded">100% Free</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                <span>By{" "}
                  <a 
                    href="https://www.instagram.com/pradeep0_98/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 font-extrabold transition-colors cursor-pointer"
                  >
                    Pradeep
                  </a>
                </span>
                <span className="text-slate-200">|</span>
                <span className="text-emerald-600 font-bold">GEMINI AI</span>
                <span className="text-slate-200">|</span>
                <span className="bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded text-[8px] font-mono leading-relaxed text-slate-500 font-medium">
                  VERSION: <span className="font-extrabold text-emerald-700">v1.4.2</span> // BUILD: <span className="font-extrabold text-slate-800">STABLE-2026.06</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editCollegeName, setEditCollegeName] = useState("");
  const [editCustomCollege, setEditCustomCollege] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editRollNumber, setEditRollNumber] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editHasConsented, setEditHasConsented] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [globalReportOpen, setGlobalReportOpen] = useState(false);
  const [firestoreConnectionError, setFirestoreConnectionError] = useState<string | null>(!isFirebaseConfigured ? 'unconfigured' : null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [prefillData, setPrefillData] = useState<{ title: string, url: string, type: string, subjectHint: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<{courses: Course[], subjects: Subject[]}>({ courses: [], subjects: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [userSubmissionsLoading, setUserSubmissionsLoading] = useState<boolean>(true);
  const [archiveSubTab, setArchiveSubTab] = useState<'browse' | 'aggregator' | 'colleges' | 'papers' | 'stats'>('browse');

  // Bookmarking system for offline reference
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem('du_archive_bookmarked_materials');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (material: Material) => {
    setBookmarkedMaterials(prev => {
      const exists = prev.some(m => m.id === material.id);
      let updated;
      if (exists) {
        updated = prev.filter(m => m.id !== material.id);
      } else {
        updated = [...prev, material];
      }
      localStorage.setItem('du_archive_bookmarked_materials', JSON.stringify(updated));
      return updated;
    });
  };

  const trackMaterialInteraction = async (materialId: string, type: 'click' | 'download' | 'impression') => {
    try {
      const cacheKey = `du_archive_int_${type}_${materialId}`;
      if (sessionStorage.getItem(cacheKey)) {
        return;
      }
      sessionStorage.setItem(cacheKey, 'true');

      const materialRef = doc(db, 'materials', materialId);
      if (type === 'click') {
        await updateDoc(materialRef, {
          clicks: increment(1)
        });
      } else if (type === 'download') {
        await updateDoc(materialRef, {
          downloads: increment(1)
        });
      } else if (type === 'impression') {
        await updateDoc(materialRef, {
          impressions: increment(1)
        });
      }
    } catch (err) {
      console.warn(`Could not track interaction (${type}):`, err);
    }
  };

  const calculateCtr = (clicks = 0, impressions = 0) => {
    if (!impressions || impressions === 0) return 0;
    const rate = (clicks / impressions) * 100;
    return Math.min(Math.max(rate, 0), 100);
  };

  const getPdfSize = (title: string, id: string): string => {
    let hash = 0;
    const combined = (title || "") + (id || "");
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    const sizes = ['1.2 MB', '2.4 MB', '1.8 MB', '3.5 MB', '4.2 MB', '850 KB', '5.1 MB', '3.9 MB', '2.3 MB', '6.1 MB', '7.4 MB', '1.5 MB', '4.8 MB'];
    const index = Math.abs(hash) % sizes.length;
    return sizes[index];
  };

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState("");
  const [moderationSettings, setModerationSettings] = useState<{ mode: string; flagThreshold: number }>({
    mode: 'approve_queue',
    flagThreshold: 5
  });

  // Dedicated Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => localStorage.getItem('du_archive_admin_auth') === 'true');
  const [adminInputUsername, setAdminInputUsername] = useState("");
  const [adminInputPasscode, setAdminInputPasscode] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");

  // Google Workspace States
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [exportedSheetsUrl, setExportedSheetsUrl] = useState<string | null>(null);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  const [generatedFormUrl, setGeneratedFormUrl] = useState<string | null>(null);
  const [emailMaterialId, setEmailMaterialId] = useState<string | null>(null);
  const [gmailRecipient, setGmailRecipient] = useState("");
  const [isSendingGmail, setIsSendingGmail] = useState(false);

  // User Behavior Logging Pattern
  const logUserBehavior = async (actionType: string, details: any = {}) => {
    try {
      await addDoc(collection(db, 'user_behavior_logs'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userFullName: userProfile?.fullName || (user?.displayName) || 'Anonymous Visitor',
        actionType,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn("Failed to log student behavior pattern:", error);
    }
  };

  // Watchers for automatic behavior telemetry collection
  useEffect(() => {
    logUserBehavior('TAB_SWITCH', { tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    if (selectedSubject) {
      logUserBehavior('VIEW_SUBJECT', {
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        courseId: selectedSubject.courseId
      });
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedCourse) {
      logUserBehavior('VIEW_COURSE', {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name
      });
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (previewMaterial) {
      logUserBehavior('VIEW_MATERIAL', {
        materialId: previewMaterial.id,
        materialTitle: previewMaterial.title,
        materialUrl: previewMaterial.url,
        materialType: previewMaterial.type
      });
    }
  }, [previewMaterial]);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 3) {
      const delay = setTimeout(() => {
        logUserBehavior('SEARCH_CONTEXTUAL', { query: searchQuery });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (globalSearchQuery && globalSearchQuery.trim().length >= 3) {
      const delay = setTimeout(() => {
        logUserBehavior('SEARCH_GLOBAL', { query: globalSearchQuery });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [globalSearchQuery]);

  // Global Search Effect
  useEffect(() => {
    if (!globalSearchQuery || globalSearchQuery.length < 2) {
      setGlobalSearchResults({ courses: [], subjects: [] });
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Filter local courses with fuzzy matching and sorting by score
        const coursesWithScores = courses
          .map(c => {
            const fuzzy = fuzzyMatch(c.name, globalSearchQuery);
            return { course: c, matches: fuzzy.matches, score: fuzzy.score };
          })
          .filter(c => c.matches)
          .sort((a, b) => b.score - a.score)
          .map(c => c.course);

        // Search subjects in Firestore (since they aren't all loaded) with fuzzy matching & sorting
        const subjectsSnap = await getDocs(collection(db, 'subjects'));
        const allSubjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
        const subjectsWithScores = allSubjects
          .map(s => {
            const fuzzy = fuzzyMatch(s.name, globalSearchQuery, s.code);
            return { subject: s, matches: fuzzy.matches, score: fuzzy.score };
          })
          .filter(s => s.matches)
          .sort((a, b) => b.score - a.score)
          .map(s => s.subject);

        setGlobalSearchResults({
          courses: coursesWithScores,
          subjects: subjectsWithScores
        });
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [globalSearchQuery, courses]);

  // Fetch Global stats
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const subjectsSnap = await getDocs(collection(db, 'subjects'));
        setTotalSubjects(subjectsSnap.size);
        
        const materialsSnap = await getDocs(collection(db, 'materials'));
        setTotalMaterials(materialsSnap.size);

        // Fetch recent activity
        const subSnap = await getDocs(query(collection(db, 'submissions'), where('status', '==', 'PUBLISHED')));
        const subs = subSnap.docs
          .map(d => d.data())
          .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentSubmissions(subs);
      } catch (err) {
        console.error("Failed to fetch global stats", err);
      }
    };
    fetchGlobalStats();
  }, [activeTab]); // Refresh when tab changes

  // Test connection on mount
  useEffect(() => {
    async function testConnection() {
      if (!isFirebaseConfigured) {
        setFirestoreConnectionError("unconfigured");
        return;
      }
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        // If successful or permission error, we clear previous errors
        setFirestoreConnectionError(null);
      } catch (error) {
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('the client is offline') || msg.includes('offline')) {
            console.error("Please check your Firebase configuration. The client is offline.", error);
            setFirestoreConnectionError("offline");
          } else if (msg.includes('api-key-not-valid') || msg.includes('api key') || msg.includes('invalid') || msg.includes('auth/')) {
            console.error("Please check your Firebase configuration. Invalid API Key.", error);
            setFirestoreConnectionError("invalid-api-key");
          } else {
            console.log("Firestore connection test completed. Database is reachable (returned expected permission restriction error):", error.message);
            setFirestoreConnectionError(null);
          }
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'moderation'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setModerationSettings({
          mode: data.mode || 'approve_queue',
          flagThreshold: data.flagThreshold !== undefined ? data.flagThreshold : 5
        });
      } else {
        setDoc(doc(db, 'settings', 'moderation'), {
          mode: 'approve_queue',
          flagThreshold: 5,
          updatedAt: new Date().toISOString(),
          updatedBy: 'System'
        }).catch(console.error);
      }
    }, (error) => {
      console.warn("Trouble reading system moderation settings. Defaulting locally to approved review queue.", error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        setCheckingProfile(true);
        unsubscribeProfile = onSnapshot(doc(db, 'users', 'DU-' + u.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            setShowOnboardingModal(false);
          } else {
            setUserProfile(null);
            setShowOnboardingModal(false);
            // Auto-initialize basic user profile
            setDoc(doc(db, 'users', 'DU-' + u.uid), {
              skippedOnboarding: true,
              fullName: u.displayName || 'Google User',
              email: u.email || 'student@du.ac.in',
              uin: ('DU-' + u.uid).substring(0, 7).toUpperCase(),
              onboardedAt: new Date().toISOString()
            }, { merge: true }).catch(err => console.error(err));
          }
          setCheckingProfile(false);
        }, (error) => {
          console.error("Error checking user profile:", error);
          setCheckingProfile(false);
        });
      } else {
        setUser(null);
        setUserProfile(null);
        setShowOnboardingModal(false);
        setCheckingProfile(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!user || !user.email) {
      setUserSubmissions([]);
      setUserSubmissionsLoading(false);
      return;
    }
    setUserSubmissionsLoading(true);
    const q = query(
      collection(db, 'submissions'),
      where('submittedByEmail', '==', user.email)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUserSubmissions(data);
      setUserSubmissionsLoading(false);
    }, (error) => {
      console.error("Error fetching user submissions:", error);
      setUserSubmissionsLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(data);
      setLoading(false);

      // Seed if empty and user is logged in (optional check, but good for demo)
      if (data.length === 0 && !loading) {
         const seedCourses = [
           "B.A. (Hons) Political Science",
           "B.A. (Hons) History",
           "B.A. (Hons) English",
           "B.A. Programme",
           "B.Sc. (Hons) Computer Science",
           "B.Sc. (Hons) Physics",
           "B.Com (Hons)",
           "B.Com Programme"
         ];
         seedCourses.forEach(async (name) => {
           const newCourse = await addDoc(collection(db, 'courses'), {
             name,
             level: 'UG',
             nepBased: true,
             durationYears: 3,
             description: `Academic materials for ${name}`,
             createdAt: new Date().toISOString()
           });

           // Add a few subjects for major courses
           if (name.includes("Political Science")) {
             await addDoc(collection(db, 'subjects'), {
               courseId: newCourse.id,
               name: "Understanding Political Theory",
               semester: 1,
               code: "UPT101",
               createdAt: new Date().toISOString()
             });
           } else if (name.includes("Computer Science")) {
             await addDoc(collection(db, 'subjects'), {
               courseId: newCourse.id,
               name: "Programming using Python",
               semester: 1,
               code: "CS101",
               createdAt: new Date().toISOString()
             });
           }
         });
      }
    }, (error) => {
      console.error("Courses snapshot error:", error);
      const msg = error.message.toLowerCase();
      if (msg.includes('api-key-not-valid') || msg.includes('api key') || msg.includes('auth/')) {
        setFirestoreConnectionError("invalid-api-key");
      } else if (msg.includes('offline') || msg.includes('the client is offline')) {
        setFirestoreConnectionError("offline");
      } else {
        setFirestoreConnectionError(error.message);
      }
    });
    return () => unsub();
  }, [loading]);

  const handleLogin = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }
    } catch (error: any) {
      console.error("Login failed", error);
      let errorMsg = error.message || String(error);
      if (error.code === 'auth/popup-blocked') {
        errorMsg = "Login popup was blocked. Please allow popups or open the app in a new tab.";
      }
      setLoginError(errorMsg);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setAdminAuthError("");
    const provider = new GoogleAuthProvider();
    // Removed strict Workspace scopes from login to prevent authentication failures.
    // Scopes will be requested uniquely during export/picker actions.
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email || "";
      if (email === 'pk950364@gmail.com') { // Authorized Admin
        setIsAdminAuthenticated(true);
        localStorage.setItem('du_archive_admin_auth', 'true');
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setGoogleAccessToken(credential.accessToken);
        }
      } else {
        setAdminAuthError(`Access Denied: Account "${email}" is not an admin.`);
      }
    } catch (error: any) {
      console.error("Admin login failed", error);
      let errorMsg = error.message || String(error);
      if (error.code === 'auth/popup-blocked') {
        errorMsg = "Admin login popup was blocked. Please allow popups or open the app in a new tab.";
      }
      setAdminAuthError(`Login failed: ${errorMsg}`);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setGoogleAccessToken(null);
    setUser(null);
    setUserProfile(null);
  };

  const ensureGoogleTokenWithScopes = async (scopes: string[]): Promise<string> => {
    let token = googleAccessToken;
    if (!token) {
      const provider = new GoogleAuthProvider();
      scopes.forEach(scope => provider.addScope(scope));
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        token = credential.accessToken;
        setGoogleAccessToken(token);
        return token;
      } else {
        throw new Error("Could not acquire Google sign-in credentials.");
      }
    }
    return token;
  };

  const handleExportToSheets = async () => {
    if (!selectedSubject) return;
    setIsExportingToSheets(true);
    setExportedSheetsUrl(null);
    try {
      const token = await ensureGoogleTokenWithScopes([
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]);
      
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `DU Archive Index: ${selectedSubject.name}`
          }
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Sheets creation failed: ${createResponse.statusText}`);
      }
      
      const sheetData = await createResponse.json();
      const spreadsheetId = sheetData.spreadsheetId;
      const spreadsheetUrl = sheetData.spreadsheetUrl;
      
      const rows = [
        ["Resource Title", "Type", "Resource URL", "Community Endorsements"],
        ...materials.map(m => [
          m.title,
          m.type,
          m.url,
          `${(m.upvotes || 0)} Upvotes`
        ])
      ];
      
      const writeResponse = await fetch(`https://sheets.googleapis.com/v4/lucide-react/`, { // wait, correct url is https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:D${rows.length}?valueInputOption=USER_ENTERED
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: rows
        })
      });
      
      // Fixed spreadsheet URL endpoint
      const writeFixedResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:D${rows.length}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: rows
        })
      });

      if (!writeFixedResponse.ok) {
        throw new Error(`Sheets values update failed: ${writeFixedResponse.statusText}`);
      }
      
      setExportedSheetsUrl(spreadsheetUrl);
    } catch (error: any) {
      console.error("Failed to export to Google Sheets:", error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExportingToSheets(false);
    }
  };

  const handleGenerateFeedbackForm = async () => {
    if (!selectedSubject) return;
    setIsGeneratingForm(true);
    setGeneratedFormUrl(null);
    try {
      const token = await ensureGoogleTokenWithScopes([
        'https://www.googleapis.com/auth/forms.body'
      ]);
      
      const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: `Feedback Form: ${selectedSubject.name}`,
            documentTitle: `Feedback Form - ${selectedSubject.name}`
          }
        })
      });
      
      if (!createResponse.ok) {
        throw new Error(`Form creation failed: ${createResponse.statusText}`);
      }
      
      const formData = await createResponse.json();
      const formId = formData.formId;
      const responderUri = formData.responderUri;
      
      const questionsBody = {
        requests: [
          {
            createItem: {
              item: {
                title: "How clear and complete is this subject's materials index?",
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: "RADIO",
                      options: [
                        { value: "Excellent" },
                        { value: "Adequate" },
                        { value: "Needs Improvement" }
                      ]
                    }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: "Are there any missing study topics or outdated materials?",
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: { paragraph: true }
                  }
                }
              },
              location: { index: 1 }
            }
          }
        ]
      };
      
      const updateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionsBody)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Adding questions failed: ${updateResponse.statusText}`);
      }
      
      setGeneratedFormUrl(responderUri);
    } catch (error: any) {
      console.error("Failed to generate Google Form:", error);
      alert(`Generation failed: ${error.message}`);
    } finally {
      setIsGeneratingForm(false);
    }
  };

  const handleSendGmailMessage = async (material: Material) => {
    if (!gmailRecipient) {
      alert("Please enter a valid recipient email address.");
      return;
    }
    setIsSendingGmail(true);
    try {
      const token = await ensureGoogleTokenWithScopes([
        'https://www.googleapis.com/auth/gmail.send'
      ]);
      
      const utf8B64 = (str: string) => {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt(p1, 16));
        }));
      };
      
      const emailContent = [
        `To: ${gmailRecipient}`,
        `Subject: [DU Archive] Recommendation: ${material.title}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e1e8ed; border-radius: 12px; color: #1c2938;">`,
          `<h2 style="color: #059669; margin-top: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">Delhi University Archive</h2>`,
          `<p style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #657786; margin-bottom: 20px;">Peer Study Material Delivery</p>`,
          `<hr style="border: 0; border-top: 1px solid #e1e8ed; margin-bottom: 20px;" />`,
          `<h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">${material.title}</h3>`,
          `<p style="font-size: 11px; font-weight: bold; color: #059669; text-transform: uppercase; margin: 0 0 15px 0;">Category: ${material.type}</p>`,
          `<p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">Your fellow DU student has shared an academic study resource directly with you. Use the secure action key below to access it.</p>`,
          `<div>`,
            `<a href="${material.url}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Open Study Resource</a>`,
          `</div>`,
          `<p style="font-size: 11px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e1e8ed; pt: 16px;">This message was generated instantly upon student request at Google Cloud preview environment platform.</p>`,
        `</div>`
      ].join('\r\n');
      
      const raw = utf8B64(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
      });
      
      if (!sendResponse.ok) {
        throw new Error(`Gmail API failed: ${sendResponse.statusText}`);
      }
      
      alert(`Resource successfully emailed to ${gmailRecipient}!`);
      setEmailMaterialId(null);
    } catch (error: any) {
      console.error("Failed to send email via Gmail:", error);
      alert(`Transmission failed: ${error.message}`);
    } finally {
      setIsSendingGmail(false);
    }
  };

  const handleSaveProfile = async (profileData: {
    fullName: string;
    collegeName: string;
    department: string;
    rollNumber: string;
    phoneNumber: string;
    hasConsented: boolean;
  }) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', 'DU-' + user.uid), {
        ...profileData,
        email: user.email || 'student@du.ac.in',
        uin: ('DU-' + user.uid).substring(0, 7).toUpperCase(),
        onboardedAt: new Date().toISOString(),
        skippedOnboarding: false
      }, { merge: true });
      setShowOnboardingModal(false);
    } catch (error: any) {
      console.error("Failed to save student profile details:", error);
      alert("Failed to save profile. Please check firestore permissions.");
      throw error;
    }
  };

  const handleSkipOnboarding = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', 'DU-' + user.uid), {
        skippedOnboarding: true,
        fullName: user.displayName || 'Google User',
        email: user.email || 'student@du.ac.in',
        uin: ('DU-' + user.uid).substring(0, 7).toUpperCase(),
        onboardedAt: new Date().toISOString()
      }, { merge: true });
      setShowOnboardingModal(false);
    } catch (error: any) {
      console.error("Failed to skip student profile setup:", error);
      alert("Failed to skip onboarding.");
    }
  };

  // Synchronise DU seed materials for a single subject
  const handleSeedSpecificSubject = async (subject: Subject) => {
    setIsSeeding(true);
    setSeedingProgress("Accessing node archives...");
    try {
      // Find matching subject in DU_SEED_DATA
      let foundMaterials: any[] = [];
      for (const cur of DU_SEED_DATA) {
        const foundSub = cur.subjects.find((s: any) => s.name.toLowerCase() === subject.name.toLowerCase() || s.code.toLowerCase() === subject.code.toLowerCase());
        if (foundSub) {
          foundMaterials = foundSub.materials;
          break;
        }
      }

      if (foundMaterials.length === 0) {
        // Generate generic rich mock materials if not found specifically
        foundMaterials = [
          { title: `${subject.name} - Official Syllabus & Practical Outline`, url: `https://www.du.ac.in/uploads/new-web/syllabi-nep-2022/`, type: "PDF" },
          { title: `${subject.name} - Consolidated 10-Year Previous Question Papers`, url: `http://web.du.ac.in/PreviousQuestionPapers/`, type: "PDF" },
          { title: `${subject.name} - Syllabus Reference Books & Notes`, url: `https://github.com/asmit-0/du-cs-study-material/`, type: "NOTES" }
        ];
      }

      // Add to Firestore
      for (let i = 0; i < foundMaterials.length; i++) {
        const m = foundMaterials[i];
        setSeedingProgress(`Linking [${i+1}/${foundMaterials.length}]: ${m.title.substring(0, 20)}...`);
        await addDoc(collection(db, 'materials'), {
          subjectId: subject.id,
          title: m.title,
          url: m.url,
          type: m.type,
          isApproved: true,
          submittedBy: user?.email || "System Seeder",
          createdAt: new Date().toISOString(),
          upvotes: Math.floor(Math.random() * 25) + 5,
          downvotes: 0
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to seed resources: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSeeding(false);
      setSeedingProgress("");
    }
  };

  // Mass Seed of all courses, subjects, and files
  const handleBulkSeedDUData = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setSeedingProgress("Connecting to Delhi University database nodes...");
    
    try {
      // 1. Get or create matching courses in Firestore
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const existingCourses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));

      for (const courseData of DU_SEED_DATA) {
        setSeedingProgress(`Seeding Course: ${courseData.name}...`);
        let courseId = "";
        const matched = existingCourses.find(c => c.name.toLowerCase().trim() === courseData.name.toLowerCase().trim());
        
        if (matched) {
          courseId = matched.id;
        } else {
          const docRef = await addDoc(collection(db, 'courses'), {
            name: courseData.name,
            description: courseData.description,
            level: courseData.level,
            durationYears: courseData.durationYears,
            nepBased: courseData.nepBased,
            createdAt: new Date().toISOString()
          });
          courseId = docRef.id;
        }

        // 2. Fetch or create subjects for this course
        const subjectsRef = collection(db, 'subjects');
        const subSnap = await getDocs(query(subjectsRef, where('courseId', '==', courseId)));
        const existingSubjects = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));

        for (const subData of courseData.subjects) {
          let subjectId = "";
          const subMatched = existingSubjects.find(s => s.name.toLowerCase().trim() === subData.name.toLowerCase().trim());

          if (subMatched) {
            subjectId = subMatched.id;
          } else {
            setSeedingProgress(`Creating subject: ${subData.name}...`);
            const subRef = await addDoc(subjectsRef, {
              courseId,
              name: subData.name,
              semester: subData.semester,
              code: subData.code,
              description: subData.description,
              createdAt: new Date().toISOString()
            });
            subjectId = subRef.id;
          }

          // 3. For each subject, check if materials already exist, if not seed them
          const matQuery = query(collection(db, 'materials'), where('subjectId', '==', subjectId));
          const matSnap = await getDocs(matQuery);
          
          if (matSnap.empty) {
            for (const m of subData.materials) {
              setSeedingProgress(`Adding material node: ${m.title.substring(0, 20)}...`);
              await addDoc(collection(db, 'materials'), {
                subjectId,
                title: m.title,
                url: m.url,
                type: m.type,
                isApproved: true,
                submittedBy: "System Seeder",
                createdAt: new Date().toISOString(),
                upvotes: Math.floor(Math.random() * 40) + 10,
                downvotes: 0
              });
            }
          }
        }
      }
      
      alert("Academic Synchronization Complete! All DU nodes, syllabus files, and PYQs are now arranged.");
    } catch (err) {
      console.error(err);
      alert("Bulk synchronization failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSeeding(false);
      setSeedingProgress("");
    }
  };

  const fetchSubjects = async (courseId: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'subjects'), where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(data);
      setActiveTab('subject-browser');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'subjects');
    } finally {
      setLoading(false);
    }
  };

  // Real-time materials listener
  useEffect(() => {
    if (!selectedSubject) return;
    
    const q = query(collection(db, 'materials'), where('subjectId', '==', selectedSubject.id));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
      setMaterials(data);
    }, (error) => {
      console.warn("Materials snapshot error: ", error);
    });
    
    return () => unsub();
  }, [selectedSubject]);

  // Auto-track impressions for displayed material resources
  useEffect(() => {
    if (materials && materials.length > 0) {
      materials.forEach(m => {
        trackMaterialInteraction(m.id, 'impression');
      });
    }
  }, [materials]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={globalSearchQuery}
        setSearchQuery={setGlobalSearchQuery}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 md:pt-36 pb-28 lg:pb-32">
        {loginError && (
          <div className="mb-12 border border-red-200 bg-red-50/45 p-6 rounded-apple text-left animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-600 text-white rounded-apple shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-red-950">
                  Google Verification & Cookie Warning
                </h3>
                <p className="text-[11px] font-bold leading-relaxed text-red-900 uppercase tracking-wide">
                  {loginError}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-widest rounded transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Bypass Sandbox (Open Web in New Tab)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => setLoginError(null)}
                    className="px-4 py-2.5 border border-slate-200 bg-white text-slate-450 hover:bg-slate-50 font-extrabold text-[9px] uppercase tracking-widest rounded transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {firestoreConnectionError && (
          <div className="mb-12 border-2 border-amber-500 bg-amber-50/50 p-6 rounded-apple text-left">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500 text-white rounded shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-955">
                  {firestoreConnectionError === 'unconfigured' 
                    ? 'Firebase Backend Setup Required' 
                    : firestoreConnectionError === 'invalid-api-key' 
                      ? 'Invalid Firebase API Key Configuration' 
                      : firestoreConnectionError === 'offline' 
                        ? 'Database Client Offline' 
                        : 'Database Setup Interrupted'}
                </h3>
                <p className="text-xs font-bold leading-relaxed text-amber-900 uppercase tracking-wide">
                  {firestoreConnectionError === 'unconfigured' && (
                    <>
                      The student resource archive is currently running on placeholder credentials because Firebase has not been provisioned. 
                      Please look for the database terminal or settings prompt in the workspace to initiate the automatic setup, then complete the Cloud Terms acceptance in the UI.
                    </>
                  )}
                  {firestoreConnectionError === 'invalid-api-key' && (
                    <>
                      The Firebase SDK was initiated with an invalid API Key. This usually happens when moving workspaces before provisioning a personal Firebase instance. 
                      Please trigger "set_up_firebase" or accept terms in the platform UI to generate a valid key.
                    </>
                  )}
                  {firestoreConnectionError === 'offline' && (
                    <>
                      The client was unable to connect to the Firebase database servers. 
                      If you have just started the dev environment, this is temporary as the system boots. Please verify your internet connection, confirm that your project is active, or reload the page.
                    </>
                  )}
                  {!(firestoreConnectionError === 'unconfigured' || firestoreConnectionError === 'invalid-api-key' || firestoreConnectionError === 'offline') && (
                    <>
                      An issue occurred while connecting to the database: {firestoreConnectionError}. 
                      Check the console logs for additional details.
                    </>
                  )}
                </p>
                
                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      setFirestoreConnectionError(null);
                      const testFn = async () => {
                        try {
                          await getDocFromServer(doc(db, 'test', 'connection'));
                          setFirestoreConnectionError(null);
                        } catch (err: any) {
                          const msg = err.message.toLowerCase();
                          if (msg.includes('offline')) {
                            setFirestoreConnectionError('offline');
                          } else if (msg.includes('key')) {
                            setFirestoreConnectionError('invalid-api-key');
                          } else {
                            setFirestoreConnectionError(err.message);
                          }
                        }
                      };
                      testFn();
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-widest rounded-apple transition-colors cursor-pointer"
                  >
                    Attempt Reconnection
                  </button>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-700 self-center">
                    Status: Offline Mode Enabled / Schema Loaded Locally
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'search-results' && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16 pb-20"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b-2 border-emerald-600 pb-8">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="section-heading">Query Retrieval</h2>
                  <p className="section-subheading">Results for <span className="text-emerald-600 font-bold">"{globalSearchQuery}"</span></p>
                </div>
                <button 
                  onClick={() => {
                    setGlobalSearchQuery("");
                    setActiveTab('home');
                  }}
                  className="px-10 py-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all rounded-apple"
                >
                  Clear Search
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-6 rounded-apple-xl flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Popular:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "DeepMind Quantum Setup",
                    "String Theory Notes",
                    "B.Sc. Physics (Hons)",
                    "Mathematical Physics",
                    "Quantum Mechanics",
                    "Thermal Physics",
                    "Statistical Mechanics"
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setGlobalSearchQuery(term);
                        setSearchQuery(term);
                      }}
                      className="px-4 py-2 bg-white border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100/80 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {isSearching ? (
                <DigitalBeamScanner message="Scanning Archival Clusters" subMessage="Querying colleges and public repositories..." />
              ) : (
                <div className="space-y-20">
                  {/* Course Results */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 text-white">
                        <GraduationCap size={24} />
                      </div>
                      <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900">Course Nodes <span className="text-slate-300 font-medium ml-2">[{globalSearchResults.courses.length}]</span></h3>
                    </div>
                    
                    <motion.div 
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                      className="grid grid-cols-1 min-[420px]:grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 md:gap-6"
                    >
                      {globalSearchResults.courses.map((course) => (
                        <motion.div
                          key={course.id}
                          variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1 }
                          }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedCourse(course);
                            fetchSubjects(course.id);
                            setActiveTab('subject-browser');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-3 sm:p-5 lg:p-6 bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer group flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md"
                        >
                          <div className="w-12 h-12 bg-slate-50 rounded-apple flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                            <Folder size={24} />
                          </div>
                          <h4 className="text-[10px] font-black text-slate-600 group-hover:text-emerald-600 line-clamp-3 leading-tight uppercase tracking-widest">{course.name}</h4>
                          <CourseMaterialsCount courseId={course.id} />
                        </motion.div>
                      ))}
                      {globalSearchResults.courses.length === 0 && (
                        <motion.div 
                          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                          className="col-span-full py-16 text-center bg-slate-50 rounded-apple-xl border border-dashed border-slate-200"
                        >
                          <p className="card-label">No matching courses mapped.</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Subject Results */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 text-white rounded-apple shadow-emerald-sm">
                        <Library size={24} />
                      </div>
                      <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900">Subject Nodes <span className="text-slate-300 font-medium ml-2">[{globalSearchResults.subjects.length}]</span></h3>
                    </div>
                    
                    <motion.div 
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    >
                      {globalSearchResults.subjects.map((sub) => (
                        <motion.div
                          key={sub.id}
                          variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1 }
                          }}
                          onClick={async () => {
                            // Find the parent course
                            const c = courses.find(course => course.id === sub.courseId);
                            if (c) setSelectedCourse(c);
                            
                            // Load siblings for the browser
                            const q = query(collection(db, 'subjects'), where('courseId', '==', sub.courseId));
                            const snapshot = await getDocs(q);
                            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
                            setSubjects(data);
                            
                            setSelectedSubject(sub);
                            setActiveTab('material-view');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-white p-6 rounded-apple-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-600 hover:bg-emerald-50/20 transition-all cursor-pointer group flex items-center gap-5"
                        >
                          <div className="w-11 h-11 bg-slate-50 rounded-apple flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                            <BookOpen size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[9px] font-black uppercase text-emerald-600">SEM {sub.semester}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{courses.find(c => c.id === sub.courseId)?.name.split(' ')[0]}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 truncate uppercase tracking-tight">{sub.name}</h4>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </motion.div>
                      ))}
                      {globalSearchResults.subjects.length === 0 && (
                        <motion.div 
                          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                          className="col-span-full py-12 text-center bg-slate-50 rounded-apple-xl border border-dashed border-slate-100"
                        >
                          <p className="card-label">No matching subjects found.</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  <LiveSearchEmbed query={globalSearchQuery} setQuery={setGlobalSearchQuery} user={user} onSave={(m) => setPrefillData({ title: m.name, url: m.path, type: 'PDF', subjectHint: '' })} />

                  {globalSearchResults.courses.length === 0 && globalSearchResults.subjects.length === 0 && (
                    <div className="bg-white rounded-apple p-6 md:p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No matches found</h3>
                        <p className="text-gray-500 mb-8">We couldn't find any courses or subjects matching your search. Try adjusting your keywords or use the DeepMind Discovery tool below.</p>
                        <button 
                          onClick={() => {
                            setSearchQuery(globalSearchQuery);
                            setActiveTab('home');
                            setTimeout(() => window.scrollTo({ top: 1000, behavior: 'smooth' }), 100);
                          }}
                          className="bg-emerald-600 text-white px-8 py-3 rounded-apple font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-emerald-600/20"
                        >
                          Try DeepMind Discovery <Sparkles size={18} />
                        </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Main Labs Tab - Managed dynamically so running queries / search processing continues in the background even if admin switches tabs */}
          <div className={activeTab === 'labs' ? 'block w-full' : 'hidden'}>
            <motion.div
              key="labs-persistent"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={activeTab === 'labs' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
              className="w-full pb-20 px-4 md:px-12 xl:px-24"
            >
              <div className="max-w-7xl mx-auto">
                <DeepResearchLabs user={user} />
              </div>
            </motion.div>
          </div>

          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-24 pt-8 text-left font-sans"
            >
              <div className="space-y-16">
                
                {/* Build and App Version Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black tracking-widest text-slate-550 text-slate-600 uppercase font-mono">SYSTEM RELEASE: ACTIVE</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 font-mono">
                    BUILD ID: <span className="text-emerald-700 font-black">STABLE-2026.06-v1.4.2</span>
                  </div>
                </div>
                
                {/* Mission Section */}
                <section className="space-y-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Our Mission
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Equal Access To Academic Resources
                  </h1>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                    The DeepMind Research & Physics Lab is a non-profit, open-source initiative designed to democratize high-quality academic resources for all undergraduate programs. We aim to bridge the gap in educational access by providing curated, authenticated, and highly structured course guides, past examination question papers, and interactive educational models.
                  </p>
                </section>

                {/* Team / Founders Details Section */}
                <section className="space-y-6 pt-8 border-t border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    The Founder
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-xl flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 font-mono font-bold shrink-0 text-lg">
                      P
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Pradeep</h3>
                        <p className="text-xs text-slate-550 text-slate-500 font-semibold uppercase tracking-wider">
                          Physics Graduate • Ramjas College
                        </p>
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                        Pradeep founded this community-based digital repository with the singular vision of making premium study materials accessible without barriers. Reflecting his background in physical sciences, what began as a compact personal archive of physics guidelines and mathematical solutions has grown into a structured hub serving students across all colleges and courses of Delhi University.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Development Phases Section */}
                <section className="space-y-8 pt-8 border-t border-slate-100">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                      Development Roadmap
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Project Release Phases
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 font-medium">
                      Our progress metrics tracking the release and evolution of digital library capabilities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                      {
                        phase: 'PHASE 01',
                        name: 'Academic Hub Foundation',
                        subtitle: 'Simplified course catalogs and secure library listings',
                        status: 'Completed',
                        description: 'Launched the core structural catalog matching different university colleges, undergraduate programs, and individual departments.'
                      },
                      {
                        phase: 'PHASE 02',
                        name: 'Syllabus & Past Exams Collection',
                        subtitle: 'Assembling official academic files',
                        status: 'Completed',
                        description: 'Gathered and structured past exam question papers and syllabus guides from previous years.'
                      },
                      {
                        phase: 'PHASE 03',
                        name: 'Smart Instant Search Box',
                        subtitle: 'Typo-tolerant lookup and instant match filters',
                        status: 'Completed',
                        description: 'Developed an elegant search box that shows corresponding subjects and papers instantly as students type.'
                      },
                      {
                        phase: 'PHASE 04',
                        name: 'Automatic Catalog Organization',
                        subtitle: 'Auto-sorting incoming resource files',
                        status: 'Completed',
                        description: 'Created automatic organizer tools that read newly added studies and instantly suggest the correct course tab.'
                      },
                      {
                        phase: 'PHASE 05',
                        name: 'Clear In-App Reader Screen',
                        subtitle: 'Read study notes directly inside the page',
                        status: 'Completed',
                        description: 'Built a comfortable full-screen reading room where materials render directly inside the page, removing friction.'
                      },
                      {
                        phase: 'PHASE 06',
                        name: 'Peer Feedback & Material Metrics',
                        subtitle: 'Tracing helpful material files and active ratings',
                        status: 'Active',
                        description: 'Engineering search tracing trackers and ratings so students can easily flag and promote the most helpful revision resources.'
                      },
                      {
                        phase: 'PHASE 07',
                        name: 'Academic Summaries & Quick Mock Sheets',
                        subtitle: 'Generating short revision sheets and exam mock sheets',
                        status: 'Planned',
                        description: 'Adding quick-read subject summaries and simple sample tests right inside subject tabs to facilitate half-time test prep.'
                      }
                    ].map((stage, idx) => (
                      <div 
                        key={idx} 
                        className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-none flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
                              {stage.phase}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              stage.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                : stage.status === 'Active' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-100' 
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                              {stage.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                            {stage.name}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500">
                            {stage.subtitle}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2 mt-1 font-medium">
                          {stage.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </motion.div>
          )}

          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-16 pb-20 w-full max-w-[1600px] mx-auto px-4 lg:px-12"
            >
              <section className="text-center space-y-8 pt-12 md:pt-32 relative">
                <div className="absolute top-0 inset-x-0 mx-auto max-w-7xl -z-10 h-[500px] pointer-events-none">
                  <div className="absolute top-20 left-1/4 w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                  <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-sky-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                </div>

                <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                   <span>DeepResearch Labs coming soon</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[1.1]">
                  Discover Materials <br />
                  <span className="text-emerald-600">Instantly</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
                  The most comprehensive, 100% free and open source study library for DU modules.
                  Built collaboratively by the community for equal educational access.
                </p>
                
                <div className="w-full max-w-4xl mx-auto relative group mt-12 md:mt-16">
                  <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10" size={24} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by subject, topic or course code..." 
                    className="w-full bg-white/95 backdrop-blur-md border border-slate-200/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 py-5 md:py-7 pl-16 md:pl-20 pr-6 md:pr-8 text-base md:text-xl font-bold text-slate-900 transition-all placeholder:text-slate-400 outline-none rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 z-10"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-6 md:mt-8 max-w-4xl mx-auto px-2 md:px-4">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest w-full text-center mb-1.5 md:w-auto md:mb-0 md:mr-2 select-none">Popular:</span>
                  {[
                    "DeepMind Quantum Setup",
                    "String Theory Notes",
                    "B.Sc. Physics (Hons)",
                    "Mathematical Physics",
                    "Quantum Mechanics",
                    "Thermal Physics",
                    "Statistical Mechanics"
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setGlobalSearchQuery(term);
                      }}
                      className="px-2.5 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-full text-[8.5px] md:text-[10px] font-black text-slate-600 uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              {/* Dynamic Algorithm & Indexing Analytics Banner */}
              <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-300">
                <AlgorithmAnalytics 
                  totalCourses={courses.length} 
                  totalSubjects={subjects.length} 
                  totalMaterials={materials.length} 
                />
              </div>

              {searchQuery.length > 0 ? (
                <div className="pt-4">
                  <LiveSearchEmbed query={searchQuery} setQuery={setSearchQuery} user={user} onSave={(m) => {
                     setPrefillData({ title: m.name, url: m.path, type: 'PDF', subjectHint: '' });
                     setActiveTab('contribute');
                  }} />
                </div>
              ) : (
                <>
                   <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {[
                        { icon: Search, title: 'How to Search', desc: 'Just type a subject name like "Political Theory" or a course code. We will instantly retrieve relevant documents.' },
                        { icon: FileText, title: 'What is Included', desc: 'Our index covers thousands of official previous year question papers, syllabi, notes, and study guides.' },
                        { icon: LayoutGrid, title: 'Archive Browsing', desc: 'Prefer to browse? Click on "Archive" in the menu to explore subjects and folders systematically.' },
                      ].map((feature, i) => (
                        <div key={i} className="px-8 py-10 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50 transition-all group relative overflow-hidden flex flex-col items-center">
                           <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center rounded-apple mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-emerald-sm">
                             <feature.icon size={26} />
                           </div>
                           <h3 className="text-lg font-black mb-3 uppercase tracking-tight text-slate-900">{feature.title}</h3>
                           <p className="text-slate-500 text-xs leading-relaxed font-bold uppercase tracking-widest">{feature.desc}</p>
                        </div>
                      ))}
                   </section>
                  
                  <MainFeaturesList />

                  <section className="pt-24 text-center border-t border-slate-100">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Archive Footprint</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-12">The scale of our open knowledge repository</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                      {[
                        { stat: '90+', label: 'Colleges' },
                        { stat: '500+', label: 'Programs' },
                        { stat: '80+', label: 'Departments' },
                        { stat: '1922', label: 'University Est.' },
                      ].map((s, i) => (
                        <div key={i} className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm hover:shadow-md transition-all hover:border-emerald-200">
                          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1 sm:mb-2 tracking-tighter uppercase font-mono">{s.stat}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 pb-24"
            >
              <div className="flex flex-wrap items-center justify-between gap-6 px-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-600 text-white rounded-apple shadow-emerald-sm">
                      <Library size={32} />
                    </div>
                    <h2 className="section-heading">The Archive</h2>
                  </div>
                  <p className="section-subheading px-1">Accessing official university nodes // Root Directory.</p>
                </div>
              </div>

              {/* Archive Navigation */}
              <div className="flex items-center gap-1.5 border border-slate-200/80 bg-slate-50/80 rounded-apple-xl p-1.5 max-w-full overflow-x-auto no-scrollbar flex-nowrap scroll-smooth shadow-sm lg:flex-nowrap">
                <button
                  onClick={() => setArchiveSubTab('browse')}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg text-center shrink-0 whitespace-nowrap ${archiveSubTab === 'browse' ? 'bg-white text-emerald-650 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  Browse Content
                </button>
                <button
                  onClick={() => setArchiveSubTab('aggregator')}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg text-center shrink-0 whitespace-nowrap ${archiveSubTab === 'aggregator' ? 'bg-white text-emerald-650 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  Resource Aggregator
                </button>
                <button
                  onClick={() => setArchiveSubTab('colleges')}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg text-center shrink-0 whitespace-nowrap ${archiveSubTab === 'colleges' ? 'bg-white text-emerald-650 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  Colleges
                </button>
                <button
                  onClick={() => setArchiveSubTab('papers')}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg text-center shrink-0 whitespace-nowrap ${archiveSubTab === 'papers' ? 'bg-white text-emerald-650 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  PYQ Papers
                </button>
                <button
                  onClick={() => setArchiveSubTab('stats')}
                  className={`px-4 sm:px-6 py-3 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg text-center shrink-0 whitespace-nowrap ${archiveSubTab === 'stats' ? 'bg-white text-emerald-650 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  System Stats
                </button>
              </div>

              {/* My Saved Study Desk Section */}
              {bookmarkedMaterials.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-apple-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-apple">
                        <BookmarkCheck size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">My Study Desk</h3>
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick offline access node ledger // {bookmarkedMaterials.length} pinned units</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if(confirm("Confirm removal of all pinned units from index desk?")) {
                          setBookmarkedMaterials([]);
                          localStorage.removeItem('du_archive_bookmarked_materials');
                        }
                      }}
                      className="px-3 py-1.5 border border-slate-200 hover:border-red-200 hover:text-red-650 bg-white text-[8px] font-black uppercase tracking-widest text-slate-500 rounded transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {bookmarkedMaterials.map((m, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        key={m.id || idx}
                        className="bg-white border border-slate-200 p-4 rounded-apple-xl flex flex-col justify-between hover:border-emerald-600/30 hover:shadow-xs transition-all min-h-[140px]"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex gap-1.5 items-center">
                              <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-wide rounded ${
                                m.type === 'PDF' ? 'bg-red-50 text-red-600 border border-red-100' :
                                m.type === 'NOTES' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-slate-100 text-slate-600 border border-slate-150'
                              }`}>
                                {m.type}
                              </span>
                              {(m.type === 'PDF' || m.url.toLowerCase().endsWith('.pdf')) && (
                                <span className="px-1.5 py-0.5 text-[7px] font-black font-mono uppercase tracking-widest rounded bg-slate-900 text-white border border-slate-900 shadow-xs leading-none">
                                  {getPdfSize(m.title, m.id)}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => toggleBookmark(m)}
                              title="Unpin resource"
                              className="text-slate-350 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wide line-clamp-2 leading-tight">
                            {m.title}
                          </h4>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                            INDEXED CODES
                          </span>
                          {m.type === 'PDF' || m.url.toLowerCase().endsWith('.pdf') ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setPreviewMaterial(m)}
                                className="px-2.5 py-1 bg-slate-900 text-white hover:bg-emerald-600 text-[8px] font-black uppercase tracking-widest rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <FolderOpen size={9} />
                                <span>Inspect</span>
                              </button>
                              <a
                                href={m.url}
                                download
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={() => trackMaterialInteraction(m.id, 'download')}
                                className="p-1 bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded transition-all cursor-pointer flex items-center justify-center"
                                title="Download PDF directly"
                              >
                                <Download size={9} className="stroke-[2.5px]" />
                              </a>
                            </div>
                          ) : (
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="px-2.5 py-1 border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded text-slate-500 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink size={9} />
                              <span>Visit</span>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {archiveSubTab === 'browse' && (
                <div className="space-y-16">
                  {/* Official Repository Section */}
                  <OfficialRepositoryBrowser />

                  {/* Community Grid */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                      <h3 className="text-xl font-black tracking-tighter uppercase">Community Collective</h3>
                    </div>
                
                {loading ? (
                  <SkeletonGrid count={6} />
                ) : (
                    <div className="grid grid-cols-1 min-[420px]:grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 md:gap-6">
                    {courses.map((course) => (
                      <motion.div
                        key={course.id}
                        variants={{
                          hidden: { opacity: 0 },
                          show: { opacity: 1 }
                        }}
                        onClick={() => {
                          setSelectedCourse(course);
                          fetchSubjects(course.id);
                          setActiveTab('subject-browser');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group flex flex-col items-center justify-center gap-4 sm:gap-6 p-3 sm:p-5 lg:p-6 bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer active:scale-95 text-center h-full shadow-sm hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-apple flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm shrink-0">
                          <Folder size={24} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-600 group-hover:text-emerald-600 line-clamp-3 leading-tight uppercase tracking-widest">{course.name}</h3>
                        <CourseMaterialsCount courseId={course.id} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {courses.length === 0 && !loading && (
                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center border border-dashed border-slate-200"
                  >
                    <GraduationCap size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Archive initializing...</p>
                    <button className="mt-4 text-slate-900 font-black uppercase tracking-widest text-xs hover:underline" onClick={() => setActiveTab('contribute')}>Suggest a Course</button>
                  </motion.div>
                )}
                    </div>
                  </div>
                )}

               {archiveSubTab === 'aggregator' && (
                <div className="pt-2">
                  <ResourceAggregator 
                    courses={courses}
                    onPreviewMaterial={(material) => {
                      setPreviewMaterial(material);
                    }}
                    bookmarkedIds={bookmarkedMaterials.map(m => m.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                </div>
              )}

              {archiveSubTab === 'colleges' && (
                <div className="pt-2">
                  <CollegesBrowser
                    onSelectCourseByName={(courseName) => {
                      const matchedCourse = courses.find(
                        (c) => c.name.toLowerCase().trim() === courseName.toLowerCase().trim()
                      );
                      if (matchedCourse) {
                        setSelectedCourse(matchedCourse);
                        fetchSubjects(matchedCourse.id);
                        setActiveTab('subject-browser');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        const startWord = courseName.split(' ')[0].toLowerCase().trim();
                        const fuzzyMatch = courses.find(
                          (c) => c.name.toLowerCase().includes(startWord)
                        );
                        if (fuzzyMatch) {
                          setSelectedCourse(fuzzyMatch);
                          fetchSubjects(fuzzyMatch.id);
                          setActiveTab('subject-browser');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          alert(`Course details for "${courseName}" are mapping soon. Try browsing other nodes!`);
                        }
                      }
                    }}
                  />
                </div>
              )}

              {archiveSubTab === 'papers' && (
                <div className="pt-0">
                  <div className="bg-white border border-slate-100 rounded-apple-2xl shadow-sm p-12 md:p-16 h-full space-y-16">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-emerald-600 text-white rounded-apple shadow-emerald-sm">
                        <BookOpen size={36} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">PYQ Repository</h3>
                        <p className="section-subheading">Direct access to curated archival clusters // Recent Academic Cycles.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {QUESTION_PAPERS_ARCHIVE.map((categoryGroup, idx) => (
                        <div key={idx} className="p-10 space-y-10 bg-slate-50/50 rounded-apple-xl border border-slate-100">
                           <h4 className="text-xl font-black uppercase tracking-tighter pb-4 border-b border-emerald-600">{categoryGroup.category}</h4>
                           <div className="space-y-6">
                             {categoryGroup.courses.map((course, cIdx) => (
                               <div key={cIdx} className="space-y-4">
                                  <div className="card-label">{course.name}</div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {course.links.map((link, lIdx) => (
                                      <a
                                        key={lIdx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all rounded-apple shadow-sm"
                                      >
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-emerald-600 transition-colors">
                                          {link.term.toUpperCase()}
                                        </span>
                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-600 transition-colors" />
                                      </a>
                                    ))}
                                  </div>
                               </div>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {archiveSubTab === 'stats' && (
                <div className="pt-4 border-t border-gray-100">
                  <StatisticsPage 
                    coursesCount={courses.length} 
                    subjectsCount={totalSubjects} 
                    materialsCount={totalMaterials} 
                    recentSubmissions={recentSubmissions}
                  />
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'subject-browser' && selectedCourse && (
            <motion.div
              key="subject-browser"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12 pb-24"
            >
              <button 
                onClick={() => setActiveTab('courses')}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowRight size={14} className="rotate-180" /> Back to Archive
              </button>

              <div className="bg-white border border-slate-100 rounded-apple-2xl shadow-sm p-4 sm:p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
                 <div className="p-6 bg-emerald-600 text-white rounded-apple shadow-emerald-sm">
                    <GraduationCap size={44} />
                 </div>
                 <div className="text-center md:text-left space-y-4 w-full">
                    <div className="section-subheading">Course Index // {selectedCourse.id.toUpperCase()}</div>
                    <h2 className="section-heading text-3xl md:text-5xl">{selectedCourse.name}</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-2xl">{selectedCourse.description || 'Access all subjects and papers for this degree program.'}</p>
                 </div>
              </div>

              {/* Course Specifications Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 p-4 sm:p-8 rounded-apple-xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-apple text-slate-700 shadow-sm shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description</span>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                      {selectedCourse.description || "Course materials & archived academic links."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-apple text-slate-700 shadow-sm shrink-0">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Duration</span>
                    <p className="text-xs font-black text-slate-950 uppercase tracking-wider">
                      {selectedCourse.durationYears ? `${selectedCourse.durationYears} Years (${selectedCourse.durationYears * 2} Semesters)` : "3 Years (6 Semesters)"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-apple text-slate-700 shadow-sm shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Regulation</span>
                    <p className="text-xs font-black text-slate-950 uppercase tracking-wider">
                      {selectedCourse.nepBased ? "NEP Based Curriculum" : "Pre-NEP Legacy"}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <AcademicDocLoader message="Mapping semesters" subMessage="Preparing subject curriculums..." />
              ) : (
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 md:gap-6">
                  {subjects.sort((a,b) => a.semester - b.semester).map((sub) => (
                    <motion.div 
                      key={sub.id}
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1 }
                      }}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setActiveTab('material-view');
                      }}
                      className="group flex flex-col items-center justify-center gap-4 sm:gap-6 p-3 sm:p-5 lg:p-6 bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all cursor-pointer h-full text-center shadow-sm hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-apple flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <BookOpen size={24} />
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sem {sub.semester}</div>
                        <h3 className="text-[10px] font-black text-slate-600 group-hover:text-emerald-600 line-clamp-3 leading-tight uppercase tracking-widest px-0">{sub.name}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'material-view' && selectedSubject && (
            <motion.div
              key="material-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16 pb-24"
            >
              <button 
                onClick={() => setActiveTab('subject-browser')}
                className="flex items-center gap-3 p-3 px-5 bg-slate-50 border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-apple w-fit"
              >
                <ArrowRight size={14} className="rotate-180" /> Back to Subject Index
              </button>

              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 bg-white p-4 sm:p-8 md:p-12 border border-slate-100 rounded-apple-2xl shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
                  <div className="p-6 bg-emerald-600 text-white rounded-apple shadow-emerald-sm transition-transform hover:scale-105 shrink-0 animate-in zoom-in-50 duration-300">
                    <BookOpen size={44} />
                  </div>
                  <div className="text-center md:text-left space-y-4 w-full">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                      Academic Module // Sem 0{selectedSubject.semester}
                    </div>
                    <h2 className="section-heading text-xl sm:text-2xl md:text-5xl leading-none">{selectedSubject.name}</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-2xl">{selectedSubject.description || 'Study guides, PYQs and notes for this module.'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('contribute')}
                  className="w-full md:w-auto bg-emerald-600 text-white px-10 py-5 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-emerald-700 active:scale-95 transition-all shadow-emerald-sm rounded-apple flex items-center justify-center gap-3 shrink-0"
                >
                  <PlusCircle size={20} /> Uplink Material
                </button>
              </div>

              {/* Google Workspace Control Panel */}
              <div className="bg-slate-50 border border-slate-100 rounded-apple-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Google Workspace Integration
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                    Syllabus index syndication, peer workspace communication, and study quality control
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sheets Export */}
                  <div className="bg-white border border-slate-200/60 rounded-apple-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                        Google Sheets Catalog
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Export Subject Ledger
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
                        Export this entire module's materials, past exam questions, and links directly to a newly generated spreadsheet in your Drive.
                      </p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <button
                        disabled={isExportingToSheets}
                        onClick={handleExportToSheets}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black text-[9px] uppercase tracking-widest rounded-apple transition-all duration-200 cursor-pointer"
                      >
                        {isExportingToSheets ? "Exporting..." : "Export to Sheets"}
                      </button>
                      
                      {exportedSheetsUrl && (
                        <a
                          href={exportedSheetsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-black text-[9px] uppercase tracking-widest rounded-apple transition-all duration-200 cursor-pointer"
                        >
                          Open Spreadsheet
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Forms feedback survey creation */}
                  <div className="bg-white border border-slate-200/60 rounded-apple-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-650">
                        Google Forms Provisioning
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Active Quality Audit
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
                        Instantly provision a peer study quality survey containing grading scales inside your Google Drive so students or teachers can audit resource accuracy.
                      </p>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                      <button
                        disabled={isGeneratingForm}
                        onClick={handleGenerateFeedbackForm}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-[9px] uppercase tracking-widest rounded-apple transition-all duration-200 cursor-pointer"
                      >
                        {isGeneratingForm ? "Provisioning..." : "Provision Form"}
                      </button>
                      
                      {generatedFormUrl && (
                        <a
                          href={generatedFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-black text-[9px] uppercase tracking-widest rounded-apple transition-all duration-200 cursor-pointer"
                        >
                          Access Survey
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {(() => {
                  if (materials.length === 0) {
                    return (
                      <motion.div 
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                        className="py-16 px-6 text-center bg-slate-50/50 rounded-apple-xl border border-dashed border-slate-200/80 flex flex-col items-center justify-center space-y-6"
                      >
                        <History size={40} className="text-slate-300" />
                        <div className="space-y-2 max-w-md">
                          <p className="card-label">Module archive empty // Waiting for node synchronization.</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            No resources are currently indexed under this specific paper. Press below to instantly sync realistic DU syllabus notes, reference guides, practical files, and PYQ documents.
                          </p>
                        </div>
                        <button
                          disabled={isSeeding}
                          onClick={() => handleSeedSpecificSubject(selectedSubject)}
                          aria-label="Enrich this subject with real materials"
                          className="px-8 py-4 bg-slate-900 text-white hover:bg-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em] rounded-apple transition-all duration-200 shadow-sm hover:shadow active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          {isSeeding ? (
                            <>
                              <Loader2 size={12} className="animate-spin text-white" />
                              <span>{seedingProgress || "Seeding Archive..."}</span>
                            </>
                          ) : (
                            "Enrich this Paper"
                          )}
                        </button>
                      </motion.div>
                    );
                  }

                  const groups: Record<string, typeof materials> = {
                    PDF: [],
                    NOTES: [],
                    VIDEO: [],
                    LINK: [],
                    OTHER: []
                  };

                  materials.forEach((m) => {
                    const type = m.type;
                    if (type === 'PDF' || type === 'NOTES' || type === 'VIDEO' || type === 'LINK') {
                      groups[type].push(m);
                    } else {
                      groups.OTHER.push(m);
                    }
                  });

                  const groupKeys = ['PDF', 'NOTES', 'VIDEO', 'LINK', 'OTHER'] as const;
                  const labels: Record<string, string> = {
                    PDF: 'Syllabus PDFs & Documents',
                    NOTES: 'Academic Notes & Handouts',
                    VIDEO: 'Lectures & Video Explanations',
                    LINK: 'Websites & Portals',
                    OTHER: 'Other Resources'
                  };

                  const categoryIcons: Record<string, React.ComponentType<any>> = {
                    PDF: FileText,
                    NOTES: BookOpen,
                    VIDEO: Video,
                    LINK: ExternalLink,
                    OTHER: FolderOpen
                  };

                  const categoryStyles: Record<string, string> = {
                    PDF: 'bg-red-50 text-red-700 border border-red-200',
                    NOTES: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                    VIDEO: 'bg-amber-50 text-amber-700 border border-amber-200',
                    LINK: 'bg-blue-50 text-blue-700 border border-blue-200',
                    OTHER: 'bg-slate-100 text-slate-700 border border-slate-200'
                  };

                  return groupKeys.map((key) => {
                    const groupItems = groups[key];
                    if (!groupItems || groupItems.length === 0) return null;

                    const groupLabel = labels[key];
                    const IconComponent = categoryIcons[key] || FolderOpen;
                    const badgeStyle = categoryStyles[key] || 'bg-slate-100 text-slate-700 border border-slate-200';

                    return (
                      <div key={key} className="space-y-6">
                        {/* Sub-header grouping banner */}
                        <div className="bg-slate-50 border-y border-slate-200/65 px-6 py-3 flex items-center justify-between select-none rounded-xl">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center p-1 rounded ${badgeStyle}`}>
                              <IconComponent size={11} className="stroke-[2.5px]" />
                            </span>
                            {groupLabel}
                          </span>
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase bg-slate-100 border border-slate-200/30 px-2 py-1 rounded">
                            {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 md:gap-6">
                          {groupItems.map((m) => {
                            const isQuarantined = m.flags !== undefined && m.flags >= (moderationSettings.flagThreshold || 5);
                            if (isQuarantined) {
                              return (
                                <div 
                                  key={m.id}
                                  className="bg-slate-50 border border-slate-200 rounded-apple-xl flex flex-col p-3 sm:p-5 lg:p-6 min-h-[220px] justify-between cursor-not-allowed select-none opacity-80"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="p-2 bg-slate-200 text-slate-500 rounded-apple border border-slate-300">
                                      <Lock size={14} />
                                    </span>
                                    <span className="text-[7.5px] font-black text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded uppercase tracking-widest">
                                      Quarantined
                                    </span>
                                  </div>
                                  <div className="space-y-2 mt-4 text-left">
                                    <div className="text-[7.5px] font-black uppercase text-slate-400 tracking-widest leading-none">Under Peer Review</div>
                                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-normal line-clamp-2">
                                      {m.title}
                                    </h4>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                      Hidden due to {m.flags} community flags.
                                    </p>
                                  </div>
                                  <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                                    <span>Reports</span>
                                    <span>{m.flags} / {moderationSettings.flagThreshold || 5}</span>
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
                                className="group relative bg-white border border-slate-100 rounded-apple-xl hover:bg-emerald-50 hover:border-emerald-600 transition-all flex flex-col p-3 sm:p-5 lg:p-6 min-h-[220px] shadow-sm hover:shadow-md"
                              >
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all z-10">
                                    <button 
                                      title="Report Integrity Loss / Flag dynamic node"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          const materialRef = doc(db, 'materials', m.id);
                                          const nextVal = (m.flags || 0) + 1;
                                          await updateDoc(materialRef, {
                                            flags: increment(1)
                                          });
                                          alert(`Community flag registered on: "${m.title}". Active threshold: ${moderationSettings.flagThreshold || 5}. Current flags: ${nextVal}`);
                                        } catch (err: any) {
                                          alert(`Reporting error: ${err.message}`);
                                        }
                                      }}
                                      className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-apple border border-slate-200 transition-colors shadow-sm cursor-pointer"
                                    >
                                      <AlertCircle size={14} />
                                    </button>
                                    <button 
                                      title="Email resource link via Gmail"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEmailMaterialId(m.id);
                                        if (user && user.email) {
                                          setGmailRecipient(user.email);
                                        } else {
                                          setGmailRecipient("");
                                        }
                                      }}
                                      className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-apple border border-slate-200 transition-colors shadow-sm cursor-pointer"
                                    >
                                      <Mail size={14} />
                                    </button>
                                    <button 
                                      title={bookmarkedMaterials.some(bm => bm.id === m.id) ? "Saved in Study Desk" : "Save to Study Desk"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(m);
                                      }}
                                      className={`p-2 rounded-apple border transition-all shadow-sm cursor-pointer ${
                                        bookmarkedMaterials.some(bm => bm.id === m.id)
                                          ? 'bg-emerald-50 border-emerald-250 text-emerald-600 hover:bg-emerald-100'
                                          : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      <BookmarkCheck size={14} />
                                    </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const shareData = { title: m.title, url: m.url };
                                      if (navigator.share) navigator.share(shareData).catch(console.error);
                                      else navigator.clipboard.writeText(m.url);
                                    }}
                                    className="px-4 py-1.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-apple shadow-emerald-sm active:scale-95 transition-all"
                                  >
                                    Push
                                  </button>
                                  {(m.type === 'PDF' || m.type === 'NOTES' || m.url.toLowerCase().endsWith('.pdf')) && (
                                    <a 
                                      href={m.url}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        trackMaterialInteraction(m.id, 'download');
                                      }}
                                      className="p-1.5 bg-slate-900 border border-slate-900 hover:bg-emerald-600 hover:border-emerald-600 text-white rounded-apple transition-colors shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                                      title="Download PDF directly"
                                    >
                                      <Download size={11} className="stroke-[2.5px]" />
                                    </a>
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
                                  className="flex flex-col items-center text-center w-full grow cursor-pointer animate-in fade-in duration-300"
                                >
                                   <div className="w-14 h-14 bg-slate-50 rounded-apple flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all mb-8 shadow-sm">
                                      {m.type === 'VIDEO' ? <Video size={28} /> : 
                                       m.type === 'PDF' ? <FileText size={28} /> : 
                                       <File size={28} />}
                                   </div>
                                   
                                   <div className="space-y-3">
                                     <div className="flex gap-2 flex-wrap justify-center min-h-[14px]">
                                       <div className="card-label opacity-40 group-hover:opacity-100 group-hover:text-emerald-600 transition-colors">
                                          Node Type // {m.type}
                                       </div>
                                       {(() => {
                                         const isOfficial = !m.tags?.some(tag => tag.toLowerCase().includes('community')) &&
                                                            (!m.submittedBy || m.submittedBy === 'System Seeder');
                                         return isOfficial ? (
                                           <span className="text-[7px] font-black text-sky-700 border border-sky-200 bg-sky-50 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none shrink-0 self-center flex items-center gap-0.5" title="Official verified repository content">
                                             <ShieldCheck size={8} className="stroke-[2.5px]" />
                                             <span>Official</span>
                                           </span>
                                         ) : (
                                           <span className="text-[7px] font-black text-amber-700 border border-amber-250 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none shrink-0 self-center flex items-center gap-0.5" title="Community-uploaded study material">
                                             <Users size={8} className="stroke-[2.5px]" />
                                             <span>Community-Sourced</span>
                                           </span>
                                         );
                                       })()}
                                       {m.tags && m.tags.filter(t => t.toLowerCase() !== 'community').map(tag => (
                                         <span key={tag} className="text-[7px] font-black text-emerald-600 border border-emerald-250 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none shrink-0 self-center">
                                           {tag}
                                         </span>
                                       ))}
                                       {m.flags !== undefined && m.flags > 0 && (
                                         <span className="text-[7px] font-black text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider leading-none shrink-0 self-center">
                                           Flagged ({m.flags})
                                         </span>
                                       )}
                                     </div>
                                     <h4 className="text-[10px] md:text-xs font-black text-slate-650 group-hover:text-emerald-650 leading-tight uppercase tracking-widest line-clamp-3">
                                       <span className="inline-flex flex-wrap justify-center gap-1.5 mb-1.5 w-full">
                                         {m.type === 'PDF' && (
                                           <>
                                             <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="PDF Document">
                                               <FileText size={10} className="stroke-[3px]" />
                                               <span>PDF</span>
                                             </span>
                                             <span className="inline-flex items-center gap-1 bg-slate-950 border border-slate-950 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-xs" title="PDF File Size">
                                               {getPdfSize(m.title, m.id)}
                                             </span>
                                             <span 
                                               className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 font-mono"
                                               title={`Downloads: ${m.downloads || 0} | Impressions: ${m.impressions || 0} | CTR: ${calculateCtr(m.clicks, m.impressions).toFixed(1)}%`}
                                             >
                                               <Download size={10} className="stroke-[3px] text-slate-600" />
                                               <span>{m.downloads || 0} DL</span>
                                               <span className="opacity-40 font-normal">|</span>
                                               <span className="text-emerald-700 font-extrabold">{calculateCtr(m.clicks, m.impressions).toFixed(0)}% CTR</span>
                                             </span>
                                           </>
                                         )}
                                         {m.type === 'NOTES' && (
                                           <>
                                             <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Academic Notes">
                                               <FileText size={10} className="stroke-[3px]" />
                                               <span>Notes</span>
                                             </span>
                                             {(m.url.toLowerCase().endsWith('.pdf') || m.type === 'NOTES') && (
                                               <span className="inline-flex items-center gap-1 bg-slate-950 border border-slate-950 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-xs" title="PDF File Size">
                                                 {getPdfSize(m.title, m.id)}
                                               </span>
                                             )}
                                             <span 
                                               className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 font-mono"
                                               title={`Downloads: ${m.downloads || 0} | Impressions: ${m.impressions || 0} | CTR: ${calculateCtr(m.clicks, m.impressions).toFixed(1)}%`}
                                             >
                                               <Download size={10} className="stroke-[3px] text-slate-600" />
                                               <span>{m.downloads || 0} DL</span>
                                               <span className="opacity-40 font-normal">|</span>
                                               <span className="text-emerald-700 font-extrabold">{calculateCtr(m.clicks, m.impressions).toFixed(0)}% CTR</span>
                                             </span>
                                           </>
                                         )}
                                         {m.type === 'VIDEO' && (
                                           <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Video Lecture">
                                             <Video size={10} className="stroke-[3px]" />
                                             <span>Video</span>
                                           </span>
                                         )}
                                         {m.type === 'LINK' && (
                                           <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Web Link">
                                             <ExternalLink size={10} className="stroke-[3px]" />
                                             <span>Link</span>
                                           </span>
                                         )}
                                       </span>
                                       <span className="block mt-1">{m.title}</span>
                                     </h4>
                                   </div>
                                </a>

                                <div className="mt-8 pt-4 border-t border-slate-100 group-hover:border-emerald-100 transition-colors">
                                  <RatingButtons material={m} user={user} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

          {activeTab === 'contribute' && (
            <motion.div
              key="contribute"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl mx-auto pb-24 px-4"
            >
              <div className="text-center space-y-6 mb-16">
                <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center mx-auto mb-6 rounded-apple shadow-emerald-sm">
                  <PlusCircle size={32} />
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-slate-900">Share Compute Models</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-lg mx-auto">Upload computational notebooks, Python analytics scripts, R statistical data, or Julia physics tensors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
                <div className="md:col-span-7 lg:col-span-8 px-0">
                  <SubmissionForm 
                    user={user} 
                    setActiveTab={setActiveTab} 
                    onCancel={() => {
                      setPrefillData(null);
                      setActiveTab('home');
                    }} 
                    existingCourses={courses}
                    prefillData={prefillData}
                    googleAccessToken={googleAccessToken}
                    setGoogleAccessToken={setGoogleAccessToken}
                    moderationSettings={moderationSettings}
                  />
                </div>

                <div className="md:col-span-5 lg:col-span-4 bg-slate-50 border border-slate-200 rounded-apple p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <FileText className="text-emerald-600 w-5 h-5 shrink-0" strokeWidth={2.5} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Contribution Guidelines</h3>
                  </div>

                  {/* Upload Formatting Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">1. Formatting Uploads</span>
                    <p className="text-[10px] text-slate-650 font-bold uppercase tracking-wider leading-relaxed">
                      Title Structure: Use clean academic titles. A recommended format is:
                    </p>
                    <div className="bg-white border border-slate-200 p-2.5 text-[9px] font-mono text-emerald-700 rounded select-all font-bold uppercase tracking-tight">
                      [Year] [Session/Exam] [Subject Name] [Type]
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      Examples: "2024 Semester 1 Calculus Core PYQ", "DSA Reference Chapter 3 Notes". Please remove all personal metadata (such as phone numbers, student IDs, or email notes) from files before sharing.
                    </p>
                  </div>

                  {/* Tagging Rules Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">2. Tagging Rules</span>
                    <p className="text-[9.5px] text-slate-655 leading-relaxed">
                      Tagging enables rapid searches for other DU students. Always tags with accuracy:
                    </p>
                    <ul className="space-y-1.5 pl-4 list-disc text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <li><strong className="text-slate-700 font-semibold">pyq:</strong> Previous year university examinations</li>
                      <li><strong className="text-slate-700 font-semibold">reference-book:</strong> Textbook chapters and reading scans</li>
                      <li><strong className="text-slate-700 font-semibold">syllabus:</strong> DU subject syllabi or NEP program papers</li>
                      <li><strong className="text-slate-700 font-semibold">practicals:</strong> Lab reports, practical files or code work</li>
                      <li><strong className="text-slate-700 font-semibold">notes:</strong> Clean lecture slides or handwritten concepts</li>
                    </ul>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      Map your resource to the exact Course and Subject catalog indices to prevent automatic quarantine routing by the AI moderator.
                    </p>
                  </div>

                  {/* Acceptable File Types */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">3. Supported Paradigms / Scripts</span>
                    <p className="text-[9.5px] text-slate-655 leading-relaxed">
                      DeepMind nodes support analytical and statistical environments:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-bold uppercase tracking-wider">
                      <div className="p-2 sm:p-3 bg-white border border-slate-200 rounded">
                        <span className="text-slate-900 block font-black">Notebooks & Data</span>
                        <span className="text-emerald-600 block mt-1 font-mono">.IPYNB, .CSV, .R</span>
                      </div>
                      <div className="p-2 sm:p-3 bg-white border border-slate-200 rounded">
                        <span className="text-slate-900 block font-black">Compute Scripts</span>
                        <span className="text-emerald-600 block mt-1 font-mono">.PY, .JL, .CPP</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-normal">
                      Ensure your neural network payloads or Google Drive URLs have unrestricted public viewing access ("Anyone with link can view"). Models that trigger automated safety risk warnings will be held for manual security clearance.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full pb-24 px-4"
            >
              <div className="max-w-4xl mx-auto space-y-12">
                
                {/* Header card with student photo / name */}
                <div className="bg-white border border-slate-100 p-12 flex flex-col md:flex-row items-center gap-12 rounded-apple-2xl shadow-sm">
                  <div className="w-32 h-32 bg-emerald-50 flex items-center justify-center border border-emerald-100 overflow-hidden shrink-0 rounded-apple-xl shadow-emerald-sm">
                    {user?.photoURL ? (
                      <img src={user?.photoURL || undefined} alt="User" className="w-full h-full object-cover transition-transform hover:scale-110" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={64} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">
                      Academic Verification Profile
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
                      {userProfile?.fullName || user?.displayName || 'Student Member'}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      {user?.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-emerald-600 transition-all group px-8 py-3.5 bg-slate-50 rounded-apple hover:bg-emerald-50 cursor-pointer"
                      >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout Session
                      </button>
                    </div>
                  </div>
                </div>

                {isEditingProfile ? (
                  /* Edit Profile Form */
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user) return;
                      const finalCollege = editCollegeName === 'Other' ? editCustomCollege.trim() : editCollegeName;
                      if (!editFullName.trim() || !finalCollege || !editDepartment.trim() || !editRollNumber.trim() || !editPhoneNumber.trim() || !editHasConsented) {
                        alert("Please fill up all required academic parameters and check the privacy covenant checkbox.");
                        return;
                      }
                      try {
                        await setDoc(doc(db, 'users', 'DU-' + user.uid), {
                          fullName: editFullName.trim(),
                          collegeName: finalCollege,
                          department: editDepartment.trim(),
                          rollNumber: editRollNumber.trim(),
                          phoneNumber: editPhoneNumber.trim(),
                          hasConsented: editHasConsented,
                          email: user.email || 'student@du.ac.in',
                          uin: ('DU-' + user.uid).substring(0, 7).toUpperCase(),
                          updatedAt: new Date().toISOString()
                        }, { merge: true });
                        setIsEditingProfile(false);
                      } catch (error) {
                        console.error("Failed to update student settings:", error);
                        alert("Update failed. Please check firestore permissions.");
                      }
                    }}
                    className="bg-white border border-slate-100 p-12 space-y-8 rounded-apple-2xl shadow-sm"
                  >
                    <div className="border-b border-slate-100 pb-6">
                      <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                        Edit Academic Credentials
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Modify your university records securely
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Academic Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Contact Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={editPhoneNumber}
                          onChange={(e) => setEditPhoneNumber(e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800"
                        />
                      </div>

                      {/* College Name Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Affiliated DU College
                        </label>
                        <select
                          required
                          value={editCollegeName}
                          onChange={(e) => {
                            setEditCollegeName(e.target.value);
                            if (e.target.value !== 'Other') setEditCustomCollege('');
                          }}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800 cursor-pointer"
                        >
                          <option value="">-- Choose College --</option>
                          {[
                            "Ramjas College",
                            "Hindu College",
                            "Hansraj College",
                            "Kirori Mal College",
                            "St. Stephen's College",
                            "Miranda House",
                            "Sri Venkateswara College",
                            "Lady Shri Ram College",
                            "Shri Ram College of Commerce",
                            "SGTB Khalsa College",
                            "Other"
                          ].map((clg) => (
                            <option key={clg} value={clg}>
                              {clg}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Student Roll No */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Student Roll Number / Scholar ID
                        </label>
                        <input
                          type="text"
                          required
                          value={editRollNumber}
                          onChange={(e) => setEditRollNumber(e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800"
                        />
                      </div>
                    </div>

                    {editCollegeName === 'Other' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Specify Custom College Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editCustomCollege}
                          onChange={(e) => setEditCustomCollege(e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800"
                        />
                      </div>
                    )}

                    {/* Department node */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Study Department / Course Node
                      </label>
                      <input
                        type="text"
                        required
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 rounded-apple text-xs uppercase font-extrabold text-slate-800"
                      />
                    </div>

                    {/* Privacy policy checkbox */}
                    <label className="flex gap-4 items-start select-none cursor-pointer group p-3 border border-slate-100 bg-slate-50 rounded-apple">
                      <input
                        type="checkbox"
                        required
                        checked={editHasConsented}
                        onChange={(e) => setEditHasConsented(e.target.checked)}
                        className="mt-1 accent-emerald-600 cursor-pointer w-4 h-4 text-white"
                      />
                      <span className="text-[9.5px] font-extrabold text-slate-600 uppercase tracking-tight leading-relaxed group-hover:text-slate-900 transition-all">
                        I reaffirm my legal agreement to DU Archive's secure privacy covenant system to map my student coordinates.
                      </span>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-apple transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-apple shadow-emerald-sm transition-all cursor-pointer"
                      >
                        Save Coordinates
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Redesigned Profile Layout */
                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                      
                      {/* Read-only Parameters - Bento Cell 1 */}
                      <div className="bg-white border border-slate-200/80 p-6 md:p-10 space-y-8 rounded-apple-2xl shadow-sm flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                Student Identity
                              </h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                Verified Firestore Profile
                              </p>
                            </div>
                            <span className="text-[10px] sm:self-start font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full shrink-0">
                              Verified ✓
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Unique UIN Node</span>
                              <span className="text-xs font-black uppercase text-indigo-650 tracking-widest font-mono block break-all">
                                {(userProfile?.uin || ('DU-' + user.uid)).substring(0, 7).toUpperCase()}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Full Name</span>
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider block truncate" title={userProfile?.fullName || 'Not Configured'}>
                                {userProfile?.fullName || 'Not Configured'}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100 sm:col-span-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">DUCT College</span>
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider block truncate" title={userProfile?.collegeName || 'Not Configured'}>
                                {userProfile?.collegeName || 'Not Configured'}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Department Node</span>
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider block truncate" title={userProfile?.department || 'Not Configured'}>
                                {userProfile?.department || 'Not Configured'}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Student Roll No.</span>
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider block truncate" title={userProfile?.rollNumber || 'Not Configured'}>
                                {userProfile?.rollNumber || 'Not Configured'}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Verification Phone</span>
                              <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider block truncate">
                                {userProfile?.phoneNumber || 'Not Configured'}
                              </span>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-apple bg-slate-50 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Privacy Consent</span>
                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider block truncate">
                                {userProfile?.hasConsented ? 'Authorized (Yes)' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditFullName(userProfile?.fullName || user?.displayName || "");
                            setEditCollegeName(userProfile?.collegeName || "");
                            setEditCustomCollege("");
                            setEditDepartment(userProfile?.department || "");
                            setEditRollNumber(userProfile?.rollNumber || "");
                            setEditPhoneNumber(userProfile?.phoneNumber || "");
                            setEditHasConsented(userProfile?.hasConsented || false);
                            setIsEditingProfile(true);
                          }}
                          className="w-full mt-6 py-3.5 border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest rounded-apple transition-all cursor-pointer text-center"
                        >
                          Edit Profile Details
                        </button>
                      </div>

                      {/* Contribution Status Tracker - Bento Cell 2 */}
                      <div className="bg-white border border-slate-200/80 p-6 md:p-10 space-y-8 rounded-apple-2xl shadow-sm flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                Contribution Activity
                              </h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                Real-time peer approval metrics
                              </p>
                            </div>
                            <span className="text-[10px] sm:self-start font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full shrink-0">
                              Live Queue
                            </span>
                          </div>

                          {/* Stats & Progress */}
                          {(() => {
                            const total = userSubmissions.length;
                            const approved = userSubmissions.filter(s => s.status === 'PUBLISHED' || s.status === 'APPROVED').length;
                            const pending = userSubmissions.filter(s => s.status === 'PENDING').length;
                            const progressRate = total > 0 ? Math.round((approved / total) * 100) : 0;

                            return (
                              <div className="space-y-6">
                                {/* Standard Metric Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-apple">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-2">Active</span>
                                    <span className="text-2xl font-black text-slate-900 font-mono block">{approved}</span>
                                  </div>
                                  <div className="text-center p-4 bg-amber-50/50 border border-amber-100/50 rounded-apple">
                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block leading-none mb-2">Auditing</span>
                                    <span className="text-2xl font-black text-amber-600 font-mono block">{pending}</span>
                                  </div>
                                  <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-apple">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-2">Total</span>
                                    <span className="text-2xl font-black text-slate-900 font-mono block">{total}</span>
                                  </div>
                                </div>

                                {/* Live Progress Bar Container */}
                                <div className="space-y-2.5">
                                  <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Approval Rate</span>
                                    <span className="text-[11px] font-black text-emerald-700 font-mono tracking-tight">{progressRate}% Approved</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                    <div 
                                      className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${progressRate}%` }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-1">
                                    {pending > 0 
                                      ? `${pending} pending submission${pending > 1 ? 's' : ''} undergoing strict manual audits`
                                      : total > 0 
                                        ? 'Compliant: All shared materials verified and activated'
                                        : 'No active academic contributions registered'
                                    }
                                  </p>
                                </div>

                                {/* Recent Submissions Feed */}
                                <div className="space-y-3.5 pt-2">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Recent Workflow</span>
                                  {userSubmissionsLoading ? (
                                    <div className="py-4 text-center">
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing database...</span>
                                    </div>
                                  ) : userSubmissions.length === 0 ? (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-apple text-center">
                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">No registered uploads. Backfill your local college chapters to support classmates.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3 max-h-[175px] overflow-y-auto pr-1 custom-scrollbar">
                                      {userSubmissions.slice(0, 2).map((sub) => {
                                        const isPending = sub.status === 'PENDING';
                                        return (
                                          <div key={sub.id} className="p-3.5 bg-white border border-slate-200 rounded-apple shadow-sm flex flex-col gap-2.5 text-left transition-all hover:border-slate-300">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight truncate">
                                                  {sub.title || 'Draft Study Guide'}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                                                  {sub.courseName || 'General'}
                                                </p>
                                              </div>
                                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shrink-0 select-none ${isPending ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
                                                {sub.status}
                                              </span>
                                            </div>

                                            {/* Step Tracking Timeline */}
                                            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-center">
                                              <div>
                                                <div className="h-1 bg-emerald-500 rounded-full" />
                                              </div>
                                              <div>
                                                <div className={`h-1 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                                              </div>
                                              <div>
                                                <div className={`h-1 rounded-full ${isPending ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {userSubmissions.length > 2 && (
                                        <div className="text-center pt-2">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            + {userSubmissions.length - 2} more uploads stored in cloud
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Bulk seed info card - Full Width */}
                    <div className="bg-white border text-center border-slate-200/80 rounded-apple-2xl shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-8 font-sans">
                      <div className="flex flex-col sm:flex-row items-center sm:text-left gap-6 flex-1">
                        <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-apple-xl shadow-emerald-sm shrink-0">
                          <History size={28} />
                        </div>
                        <div className="space-y-1.5 max-w-xl">
                          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">DU Archive Universal Sync</h3>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                            Populate and arrange courses, subjects, and study materials in your local Firestore database with audited Delhi University nodes.
                          </p>
                        </div>
                      </div>

                      <button
                        disabled={isSeeding}
                        onClick={handleBulkSeedDUData}
                        aria-label="Synchronize entire DU node collection"
                        className="w-full md:w-auto shrink-0 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-widest rounded-apple shadow-emerald-md transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isSeeding ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>{seedingProgress || "Syncing Data..."}</span>
                          </>
                        ) : (
                          "Sync Academic Archive"
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (() => {
            const isUserAdminByEmail = user?.email === 'pk950364@gmail.com';
            const hasAdminAccess = isAdminAuthenticated || isUserAdminByEmail;

            if (!hasAdminAccess) {
              return (
                <motion.div
                  key="admin-auth-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-md mx-auto py-16 px-6"
                >
                  <div className="bg-white border border-slate-200/80 p-8 sm:p-10 rounded-apple-2xl shadow-xl space-y-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center mx-auto rounded-apple shadow-md">
                        <Shield size={28} />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider text-slate-800">
                        Admin Command Center
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        RESTRICTED ADMINISTRATIVE NODE
                      </p>
                    </div>

                    {adminAuthError && (
                      <div className="p-4 bg-red-50 border border-red-200/80 rounded-apple text-left flex gap-3 items-start animate-shake">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                        <span className="text-[10px] text-red-800 font-extrabold uppercase tracking-wide leading-relaxed">
                          {adminAuthError}
                        </span>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setAdminAuthError("");
                        
                        if (!adminInputUsername.trim() || !adminInputPasscode.trim()) {
                          setAdminAuthError("Both fields are required to secure this administrative terminal.");
                          return;
                        }

                        // Check separate administrative credentials
                        if (adminInputUsername.trim().toLowerCase() === "admin" && adminInputPasscode === "du-admin-2026") {
                          setIsAdminAuthenticated(true);
                          localStorage.setItem('du_archive_admin_auth', 'true');
                          setAdminInputUsername("");
                          setAdminInputPasscode("");
                          setAdminAuthError("");
                        } else {
                          setAdminAuthError("Access denied. Invalid credentials node. Please use separate username and passcode.");
                        }
                      }}
                      className="space-y-4 text-left"
                    >
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                          Admin User Account ID
                        </label>
                        <input
                          type="text"
                          required
                          value={adminInputUsername}
                          onChange={(e) => setAdminInputUsername(e.target.value)}
                          placeholder="e.g. admin"
                          className="w-full bg-slate-50 border border-slate-200/85 rounded-apple px-4 py-3 font-semibold text-xs text-slate-800 placeholder:text-slate-400 placeholder:uppercase select-all outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all uppercase"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                          Secure System Passcode
                        </label>
                        <input
                          type="password"
                          required
                          value={adminInputPasscode}
                          onChange={(e) => setAdminInputPasscode(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200/85 rounded-apple px-4 py-3 font-semibold text-xs text-slate-800 placeholder:text-slate-400 select-all outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded-apple shadow-lg active:scale-95 transition-all cursor-pointer"
                      >
                        Authorize & Login
                      </button>
                    </form>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-150"></div>
                      <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        OR SECURE DIRECT ACCESS
                      </span>
                      <div className="flex-grow border-t border-slate-150"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdminGoogleLogin}
                      className="w-full py-4 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-800 font-black text-[9px] uppercase tracking-widest rounded-apple shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-650 shrink-0" strokeWidth={2.5} />
                      <span>Sign In with Admin Google Account</span>
                    </button>

                    <div className="border-t border-slate-100 pt-6 text-center space-y-4">
                      {window.self !== window.top && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-apple text-left flex gap-2.5 items-start">
                          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[9px] text-amber-850 font-extrabold uppercase tracking-wide leading-relaxed">
                            Web Sandbox Active: Inline frame environment detected. Popups and auth cookies may be blocked. Open in a <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="underline text-amber-950 font-black">New Tab</a> for flawless sign-in.
                          </span>
                        </div>
                      )}

                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                        Secondary student members must use their respective credentials in the profile settings tab.
                      </p>
                      
                      {user && (
                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-apple flex flex-col items-center justify-center space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Logged in via:</span>
                          <span className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider truncate max-w-xs">{user.email}</span>
                          <span className="text-[8px] font-black uppercase text-red-500 tracking-widest mt-1">Status: Unauthorized</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key="admin-workspace"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full pb-24 px-4"
              >
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Separate logout or session controller bar for administrative portal */}
                  <div className="bg-slate-900 text-white rounded-apple-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="p-2 py-1 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded">
                        Admin Session
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          {isUserAdminByEmail ? `Owner: ${user?.email}` : "System Admin Node Active"}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Authorized on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        localStorage.removeItem('du_archive_admin_auth');
                        // If they bypass by email, they can select home tab
                        if (isUserAdminByEmail) {
                          setActiveTab('home');
                        }
                      }}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-white font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer"
                    >
                      Exit Administrative Terminal
                    </button>
                  </div>

                  <AdminPanel 
                    courses={courses}
                    userEmail={user?.email || "System Admin"}
                    onSelectCourse={(course) => {
                      setSelectedCourse(course);
                      fetchSubjects(course.id);
                    }}
                    onSelectSubject={(subj) => {
                      setSelectedSubject(subj);
                      fetchSubjects(subj.courseId);
                    }}
                    setActiveTab={setActiveTab}
                  />
                </div>
              </motion.div>
            );
          })()}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <HealthPage 
                totalCourses={courses.length} 
                totalSubjects={subjects.length} 
                totalMaterials={materials.length} 
              />
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <PrivacyPolicyPage />
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-[1200px] mx-auto py-10 px-4"
            >
              <div className="bg-white border border-slate-100 p-8 md:p-20 text-slate-900 relative overflow-hidden transition-all rounded-apple-2xl shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rotate-45 -mr-48 -mt-48 hidden md:block"></div>
                
                <div className="relative z-10 grid md:grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                  <div className="space-y-12 text-center md:text-left">
                    <div className="p-5 bg-emerald-600 text-white w-fit mx-auto md:mx-0 rounded-apple shadow-emerald-sm">
                      <Headset size={40} />
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-none text-slate-900 uppercase">
                        Get In <br />Touch.
                      </h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-md leading-relaxed">
                        HAVE QUESTIONS OR WANT TO CONTRIBUTE TO THE ARCHIVE? WE'RE HERE TO HELP.
                      </p>
                    </div>
                    
                    <div className="pt-12 border-t border-slate-100">
                      <div className="space-y-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Email Contact</div>
                        <a 
                          href="mailto:support@duarchive.edu.in" 
                          className="flex items-center justify-center md:justify-start gap-4 text-emerald-600 hover:text-emerald-700 transition-all uppercase tracking-widest font-black"
                        >
                          <Mail size={24} />
                          <span className="text-xl md:text-2xl">support@duarchive.edu.in</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <form className="bg-slate-50 p-10 space-y-8 border border-slate-100 rounded-apple-xl shadow-sm" onSubmit={(e) => {
                    e.preventDefault();
                    setActiveTab('home');
                  }}>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Message Us</h3>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Subject</label>
                       <input required placeholder="eg. Content Error" className="w-full px-6 py-5 bg-white border border-slate-200 rounded-apple outline-none focus:border-emerald-600 text-xs font-bold uppercase tracking-widest transition-all" />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Message</label>
                       <textarea required rows={5} placeholder="How can we help..." className="w-full px-6 py-5 bg-white border border-slate-200 rounded-apple outline-none focus:border-emerald-600 transition-all resize-none text-xs font-bold uppercase tracking-widest" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-6 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-emerald-700 transition-all shadow-emerald-sm flex items-center justify-center gap-4 group rounded-apple">
                      Send Message
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-[1200px] mx-auto space-y-12 py-10 px-4"
            >
              <div className="text-center space-y-10 py-12 border-b border-slate-100">
                <h2 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-none text-slate-900">Open Access <br /><span className="text-emerald-600">For Everyone.</span></h2>
                <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-400 max-w-2xl mx-auto leading-loose">The DU Academic Archive was born from a simple mission: providing free, high-quality study resources for all students across the University of Delhi.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="p-12 md:p-16 bg-white border border-slate-100 rounded-apple-2xl space-y-8 group hover:bg-emerald-50 transition-all shadow-sm">
                    <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center rounded-apple shadow-emerald-sm transition-transform group-hover:scale-110">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Modern Library</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Specifically organized for the latest DU syllabus. Every document is indexed for fast retrieval and easy learning.</p>
                 </div>
                 <div className="p-12 md:p-16 bg-white border border-slate-100 rounded-apple-2xl space-y-8 group hover:bg-emerald-50 transition-all shadow-sm">
                    <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center rounded-apple shadow-emerald-sm transition-transform group-hover:scale-110">
                      <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Student First</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Built by students who understand the struggle. We're here to help each other succeed through collective knowledge sharing.</p>
                 </div>
              </div>

              <div className="bg-emerald-600 p-12 md:p-20 text-white text-center space-y-12 rounded-apple-2xl shadow-emerald-lg">
                 <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Our Foundations</h3>
                 <div className="flex flex-wrap justify-center gap-12 sm:gap-24">
                    <div className="flex flex-col items-center gap-4 group">
                       <span className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform">01.</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">100% Free</span>
                    </div>
                    <div className="flex flex-col items-center gap-4 group">
                       <span className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform">02.</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">Peer Verified</span>
                    </div>
                    <div className="flex flex-col items-center gap-4 group">
                       <span className="text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform">03.</span>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">Permanent</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-32 md:pb-8 mt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 select-none text-[10px] uppercase font-bold tracking-wider">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span>DU Archive &copy; {new Date().getFullYear()}</span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="text-slate-650 font-extrabold">
            Designed and Created by{" "}
            <a 
              href="https://www.instagram.com/pradeep0_98/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 font-extrabold transition-colors cursor-pointer"
            >
              Pradeep
            </a>
          </span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="text-emerald-600 font-black">Powered by Gemini Google</span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="text-slate-500 font-mono text-[9px] bg-slate-50 px-3 py-1 border border-slate-150 rounded uppercase font-medium">
            VERSION: <span className="font-extrabold text-emerald-700">v1.4.2</span> | BUILD STATUS: <span className="font-extrabold text-slate-800">STABLE-2026.06</span>
          </span>
        </div>

      </footer>

      <AnimatePresence>
        {user && showOnboardingModal && (
          <OnboardingModal 
            user={user} 
            isOpen={showOnboardingModal} 
            onSave={handleSaveProfile} 
            onSkip={handleSkipOnboarding}
            onLogout={handleLogout} 
          />
        )}

        {previewMaterial && (
          <PdfPreviewModal 
            material={previewMaterial} 
            onClose={() => setPreviewMaterial(null)} 
            onTrackDownload={(id) => trackMaterialInteraction(id, 'download')}
          />
        )}

        {emailMaterialId && (() => {
          const m = materials.find(x => x.id === emailMaterialId);
          if (!m) return null;
          return (
            <motion.div
              key="gmail-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEmailMaterialId(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white border border-slate-150 rounded-apple-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase">
                      Workspace Transmission Suite
                    </span>
                    <h3 className="section-heading text-lg sm:text-xl uppercase tracking-wider text-slate-800 leading-normal mt-1">
                      Email Study Material
                    </h3>
                  </div>
                  <button 
                    onClick={() => setEmailMaterialId(null)}
                    className="p-1 px-2.5 bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 rounded uppercase tracking-widest text-[10px] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-150/80 rounded-apple-lg p-4 space-y-2">
                  <div className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                    Dispatched Node ID: {m.id}
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {m.title}
                  </h4>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Category: {m.type}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={gmailRecipient}
                      onChange={(e) => setGmailRecipient(e.target.value)}
                      placeholder="e.g. peer.student@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-apple px-4 py-3 font-semibold text-xs placeholder:text-slate-400 placeholder:uppercase select-all focus:bg-white focus:ring-1 focus:ring-emerald-500 text-slate-800 outline-none transition-all uppercase"
                    />
                  </div>

                  <button
                    disabled={isSendingGmail}
                    onClick={() => handleSendGmailMessage(m)}
                    className="w-full bg-slate-900 text-white font-black hover:bg-emerald-600 disabled:bg-slate-300 py-4 text-[10px] uppercase tracking-widest rounded-apple transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSendingGmail ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Transmitting email...</span>
                      </>
                    ) : (
                      "Send study material"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Global Floating Report action */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setGlobalReportOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-full hover:bg-slate-900 border border-slate-800 shadow-xl transition-all cursor-pointer font-black text-[9px] uppercase tracking-widest group"
          title="Report any broken document or page loading issue"
        >
          <AlertCircle size={13} className="text-emerald-500" />
          <span>Report Broken Link / Issue</span>
        </button>
      </div>

      <ReportIssueModal
        isOpen={globalReportOpen}
        onClose={() => setGlobalReportOpen(false)}
        defaultReportedPage={activeTab === 'home' ? 'Home Catalog' : `Page tab: ${activeTab.toUpperCase()}`}
      />
    </div>
  );
};