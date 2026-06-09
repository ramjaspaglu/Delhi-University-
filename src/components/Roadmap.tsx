import React, { useState, useEffect } from "react";
import {
  Search,
  Layers,
  BookOpen,
  ArrowRight,
  Check,
  Award,
  Users,
  Compass,
  FileText,
  X,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Plus,
  Loader2,
  Wand2,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface GrowthStage {
  id: string;
  phase: string;
  name: string;
  subtitle: string;
  status: "COMPLETED" | "ACTIVE" | "PLANNED";
  description: string;
  highlights: string[];
  growthObjectives: {
    label: string;
    details: string;
  }[];
  focusArea: string;
}

const GROWTH_STAGES: GrowthStage[] = [
  {
    id: "stage-1",
    phase: "PHASE 01",
    name: "Academic Hub Foundation",
    subtitle: "Simplified course catalogs and secure library listings",
    status: "COMPLETED",
    description:
      "Launched the core structural catalog matching different Delhi University colleges, undergraduate courses, and individual departments together.",
    focusArea: "Simple Navigation & Core Layout",
    highlights: [
      "Built a clean course directory with simple clicks for fast access",
      "Set up secure, organized lists preventing accidental errors in library files",
    ],
    growthObjectives: [
      {
        label: "Ease of Access",
        details:
          "Validated that first-year students can easily locate their respective degree course.",
      },
    ],
  },
  {
    id: "stage-2",
    phase: "PHASE 02",
    name: "Syllabus & Past Exams Collection",
    subtitle: "Assembling official academic years files",
    status: "COMPLETED",
    description:
      "Gathered and structured past exam question papers and syllabus guides from previous years across major departments.",
    focusArea: "Content Assembly & Verification",
    highlights: [
      "Collected decades of past question papers from diverse university colleges",
      "Sorted messy file names into uniform, easy-to-read document labels",
    ],
    growthObjectives: [
      {
        label: "Catalog Completeness",
        details:
          "Achieved full syllabus document listings across popular degrees.",
      },
    ],
  },
  {
    id: "stage-3",
    phase: "PHASE 03",
    name: "Smart Instant Search Box",
    subtitle: "Typo-tolerant lookup and instant match filters",
    status: "COMPLETED",
    description:
      "Developed an elegant search box that shows corresponding subjects and papers instantly as students type.",
    focusArea: "Search Usability & Response Time",
    highlights: [
      "Allows students to search using either course names or subject codes",
      "Configured fast instant-results logic eliminating annoying loading pauses",
    ],
    growthObjectives: [
      {
        label: "Zero Search Delays",
        details:
          "Trimmed waiting times down to let search updates show up instantly.",
      },
    ],
  },
  {
    id: "stage-4",
    phase: "PHASE 04",
    name: "Automatic Catalog Organization",
    subtitle: "Auto-sorting incoming resource files",
    status: "COMPLETED",
    description:
      "Created automatic organizer tools that read newly added studies and instantly suggest the correct course tab.",
    focusArea: "Catalog Maintenance & Clean Listings",
    highlights: [
      "Auto-detects duplicates and filters out invalid or empty resources",
      "Groups related notes neatly by target class or exam year",
    ],
    growthObjectives: [
      {
        label: "Zero Manual Sorting",
        details:
          "Saves moderator time by automating the categorization of community-added files.",
      },
    ],
  },
  {
    id: "stage-5",
    phase: "PHASE 05",
    name: "Clear In-App Reader Screen",
    subtitle: "Read study notes directly inside the page",
    status: "COMPLETED",
    description:
      "Built a comfortable full-screen reading room where materials render directly inside the page, removing painful downloads.",
    focusArea: "Reading Convenience & Mobile Sizing",
    highlights: [
      "Interactive viewer scales perfectly across tablets, laptops, and smartphones",
      "Secure framing safeguards browser storage against unknown download scripts",
    ],
    growthObjectives: [
      {
        label: "Frictionless Learning",
        details: "Students can check past papers in one single click.",
      },
    ],
  },
  {
    id: "stage-6",
    phase: "PHASE 06",
    name: "Student Feedback & Popular Trends",
    subtitle: "Tracing helpful material files and ratings",
    status: "ACTIVE",
    description:
      "Engineered search tracing trackers and ratings so students can flag and promote the most helpful revision materials.",
    focusArea: "Community Upvoting & Active Stats",
    highlights: [
      "Displays simple view counters and peer ratings on study material lists",
      "Highlights trending notes that got students through busy prep weeks",
    ],
    growthObjectives: [
      {
        label: "Data Transparency",
        details:
          "Enables administrators to see which materials students are actually reading.",
      },
    ],
  },
  {
    id: "stage-7",
    phase: "PHASE 07",
    name: "Academic Summaries & Quick Practice",
    subtitle: "Generating short revision sheets and exam mock sheets",
    status: "ACTIVE",
    description:
      "Adding quick-read subject summaries and simple sample tests right inside subject tabs to help students revise in half the time.",
    focusArea: "Revision Support & Exam Mock Beds",
    highlights: [
      "Summarizes massive chapters down to digestible three-minute read sheets",
      "Provides practical questions matching actual university exam styles",
    ],
    growthObjectives: [
      {
        label: "Grade Improvements",
        details:
          "Empowers students with structured checklist sheets ahead of finals.",
      },
    ],
  },
  {
    id: "stage-8",
    phase: "PHASE 08",
    name: "Offline-First Study Mode",
    subtitle: "Paved offline study files and on-device storage",
    status: "PLANNED",
    description:
      "Planning browser storage support so students can cache entire study booklets locally and read them during offline daily commutes.",
    focusArea: "Resilience Against Spotty Networks",
    highlights: [
      "Allows downloading subject packets directly into secured web browser cache",
      "Maintains full search access across stored notes when internet is disconnected",
    ],
    growthObjectives: [
      {
        label: "Continuous Study",
        details:
          "Guarantees reading availability without relying on active campus Wi-Fi.",
      },
    ],
  },
  {
    id: "stage-9",
    phase: "PHASE 09",
    name: "Synchronized Chat Study Spaces",
    subtitle: "Classroom revisions and collective file feedback",
    status: "PLANNED",
    description:
      "Expanding the platform into an interactive hub where students of the same college can study together and annotate notes collectively.",
    focusArea: "Real-time Class Collaboration",
    highlights: [
      "Allows group chats and mutual study discussions under subject guides",
      "Enables students to share customized revision summaries with peers",
    ],
    growthObjectives: [
      {
        label: "Community Learning",
        details:
          "Enables interactive prep sessions where classmates help solve difficult syllabus questions.",
      },
    ],
  },
  {
    id: "stage-10",
    phase: "PHASE 10",
    name: "Cross-College Sharing Library",
    subtitle: "Unified academic ecosystem across all delhi university colleges",
    status: "PLANNED",
    description:
      "Our final vision of platform growth: uniting isolated Delhi University libraries into a massive, student-managed, shared study library.",
    focusArea: "Platform Maturity & Shared Contributions",
    highlights: [
      "Enables rapid inter-college resource sharing without duplicating archives",
      "Establishes community-led peer curation guidelines for academic quality control",
    ],
    growthObjectives: [
      {
        label: "Unified Resource Network",
        details:
          "Ensures equal access to top-tier notes for students across all campuses.",
      },
    ],
  },
];

export interface FeatureProposal {
  id: string;
  title: string;
  description: string;
  subject: string;
  votes: number;
  status: "PROPOSED" | "IN_RESEARCH" | "UNDER_CONSTRUCTION" | "COMPLETED";
  submittedBy: string;
  createdAt: string;
  milestones?: {
    phaseTitle: string;
    description: string;
    subtasks: string[];
  }[];
}

export const Roadmap = ({ user }: { user?: any }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>("stage-6");
  const [timelineSearch, setTimelineSearch] = useState<string>("");
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [showSubmissionModal, setShowSubmissionModal] =
    useState<boolean>(false);

  // Proposal State Variables
  const [proposals, setProposals] = useState<FeatureProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState<boolean>(true);
  const [proposalTab, setProposalTab] = useState<"LIST" | "CREATE">("LIST");
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(
    null,
  );

  // New Proposal Form State
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSubject, setNewSubject] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [aiGeneratedMilestones, setAiGeneratedMilestones] = useState<
    any[] | null
  >(null);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  // Simple Device Voter Tracking (Persisted in localStorage)
  const [votedIds, setVotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("voted_proposals");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("voted_proposals", JSON.stringify(votedIds));
    } catch (err) {
      console.error("LocalStorage persistence error:", err);
    }
  }, [votedIds]);

  // Real-time proposals sync & bootstrapper
  useEffect(() => {
    const q = query(collection(db, "feature_proposals"));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // Bootstrap defaults
          const defaults: Omit<FeatureProposal, "id">[] = [
            {
              title: "Interactive Quantum Wave Packet Simulation",
              description:
                "Interactive visualization tool illustrating the dispersion of a Gaussian wave packet over time, demonstrating Heisenberg uncertainty principle limits. Includes customized momentum-space Fourier transform curves.",
              subject: "Quantum Mechanics",
              votes: 18,
              status: "IN_RESEARCH",
              submittedBy: "advisor.physics@du.in",
              createdAt: new Date().toISOString(),
              milestones: [
                {
                  phaseTitle:
                    "Phase 1: Mathematical Wave Packet Propagation Engine",
                  description:
                    "Solve the time-dependent Schrödinger equation using split-operator Fourier propagation methods on 1D mesh coordinates.",
                  subtasks: [
                    "Configure fast discrete Fourier transforms for coordinate state maps",
                    "Formulate matrix grid potentials for barrier interaction presets",
                    "Verify propagation stability under varied grid mesh space lengths",
                  ],
                },
                {
                  phaseTitle:
                    "Phase 2: High-velocity Canvas Animation Integration",
                  description:
                    "Formulate hardware-accelerated interactive plot lines illustrating real-time probability density shifts.",
                  subtasks: [
                    "Integrate crisp wave density lines rendering onto flat HTML5 layouts",
                    "Construct click-and-drag potential barriers on active mesh intervals",
                    "Configure dynamic state scaling to prevent plot clipping during dispersion",
                  ],
                },
                {
                  phaseTitle:
                    "Phase 3: Phase Space Trajectories & Uncertainty Checkers",
                  description:
                    "Map instant expectation values and uncertainty products dynamically on active panels.",
                  subtasks: [
                    "Calculate moment integrations for delta-X and delta-P expectation values",
                    "Reroute live data metrics directly into high-contrast secondary plots",
                    "Integrate preset configurations for particle packets inside simple box enclosures",
                  ],
                },
              ],
            },
            {
              title: "Cosmological Redshift & Hubble Expansion Simulator",
              description:
                "Interactive waveform visualizer showing galaxy redshift values across spatial scaling metrics. Demonstrates Doppler changes and relic radiation stretching.",
              subject: "Cosmology and Space Physics",
              votes: 12,
              status: "PROPOSED",
              submittedBy: "cosmo.scholar@du.in",
              createdAt: new Date().toISOString(),
              milestones: [
                {
                  phaseTitle: "Phase 1: Scale Factor & FLRW Metric Solutions",
                  description:
                    "Construct Friedmann equation expansion routines using specific dry density, matter, and radiation scales.",
                  subtasks: [
                    "Program cosmological parameter bounds for flat or open curvature models",
                    "Set up adaptive Runge-Kutta numerical solvers for scaling updates",
                    "Calibrate conformal time coordinate tables across spatial intervals",
                  ],
                },
                {
                  phaseTitle:
                    "Phase 2: Relativistic Light Path Propagation Engine",
                  description:
                    "Calculate wave-stretching ratios of light emissions across expanding spacetime grids.",
                  subtasks: [
                    "Simulate continuous wave stretching on simulated particle lines over time",
                    "Configure visual Doppler hue shifts correlating with redshift values",
                    "Verify photon decay tracking curves across large cosmological distances",
                  ],
                },
                {
                  phaseTitle:
                    "Phase 3: Observational Plot Overlays & Cosmic Datasets",
                  description:
                    "Plot actual historical supernova distance modules against custom model parameters.",
                  subtasks: [
                    "Integrate observational luminosity distance datasets directly onto plots",
                    "Enable multi-parameter sliders to simulate accelerated expansion limits",
                    "Incorporate high-contrast coordinate systems to read relativistic models",
                  ],
                },
              ],
            },
          ];

          try {
            for (const item of defaults) {
              await addDoc(collection(db, "feature_proposals"), item);
            }
          } catch (bootstrapErr) {
            console.error(
              "Failed to bootstrap default proposals in Firestore:",
              bootstrapErr,
            );
          }
        } else {
          const fetched = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as FeatureProposal,
          );

          // Sort by votes descending manually to ensure consistent reactivity
          fetched.sort((a, b) => b.votes - a.votes);
          setProposals(fetched);
          setProposalsLoading(false);
        }
      },
      (error) => {
        console.error("Firestore synchronizer error:", error);
        setProposalsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Vote handler
  const handleVote = async (proposalId: string, value: number) => {
    if (votedIds.includes(proposalId)) return; // Already voted on this device

    try {
      const proposalRef = doc(db, "feature_proposals", proposalId);
      await updateDoc(proposalRef, {
        votes: increment(value),
      });
      setVotedIds((prev) => [...prev, proposalId]);
    } catch (err) {
      console.error("Failed to register vote in database:", err);
    }
  };

  // AI Roadmap Architect triggering
  const handleGenerateAiBreakdown = async () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      setAiError(
        "Please supply both a proposal title and motivation summary first.",
      );
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);
    setAiGeneratedMilestones(null);

    try {
      const res = await fetch("/api/ai/generate-feature-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });

      if (!res.ok) {
        throw new Error(
          "Cluster request failed under high load. Please try again.",
        );
      }

      const data = await res.json();
      if (data.milestones && Array.isArray(data.milestones)) {
        setAiGeneratedMilestones(data.milestones);
      } else {
        throw new Error("AI returned an invalid response blueprint shape.");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setAiError(err.message || "Failed to trigger AI Architect.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Form submit handler
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      const payload: Omit<FeatureProposal, "id"> = {
        title: newTitle,
        description: newDesc,
        subject: newSubject || "General Physics Lab",
        votes: 1,
        status: "PROPOSED",
        submittedBy: user?.email || "Anonymous Student",
        createdAt: new Date().toISOString(),
        milestones: aiGeneratedMilestones || [
          {
            phaseTitle: "Phase 1: Discovery & Mathematical Blueprinting",
            description:
              "Formulate primary mathematical frameworks, research articles, and computational libraries designed for this model.",
            subtasks: [
              "Review foundational literature and syllabus relevance indicators",
              "Identify core processing libraries (Python/NumPy, Julia, C++) suitable for numerical solving",
              "Map necessary data structures and required database collections in Firestore",
            ],
          },
        ],
      };

      await addDoc(collection(db, "feature_proposals"), payload);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setNewTitle("");
        setNewDesc("");
        setNewSubject("");
        setAiGeneratedMilestones(null);
        setSubmissionSuccess(false);
        setProposalTab("LIST");
      }, 3000);
    } catch (err) {
      console.error("Failed to publish feature proposal:", err);
      setAiError("Failed to publish proposal to Firestore.");
    }
  };

  const activeStage =
    GROWTH_STAGES.find((s) => s.id === selectedStageId) || GROWTH_STAGES[5];

  const filteredStages = GROWTH_STAGES.filter((stage) => {
    const q = timelineSearch.toLowerCase();
    return (
      stage.name.toLowerCase().includes(q) ||
      stage.phase.toLowerCase().includes(q) ||
      stage.description.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="w-full text-slate-900 bg-white p-4 sm:p-8 md:p-12 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-2xl shadow-sm text-left font-sans"
      id="road-bento-parent-dashboard"
    >
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-[0.2em] block leading-none">
              PLATFORM ROADMAP &amp; EXPANSION METRICS
            </span>
            <span className="text-[9px] font-extrabold text-slate-500 px-2 py-0.5 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded uppercase tracking-[0.05em]">
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
            <span className="text-[9px] font-black text-emerald-700 px-2 py-0.5 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-150 bg-emerald-50/50 rounded uppercase tracking-[0.05em]">
              Powered by Gemini Google
            </span>
          </div>
          <h2
            className="text-2xl sm:text-4xl font-extrabold text-slate-950 uppercase tracking-tight leading-none"
            id="bento-roadmap-h2"
          >
            10-Phase Expansion Map
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider leading-relaxed">
            Trace how the platform expands from basic course guides and smart
            search boxes to fully integrated peer revision rooms and
            cross-college libraries.
          </p>
        </div>
      </div>

      {/* COMPREHENSIVE BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
        {/* BENTO CELL 1: CURRENT STAGE CONTROLLER */}
        <div className="md:col-span-8 bg-emerald-55/40 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 hover:shadow-sm transition-shadow">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[9px] font-bold px-2.5 py-1 bg-emerald-600 text-white uppercase tracking-widest rounded">
                CURRENT WORKING PHASE
              </span>
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                STATUS: IN DEVELOPMENT
              </span>
            </div>

            <div className="space-y-1.5 text-left">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                {activeStage.phase}: {activeStage.name}
              </h3>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                {activeStage.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-600 font-medium uppercase tracking-wider leading-relaxed text-left max-w-2xl">
              {activeStage.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-200/50">
            <div className="space-y-1 text-left">
              <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-widest block">
                FOCUS OBJECTIVE
              </span>
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tight block">
                {activeStage.focusArea}
              </span>
            </div>
            <div className="space-y-1.5 text-left">
              <span className="text-[8.5px] font-bold text-emerald-800 uppercase tracking-widest block">
                BUILD STATUS
              </span>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-emerald-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 transition-all duration-500"
                    style={{
                      width:
                        activeStage.status === "COMPLETED"
                          ? "100%"
                          : activeStage.status === "ACTIVE"
                            ? "85%"
                            : "20%",
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-emerald-955 font-mono">
                  {activeStage.status === "COMPLETED"
                    ? "100%"
                    : activeStage.status === "ACTIVE"
                      ? "85%"
                      : "PROPOSED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO CELL 2: PLATFORM SUMMARY */}
        <div className="md:col-span-4 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-6 hover:shadow-sm transition-shadow">
          <div className="space-y-3 text-left">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
              DEVELOPER SPECS
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                Active Platform Status
              </h4>
              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide leading-normal">
                Continuous operational development status tracked across Delhi
                University Archive database levels.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                STAGE COVERAGE
              </span>
              <span className="text-2xl font-black text-slate-955">
                10 COMPLETE PHASES
              </span>
            </div>
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                ACTIVE MATURITY INDICATOR
              </span>
              <span className="text-2xl font-black text-emerald-700">
                80% INTEGRATED
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                STABLE VERSION DEPTH
              </span>
              <span className="text-[9.5px] font-bold text-slate-800">
                CAMPUS_RELEASE_V2
              </span>
            </div>
          </div>
        </div>

        {/* BENTO CELL 3: TIMELINE TIMELINE SELECTOR */}
        <div className="md:col-span-4 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-5 rounded-2xl space-y-4 hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div className="space-y-3 text-left">
            <div className="space-y-1">
              <span className="text-[8.5px] font-bold uppercase text-emerald-600 tracking-wider block font-sans">
                EVOLUTION GUIDE
              </span>
              <h4 className="text-xs font-bold text-slate-950 uppercase tracking-tight font-sans">
                Select Step Phase
              </h4>
              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Click any key developmental step below to review its precise
                objectives.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search stages or tags..."
                value={timelineSearch}
                onChange={(e) => setTimelineSearch(e.target.value)}
                className="w-full bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-2 pl-7 text-[8.5px] font-bold uppercase tracking-widest rounded focus:outline-none focus:border-slate-400 text-slate-900 font-sans"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 text-left my-2 scrollbar-thin">
            {filteredStages.map((stg) => {
              const isSelected = stg.id === selectedStageId;
              let stageBadge = "bg-slate-100 text-slate-600";
              if (stg.status === "COMPLETED") {
                stageBadge =
                  "bg-emerald-50 text-emerald-800 border-emerald-100 font-bold";
              } else if (stg.status === "ACTIVE") {
                stageBadge = "bg-emerald-600 text-white font-bold";
              }

              return (
                <button
                  key={stg.id}
                  type="button"
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`w-full text-left p-3 border-y border-x-0 sm:border sm:border-x rounded transition-all cursor-pointer block ${
                    isSelected
                      ? "bg-slate-50 border-emerald-600 text-slate-950"
                      : "bg-white border-slate-100 hover:bg-slate-55 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      {stg.phase}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[6.5px] font-bold uppercase tracking-widest border-transparent ${stageBadge}`}
                    >
                      {stg.status}
                    </span>
                  </div>
                  <h5 className="text-[9.5px] font-black uppercase tracking-tight text-slate-900 leading-tight mt-1">
                    {stg.name}
                  </h5>
                </button>
              );
            })}
          </div>
        </div>

        {/* BENTO CELL 4: DETAILED SPECIFICATIONS VIEW */}
        <div className="md:col-span-8 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-6 sm:p-8 rounded-2xl space-y-6 hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[8.5px] font-bold uppercase text-emerald-600 tracking-widest block font-sans">
              REPRESENTATIVE OUTLINE FOR {activeStage.phase}
            </span>

            {/* Spec highlights */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                PRACTICAL OBJECTIVES AND OUTCOMES:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeStage.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded bg-slate-50/50 flex items-start gap-3 text-left transition-colors hover:border-slate-200"
                  >
                    <div className="p-1 rounded mt-0.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 text-emerald-600">
                      <Check size={11} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-800 uppercase tracking-wider block">
                        OBJECTIVE 0{idx + 1}
                      </p>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Objectives details */}
            <div className="pt-4 border-t border-slate-150 space-y-3">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-sans">
                VERIFIABLE IMPROVEMENT METRIC:
              </h5>
              <div className="space-y-3">
                {activeStage.growthObjectives.map((metric, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded bg-white flex items-start gap-3.5 hover:border-slate-200 transition-colors"
                  >
                    <div className="p-1 rounded-full bg-emerald-50 text-emerald-700 mt-0.5 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 flex-shrink-0">
                      <Check size={12} />
                    </div>
                    <div className="text-left space-y-0.5">
                      <h6 className="text-[9px] font-bold uppercase tracking-tight text-slate-900">
                        {metric.label}
                      </h6>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest leading-relaxed">
                        {metric.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BENTO CELL 5: HOW WE UPGRADE */}
        <div className="md:col-span-6 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-6 rounded-2xl bg-slate-50 text-left space-y-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded text-emerald-700 shadow-sm">
              <Compass size={16} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-bold uppercase text-emerald-600 tracking-widest block">
                QUALITY STANDARDS
              </span>
              <h4 className="text-xs font-bold uppercase tracking-tight text-slate-950">
                How We Upgrade
              </h4>
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-widest leading-loose">
            Every library file goes through dynamic quality steps to ensure
            clear readability. Syllabus updates match official educational
            sheets, and student-reported guidelines are reviewed to keep
            directories complete and secure.
          </p>
          <button
            type="button"
            onClick={() => setShowRevisionModal(true)}
            className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase text-emerald-700 tracking-wider hover:underline hover:text-emerald-850 cursor-pointer text-left border-none bg-transparent p-0"
          >
            <span>Review Revision Guidelines</span> <ArrowRight size={10} />
          </button>
        </div>

        {/* BENTO CELL 6: HOW WE EXPAND */}
        <div className="md:col-span-6 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-6 rounded-2xl bg-slate-50 text-left space-y-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded text-emerald-700 shadow-sm">
              <Users size={16} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-bold uppercase text-emerald-650 tracking-widest block">
                COMMUNITY VALUE
              </span>
              <h4 className="text-xs font-bold uppercase tracking-tight text-slate-950">
                How We Expand
              </h4>
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-widest leading-loose">
            We continuously onboard additional colleges, courses, and unique
            subject chapters based on student suggestions. Volunteer student
            contributors submit verified local study packets to help friends
            learn together on a single hub.
          </p>
          <button
            type="button"
            onClick={() => setShowSubmissionModal(true)}
            className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase text-emerald-700 tracking-wider hover:underline hover:text-emerald-850 cursor-pointer text-left border-none bg-transparent p-0"
          >
            <span>Read Submission Guide</span> <ArrowRight size={10} />
          </button>
        </div>
      </div>

      {/* COMPUTATIONAL LAB FEATURE PLANNER & PROPOSALS */}
      <section className="mt-16 pt-16 border-t border-slate-205 border-slate-200 space-y-10 text-left">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase text-emerald-600 tracking-[0.25em] block leading-none">
            ACADEMIC EXPERIMENTATION SANDBOX
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-950 uppercase tracking-tight">
            Computational Lab Proposal Board
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider leading-relaxed max-w-3xl">
            Propose, inspect, and deconstruct computational physics modules. Use
            the AI Architect to build phase-by-phase development plans before
            publishing them for collaborative review and upvoting.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-slate-200 pb-0.5">
          <button
            type="button"
            onClick={() => setProposalTab("LIST")}
            className={`px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
              proposalTab === "LIST"
                ? "border-emerald-600 text-slate-950 font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Requested Features ({proposals.length})
          </button>
          <button
            type="button"
            onClick={() => setProposalTab("CREATE")}
            className={`px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
              proposalTab === "CREATE"
                ? "border-emerald-600 text-slate-950 font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Draft New Module Proposal
          </button>
        </div>

        {proposalTab === "LIST" ? (
          <div className="space-y-6">
            {proposalsLoading ? (
              <div className="p-16 text-center border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Loading requested models catalog...
                </p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="p-16 text-center border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-dashed border-slate-200 bg-slate-50/50 rounded-2xl space-y-4">
                <Cpu className="text-slate-350 mx-auto w-10 h-10" />
                <div className="space-y-1">
                  <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider">
                    No proposals cataloged
                  </h4>
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest">
                    Be the first researcher to propose a physical analysis
                    simulator!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProposalTab("CREATE")}
                  className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 text-[9px] font-extrabold uppercase tracking-widest rounded transition-all"
                >
                  Create Simulator Proposal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {proposals.map((proposal) => {
                  const isExpanded = expandedProposalId === proposal.id;
                  const alreadyVoted = votedIds.includes(proposal.id);

                  let statusText = "Proposed";
                  let statusColor =
                    "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200";
                  if (proposal.status === "IN_RESEARCH") {
                    statusText = "Under Research";
                    statusColor =
                      "bg-amber-50 text-amber-700 border-amber-200 font-bold";
                  } else if (proposal.status === "UNDER_CONSTRUCTION") {
                    statusText = "In Active Build";
                    statusColor =
                      "bg-blue-55 bg-blue-50 text-blue-700 border-blue-200 font-bold";
                  } else if (proposal.status === "COMPLETED") {
                    statusText = "Constructed & Live";
                    statusColor =
                      "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
                  }

                  return (
                    <div
                      key={proposal.id}
                      className="p-6 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-xl space-y-4 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1.5 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50/50 px-2 py-0.5 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 rounded">
                              {proposal.subject}
                            </span>
                            <span
                              className={`text-[8px] font-black uppercase px-2 py-0.5 border-y border-x-0 sm:border sm:border-x rounded ${statusColor}`}
                            >
                              {statusText}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950">
                            {proposal.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                            <Clock size={11} />
                            <span>Submitted by: {proposal.submittedBy}</span>
                          </div>
                        </div>

                        {/* Vote Action Buttons */}
                        <div className="flex items-center gap-2 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 p-1.5 rounded-lg self-start">
                          <button
                            type="button"
                            disabled={alreadyVoted}
                            onClick={() => handleVote(proposal.id, 1)}
                            className={`p-2 rounded text-xs flex items-center gap-1 cursor-pointer transition-all ${
                              alreadyVoted
                                ? "text-emerald-600 font-black"
                                : "text-slate-500 hover:text-slate-800 hover:bg-white"
                            }`}
                          >
                            <ThumbsUp size={12} />
                            <span className="text-[10px] font-black">
                              {proposal.votes}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Motivation body */}
                      <p className="text-[11px] text-slate-550 text-slate-500 font-semibold leading-relaxed uppercase tracking-wider text-left">
                        {proposal.description}
                      </p>

                      {/* Milestone toggler */}
                      {proposal.milestones &&
                        proposal.milestones.length > 0 && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedProposalId(
                                  isExpanded ? null : proposal.id,
                                )
                              }
                              className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest hover:underline cursor-pointer"
                            >
                              <span>
                                {isExpanded
                                  ? "Hide Deconstructed Milestones"
                                  : "Load AI Deconstructed Milestones"}
                              </span>
                              <ArrowUpRight
                                size={11}
                                className={`transition-transform duration-250 ${isExpanded ? "rotate-45" : ""}`}
                              />
                            </button>

                            {/* Expanded milestones view */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-4"
                                >
                                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block font-mono">
                                    AI ARCHITECT VERIFIED ROADMAP BLUEPRINT
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {proposal.milestones.map((m, mIdx) => (
                                      <div
                                        key={mIdx}
                                        className="p-4 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded bg-slate-50/50 space-y-3 hover:bg-slate-50 transition-colors"
                                      >
                                        <div className="space-y-1">
                                          <div className="text-[7.5px] font-black tracking-widest text-emerald-605 text-emerald-600 font-mono">
                                            MILESTONE 0{mIdx + 1}
                                          </div>
                                          <h4 className="text-[10.5px] font-black uppercase text-slate-800 leading-tight">
                                            {m.phaseTitle}
                                          </h4>
                                        </div>
                                        <p className="text-[9.5px] text-slate-400 font-bold leading-normal uppercase tracking-widest">
                                          {m.description}
                                        </p>
                                        <ul className="text-[9px] text-slate-500 font-semibold leading-normal uppercase tracking-widest space-y-2 border-t border-slate-200/65 pt-2.5 font-sans">
                                          {m.subtasks.map(
                                            (st: string, stIdx: number) => (
                                              <li
                                                key={stIdx}
                                                className="flex gap-2 items-start text-left font-sans"
                                              >
                                                <span className="font-extrabold text-emerald-600 shrink-0">
                                                  &#8250;
                                                </span>
                                                <span>{st}</span>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmitProposal}
            className="p-6 sm:p-10 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-2xl text-left space-y-8"
          >
            <div className="space-y-2 pb-4 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                New Computational Design Proposal
              </h3>
              <p className="text-[9.5px] text-slate-400 font-medium uppercase tracking-widest leading-loose">
                Submit an upgrade request or dynamic experiment module idea. Use
                the AI deconstructor logic below to lay out correct research
                stages.
              </p>
            </div>

            {aiError && (
              <div className="p-4 bg-red-50 text-red-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-red-155 rounded text-[10px] font-bold uppercase tracking-wider">
                {aiError}
              </div>
            )}

            {submissionSuccess ? (
              <div className="p-8 text-center bg-emerald-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-150 rounded-xl space-y-3 text-emerald-800">
                <CheckCircle2 size={32} className="mx-auto" />
                <h4 className="text-[11px] font-black uppercase tracking-widest">
                  UPLINK PUBLISHED
                </h4>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em]">
                  Your simulation proposal was successfully submitted to the
                  student archive hub.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                      Proposed Simulator Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Relativistic Mass Inflation Near Event Horizon"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-3.5 text-xs font-bold uppercase tracking-wider rounded focus:outline-none focus:border-slate-400 text-slate-900"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                      Target Syllabus Subject / Course
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Statistical Mechanics // Nuclear Physics"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                      className="w-full bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-3.5 text-xs font-bold uppercase tracking-wider rounded focus:outline-none focus:border-slate-400 text-slate-900"
                    />
                  </div>
                </div>

                {/* Motivation summary */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                    Abstract Motivation & Scientific Overview
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a functional summary detailing mathematical solver bounds, visual output charts, and theoretical importance to the physical syllabus..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                    className="w-full bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-3.5 text-xs font-bold uppercase tracking-wider leading-relaxed rounded focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>

                {/* AI Blueprint generator trigger */}
                <div className="pt-2 border-t border-slate-150 text-left space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-4 rounded-xl">
                    <div className="space-y-0.5 max-w-xl text-left">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        Physics AI Blueprint Architect
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Query the Gemini API to break down this custom proposal.
                        It maps theoretical formulations, particle solvers, and
                        graphics targets automatically into a 3-Phase milestone
                        plan.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={
                        isAiGenerating || !newTitle.trim() || !newDesc.trim()
                      }
                      onClick={handleGenerateAiBreakdown}
                      className="px-5 py-3.5 bg-slate-950 text-white hover:bg-slate-850 hover:text-white disabled:opacity-40 disabled:hover:bg-slate-950 text-[9px] font-extrabold uppercase tracking-widest rounded flex items-center justify-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto cursor-pointer"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="animate-spin w-4.5 h-4.5" />
                          <span>Mapping Parameters...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          <span>AI Deconstruct Blueprint</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic loader scan text */}
                  {isAiGenerating && (
                    <div className="p-6 bg-slate-950 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-850 rounded-xl space-y-2 animate-pulse text-left font-mono">
                      <p className="text-[8.5px] text-emerald-400 uppercase tracking-widest">
                        &#8250; [AI ARCHITECT CLUSTER INITIATED...]
                      </p>
                      <p className="text-[8px] text-emerald-500 uppercase tracking-widest">
                        &#8250; [READING ACADEMIC FOCUS TARGET:{" "}
                        {newSubject || "General Physics Lab"}]
                      </p>
                      <p className="text-[8px] text-emerald-500 uppercase tracking-widest">
                        &#8250; [RESOLVING SCHRÖDINGER SPECTRA & VECTOR
                        COEFFICIENTS...]
                      </p>
                      <p className="text-[8px] text-emerald-500 uppercase tracking-widest">
                        &#8250; [GENERATING STANDARDIZED 3-STAGE BLUEPRINT
                        SEQUENCE...]
                      </p>
                    </div>
                  )}

                  {/* AI milestones list block if successfully generated */}
                  {aiGeneratedMilestones && (
                    <div className="p-6 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-200 rounded-xl text-left space-y-6">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <Wand2 className="text-emerald-600" size={16} />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          AI Generated Blueprint Breakdown (3 Phases)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {aiGeneratedMilestones.map((m, idx) => (
                          <div
                            key={idx}
                            className="space-y-3 p-4 bg-slate-50 rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 hover:border-slate-300 transition-colors"
                          >
                            <span className="text-[7.5px] font-black text-emerald-600 block font-mono">
                              PHASE METRIC 0{idx + 1}
                            </span>
                            <h4 className="text-[10.5px] font-black uppercase text-slate-800 leading-tight">
                              {m.phaseTitle}
                            </h4>
                            <p className="text-[9.5px] text-slate-400 font-bold leading-normal uppercase tracking-widest">
                              {m.description}
                            </p>
                            <ul className="text-[9px] text-slate-550 text-slate-550 text-slate-500 font-semibold space-y-1.5 pt-2 border-t border-slate-200 uppercase tracking-widest leading-relaxed font-sans">
                              {m.subtasks.map((sub: string, sIdx: number) => (
                                <li
                                  key={sIdx}
                                  className="flex gap-2 items-start text-left font-sans"
                                >
                                  <span className="font-extrabold text-emerald-600 shrink-0">
                                    &#8250;
                                  </span>
                                  <span>{sub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTitle("");
                      setNewDesc("");
                      setNewSubject("");
                      setAiGeneratedMilestones(null);
                      setProposalTab("LIST");
                    }}
                    className="px-6 py-3.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-250 text-slate-700 text-[9px] font-extrabold uppercase tracking-widest rounded hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Reset & Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 text-[9px] font-extrabold uppercase tracking-widest rounded flex items-center gap-2 hover:text-white transition-all cursor-pointer"
                  >
                    <span>Submit Proposal to Student Board</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </section>

      {/* GUIDELINES ACTIVE MODALS */}
      <AnimatePresence>
        {showRevisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100/60 text-emerald-800 rounded-lg">
                    <Compass size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">
                      QUALITY STANDARDS
                    </span>
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                      REVISION QUALITY RULES
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-150 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider leading-relaxed text-left">
                  To protect the integrity of the Delhi University study index,
                  all library resources must pass these precise manual peer
                  checks before activation:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      1
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Document Readability Screen
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Ensure all text, charts, and equations are fully
                        legible. Avoid blurry camera angles or cutoff borders.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      2
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Accurate Target Labels
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Verify syllabus matching. Name your file correctly
                        using: Course Name, Semester, subject title, and paper
                        year.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      3
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Prevent Library Duplication
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Double-check the active search bar. Make sure another
                        classmate back-filled the exact year syllabus or
                        question document beforehand.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      4
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Safety &amp; Compliance Guidelines
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Only upload authentic course guides or educational
                        answer revisions. Any self-promotion, advertising
                        sheets, or unrelated text files are discarded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white hover:text-white text-[9px] font-extrabold uppercase tracking-widest rounded transition-all cursor-pointer"
                >
                  Close &amp; I Understand
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSubmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100/60 text-emerald-800 rounded-lg">
                    <Users size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">
                      COMMUNITY VALUE
                    </span>
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                      SUBMISSION GUIDE
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-150 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider leading-relaxed text-left">
                  Want to contribute to the student archive? Follow these clear
                  steps to add notes and share with classmates properly:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      1
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Navigate to Contribute
                      </p>
                      <p className="text-[10px] text-slate-505 text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Click the "Contribute" button in the menu or page footer
                        to open the simple resource uploader.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      2
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Detail Your Study Notes
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Select the exact Delhi University college, relevant
                        course (e.g. B.Sc. Hons Physical Science), and target
                        subject name.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-650 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      3
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Attach Document or Link
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Provide direct file links (Google Drive, Dropbox) or
                        capture clear images and upload directly onto our
                        storage form.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-155 rounded flex items-start gap-3">
                    <div className="p-1 rounded bg-white text-emerald-655 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-xs font-bold shrink-0">
                      4
                    </div>
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-900">
                        Community Approval
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-relaxed">
                        Student moderators evaluate submissions for accuracy.
                        Once validated, your upload drops into active course
                        archives for everyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white hover:text-white text-[9px] font-extrabold uppercase tracking-widest rounded transition-all cursor-pointer"
                >
                  Understand &amp; Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
