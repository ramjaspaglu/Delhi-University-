import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Database, Network, Cpu, Shield, Globe2, Activity, Binary } from 'lucide-react';

export default function DeepResearchLabs({ user }: { user?: any }) {
  const [activeTab, setActiveTab] = useState<'scraping' | 'crawling' | 'aggregation'>('scraping');

  const modules = {
    scraping: {
      icon: <Cpu size={24} className="text-emerald-400" />,
      title: 'Scraping Engine',
      status: 'ENGINEERING',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      description: 'Building a highly resilient, anti-bot bypassing DOM parsing engine designed for massive scale and pinpoint extraction accuracy across complex web structures.',
      features: ['Dynamic DOM Evaluation', 'Headless Cluster Management', 'Intelligent Proxy Rotation']
    },
    crawling: {
      icon: <Network size={24} className="text-blue-400" />,
      title: 'Crawling Protocol',
      status: 'ARCHITECTING',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      description: 'Designing an intelligent, priority-queued spidering system mapped to dynamically discover and traverse millions of hyperlinked nodes efficiently.',
      features: ['Distributed Frontier Queue', 'Robots/Sitemap Compliance', 'Heuristic Link Routing']
    },
    aggregation: {
      icon: <Database size={24} className="text-indigo-400" />,
      title: 'Aggregation Matrix',
      status: 'blueprint',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      description: 'Synthesizing disparate data pipelines into a unified, clean, and normalized semantic graph for downstream deep research vectorization.',
      features: ['Schema Normalization', 'Deduplication Pipeline', 'Vector Stream Sync']
    }
  };

  return (
    <div className="w-full bg-white text-slate-900 border border-slate-200 p-6 sm:p-10 md:p-14 relative overflow-hidden select-none rounded-[2rem] shadow-sm">
      
      {/* Flat Minimalist Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
              <Binary size={12} className="text-slate-400" />
              <span>CORE INFRASTRUCTURE V4</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight text-slate-950 uppercase leading-none">
              DeepResearch
              <span className="block text-slate-400 font-light tracking-wider italic mt-1 md:mt-2">Systems</span>
            </h1>
          </div>
          
          <div className="text-left md:text-right space-y-1">
            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">System Status</p>
            <div className="flex items-center md:justify-end gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Building Next-Gen Architecture
            </div>
          </div>
        </div>

        {/* Interactive Module Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(modules) as Array<keyof typeof modules>).map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex flex-col items-start p-6 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                  isActive 
                    ? 'bg-slate-50 border-slate-300 shadow-sm' 
                    : 'bg-transparent border-slate-200/60 hover:bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className={`p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm ${isActive ? '' : 'opacity-60'}`}>
                    {modules[key].icon}
                  </div>
                  {isActive && <Activity size={14} className={`${modules[key].textColor} animate-pulse`} />}
                </div>
                <h3 className={`text-sm font-black uppercase tracking-wider font-mono mb-1 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {modules[key].title}
                </h3>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] font-mono ${isActive ? modules[key].textColor : 'text-slate-400'}`}>
                  PHASE: {modules[key].status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Display (Flat, highly legible) */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${modules[activeTab].textColor}`}>
                    TECHNICAL ABSTRACT
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                    {modules[activeTab].title}
                  </h2>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed font-mono uppercase tracking-wide font-medium">
                  {modules[activeTab].description}
                </p>

                <div className="pt-4 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-400">
                    CORE CAPABILITIES
                  </span>
                  <div className="space-y-3 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {modules[activeTab].features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${modules[activeTab].color}`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Representation Diagram (Flat blocks, NO 3D) */}
              <div className="flex items-center justify-center bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                <div className="relative z-10 w-full flex flex-col items-center gap-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-full max-w-[240px] bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3 shadow-sm">
                      <div className={`w-3 h-3 rounded-sm ${modules[activeTab].color} opacity-80`} />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${modules[activeTab].color}`} style={{ width: `${Math.max(30, Math.random() * 100)}%` }} />
                        </div>
                        <div className="h-1.5 w-2/3 bg-slate-200 rounded-full" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                    <Globe2 size={12} className={modules[activeTab].textColor} />
                    SIMULATED NODE TRAFFIC
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono font-black uppercase tracking-widest text-slate-400 border-t border-slate-200 pt-8 gap-4 text-center sm:text-left">
          <span>DEEPRESEARCH ARCHITECTURE LABS // PROTOTYPE SYSTEM</span>
          <span>STAGING ENVIRONMENT ACTIVE</span>
        </div>

      </div>
    </div>
  );
}
