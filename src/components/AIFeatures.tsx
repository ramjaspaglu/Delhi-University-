import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Atom, 
  Eye, 
  RefreshCcw, 
  AlertCircle,
  Binary,
  Sliders,
  CheckCircle,
  ArrowRight,
  Upload,
  FileText,
  Compass,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

interface AnalystResult {
  wavefunctionFormula: string;
  energyLevelEv: string;
  nodesCount: number;
  interpretation: string;
  tunnelingContext: string;
  uncertaintyProduct: string;
}

interface DiagnosticSubject {
  subject: string;
  score: number;
  maxScore: number;
}

interface DiagnosticsResult {
  parsedSubjects: DiagnosticSubject[];
  gpa: string;
  academicStanding: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestedActions: { title: string; description: string }[];
  recommendedResearchSubfields: string[];
}

export default function AIFeatures() {
  const [activeSegment, setActiveSegment] = useState<'sim' | 'diagnostics' | 'relativity'>('sim');

  // --- TAB A: SIMULATION ENGINE STATE ---
  const [quantumN, setQuantumN] = useState<number>(3);
  const [wellWidth, setWellWidth] = useState<number>(5.0); // in Angstroms
  const [particle, setParticle] = useState<'Electron' | 'Proton' | 'Muon' | 'Alpha Particle'>('Electron');
  const [viewType, setViewType] = useState<'wavefunction' | 'probability'>('probability');
  const [calculatedEnergy, setCalculatedEnergy] = useState<string>("0");
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<AnalystResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // --- TAB B: ACADEMIC DIAGNOSTICS STATE ---
  const [rawText, setRawText] = useState<string>("");
  const [studentContext, setStudentContext] = useState<string>("B.Sc. Physics (Hons) Undergraduate student");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [diagLoading, setDiagLoading] = useState<boolean>(false);
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [diagResult, setDiagResult] = useState<DiagnosticsResult | null>(null);
  const [diagError, setDiagError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New binary upload and OCR state variables
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ url: string; name: string; size: number } | null>(null);
  const [fileUploading, setFileUploading] = useState<boolean>(false);

  // --- TAB C: SCHWARZSCHILD GEODESIC RELATIVITY STATE ---
  const [isPhoton, setIsPhoton] = useState<boolean>(false);
  const [grR0, setGrR0] = useState<number>(8.0);
  const [grL, setGrL] = useState<number>(3.6);
  const [grVr0, setGrVr0] = useState<number>(0.0);
  const [trajectory, setTrajectory] = useState<{ x: number; y: number; r: number; phi: number }[]>([]);
  const [grOutcome, setGrOutcome] = useState<'CROSS_HORIZON' | 'ESCAPED' | 'STABLE_ORBIT' | 'MAX_BOUND'>('STABLE_ORBIT');
  const [relativityLoading, setRelativityLoading] = useState<boolean>(false);
  const [relativityResult, setRelativityResult] = useState<any | null>(null);
  const [relativityError, setRelativityError] = useState<string | null>(null);
  const grCanvasRef = useRef<HTMLCanvasElement>(null);
  const [simStepRate, setSimStepRate] = useState<number>(0.03);

  // Schwarzschild Geodesic numerical solver (Runge-Kutta 4th order in proper time/affine parameter)
  const calculateTrajectory = (photonMode: boolean, r0: number, LVal: number, vr0: number, dlambda: number) => {
    const points: { x: number; y: number; r: number; phi: number }[] = [];
    const maxSteps = 2200;
    const epsilon = photonMode ? 0.0 : 1.0;
    const M = 1.0; // Normalized mass

    let r = r0;
    let vr = vr0;
    let phi = 0.0;

    if (r <= 2.0 * M) {
      return {
        points: [{ x: r0, y: 0, r: r0, phi: 0 }],
        outcome: 'CROSS_HORIZON' as const
      };
    }

    const dv_dlambda = (currR: number, currVr: number) => {
      if (currR <= 2.0 * M) return 0.0;
      // Equation: \ddot{r} = L^2/r^3 - M\epsilon/r^2 - 3ML^2/r^4
      const termCentrifugal = (LVal * LVal) / (currR * currR * currR);
      const termNewtonian = (M * epsilon) / (currR * currR);
      const termRelativistic = (3.0 * M * LVal * LVal) / (currR * currR * currR * currR);
      return termCentrifugal - termNewtonian - termRelativistic;
    };

    let outcome: 'CROSS_HORIZON' | 'ESCAPED' | 'STABLE_ORBIT' | 'MAX_BOUND' = 'MAX_BOUND';

    for (let step = 0; step < maxSteps; step++) {
      const x = r * Math.cos(phi);
      const y = r * Math.sin(phi);
      points.push({ x, y, r, phi });

      if (r <= 2.01 * M) {
        outcome = 'CROSS_HORIZON';
        break;
      }
      if (r >= 42.0 * M) {
        outcome = 'ESCAPED';
        break;
      }

      // RK4 integration step for r and vr
      const k1_r = vr;
      const k1_vr = dv_dlambda(r, vr);

      const r2 = r + 0.5 * dlambda * k1_r;
      const vr2 = vr + 0.5 * dlambda * k1_vr;
      const k2_r = vr2;
      const k2_vr = dv_dlambda(r2, vr2);

      const r3 = r + 0.5 * dlambda * k2_r;
      const vr3 = vr + 0.5 * dlambda * k2_vr;
      const k3_r = vr3;
      const k3_vr = dv_dlambda(r3, vr3);

      const r4 = r + dlambda * k3_r;
      const vr4 = vr + dlambda * k3_vr;
      const k4_r = vr4;
      const k4_vr = dv_dlambda(r4, vr4);

      const nextR = r + (dlambda / 6.0) * (k1_r + 2.0 * k2_r + 2.0 * k3_r + k4_r);
      const nextVr = vr + (dlambda / 6.0) * (k1_vr + 2.0 * k2_vr + 2.0 * k3_vr + k4_vr);
      
      let nextPhi = phi;
      if (r > 0.1) {
        // dphi/dlambda = L / r^2
        nextPhi = phi + dlambda * (LVal / (r * r));
      }

      if (step === maxSteps - 1) {
        outcome = 'STABLE_ORBIT';
      }

      r = nextR;
      vr = nextVr;
      phi = nextPhi;
    }

    return { points, outcome };
  };

  // Run calculation dynamically
  useEffect(() => {
    const { points, outcome } = calculateTrajectory(isPhoton, grR0, grL, grVr0, simStepRate);
    setTrajectory(points);
    setGrOutcome(outcome);
  }, [isPhoton, grR0, grL, grVr0, simStepRate]);

  // Paint dynamic coordinate canvas
  useEffect(() => {
    const canvas = grCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to clean slate space theme
    ctx.fillStyle = '#090d16'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const maxRadius = 18.0;
    const scale = Math.min(canvas.width, canvas.height) / (maxRadius * 2.2);

    // 1. Draw coordinate grid circles
    ctx.strokeStyle = '#1e293b'; 
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    
    [5, 10, 15].forEach((ringR) => {
      ctx.beginPath();
      ctx.arc(cx, cy, ringR * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#475569'; 
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.setLineDash([]);
      ctx.fillText(`r = ${ringR}M`, cx + ringR * scale + 4, cy - 4);
      ctx.setLineDash([4, 4]);
    });
    ctx.setLineDash([]);

    // 2. Innermost Stable Circular Orbit (ISCO) at r = 6M
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)'; 
    ctx.lineWidth = 1.0;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, 6.0 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillText('ISCO BOUNDARY (6M)', cx - 6.0 * scale + 6, cy + 12);

    // 3. Photon Sphere at r = 3M
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'; 
    ctx.lineWidth = 1.0;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, 3.0 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.fillText('PHOTON SPHERE (3M)', cx - 3.0 * scale + 6, cy - 8);

    ctx.setLineDash([]);

    // 4. Draw Geodesic Path
    if (trajectory.length > 0) {
      ctx.lineWidth = 1.75;
      ctx.strokeStyle = isPhoton ? '#f97316' : '#06b6d4'; 
      ctx.beginPath();

      trajectory.forEach((pt, idx) => {
        const drawX = cx + pt.x * scale;
        const drawY = cy - pt.y * scale;

        if (idx === 0) {
          ctx.moveTo(drawX, drawY);
        } else {
          ctx.lineTo(drawX, drawY);
        }
      });
      ctx.stroke();

      const lastPt = trajectory[trajectory.length - 1];
      ctx.fillStyle = isPhoton ? '#fdba74' : '#67e8f9';
      ctx.beginPath();
      ctx.arc(cx + lastPt.x * scale, cy - lastPt.y * scale, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Central Event Horizon (r = 2M)
    ctx.beginPath();
    ctx.arc(cx, cy, 2.0 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#000000'; 
    ctx.fill();
    ctx.strokeStyle = '#ef4444'; 
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.fillText('EVENT HORIZON (Rs=2M)', cx - 50, cy + 3);

    // 6. Draw Launch position
    ctx.fillStyle = '#10b981'; 
    ctx.beginPath();
    ctx.arc(cx + grR0 * scale, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [trajectory, grR0, isPhoton]);

  const handleAnalyzeGeodesic = async () => {
    setRelativityLoading(true);
    setRelativityError(null);
    setRelativityResult(null);

    try {
      const res = await fetch("/api/ai/analyze-geodesic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPhoton,
          r0: grR0,
          L: grL,
          vr0: grVr0,
          outcome: grOutcome
        })
      });

      if (!res.ok) {
        throw new Error("Einstein relativity cluster analytical request failed under load.");
      }

      const data = await res.json();
      setRelativityResult(data);
    } catch (err: any) {
      console.error(err);
      setRelativityError(err.message || "Failed to compile Schwarzschild geodesic analysis.");
    } finally {
      setRelativityLoading(false);
    }
  };

  // Math solver for Infinite Potential Well
  useEffect(() => {
    // E_n = (h^2 * n^2) / (8 * m * L^2)
    // For Electron, E_n = 37.6 * (n^2 / L^2) eV
    let baseConstant = 37.6; // Electron base constant (eV * Angstrom^2)
    if (particle === 'Proton') {
      baseConstant = 37.6 / 1836.15;
    } else if (particle === 'Muon') {
      baseConstant = 37.6 / 206.77;
    } else if (particle === 'Alpha Particle') {
      baseConstant = 37.6 / 7294.3;
    }

    const energy = (baseConstant * Math.pow(quantumN, 2)) / Math.pow(wellWidth, 2);
    if (energy < 0.001) {
      setCalculatedEnergy(energy.toExponential(4));
    } else {
      setCalculatedEnergy(energy.toFixed(3));
    }
  }, [quantumN, wellWidth, particle]);

  const handleAISynergize = async () => {
    setSimLoading(true);
    setSimResult(null);
    setSimError(null);
    try {
      const res = await fetch('/api/ai/physics-analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "1D Infinite Potential Well",
          n: quantumN,
          width: wellWidth,
          particle: particle
        })
      });

      if (!res.ok) throw new Error("AI Simulation service failed.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSimResult(data);
    } catch (e: any) {
      setSimError(e.message || "An unexpected simulation service error occurred.");
    } finally {
      setSimLoading(false);
    }
  };

  // Preset Template loader
  const loadPresetTemplate = (type: 'physics3' | 'physics1') => {
    setUploadedFileInfo(null);
    if (type === 'physics3') {
      setRawText(
        `UNIVERSITY ACADEMIC RECORD TRANSCRIPT\n` +
        `COURSE: B.Sc. Physics (Hons) Semester III\n\n` +
        `Mathematical Physics II: 88 / 100\n` +
        `Thermal Physics: 82 / 100\n` +
        `Digital Systems & Applications: 94 / 100\n` +
        `Electromagnetic Theory: 76 / 100\n` +
        `Quantum Computing Elective: 91 / 100\n` +
        `Modern Optoelectronics Laboratory: 95 / 100`
      );
    } else {
      setRawText(
        `PRELIMINARY ASSESSMENT REPORT CARD\n` +
        `COURSE: Undergraduate Physics Semester I\n\n` +
        `Mechanics I: 71 / 100\n` +
        `Calculus & Lin Algebra: 62 / 100\n` +
        `General Laboratory Practice: 85 / 100\n` +
        `Computational Physics Basics: 89 / 100\n` +
        `Wave Motion & Acoustics: 74 / 100`
      );
    }
  };

  const uploadBinaryFile = async (file: File) => {
    setFileUploading(true);
    setDiagError(null);
    setUploadedFileInfo(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("File upload to server failed.");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setUploadedFileInfo({
        url: data.url,
        name: data.name,
        size: data.size
      });
      setRawText(`[Selected File Core: ${data.name}]`);
    } catch (e: any) {
      setDiagError(e.message || "Failed to upload file to the backend analyzer.");
    } finally {
      setFileUploading(false);
    }
  };

  // Diagnostic submit action with elegant timed logging
  const handleRunDiagnostics = async () => {
    if (!rawText.trim() && !uploadedFileInfo) return;
    
    setDiagLoading(true);
    setDiagResult(null);
    setDiagError(null);
    setDiagLogs([]);

    // Timed logging simulation tailored to current input format
    const logs = uploadedFileInfo 
      ? [
          "Spawning DeepMind scholastic analytical agent node...",
          "Uploading and registering binary document stream...",
          "Running precise OCR node text extraction via Gemini 3.5...",
          "Matching scorecard markings to DU curriculum matrix indexes..."
        ]
      : [
          "Spawning DeepMind scholastic analytical agent node...",
          "Decoding digital scorecards and academic metrics...",
          "Constructing multivariate grade point estimation matrices...",
          "Matching subject performance to leading computational research streams..."
        ];

    let currentLogIndex = 0;
    setDiagLogs([logs[0]]);

    const interval = setInterval(() => {
      currentLogIndex++;
      if (currentLogIndex < logs.length) {
        setDiagLogs(prev => [...prev, logs[currentLogIndex]]);
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      let res;
      if (uploadedFileInfo) {
        res = await fetch('/api/ai/analyze-pdf-scorecard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: uploadedFileInfo.url,
            studentContext
          })
        });
      } else {
        res = await fetch('/api/ai/analyze-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText,
            studentContext
          })
        });
      }

      clearInterval(interval);
      
      if (!res.ok) throw new Error("Academic Advisor Agent reached resource exhaustion.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Finish with success log before showing
      setDiagLogs(prev => [...prev, "Diagnostics generation complete. Formatting dashboards."]);
      
      // Delay slightly so the user sees the final step of the loading animation
      await new Promise(r => setTimeout(r, 600));
      setDiagResult(data);
    } catch (e: any) {
      clearInterval(interval);
      setDiagError(e.message || "An unexpected engine failure occurred during computation.");
    } finally {
      setDiagLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isBinaryScorecard = ['.pdf', '.png', '.jpg', '.jpeg'].includes(ext);

      if (isBinaryScorecard) {
        uploadBinaryFile(file);
      } else {
        setUploadedFileInfo(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setRawText(event.target.result as string);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const isBinaryScorecard = ['.pdf', '.png', '.jpg', '.jpeg'].includes(ext);

      if (isBinaryScorecard) {
        uploadBinaryFile(file);
      } else {
        setUploadedFileInfo(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setRawText(event.target.result as string);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  // Wave plotting path
  const generateSvgPath = () => {
    const width = 600;
    const height = 240;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const centerY = padding + graphHeight / 2;
    
    let points: string[] = [];

    for (let xPixel = 0; xPixel <= graphWidth; xPixel++) {
      const fraction = xPixel / graphWidth;
      const xMath = fraction * Math.PI;
      
      let yOffset = 0;
      if (viewType === 'wavefunction') {
        yOffset = Math.sin(quantumN * xMath) * (graphHeight / 2 - 10);
      } else {
        yOffset = Math.pow(Math.sin(quantumN * xMath), 2) * (graphHeight - 20);
      }

      const xCoord = padding + xPixel;
      const yCoord = viewType === 'wavefunction' ? centerY - yOffset : padding + graphHeight - yOffset;
      
      points.push(`${xCoord},${yCoord}`);
    }

    return points.join(' ');
  };

  const getNodes = () => {
    const nodes: number[] = [];
    for (let k = 1; k < quantumN; k++) {
      nodes.push(k / quantumN);
    }
    return nodes;
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-10 md:py-16 px-4 space-y-12">
      {/* Labs Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
          <Atom size={32} strokeWidth={1.5} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">DeepMind Physics & Analytics Lab</h1>
        <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed">
          Advanced computational simulations, quantum well solvers, and automated student scorecard diagnostics agents.
        </p>

        {/* Outer Tab Controls */}
        <div className="flex justify-center p-1 bg-slate-100 rounded-2xl max-w-lg mx-auto shadow-sm">
          <button
            onClick={() => setActiveSegment('sim')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'sim' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quantum Well
          </button>
          <button
            onClick={() => setActiveSegment('relativity')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'relativity' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Einstein Geodesics
          </button>
          <button
            onClick={() => setActiveSegment('diagnostics')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeSegment === 'diagnostics' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Diagnostics Agent
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSegment === 'sim' && (
          <motion.div
            key="sim-segment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* SETUP PARAMETERS */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-8">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Sliders size={20} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Parameters</h3>
              </div>

              <div className="space-y-6">
                {/* Particle Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Select Quantum Particle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Electron', 'Proton', 'Muon', 'Alpha Particle'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setParticle(p)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-left ${
                          particle === p 
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantum Number n */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Quantum Number (n)</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold">n = {quantumN}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={quantumN}
                    onChange={(e) => setQuantumN(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block leading-tight">Controls wave oscillation nodes & energy eigenvalue limits.</span>
                </div>

                {/* Well Width */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-400">Well Width (L)</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold">{wellWidth.toFixed(1)} Å</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={15.0}
                    step={0.5}
                    value={wellWidth}
                    onChange={(e) => setWellWidth(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block leading-tight">Width compression directly scales kinetic energy potential limits.</span>
                </div>

                {/* Metric View Toggle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Wave Metric View</label>
                  <div className="grid grid-cols-2 gap-2 border border-slate-200 p-1 rounded-2xl bg-slate-50">
                    <button
                      onClick={() => setViewType('wavefunction')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                        viewType === 'wavefunction' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Wavefunction Ψ
                    </button>
                    <button
                      onClick={() => setViewType('probability')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                        viewType === 'probability' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Probability |Ψ|²
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <Binary size={15} />
                  <span>Calculated Eigenvalue</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ENERGY E_n</span>
                  <span className="text-2xl font-black text-slate-800">
                    {calculatedEnergy} eV
                  </span>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Formula:<br />
                  <code className="font-mono bg-white p-1 rounded border border-slate-205 block text-center text-[10px] mt-1 text-slate-700">
                    E_n = (n² * h²) / (8 * m * L²)
                  </code>
                </p>
              </div>
            </div>

            {/* LIVE SIMULATOR DISPLAY */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Eye size={12} /> LIVE GRAPH MODEL
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">Infinite Well Waves</h3>
                  </div>

                  <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block"></span>
                      <span>{viewType === 'wavefunction' ? 'Amplitude Ψ(x)' : 'Probability Density |Ψ(x)|²'}</span>
                    </div>
                  </div>
                </div>

                {/* SVG WAVE CHART */}
                <div className="relative border border-slate-100 rounded-2xl bg-slate-50 overflow-hidden py-4">
                  <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-300" xmlns="http://www.w3.org/2000/svg">
                    <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                    <line x1="560" y1="20" x2="560" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                    <line x1="10" y1="160" x2="590" y2="160" stroke="#94a3b8" strokeWidth="1" opacity="0.2" />
                    <line x1="40" y1="160" x2="560" y2="160" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" />
                    
                    {viewType === 'wavefunction' ? (
                      <path d={`M ${generateSvgPath()}`} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <>
                        <polygon points={`40,200 ${generateSvgPath()} 560,200`} fill="#e6f4ea" opacity="0.65" />
                        <path d={`M ${generateSvgPath()}`} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}

                    <text x="35" y="232" textAnchor="end" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">x = 0</text>
                    <text x="565" y="232" textAnchor="start" className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest">x = L</text>

                    {viewType === 'probability' && getNodes().map((nodeFrac, idx) => {
                      const xPos = 40 + nodeFrac * 520;
                      return (
                        <g key={idx}>
                          <line x1={xPos} y1="40" x2={xPos} y2="200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                          <circle cx={xPos} cy="200" r="4" fill="#059669" />
                          <text x={xPos} y="222" textAnchor="middle" className="text-[9px] font-bold fill-slate-400 font-mono">Node {idx + 1}</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute top-4 left-6 text-[10px] font-mono text-slate-400 space-y-1">
                    <div>Ψ_max = √(2/L) = {(Math.sqrt(2 / wellWidth)).toFixed(3)}</div>
                    <div>λ_n = 2L/n = {((2 * wellWidth) / quantumN).toFixed(2)} Å</div>
                  </div>
                </div>

                {/* AI Theoretical report trigger */}
                <div className="flex flex-col md:flex-row items-center md:justify-between p-6 bg-emerald-50 border border-emerald-100/50 rounded-2xl gap-4">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="font-bold text-emerald-950 flex items-center justify-center md:justify-start gap-1.5 text-sm uppercase tracking-wider">
                      <Sparkles size={16} className="text-emerald-600" /> Theoretical Analyst report
                    </h4>
                    <p className="text-xs text-emerald-700/80 max-w-lg">
                      Submit these parameters to generate a profound Bohr correspondence wave theory report.
                    </p>
                  </div>

                  <button
                    onClick={handleAISynergize}
                    disabled={simLoading}
                    className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                  >
                    {simLoading ? (
                      <>
                        <RefreshCcw size={14} className="animate-spin" />
                        <span>Solving...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Report</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* SIM AI RESULT */}
                <AnimatePresence mode="wait">
                  {simError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 mt-4 text-xs font-semibold text-rose-800"
                    >
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-extrabold uppercase mb-1">State Evaluation Error</h5>
                        <p>{simError}</p>
                      </div>
                    </motion.div>
                  )}

                  {simResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-6"
                    >
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50">
                        <CheckCircle className="text-emerald-600" size={18} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">Simulation Report Details</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Wavefunction Formula</span>
                          <div className="bg-white border border-slate-100 p-3 rounded-xl text-center font-mono text-xs font-bold text-emerald-800">
                            {simResult.wavefunctionFormula}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Uncertainty Limit</span>
                          <div className="bg-white border border-slate-100 p-3 rounded-xl text-center font-mono text-xs font-bold text-emerald-800">
                            {simResult.uncertaintyProduct}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Interpretation</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {simResult.interpretation}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Boundary & Tunneling Context</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {simResult.tunnelingContext}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {activeSegment === 'relativity' && (
          <motion.div
            key="relativity-segment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left font-sans"
          >
            {/* PARAMETERS CONFIGURATION PANEL */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-8">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Sliders size={20} className="text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Einstein Orbit Parameters</h3>
              </div>

              <div className="space-y-6">
                {/* 1. Metric Particle Model Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Mass Metric Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPhoton(false)}
                      className={`py-2.5 px-3 text-[10px] font-black uppercase rounded-xl border transition-all text-center cursor-pointer ${
                        !isPhoton
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Massive Probe
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPhoton(true)}
                      className={`py-2.5 px-3 text-[10px] font-black uppercase rounded-xl border transition-all text-center cursor-pointer ${
                        isPhoton
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Light Photon
                    </button>
                  </div>
                </div>

                {/* 2. Initial distance selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-[10px] font-black uppercase text-slate-400">Launch Distance (r₀)</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[11px]">{grR0.toFixed(1)} M</span>
                  </div>
                  <input
                    type="range"
                    min="2.2"
                    max="16.0"
                    step="0.1"
                    value={grR0}
                    onChange={(e) => setGrR0(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Horizon Limit (2.0)</span>
                    <span>Mid-Space Orbit (16.0)</span>
                  </div>
                </div>

                {/* 3. Conserved Angular Momentum L */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-sans">Angular Momentum (L)</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[11px]">{grL.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-8.0"
                    max="8.0"
                    step="0.1"
                    value={grL}
                    onChange={(e) => setGrL(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Counter-Clockwise</span>
                    <span>Clockwise</span>
                  </div>
                </div>

                {/* 4. Radial velocity dr_dlambda */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-[10px] font-black uppercase text-slate-400">Radial Velocity (dr/dλ)</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[11px]">{grVr0.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1.50"
                    max="1.50"
                    step="0.05"
                    value={grVr0}
                    onChange={(e) => setGrVr0(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Inward Descent (-1.5)</span>
                    <span>Radial Launch (1.5)</span>
                  </div>
                </div>

                {/* 5. Integration Step Rate dlambda */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-sans">Integrator Step bounds (dλ)</span>
                    <span className="font-mono text-emerald-700 font-extrabold text-[11px]">{simStepRate.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.06"
                    step="0.005"
                    value={simStepRate}
                    onChange={(e) => setSimStepRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* ACTION TOGGLER FOR GEODESIC ANALYTICAL THESIS */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <button
                  type="button"
                  disabled={relativityLoading}
                  onClick={handleAnalyzeGeodesic}
                  className="w-full py-4 px-6 bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-40 select-none text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                >
                  {relativityLoading ? (
                    <>
                      <RefreshCcw className="animate-spin w-4 h-4 text-emerald-500" />
                      <span>Resolving Einstein Field Matrices...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                      <span>Generate Relativistic AI Thesis</span>
                    </>
                  )}
                </button>
                <div className="text-[9.5px] text-slate-400 leading-normal font-semibold uppercase tracking-wider text-center">
                  Theoretical Analysis provided by Google Gemini 3.5 AI Core
                </div>
              </div>
            </div>

            {/* LIVE DYNAMICS VISUALIZER PANEL */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* HTML5 Dynamic Graphics System */}
                <div className="md:col-span-7 flex flex-col items-center justify-center">
                  <div className="p-1 bg-slate-950 rounded-[1.75rem] border border-slate-800 shadow-inner relative max-w-full overflow-hidden">
                    <canvas
                      ref={grCanvasRef}
                      width={400}
                      height={400}
                      className="rounded-[1.5rem] w-full max-w-[400px] aspect-square"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/80 px-2.5 py-1 border border-slate-800/80 rounded font-mono text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                      Schwarzschild Spacetime Frame θ = π/2
                    </div>
                  </div>
                </div>

                {/* Coordinate Reads / Analysis Outcome Stats */}
                <div className="md:col-span-5 space-y-6 text-left">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block leading-none font-mono">
                      COORDINATE OUTCOME READOUT
                    </span>
                    <h2 className="text-xl font-extrabold uppercase text-slate-900 tracking-tight leading-tight">
                      {grOutcome === 'CROSS_HORIZON' ? 'Singularity Capture Crossing' : 
                       grOutcome === 'ESCAPED' ? 'Asymptotic Spatial Escape' : 
                       grOutcome === 'STABLE_ORBIT' ? 'Resonant Precession Bound' : 'Complex Relativistic Path'}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                      Numerical trajectory integrated in real-time. Einsteinian corrections show periapsis precession which is absent in classical models.
                    </p>
                  </div>

                  <div className="border border-slate-150 rounded-2xl divide-y divide-slate-150 overflow-hidden bg-slate-50/50">
                    <div className="p-4 flex justify-between items-center text-xs font-bold uppercase text-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase font-mono">Integration Status</span>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black border uppercase tracking-wider ${
                        grOutcome === 'CROSS_HORIZON' 
                          ? 'bg-rose-50 border-rose-200 text-rose-700' 
                          : grOutcome === 'ESCAPED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}>
                        {grOutcome === 'CROSS_HORIZON' ? 'CAPTURED (r <= 2M)' : 
                         grOutcome === 'ESCAPED' ? 'ESCAPED (r > 40M)' : 'ORBITING / RESOLVED'}
                      </span>
                    </div>

                    <div className="p-4 flex justify-between items-center text-xs font-bold uppercase text-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase font-mono">Solver Steps</span>
                      <span className="font-mono font-black text-slate-900 text-[11px]">{trajectory.length} RK4 Steps</span>
                    </div>

                    <div className="p-4 flex justify-between items-center text-xs font-bold uppercase text-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase font-mono">Closest Approach Min(r)</span>
                      <span className="font-mono font-black text-slate-900 text-[11px]">
                        {trajectory.length > 0 
                          ? Math.min(...trajectory.map(p => p.r)).toFixed(3)
                          : 'N/A'
                        } M
                      </span>
                    </div>

                    <div className="p-4 flex justify-between items-center text-xs font-bold uppercase text-slate-800">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase font-mono">Orbital Phase Angle</span>
                      <span className="font-mono font-black text-slate-900 text-[11px]">
                        {trajectory.length > 0
                          ? ((trajectory[trajectory.length - 1].phi / Math.PI) * 180.0).toFixed(1)
                          : '0.0'
                        }°
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI SCHOLASTIC TREATISE EXPANSE */}
              {relativityError && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-150 rounded-2xl text-xs font-bold uppercase tracking-wider text-left">
                  {relativityError}
                </div>
              )}

              <AnimatePresence mode="wait">
                {relativityResult && (
                  <motion.div
                    key="relativity-ai-result"
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8 bg-slate-950 border border-slate-800 rounded-[2rem] text-left space-y-8"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-805 border-slate-800 pb-5 text-left">
                      <div className="space-y-1.5">
                        <span className="text-[8.5px] font-black uppercase text-emerald-400 tracking-[0.2em] font-mono leading-none block">
                          EINSTEIN TENSOR COVARIANT MODEL RESOLVED STATE
                        </span>
                        <h3 className="text-base md:text-lg font-bold uppercase text-white font-sans tracking-tight">
                          Theoretical Schwarzschild Geodesic Core Thesis
                        </h3>
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest">
                          Report Compiled under Einstein Field Equations solver matrices (G_μν = 8πT_μν)
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-widest border border-emerald-500/20 rounded font-mono">
                        VERIFIED BLUEPRINT
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      {/* Physical Summary Paragraph */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block">Orbit Mechanics Summary</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold uppercase tracking-wider font-sans">
                          {relativityResult.physicalSummary}
                        </p>
                      </div>

                      {/* Effective Potential Breakdown */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block">Effective Potential (V_eff) Interaction</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold uppercase tracking-wider font-sans">
                          {relativityResult.effectivePotentialExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 border-t border-slate-800 text-left">
                      {/* Phenomena Detected */}
                      <div className="md:col-span-7 space-y-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block">Relativistic Phenomena Isolated</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {relativityResult.phenomenaObserved.map((phen: string, pIdx: number) => (
                            <div key={pIdx} className="p-3 bg-slate-905 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>{phen}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Astrophysical Realities */}
                      <div className="md:col-span-5 space-y-3">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono block">Astrophysical Precedents</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-widest bg-slate-900/50 p-4 border border-slate-800 rounded-xl font-sans">
                          {relativityResult.astrophysicalContext}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 text-center font-mono text-[8.5px] text-slate-500 uppercase tracking-wider">
                      Academic Geodesic Monograph Model G-2026 // DeepMind Physics Labs Server Hub
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeSegment === 'diagnostics' && (
          <motion.div
            key="diagnostics-segment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* UPLOADER / TEXT INPUT COMPONENT */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-8">
              <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wider">Scorecard Analysis Terminal</h3>
                  <p className="text-xs text-slate-400 font-medium">Input, drag & drop your semester transcripts, or choose an academic prototype below.</p>
                </div>
                
                {/* Template Preset Buttons as shortcuts */}
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPresetTemplate('physics3')}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-250 rounded-lg transition-all"
                  >
                    Physics Sem 3 Template
                  </button>
                  <button
                    onClick={() => loadPresetTemplate('physics1')}
                    className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-250 rounded-lg transition-all"
                  >
                    Physics Sem 1 Template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Text entry / Drag-and-Drop */}
                <div className="lg:col-span-8 space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all min-h-[240px] flex flex-col justify-between overflow-hidden ${
                      isDragging 
                        ? 'border-emerald-600 bg-emerald-50/50' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    {/* Upload progress state overlay */}
                    {fileUploading && (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center rounded-2xl z-20 space-y-3">
                        <RefreshCcw size={24} className="animate-spin text-emerald-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 animate-pulse">Uploading file stream. Prepare OCR models...</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Connecting securely to Sandbox File Server</span>
                      </div>
                    )}

                    {uploadedFileInfo ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                          <FileText size={24} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">{uploadedFileInfo.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Size: {(uploadedFileInfo.size / 1024 / 1024).toFixed(2)} MB • PDF/OCR Document Locked</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium max-w-sm">
                          This document has been uploaded and stored on the Secure Sandbox. Click "Run Diagnostic Agent Engine" to perform OCR and analysis on the backend.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileInfo(null);
                            setRawText("");
                          }}
                          className="py-1 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-[10px] font-bold text-rose-700 uppercase rounded-lg transition-all"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste your subject scorecard, lists of results with scores here (e.g. Mathematical Physics: 85/100, Electromagnetic Theory: 70)... or drop your scorecard text/PDF/Image file here."
                        rows={6}
                        className="w-full text-xs font-semibold uppercase leading-relaxed tracking-wider placeholder:text-slate-300 border-none bg-transparent outline-none focus:ring-0 resize-none text-slate-700"
                      />
                    )}

                    <div className="flex justify-between items-center border-t border-slate-200/60 pt-4 mt-4 flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-slate-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drag/Drop or Paste standard text/PDF/Image transcript</span>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 text-[10px] bg-white border border-slate-200 font-bold uppercase tracking-wider text-slate-605 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Upload size={12} />
                        Browse Files
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".txt,.csv,.json,.pdf,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Side parameters */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Student Academic Context</label>
                    <input
                      type="text"
                      value={studentContext}
                      onChange={(e) => setStudentContext(e.target.value)}
                      placeholder="e.g. B.Sc. Physics (Hons) Student"
                      className="w-full text-xs font-bold border border-slate-200 bg-slate-50 p-3.5 rounded-xl outline-none focus:border-emerald-600 transition-all text-slate-700 uppercase tracking-wide"
                    />
                  </div>

                  <button
                    onClick={handleRunDiagnostics}
                    disabled={diagLoading || (!rawText.trim() && !uploadedFileInfo)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw size={14} className={diagLoading ? "animate-spin" : ""} />
                    <span>Run Diagnostic Agent Engine</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ERROR MSG AND EXTREME LOADING ANIMATION */}
            <AnimatePresence>
              {diagError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-start gap-3 text-xs font-bold text-rose-800 max-w-4xl mx-auto"
                >
                  <AlertCircle size={20} className="shrink-0 text-rose-600" />
                  <div>
                    <h5 className="font-extrabold uppercase mb-1">Diagnostics Agent Error</h5>
                    <p className="font-medium text-rose-700">{diagError}</p>
                  </div>
                </motion.div>
              )}

              {diagLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900 text-slate-100 p-8 rounded-[2rem] shadow-xl border border-slate-800 max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center text-center py-12"
                >
                  {/* Custom Physics Matrix Spin Orbit animation */}
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin" style={{ animationDuration: '6s' }} />
                    <div className="absolute w-16 h-16 rounded-full border border-emerald-500/30 animate-reverse-spin" />
                    <div className="absolute w-10 h-10 rounded-full border border-emerald-400 animate-spin" style={{ animationDuration: '2s' }} />
                    <Atom size={20} className="text-emerald-400 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white uppercase tracking-widest animate-pulse">Running Diagnostic Core</h4>
                    <p className="text-xs text-slate-450 uppercase tracking-wider font-semibold max-w-sm">
                      Please wait while the DeepMind intelligence agent deciphers your transcript score indexes and compiles statistical guidelines.
                    </p>
                  </div>

                  {/* Terminal loading steps stack */}
                  <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left font-mono text-[10px] space-y-2 text-emerald-400 leading-relaxed shadow-inner">
                    {diagLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-emerald-600 font-extrabold shrink-0">{`[ST_0${idx+1}]`}</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DIAGNOSTIC DETAILED REPORTS & RECHARTS GRAPHS */}
            <AnimatePresence>
              {diagResult && !diagLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 animate-in fade-in duration-300"
                >
                  {/* Summary & Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AGGREGATE STANDING</span>
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{diagResult.academicStanding}</h4>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Index</span>
                        <Award size={18} className="text-emerald-600" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">GPA OR PERCENTAGE PERCENTILE</span>
                        <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">{diagResult.gpa}</h4>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Weighted Index</span>
                        <Binary size={18} className="text-emerald-600" />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-4 col-span-1 md:col-span-1">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Primary Discipline</span>
                        <h4 className="text-base font-bold text-slate-800 uppercase tracking-wider truncate">{studentContext}</h4>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Academic Track</span>
                        <Compass size={18} className="text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Graph visualization with Recharts */}
                  <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <FileText size={12} strokeWidth={2} /> Quantitative Scoring Distribution
                      </span>
                      <h3 className="text-xl font-bold text-slate-850">Scholastic Matrix Plot</h3>
                    </div>

                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={diagResult.parsedSubjects}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="subject" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            dx={-10}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                              fontFamily: 'sans-serif',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} 
                            verticalAlign="top" 
                            height={36} 
                          />
                          <Bar 
                            name="Academic Score Achieved" 
                            dataKey="score" 
                            fill="#059669" 
                            radius={[8, 8, 0, 0]} 
                            maxBarSize={45}
                          />
                          <Bar 
                            name="Maximum Scale Margin" 
                            dataKey="maxScore" 
                            fill="#cbd5e1" 
                            radius={[8, 8, 0, 0]} 
                            maxBarSize={45}
                            opacity={0.3}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Overview Text Detail */}
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">DeepMind Scholastic Overview</span>
                    <p className="text-slate-800 text-sm leading-relaxed font-semibold">
                      {diagResult.overview}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-emerald-850 flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-600" /> Key Physics & Mathematical Strengths
                      </h4>
                      <ul className="space-y-3 pl-2">
                        {diagResult.strengths.map((str, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700 font-semibold leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <AlertCircle size={16} className="text-emerald-600" /> Targeted Focus Areas For Improvement
                      </h4>
                      <ul className="space-y-3 pl-2">
                        {diagResult.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700 font-semibold leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggested Research Subfields & Action Items */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Action recommendations list */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-600" /> Prescribed Study Directives
                      </h4>
                      
                      <div className="space-y-4">
                        {diagResult.suggestedActions.map((act, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3.5">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="space-y-1">
                              <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider leading-snug">{act.title}</h5>
                              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{act.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested deep research pathways */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <Compass size={16} className="text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} /> Future Physics Research Prospects
                      </h4>
                      
                      <div className="space-y-3">
                        {diagResult.recommendedResearchSubfields.map((sub, idx) => (
                          <div key={idx} className="p-4 border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-bold uppercase text-slate-800 bg-emerald-50/20">
                            <span>{sub}</span>
                            <ArrowRight size={14} className="text-emerald-600" />
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 text-[10px] text-slate-505 font-bold leading-normal uppercase tracking-wider text-center border border-slate-100">
                        Diagnostics compiled by DeepMind Scholastic Module v2.1
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
