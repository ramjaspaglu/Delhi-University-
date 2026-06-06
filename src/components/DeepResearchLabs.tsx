import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  Compass, 
  Activity, 
  Lock,
  Atom,
  Binary,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Terminal,
  Cpu,
  Bookmark,
  ChevronRight,
  Sliders,
  Database,
  Radio,
  Server,
  Network,
  RotateCcw,
  GitBranch,
  Monitor
} from 'lucide-react';
import { collection, addDoc, getDocs, limit, query, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Node {
  id: string;
  name: string;
  category: string;
  frequency: string;
  packets: number;
  x: number;
  y: number;
  active: boolean;
  type: 'core' | 'subject' | 'model';
}

interface Connection {
  from: string;
  to: string;
}

export default function DeepResearchLabs({ user }: { user?: any }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessChecked, setAccessChecked] = useState<boolean>(false);

  // 3D Tilt Effect State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 120, damping: 20 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Simulation parameters
  const [queryTopic, setQueryTopic] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [liveBandwidth, setLiveBandwidth] = useState<number>(420);
  const [packetSuccessCount, setPacketSuccessCount] = useState<number>(18920);
  
  // Interactive network configurations
  const [selectedCoreFrequency, setSelectedCoreFrequency] = useState<'8.4GHZ' | '5.2GHZ' | '2.4GHZ'>('8.4GHZ');
  const [payloadMultiplier, setPayloadMultiplier] = useState<number>(1);
  const [activeRoutePath, setActiveRoutePath] = useState<string>('GATEWAY_PRIMARY');
  const [crawlerProtocol, setCrawlerProtocol] = useState<'AUTO_EMBED' | 'DEEP_SCAN' | 'CONCURRENT_HARVEST'>('DEEP_SCAN');

  // Interactive Graph Nodes
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', name: 'SEMANTIC CORE ENGINE', category: 'SYSTEM CENTRAL', frequency: '8.40 GHZ', packets: 4291, x: 50, y: 50, active: true, type: 'core' },
    { id: '2', name: 'NEP COURSE INTEGRATOR', category: 'SYLLABI PARSER', frequency: '5.20 GHZ', packets: 1205, x: 20, y: 25, active: true, type: 'subject' },
    { id: '3', name: 'PREVIOUS YEAR BLUEPRINTS', category: 'DECODING NODE', frequency: '2.40 GHZ', packets: 3410, x: 80, y: 15, active: false, type: 'subject' },
    { id: '4', name: 'CONCURRENT HARVESTER', category: 'WEB SCRAPER', frequency: '5.20 GHZ', packets: 981, x: 15, y: 75, active: false, type: 'model' },
    { id: '5', name: 'COGNITIVE bluePRINT UNIT', category: 'VECTOR STACK', frequency: '8.40 GHZ', packets: 2154, x: 85, y: 70, active: true, type: 'model' },
    { id: '6', name: 'TAXONOMY MAPPING CORNER', category: 'BLUEPRINT HEURISTICS', frequency: '2.40 GHZ', packets: 692, x: 48, y: 88, active: false, type: 'subject' },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '1', to: '4' },
    { from: '1', to: '5' },
    { from: '1', to: '6' },
  ]);

  const toggleNodeActive = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const nextActive = !n.active;
        if (nextActive) {
          // Increase bandwidth temporarily to simulate interaction feedback
          setLiveBandwidth(b => Math.min(999, b + 52));
          setPacketSuccessCount(p => p + 34);
        }
        return { ...n, active: nextActive };
      }
      return n;
    }));
  };

  const handleResetNetwork = () => {
    setNodes(prev => prev.map(n => ({ ...n, active: n.id === '1' })));
    setLiveBandwidth(420);
    setQueryTopic('');
    setSimResult(null);
  };

  const runSimulation = () => {
    if(!queryTopic.trim()) return;
    setIsSimulating(true);
    setSimResult(null);
    
    // Animate custom network activity
    setNodes(prev => prev.map(n => ({...n, active: true, packets: n.packets + Math.floor(Math.random() * 85) + 10})));
    setLiveBandwidth(840);

    setTimeout(() => {
      setIsSimulating(false);
      setSimResult({
        topic: queryTopic,
        nodes: ['Unified Syllabus Stack', 'NEP Criteria Metrics', 'PyTorch Vector Embeddings', 'DU Question Registry Table'],
        insights: `Simulation analysis model mapped successfully. Relational indices identified a 97.2% taxonomy correlation. Generated 4 dynamic blueprint route pipelines using crawler protocol ${crawlerProtocol} running on ${selectedCoreFrequency}.`,
        confidence: 97.2
      });
      // De-activate some nodes, keep central core active
      setNodes(prev => prev.map((n, idx) => ({...n, active: idx % 2 === 0, packets: n.packets + 250})));
      setLiveBandwidth(550);
      setPacketSuccessCount(prev => prev + 124 * payloadMultiplier);
    }, 2500);
  };

  useEffect(() => {
    if (user?.email === 'pk950364@gmail.com') {
      setHasAccess(true);
      setAccessChecked(true);
      return;
    }

    if (!user?.email) {
      setHasAccess(false);
      setAccessChecked(true);
      return;
    }

    const checkAccess = async () => {
      try {
        const q = query(collection(db, 'beta_requests'), where('email', '==', user.email.toLowerCase()), limit(1));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const doc = qs.docs[0].data();
          if (doc.status === 'APPROVED') {
            setHasAccess(true);
          }
        }
      } catch (err) {
        console.error("Access check error", err);
      } finally {
        setAccessChecked(true);
      }
    };
    checkAccess();
  }, [user]);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Periodic network state changes to look beautiful and alive
  useEffect(() => {
    const aliveInterval = setInterval(() => {
      // Tick bandwidth and packets slightly
      setLiveBandwidth(prev => {
        const offset = Math.floor(Math.random() * 11) - 5;
        return Math.max(100, Math.min(990, prev + offset));
      });
      setPacketSuccessCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);

    return () => clearInterval(aliveInterval);
  }, []);

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid institution or academic email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        submittedAt: new Date().toISOString(),
        status: 'PENDING'
      };

      try {
        await addDoc(collection(db, 'beta_requests'), payload);
        setSuccess(true);
        setEmail('');
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, 'beta_requests');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Access pipeline register failed on core nodes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 border border-slate-200/85 p-4 sm:p-8 md:p-12 relative overflow-hidden select-none shadow-xs rounded-3xl h-auto">
      
      {/* Immersive Tech Background Blueprints */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-12 left-12 w-32 h-32 border-l border-t border-slate-250/50 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-32 h-32 border-r border-b border-slate-250/50 rounded-br-3xl pointer-events-none" />

      <div className="relative z-10 space-y-10 max-w-7xl mx-auto">
        
        {/* PREMIUM METRIC STRIP */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-200/60 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-950 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-slate-900">
              <Network size={22} className="text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 block leading-none">
                DELHI UNIVERSITY RESEARCH ENGINE
              </span>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 font-mono">
                DEEPRESEARCH ARCHIVAL LABS // V3
              </h2>
            </div>
          </div>

          {/* Subtly dense grid metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
            <div className="bg-[#fcfdfa] border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-3xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>BANDWIDTH: <strong className="text-slate-950 font-black">{liveBandwidth} KBPS</strong></span>
            </div>
            <div className="bg-[#fcfdfa] border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-3xs">
              <Database size={12} className="text-slate-400" />
              <span>PACKETS ROUTED: <strong className="text-slate-950 font-black">{packetSuccessCount}</strong></span>
            </div>
            <div className="bg-[#fcfdfa] border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-3xs">
              <Radio size={12} className="text-emerald-500 animate-pulse" />
              <span>STATION: <strong className="text-slate-950 font-black">{selectedCoreFrequency}</strong></span>
            </div>
          </div>
        </div>

        {/* TOP COGNITIVE BANNER BRAND */}
        <div className="space-y-4 max-w-4xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/70 border border-slate-200 text-slate-700 text-[8.5px] font-black uppercase tracking-widest rounded-lg">
            <Server size={10} className="text-emerald-600 animate-pulse" />
            <span>CORE SPEC: MULTICAST PARSING PIPELINE</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-slate-950 uppercase leading-[0.95] break-words hyphens-auto">
            DeepResearch <span className="text-slate-400 font-sans font-light capitalize tracking-wide italic">Crawler</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed uppercase font-mono font-bold tracking-tight max-w-3xl">
            Visualize the real-time topological semantic graph. DU previous year exam questions, NEP syllabus structures, and subject indexes are synthesized along early developer whitelists.
          </p>
        </div>

        {/* COGNITIVE HARDWARE GRID SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          
          {/* LEFT INTERACTION FORM CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl space-y-6 shadow-3xs relative">
              
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block leading-none mb-1 font-mono">
                  MATRIX SETTINGS — CONSOLE.V3
                </span>
                <h3 className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                  Tuning Controller
                </h3>
              </div>

              {!accessChecked ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-none h-6 w-6 border-2 border-slate-950 border-t-transparent" />
                </div>
              ) : hasAccess ? (
                <div className="space-y-6">
                  
                  {/* Authorized Shield status bar */}
                  <div className="px-3 py-2 bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-[9.5px] font-mono font-black uppercase tracking-widest rounded-xl flex items-center gap-2 w-full">
                    <Shield size={12} className="text-emerald-600" />
                    <span>SESSION SECURED & DECRYPTED</span>
                  </div>

                  {/* Core controls inputs */}
                  <div className="space-y-4">
                    
                    {/* FREQUENCY TUNER */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">Frequency Waveband</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['8.4GHZ', '5.2GHZ', '2.4GHZ'] as const).map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => {
                              setSelectedCoreFrequency(freq);
                              setLiveBandwidth(prev => Math.min(999, prev + 15));
                            }}
                            className={`py-2 px-1 text-[9px] font-mono font-black border transition-all rounded-lg cursor-pointer ${
                              selectedCoreFrequency === freq
                                ? 'bg-slate-950 border-slate-950 text-white shadow-3xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ROUTING PATH SELECTION */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">Active Routing Path</label>
                      <select
                        value={activeRoutePath}
                        onChange={(e) => {
                          setActiveRoutePath(e.target.value);
                          setLiveBandwidth(prev => Math.max(100, prev - 24));
                        }}
                        className="w-full bg-white border border-slate-205 py-2.5 px-3 text-[10px] text-slate-800 uppercase font-mono rounded-xl outline-none focus:border-slate-400 min-h-[40px]"
                      >
                        <option value="GATEWAY_PRIMARY">GATEWAY PRIMARY // SECURE.01</option>
                        <option value="GATEWAY_REDUNDANT">GATEWAY REDUNDANT // SYLC.02</option>
                        <option value="GATEWAY_DISTRIBUTED">GATEWAY DISTRIBUTED // COGN.03</option>
                      </select>
                    </div>

                    {/* CRAWLING ALGORITHM MULTIPLIER AND MULTIPROCESSOR */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase font-black">
                        <span>Payload Multiplier</span>
                        <span className="text-slate-900 font-extrabold">{payloadMultiplier}x</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={payloadMultiplier}
                          onChange={(e) => setPayloadMultiplier(Number(e.target.value))}
                          className="flex-1 h-1 bg-slate-100 rounded appearance-none cursor-pointer accent-slate-950"
                        />
                      </div>
                    </div>

                    {/* HARVESTER TYPE CHANNELS */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">Crawler Mode</label>
                      <div className="grid grid-cols-1 gap-1.5 text-[9px] font-mono uppercase font-black text-slate-700">
                        {[
                          { id: 'AUTO_EMBED', label: 'Semantic Embed Matcher' },
                          { id: 'DEEP_SCAN', label: 'Deep Multi-Hop Scan' },
                          { id: 'CONCURRENT_HARVEST', label: 'Concurrent Subject Harvester' }
                        ].map((m) => (
                          <label key={m.id} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-150 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input
                              type="radio"
                              name="crawler-mode"
                              checked={crawlerProtocol === m.id}
                              onChange={() => setCrawlerProtocol(m.id as any)}
                              className="accent-slate-950 scale-100 pointer-events-auto"
                            />
                            <span>{m.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* ACTIVE TESTING CONTROLLER */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono block">Evaluate Match Query</label>
                    <input
                      type="text"
                      value={queryTopic}
                      onChange={(e) => setQueryTopic(e.target.value)}
                      disabled={isSimulating}
                      onKeyDown={(e) => { if (e.key === 'Enter') runSimulation(); }}
                      placeholder="EX: DSC DISCRETE ALGORITHMS..."
                      className="w-full bg-slate-50/50 border border-slate-205 focus:bg-white focus:border-slate-405 rounded-xl px-4.5 py-3 text-xs text-slate-900 outline-none uppercase placeholder:text-slate-300 font-mono min-h-[44px] transition-all"
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={runSimulation}
                        disabled={isSimulating || !queryTopic.trim()}
                        className="flex-1 py-3 bg-slate-955 text-white hover:bg-slate-900 disabled:bg-slate-150 disabled:text-slate-400 disabled:border-slate-100 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-3xs min-h-[42px] border border-slate-950 flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        {isSimulating ? 'PARSING...' : 'TEST PIPELINE'}
                        <ArrowRight size={10} className="stroke-[3.5px]" />
                      </button>
                      <button
                        onClick={handleResetNetwork}
                        title="Reset network topography"
                        className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-center active:scale-95 transition-all"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* SIMULATED RESULTS COMPILER OUTPUT */}
                  <AnimatePresence>
                    {simResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4.5 bg-slate-950 border border-slate-950 text-white rounded-xl space-y-3 shadow-sm font-mono text-[9px] text-left leading-relaxed"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-emerald-450 font-black tracking-widest block uppercase">RELATIONAL SCHEMA REPORT</span>
                          <span className="text-emerald-400 font-bold px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">97.2% Match</span>
                        </div>
                        <p className="text-slate-350 uppercase tracking-wide leading-relaxed font-bold">
                          {simResult.insights}
                        </p>
                        <div className="space-y-1">
                          <span className="text-slate-500 font-bold tracking-widest block uppercase text-[8px]">RESOLVED COGNITIVE SEGMENTS:</span>
                          <div className="flex flex-wrap gap-1">
                            {simResult.nodes.map((n: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 font-extrabold uppercase text-[7.5px]">
                                #{n.toUpperCase().replace(/\s+/g, '_')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4.5 bg-[#fafaf8] border border-slate-200 rounded-xl text-slate-700 space-y-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-mono">
                      <Lock size={12} className="text-slate-850" /> Secure Sandbox Gateway
                    </h5>
                    <p className="text-[10px] uppercase tracking-wide leading-relaxed font-mono font-bold text-slate-405">
                      Early access stages to the research node graph is strictly authorized under student verification queues. Submit your email to join the whitelisted developer loop.
                    </p>
                  </div>

                  <form onSubmit={handleBetaSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 font-mono block font-bold">University Email Domain Link</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="NAME@DU.AC.IN"
                        disabled={isSubmitting || success}
                        className="w-full bg-slate-50/50 border border-slate-205 focus:bg-white focus:border-slate-405 rounded-xl px-4 py-3.5 text-xs text-slate-900 outline-none uppercase placeholder:text-slate-300 font-mono min-h-[44px] transition-all shadow-3xs"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || success}
                      className="w-full py-3.5 bg-slate-950 text-white hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150 font-black text-[9px] uppercase tracking-widest border border-slate-950 rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isSubmitting ? 'BUFFERING QUEUE POSITION...' : success ? 'POSITION REGISTERED' : 'SUBMIT AUTHENTICATION REQUEST'}
                    </button>
                  </form>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 text-[9px] font-mono font-black text-emerald-800 tracking-wider uppercase leading-relaxed rounded-xl shadow-3xs"
                      >
                        Success: Academic whitelist coordinates buffered successfully. Staging pipeline activated.
                      </motion.div>
                    )}
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 text-[9px] font-mono font-black text-red-800 tracking-wider uppercase leading-relaxed rounded-xl shadow-3xs"
                      >
                        Encryption Core Error: {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT IMMERSIVE TOPOGRAPHY NODE GRAPH */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#fafaf6] border border-slate-200 p-4 sm:p-6 md:p-8 rounded-3xl space-y-6 shadow-2xs relative">
              
              {/* Corner Watermarks */}
              <span className="absolute top-4 left-4 text-[7px] font-mono tracking-widest font-black text-slate-300 uppercase">SYS_FOCAL: {crawlerProtocol}</span>
              <span className="absolute top-4 right-4 text-[7px] font-mono tracking-widest font-black text-slate-300 uppercase">LATENCY: {1000 - liveBandwidth}MS</span>

              <div className="border-b border-slate-150/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block leading-none font-mono">
                    STAGE 02 — TOPOLOGY BLUEPRINTS
                  </span>
                  <h3 className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                    Relational Node Matrix Canvas
                  </h3>
                </div>
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest text-left sm:text-right">
                  MANUAL TRACE ROUTING: <span className="text-[#059669] font-black">STRIKE ACTIVE POINT TO TOGGLE SHARDS</span>
                </div>
              </div>

              {/* Blueprint coordinate matrix frame */}
              <div 
                className="w-full aspect-square md:aspect-video lg:aspect-[1.5/1] bg-slate-50 border border-slate-200 rounded-3xl relative flex items-center justify-center shadow-inner group overflow-hidden"
                style={{ perspective: '1400px' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* 3D Rotational Perspective Container */}
                <motion.div 
                  className="w-full h-full absolute inset-0 flex items-center justify-center transform-gpu"
                  style={{ 
                    rotateX, 
                    rotateY, 
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Subtle 3D Depth Floor Plate */}
                  <div className="absolute inset-4 rounded-xl border border-slate-200/50 bg-white/40 shadow-xl" style={{ transform: 'translateZ(-40px)' }} />

                  {/* Visual coordinate overlays */}
                  <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-10px)' }}>
                    {/* Grid lines */}
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-slate-200 border-b border-dashed border-slate-200" />
                    <div className="absolute top-2/4 left-0 right-0 h-px bg-slate-200 border-b border-dashed border-slate-200" />
                    <div className="absolute top-3/4 left-0 right-0 h-px bg-slate-200 border-b border-dashed border-slate-200" />
                    <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-200 border-r border-dashed border-slate-200" />
                    <div className="absolute left-2/4 top-0 bottom-0 w-px bg-slate-200 border-r border-dashed border-slate-200" />
                    <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-200 border-r border-dashed border-slate-200" />
                    
                    {/* Compass layout circles */}
                    <div className="absolute inset-[15%] rounded-full border border-dashed border-slate-300/50" />
                    <div className="absolute inset-[30%] rounded-full border border-slate-200" />
                    <div className="absolute inset-[45%] rounded-full border border-emerald-500/10 animate-pulse" />
                  </div>

                  {/* Coordinates network mapping links */}
                  <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible" style={{ transform: 'translateZ(20px)' }}>
                    {connections.map((c, i) => {
                      const fromNode = nodes.find(n => n.id === c.from);
                      const toNode = nodes.find(n => n.id === c.to);
                      if (!fromNode || !toNode) return null;
                      
                      const isFullyActive = fromNode.active && toNode.active;
                      
                      return (
                        <line
                          key={i}
                          x1={`${fromNode.x}%`}
                          y1={`${fromNode.y}%`}
                          x2={`${toNode.x}%`}
                          y2={`${toNode.y}%`}
                          className={`${
                            isFullyActive ? 'stroke-slate-950' : 'stroke-slate-300'
                          } transition-colors duration-500`}
                          strokeWidth={isFullyActive ? 2 : 1}
                          strokeDasharray={isFullyActive ? "none" : "6 6"}
                        />
                      );
                    })}
                  </svg>

                  {/* Micro compass focal core */}
                  <div className="absolute w-14 h-14 rounded-2xl bg-slate-950 border border-slate-900 flex items-center justify-center shadow-2xl z-10 transition-transform hover:scale-105 active:scale-95 cursor-pointer" style={{ transform: 'translateZ(60px)' }}>
                    <Compass size={22} className="text-emerald-400 animate-pulse" />
                    <span className="absolute -bottom-6 text-[7px] font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap bg-white/80 px-2 py-0.5 rounded shadow-sm border border-slate-200 backdrop-blur-sm">CENTRAL INDEX</span>
                  </div>

                  {/* Real interactive coordinate anchors */}
                  {nodes.map((n) => {
                    return (
                      <motion.button
                        key={n.id}
                        layout
                        onClick={() => toggleNodeActive(n.id)}
                        style={{
                          position: 'absolute',
                          left: `${n.x}%`,
                          top: `${n.y}%`,
                          transform: `translate(-50%, -50%) translateZ(${n.active ? 80 : 30}px)`,
                          transformStyle: 'preserve-3d'
                        }}
                        className="cursor-pointer z-20 group relative focus:outline-none flex items-center justify-center min-w-[40px] min-h-[40px] transition-transform duration-500"
                      >
                        <span className="relative flex h-6 w-6 items-center justify-center">
                          {n.active && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40 shadow-xl" />
                          )}
                          <span className={`relative inline-flex rounded-full h-3 w-3 border-[2.5px] transition-all duration-300 ${
                            n.active 
                              ? 'bg-slate-950 border-slate-950 scale-125 shadow-xl shadow-slate-900/40' 
                              : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-md'
                          }`} />
                        </span>

                        {/* Floating 3D label */}
                        <span style={{ transform: 'translateZ(50px)' }} className={`absolute left-1/2 bottom-8 -translate-x-1/2 px-2.5 py-1 text-[8px] font-mono font-black uppercase tracking-widest border rounded-md pointer-events-none whitespace-nowrap transition-all duration-300 shadow-xl ${
                          n.active 
                            ? 'bg-slate-950 text-white border-slate-900 opacity-100 translate-y-0 scale-110' 
                            : 'bg-white text-slate-600 border-slate-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                        }`}>
                          {n.name}
                        </span>
                        
                        {/* 3D connecting anchor to the floor */}
                        <div className={`absolute top-1/2 left-1/2 w-[1px] -translate-x-1/2 transition-all duration-500 origin-top transform-gpu ${
                          n.active ? 'opacity-30 bg-slate-950 h-[120px]' : 'opacity-10 bg-slate-400 h-[70px]'
                        }`} style={{ transform: 'rotateX(-90deg) translateZ(-1px)' }} />
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Perspective overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.03)] pointer-events-none rounded-2xl" />

                <span className="absolute bottom-4 left-5 text-[7px] font-mono text-slate-400 uppercase tracking-widest font-black leading-none bg-white/80 px-2.5 py-1 border border-slate-200 rounded backdrop-blur-sm z-30">
                  FULL 3D IMMERSIVE MATRIX :: TRACKING ACTIVE
                </span>
              </div>

              {/* TECHNOLOGY NODE REGISTRY TABLE STYLE 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="bg-slate-50 px-4.5 py-3 border-b border-slate-150 text-left">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#059669] font-mono block">TOPOLOGICAL CHANNELS REGISTRY</span>
                </div>
                
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full text-left font-mono text-[9px] text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50/45 border-b border-slate-100 text-[8px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-2.5">COORD_ID</th>
                        <th className="px-5 py-2.5">NODE_NAME</th>
                        <th className="px-5 py-2.5">CATEGORY</th>
                        <th className="px-5 py-2.5">FREQ_CHAN</th>
                        <th className="px-5 py-2.5 text-right">PACKETS_COUNT</th>
                        <th className="px-5 py-2.5 text-right">STATUS_NET</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold uppercase">
                      {nodes.map((node) => (
                        <tr 
                          key={node.id} 
                          onClick={() => toggleNodeActive(node.id)}
                          className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                            node.active ? 'text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          <td className="px-5 py-3 font-extrabold">0{node.id}</td>
                          <td className="px-5 py-3 font-black text-slate-800">{node.name}</td>
                          <td className="px-5 py-3 text-[8.5px] text-slate-500">{node.category}</td>
                          <td className="px-5 py-3">{node.frequency}</td>
                          <td className="px-5 py-3 text-right">{node.packets}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`px-2 py-0.5 text-[7.5px] font-black rounded-md border inline-block leading-none ${
                              node.active 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}>
                              {node.active ? 'COHESIVE' : 'BYPASS'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* HIGH CONTRAST SPEC STATUS BAR */}
        <div className="border-t border-slate-200/60 pt-6 flex flex-col md:flex-row justify-between items-center text-[8px] font-mono text-slate-401 uppercase tracking-widest gap-4">
          <div>DELHI UNIVERSITY SEARCH NODES // COMPLIANT WITH UNIVERSITY ARCHIVAL PROTOCOLS</div>
          <div className="text-center md:text-right font-black text-slate-500">
            SYSTEM ENGINE: DEEP SCRAMBLE CRAWLER .v3
          </div>
        </div>

      </div>
    </div>
  );
}
