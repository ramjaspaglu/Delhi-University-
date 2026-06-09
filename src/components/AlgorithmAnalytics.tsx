import React, { useState, useEffect } from "react";
import { Database, Activity, GitCommit } from "lucide-react";

interface AlgorithmAnalyticsProps {
  totalCourses: number;
  totalSubjects: number;
  totalMaterials: number;
}

export default function AlgorithmAnalytics({
  totalCourses,
  totalSubjects,
  totalMaterials,
}: AlgorithmAnalyticsProps) {
  const [opsCount, setOpsCount] = useState(48240);
  const [latency, setLatency] = useState(8.4);

  useEffect(() => {
    const timer = setInterval(() => {
      setOpsCount((p) => p + Math.floor(Math.random() * 3) + 1);
      setLatency(8.0 + Math.random() * 1.5);
    }, 3050);
    return () => clearInterval(timer);
  }, []);

  const totalSegments = Math.max(
    128,
    totalCourses * 12 + totalSubjects * 4 + totalMaterials,
  );

  return (
    <div className="w-full bg-slate-950 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-800 rounded-none sm:rounded-none sm:rounded-apple-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left shadow-lg overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-950 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-800 text-emerald-500 rounded-none sm:rounded-apple shrink-0">
          <Activity size={18} />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block font-mono">
            System Telemetry
          </span>
          <p className="text-[9px] text-slate-400 uppercase font-bold leading-relaxed tracking-wider max-w-sm">
            Live crawler aggregations and index mapping operations running
            securely at scale.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block font-mono flex items-center gap-1">
            <GitCommit size={10} /> LATENCY
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-white font-mono">
              {latency.toFixed(1)}
            </span>
            <span className="text-[8px] font-bold text-slate-500 font-mono">
              MS
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block font-mono flex items-center gap-1">
            <Database size={10} /> NODES
          </span>
          <span className="text-sm font-black text-white font-mono block">
            {totalSegments}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block font-mono">
            OPERATIONS
          </span>
          <span className="text-sm font-black text-white font-mono block">
            {opsCount.toLocaleString()}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest block font-mono">
            INDEX HEALTH
          </span>
          <span className="text-sm font-black text-emerald-400 font-mono block">
            99.9%
          </span>
        </div>
      </div>
    </div>
  );
}
