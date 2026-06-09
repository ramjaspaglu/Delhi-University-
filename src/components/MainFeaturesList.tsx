import React from "react";
import { motion } from "motion/react";
import {
  Search,
  Layers,
  BookOpen,
  Archive,
  PlusCircle,
  Folder,
  CheckCircle,
} from "lucide-react";

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  subtitle: string;
  details: string[];
}

export default function MainFeaturesList() {
  const features: FeatureItem[] = [
    {
      id: "feature-search",
      icon: Search,
      title: "Global Search Engine",
      subtitle: "Instant academic asset indexing",
      details: [
        "Real-time fuzzy search across major courses & subjects",
        "Direct keyword matching for notes, PDFs, and official files",
        "Automatic redirection with instant state sync",
      ],
    },
    {
      id: "feature-trackers",
      icon: Layers,
      title: "100% Free & Open Source",
      subtitle: "Permanently accessible public archive",
      details: [
        "100% open-source, community-governed public index",
        "Strictly zero paywalls or subscription gates ever",
        "Licensed transparently for student academic access",
      ],
    },
    {
      id: "feature-colleges",
      icon: BookOpen,
      title: "DU Colleges & Degrees Directory",
      subtitle: "Campus-wide curriculum mapping",
      details: [
        "List and Grid viewports for North, South, and Off-Campus colleges",
        "Direct links from offered courses to live syllabus contents",
        "Includes established dates, physical addresses, and academic scope",
      ],
    },
    {
      id: "feature-pyq",
      icon: Archive,
      title: "Archival PYQ Repository",
      subtitle: "Organized core exam packages",
      details: [
        "Permanent library cataloging past university cycles",
        "Clean high-contrast download tables for files",
        "Direct redirection to official educational resources",
      ],
    },
    {
      id: "feature-contrib",
      icon: PlusCircle,
      title: "Moderated Share Portal",
      subtitle: "Peer-to-peer scholarly coordination",
      details: [
        "Simple community note submission form",
        "Clean local storage tracking for customized uploads",
        "Automated directory schema mapping for new course suggestions",
      ],
    },
    {
      id: "feature-folders",
      icon: Folder,
      title: "Structured Syllabus Viewports",
      subtitle: "Semester-by-semester node mapping",
      details: [
        "Chronological semester groupings (I to VI)",
        "Extracted list of chapters, core units, and elective papers",
        "Embedded material previews and syllabus downloads",
      ],
    },
  ];

  return (
    <section
      className="space-y-12 py-16 border-t border-slate-100"
      id="platform-key-features"
    >
      <div className="text-center space-y-4">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-600 block">
          Platform Architecture
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
          Core System Capabilities
        </h2>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-tight max-w-2xl mx-auto">
          Delivering a reliable, highly indexed, and community-driven resource
          index for university schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
              className="p-5 sm:p-6 lg:p-8 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200/80 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-sm hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex flex-col justify-between hover:shadow-md group"
              id={feat.id}
            >
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 text-emerald-600 flex items-center justify-center rounded-none sm:rounded-apple shadow-emerald-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Icon size={20} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-900 leading-none">
                    {feat.title}
                  </h3>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                    {feat.subtitle}
                  </p>
                </div>

                <ul className="space-y-3 pt-2 text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                  {feat.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={12}
                        className="text-emerald-600 shrink-0 mt-0.5"
                      />
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
