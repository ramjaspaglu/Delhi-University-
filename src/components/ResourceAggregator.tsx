import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RhythmicScanner } from "./Loader";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronsUpDown,
  Download,
  ExternalLink,
  ThumbsUp,
  BookOpen,
  SlidersHorizontal,
  BookmarkCheck,
  FolderOpen,
  FileText,
  Video,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { Course, Subject, Material } from "../types";

interface ResourceAggregatorProps {
  courses: Course[];
  onPreviewMaterial: (material: Material) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (material: Material) => void;
}

interface AggregatedItem {
  material: Material;
  subject: Subject | null;
  course: Course | null;
}

const getPdfSize = (title: string, id: string): string => {
  let hash = 0;
  const combined = (title || "") + (id || "");
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  const sizes = [
    "1.2 MB",
    "2.4 MB",
    "1.8 MB",
    "3.5 MB",
    "4.2 MB",
    "850 KB",
    "5.1 MB",
    "3.9 MB",
    "2.3 MB",
    "6.1 MB",
    "7.4 MB",
    "1.5 MB",
    "4.8 MB",
  ];
  const index = Math.abs(hash) % sizes.length;
  return sizes[index];
};

export default function ResourceAggregator({
  courses,
  onPreviewMaterial,
  bookmarkedIds = [],
  onToggleBookmark,
}: ResourceAggregatorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [externalMaterials, setExternalMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "upvotes" | "alphabetical">(
    "upvotes",
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<"course" | "semester" | "type" | "sort" | null>(null);
  const [courseSearch, setCourseSearch] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCourseId,
    selectedSemester,
    selectedType,
    sortBy,
    selectedTag,
  ]);

  // Real-time loading of subjects and materials
  useEffect(() => {
    setLoading(true);

    // 1. Listen to all approved subjects
    const unsubscribeSubjects = onSnapshot(
      collection(db, "subjects"),
      (snapshot) => {
        const subList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Subject,
        );
        setSubjects(subList);
      },
      (error) => {
        console.error("Error fetching subjects:", error);
      },
    );

    // 2. Listen to approved materials
    const unsubscribeMaterials = onSnapshot(
      collection(db, "materials"),
      (snapshot) => {
        const matList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Material,
        );
        setMaterials(matList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching materials:", error);
        setLoading(false);
      },
    );

    // 3. Fetch external aggregated content
    fetch("/api/aggregate-du")
      .then((res) => (res.ok ? res.json() : { links: [] }))
      .then((data) => {
        if (data && data.links) {
          const externalFormat: Material[] = data.links.map(
            (link: any, i: number) => ({
              id: `ext-${i}-${Math.random().toString(36).substring(2, 6)}`,
              subjectId: "external",
              title: link.cleanName || link.name || "Untitled Source",
              url: link.path,
              type: link.path.toLowerCase().endsWith(".pdf") ? "PDF" : "LINK",
              author: link.source,
              submittedBy: link.sourceType || "External Aggregator",
              submittedAt: new Date().toISOString(),
              isApproved: true,
              tags: [link.source, "community", link.category],
              upvotes: 0,
              downvotes: 0,
              flags: 0,
              description: `Scraped from ${link.source}`,
            }),
          );
          setExternalMaterials(externalFormat);
        }
      })
      .catch((err) => console.error("Aggregation scrape error:", err));

    return () => {
      unsubscribeSubjects();
      unsubscribeMaterials();
    };
  }, []);

  const handleUpvote = async (materialId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (materialId.startsWith("ext-")) return; // External links cannot be upvoted directly yet
    try {
      const docRef = doc(db, "materials", materialId);
      await updateDoc(docRef, {
        upvotes: increment(1),
      });
    } catch (error) {
      console.error("Failed to increase upvotes:", error);
    }
  };

  // Build the list of items combined with course & subject data
  const aggregatedData: AggregatedItem[] = [
    ...materials,
    ...externalMaterials,
  ].map((material) => {
    const subject = subjects.find((s) => s.id === material.subjectId) || null;
    const course = subject
      ? courses.find((c) => c.id === subject.courseId) || null
      : null;
    return { material, subject, course };
  });

  // Calculate popular tags from materials
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    [...materials, ...externalMaterials].forEach((m) => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach((tag) => {
          if (tag && typeof tag === "string") {
            const cleanTag = tag.trim().toUpperCase();
            if (cleanTag) {
              counts[cleanTag] = (counts[cleanTag] || 0) + 1;
            }
          }
        });
      }
    });
    return counts;
  }, [materials]);

  const popularTags = React.useMemo(() => {
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Get top 20 popular tags
  }, [tagCounts]);

  // Apply filters
  const filteredData = aggregatedData.filter((item) => {
    const { material, subject, course } = item;

    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject &&
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject &&
        subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course && course.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse =
      selectedCourseId === "all" ||
      (subject && subject.courseId === selectedCourseId);

    const matchesSemester =
      selectedSemester === "all" ||
      (subject && subject.semester.toString() === selectedSemester);

    const matchesType =
      selectedType === "all" || material.type === selectedType;

    const matchesTag =
      !selectedTag ||
      (material.tags &&
        material.tags.some(
          (t) => t.trim().toUpperCase() === selectedTag.toUpperCase(),
        ));

    return (
      matchesSearch &&
      matchesCourse &&
      matchesSemester &&
      matchesType &&
      matchesTag
    );
  });

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "newest") {
      const dateA = a.material.submittedAt || "";
      const dateB = b.material.submittedAt || "";
      return dateB.localeCompare(dateA);
    }
    if (sortBy === "upvotes") {
      return (b.material.upvotes || 0) - (a.material.upvotes || 0);
    }
    return a.material.title.localeCompare(b.material.title);
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6" id="materials-aggregator-root">
      {/* Search & Sliders Filter Strip */}
      <div className="bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-6 rounded-none sm:rounded-apple shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query titles, codes, subjects or files..."
              className="w-full bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 focus:border-emerald-600 pl-11 pr-4 py-3 text-[11px] font-bold outline-none transition-all placeholder:text-slate-400 rounded-none sm:rounded-apple uppercase tracking-wider text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View selectors */}
            <div className="flex items-center gap-1 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-1 rounded-none sm:rounded-apple">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-slate-100 text-emerald-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-emerald-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Tile View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Select backdrop detector */}
        {openDropdown !== null && (
          <div
            className="fixed inset-0 bg-slate-900/5 backdrop-blur-[0.5px] z-40 transition-opacity"
            onClick={() => {
              setOpenDropdown(null);
              setCourseSearch("");
            }}
          />
        )}

         {/* Filters Custom Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          
          {/* 1. Course Filter */}
          <div className="space-y-1.5 relative z-40 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pointer-events-none select-none">
              Degree Course
            </span>
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(openDropdown === "course" ? null : "course");
                setCourseSearch("");
              }}
              className={`w-full bg-white border-y border-x-0 sm:border sm:border-x text-left text-sm font-semibold tracking-wide p-3 rounded-none sm:rounded-none sm:rounded-apple-xl outline-none transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
                openDropdown === "course"
                  ? "border-emerald-600 ring-2 ring-emerald-500/10 text-emerald-700"
                  : "border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
            >
              <span className="truncate">
                {selectedCourseId === "all"
                  ? `All Courses (${courses.length})`
                  : courses.find((c) => c.id === selectedCourseId)?.name || "Undergraduate Module"}
              </span>
              <motion.div
                animate={{ rotate: openDropdown === "course" ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0"
              >
                <ChevronDown size={14} className={openDropdown === "course" ? "text-emerald-600" : "text-slate-400"} />
              </motion.div>
            </button>

            <AnimatePresence>
              {openDropdown === "course" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-apple z-50 p-2.5 space-y-2"
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Filter courses..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-450"
                    />
                  </div>

                  <div className="max-h-[200px] overflow-y-auto pr-1 space-y-0.5">
                    {/* All Courses Selection */}
                    {(!courseSearch || "all courses".includes(courseSearch.toLowerCase())) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourseId("all");
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCourseId === "all"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>All Courses ({courses.length})</span>
                        {selectedCourseId === "all" && <Check size={12} className="text-emerald-400" />}
                      </button>
                    )}

                    {/* Filtered course items */}
                    {courses
                      .filter((c) => c.name.toLowerCase().includes(courseSearch.toLowerCase()))
                      .map((course) => {
                        const isSel = selectedCourseId === course.id;
                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => {
                              setSelectedCourseId(course.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3.5 py-3 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isSel
                                ? "bg-slate-900 text-white"
                                : "text-slate-650 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{course.name}</span>
                            {isSel && <Check size={12} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}

                    {courses.filter((c) => c.name.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        No matches found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Semester Level Filter */}
          <div className="space-y-1.5 relative z-40 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pointer-events-none select-none">
              Semester Level
            </span>
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(openDropdown === "semester" ? null : "semester");
              }}
              className={`w-full bg-white border-y border-x-0 sm:border sm:border-x text-left text-sm font-semibold tracking-wide p-3 rounded-none sm:rounded-none sm:rounded-apple-xl outline-none transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
                openDropdown === "semester"
                  ? "border-emerald-600 ring-2 ring-emerald-500/10 text-emerald-700"
                  : "border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
            >
              <span className="truncate">
                {selectedSemester === "all"
                  ? "All Semesters (I - VI)"
                  : `Semester ${selectedSemester === "1" ? "I" : selectedSemester === "2" ? "II" : selectedSemester === "3" ? "III" : selectedSemester === "4" ? "IV" : selectedSemester === "5" ? "V" : "VI"}`}
              </span>
              <motion.div
                animate={{ rotate: openDropdown === "semester" ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0"
              >
                <ChevronDown size={14} className={openDropdown === "semester" ? "text-emerald-600" : "text-slate-400"} />
              </motion.div>
            </button>

            <AnimatePresence>
              {openDropdown === "semester" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-apple z-50 p-2 space-y-0.5"
                >
                  {[
                    { id: "all", label: "All Semesters" },
                    { id: "1", label: "Semester I" },
                    { id: "2", label: "Semester II" },
                    { id: "3", label: "Semester III" },
                    { id: "4", label: "Semester IV" },
                    { id: "5", label: "Semester V" },
                    { id: "6", label: "Semester VI" },
                  ].map((sem) => {
                    const isSel = selectedSemester === sem.id;
                    return (
                      <button
                        key={sem.id}
                        type="button"
                        onClick={() => {
                          setSelectedSemester(sem.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSel
                            ? "bg-slate-900 text-white"
                            : "text-slate-660 hover:bg-slate-50"
                        }`}
                      >
                        <span>{sem.label}</span>
                        {isSel && <Check size={12} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Resource Format Filter */}
          <div className="space-y-1.5 relative z-40 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pointer-events-none select-none">
              Resource Format
            </span>
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(openDropdown === "type" ? null : "type");
              }}
              className={`w-full bg-white border-y border-x-0 sm:border sm:border-x text-left text-sm font-semibold tracking-wide p-3 rounded-none sm:rounded-none sm:rounded-apple-xl outline-none transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
                openDropdown === "type"
                  ? "border-emerald-600 ring-2 ring-emerald-500/10 text-emerald-700"
                  : "border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
            >
              <span className="truncate">
                {selectedType === "all"
                  ? "All Formats"
                  : selectedType === "PDF"
                    ? "Syllabus PDF"
                    : selectedType === "NOTES"
                      ? "Notes / Slides"
                      : selectedType === "VIDEO"
                        ? "Lectures / Media"
                        : "Official Portal / Links"}
              </span>
              <motion.div
                animate={{ rotate: openDropdown === "type" ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0"
              >
                <ChevronDown size={14} className={openDropdown === "type" ? "text-emerald-600" : "text-slate-400"} />
              </motion.div>
            </button>

            <AnimatePresence>
              {openDropdown === "type" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-apple z-50 p-2 space-y-0.5"
                >
                  {[
                    { id: "all", label: "All Formats" },
                    { id: "PDF", label: "Syllabus PDF" },
                    { id: "NOTES", label: "Notes / Slides" },
                    { id: "VIDEO", label: "Lectures / Media" },
                    { id: "LINK", label: "Official Portal / Links" },
                  ].map((fmt) => {
                    const isSel = selectedType === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(fmt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSel
                            ? "bg-slate-900 text-white"
                            : "text-slate-660 hover:bg-slate-50"
                        }`}
                      >
                        <span>{fmt.label}</span>
                        {isSel && <Check size={12} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Rank Ordering Filter */}
          <div className="space-y-1.5 relative z-40 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pointer-events-none select-none">
              Rank Ordering
            </span>
            <button
              type="button"
              onClick={() => {
                setOpenDropdown(openDropdown === "sort" ? null : "sort");
              }}
              className={`w-full bg-white border-y border-x-0 sm:border sm:border-x text-left text-sm font-semibold tracking-wide p-3 rounded-none sm:rounded-none sm:rounded-apple-xl outline-none transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
                openDropdown === "sort"
                  ? "border-emerald-600 ring-2 ring-emerald-500/10 text-emerald-700"
                  : "border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: "44px" }}
            >
              <span className="truncate">
                {sortBy === "upvotes"
                  ? "Upvoting Index (Highest)"
                  : sortBy === "newest"
                    ? "Freshly Indexed"
                    : "Title Alphabetical"}
              </span>
              <motion.div
                animate={{ rotate: openDropdown === "sort" ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="shrink-0"
              >
                <ChevronDown size={14} className={openDropdown === "sort" ? "text-emerald-600" : "text-slate-400"} />
              </motion.div>
            </button>

            <AnimatePresence>
              {openDropdown === "sort" && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-apple z-50 p-2 space-y-0.5"
                >
                  {[
                    { id: "upvotes", label: "Upvoting Index (Highest)" },
                    { id: "newest", label: "Freshly Indexed" },
                    { id: "alphabetical", label: "Title Alphabetical" },
                  ].map((srt) => {
                    const isSel = sortBy === srt.id;
                    return (
                      <button
                        key={srt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(srt.id as any);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-3.5 py-3 rounded-none sm:rounded-none sm:rounded-apple-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSel
                            ? "bg-slate-900 text-white"
                            : "text-slate-660 hover:bg-slate-50"
                        }`}
                      >
                        <span>{srt.label}</span>
                        {isSel && <Check size={12} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Popular Tags Cloud */}
        <div className="border-t border-slate-200/85 pt-4 mt-2 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                Popular Tags Cloud
              </span>
              {selectedTag && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-100 text-[8.5px] font-black uppercase tracking-wider rounded animate-pulse">
                  FILTERING: #{selectedTag}
                </span>
              )}
            </div>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[9.5px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                Clear tag filter ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {popularTags.map(([tag, count]) => {
              const isActive = selectedTag?.toUpperCase() === tag.toUpperCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className={`px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-colors rounded-none sm:rounded-apple border-y border-x-0 sm:border sm:border-x flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 ${
                    isActive
                      ? "bg-slate-950 border-slate-950 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                  title={`Filter by tag #${tag}`}
                >
                  <span>#{tag}</span>
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none flex items-center justify-center ${
                      isActive
                        ? "bg-slate-800 text-slate-200 font-extrabold"
                        : "bg-slate-100 text-slate-500 font-bold"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {popularTags.length === 0 && (
              <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest leading-none py-1">
                No community keywords indexed yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div
          id="materials-loader-container"
          className="border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-dashed border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl bg-slate-50/40"
        >
          <RhythmicScanner label="Assembling and aggregating index files" />
        </div>
      ) : sortedData.length > 0 ? (
        <div className="space-y-8">
          {viewMode === "list" ? (
            /* Table View formatting */
            <div className="border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-apple overflow-hidden bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {(() => {
                  // Group the data by type
                  const groups: Record<string, AggregatedItem[]> = {
                    PDF: [],
                    NOTES: [],
                    VIDEO: [],
                    LINK: [],
                    OTHER: [],
                  };

                  paginatedData.forEach((item) => {
                    const type = item.material.type;
                    if (
                      type === "PDF" ||
                      type === "NOTES" ||
                      type === "VIDEO" ||
                      type === "LINK"
                    ) {
                      groups[type].push(item);
                    } else {
                      groups.OTHER.push(item);
                    }
                  });

                  const groupKeys = [
                    "PDF",
                    "NOTES",
                    "VIDEO",
                    "LINK",
                    "OTHER",
                  ] as const;
                  const labels: Record<string, string> = {
                    PDF: "Syllabus PDFs",
                    NOTES: "Academic Notes & Handouts",
                    VIDEO: "Lectures & Explanations",
                    LINK: "Websites & Portals",
                    OTHER: "Other Resources",
                  };

                  const categoryIcons: Record<
                    string,
                    React.ComponentType<any>
                  > = {
                    PDF: FileText,
                    NOTES: BookOpen,
                    VIDEO: Video,
                    LINK: ExternalLink,
                    OTHER: FolderOpen,
                  };

                  const categoryStyles: Record<string, string> = {
                    PDF: "bg-red-50 text-red-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-red-200",
                    NOTES:
                      "bg-emerald-50 text-emerald-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-200",
                    VIDEO: "bg-amber-50 text-amber-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-amber-200",
                    LINK: "bg-blue-50 text-blue-700 border-blue-200",
                    OTHER:
                      "bg-slate-100 text-slate-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200",
                  };

                  let globalIndex = 0;

                  return groupKeys.map((key) => {
                    const groupItems = groups[key];
                    if (!groupItems || groupItems.length === 0) return null;

                    const groupLabel = labels[key];
                    const IconComponent = categoryIcons[key] || FolderOpen;
                    const badgeStyle =
                      categoryStyles[key] ||
                      "bg-slate-100 text-slate-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200";

                    return (
                      <div key={key} className="flex flex-col">
                        {/* Sub-header banner separating categories */}
                        <div className="bg-slate-50 border-y border-slate-200/65 px-6 py-2.5 flex items-center justify-between select-none">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center p-1 rounded ${badgeStyle}`}
                            >
                              <IconComponent
                                size={11}
                                className="stroke-[2.5px]"
                              />
                            </span>
                            {groupLabel}
                          </span>
                          <span className="text-[8px] font-mono font-black text-slate-400 uppercase bg-slate-100 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200/30 px-1.5 py-0.5 rounded">
                            {groupItems.length}{" "}
                            {groupItems.length === 1 ? "item" : "items"}
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 bg-white">
                          {groupItems.map((item) => {
                            const { material, subject, course } = item;
                            const currentIndex = globalIndex++;
                            return (
                              <motion.div
                                key={material.id || currentIndex}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.1,
                                  delay: Math.min(currentIndex * 0.02, 0.2),
                                }}
                                className="flex flex-col lg:flex-row gap-4 items-start lg:items-center px-6 py-5 hover:bg-slate-50/50 transition-colors text-[11px] font-semibold text-slate-600 group"
                              >
                                <div className="flex-1 min-w-0 space-y-2 lg:space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded font-mono ${
                                        material.type === "PDF"
                                          ? "bg-red-50 text-red-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-red-200"
                                          : material.type === "NOTES"
                                            ? "bg-emerald-50 text-emerald-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-200"
                                            : material.type === "VIDEO"
                                              ? "bg-amber-50 text-amber-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-amber-200"
                                              : "bg-slate-100 text-slate-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200"
                                      }`}
                                    >
                                      {material.type}
                                    </span>

                                    {subject && (
                                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 border-dashed text-slate-500 font-mono">
                                        {subject.code}
                                      </span>
                                    )}

                                    {course && (
                                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-slate-100 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-600 font-mono hidden sm:inline-block">
                                        {course.name}
                                      </span>
                                    )}

                                    {material.type === "PDF" && (
                                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded bg-slate-900 text-slate-100 font-mono">
                                        {getPdfSize(
                                          material.title,
                                          material.id,
                                        )}
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-700 transition-colors line-clamp-1">
                                      {material.title}
                                    </h4>
                                    {subject && (
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                        <span>Sem {subject.semester}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="line-clamp-1">
                                          {subject.name}
                                        </span>
                                        {material.submittedBy && (
                                          <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="font-mono">
                                              IDX BY: {material.submittedBy}
                                            </span>
                                          </>
                                        )}
                                      </p>
                                    )}
                                  </div>

                                  {material.tags &&
                                    material.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        {material.tags.map((tag) => {
                                          const cleanTag = tag
                                            .trim()
                                            .toUpperCase();
                                          if (!cleanTag) return null;
                                          return (
                                            <span
                                              key={tag}
                                              className="text-[7.5px] font-mono font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-1 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 rounded"
                                            >
                                              #{cleanTag}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 shrink-0 mt-3 lg:mt-0 w-full lg:w-auto">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-[10px] font-black mr-2">
                                    <button
                                      onClick={(e) =>
                                        handleUpvote(material.id, e)
                                      }
                                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                                    >
                                      <ThumbsUp size={12} />
                                    </button>
                                    <span className="text-slate-600 font-mono w-6 text-center">
                                      {material.upvotes || 0}
                                    </span>
                                  </div>

                                  {onToggleBookmark && (
                                    <button
                                      onClick={() => onToggleBookmark(material)}
                                      className={`p-2 rounded border-y border-x-0 sm:border sm:border-x transition-colors ${
                                        bookmarkedIds.includes(material.id)
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                          : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <BookmarkCheck size={14} />
                                    </button>
                                  )}

                                  {material.type === "PDF" ||
                                  material.type === "NOTES" ||
                                  material.url
                                    .toLowerCase()
                                    .endsWith(".pdf") ? (
                                    <div className="flex items-center gap-1 flex-1 lg:flex-none">
                                      <button
                                        onClick={() =>
                                          onPreviewMaterial(material)
                                        }
                                        className="flex-1 lg:flex-none px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                      >
                                        <FolderOpen size={12} /> View
                                      </button>
                                      <a
                                        href={material.url}
                                        download
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="p-2 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded transition-colors flex items-center justify-center"
                                      >
                                        <Download size={14} />
                                      </a>
                                    </div>
                                  ) : (
                                    <a
                                      href={material.url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="flex-1 lg:flex-none px-5 py-2 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                    >
                                      <ExternalLink size={12} /> Visit Target
                                    </a>
                                  )}
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
            </div>
          ) : (
            /* Grid Card Format */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((item, index) => {
                const { material, subject, course } = item;
                return (
                  <motion.div
                    key={material.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl p-5 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded font-mono ${
                              material.type === "PDF"
                                ? "bg-red-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-red-200 text-red-700"
                                : material.type === "NOTES"
                                  ? "bg-emerald-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-emerald-200 text-emerald-700"
                                  : material.type === "VIDEO"
                                    ? "bg-amber-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-amber-200 text-amber-700"
                                    : "bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-700"
                            }`}
                          >
                            {material.type}
                          </span>
                          {(material.type === "PDF" ||
                            material.type === "NOTES" ||
                            material.url.toLowerCase().endsWith(".pdf")) && (
                            <span
                              className="px-2 py-0.5 text-[8px] font-black font-mono uppercase tracking-widest rounded bg-slate-900 text-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-900 shadow-xs"
                              title="PDF File Size"
                            >
                              {getPdfSize(material.title, material.id)}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest font-mono">
                          {subject?.code || "NO-MAP"}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                          {material.title}
                        </h3>
                        {course && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 px-1.5 py-0.5 rounded inline-block font-mono">
                            {course.name}
                          </span>
                        )}
                      </div>

                      {material.tags && material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {material.tags.map((tag) => {
                            const cleanTag = tag.trim().toUpperCase();
                            if (!cleanTag) return null;
                            return (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-[7.5px] font-mono font-black uppercase tracking-wider rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 bg-slate-50 text-slate-400"
                              >
                                #{cleanTag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Metadata summary */}
                      {subject && (
                        <div className="p-3 bg-slate-50 rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 space-y-1.5 text-[10px]">
                          <span className="font-extrabold text-slate-700 block line-clamp-1">
                            {subject.name}
                          </span>
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">
                            <span>SEM {subject.semester}</span>
                            <span>
                              UPLOADS:{" "}
                              {material.submittedBy
                                ? material.submittedBy.substring(0, 8)
                                : "SYSTEM"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer control panel */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-[10px] font-black mr-2">
                        <button
                          onClick={(e) => handleUpvote(material.id, e)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <span className="text-slate-600 font-mono w-6 text-center">
                          {material.upvotes || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onToggleBookmark && (
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(material)}
                            className={`p-2 rounded border-y border-x-0 sm:border sm:border-x transition-colors ${
                              bookmarkedIds.includes(material.id)
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-slate-50"
                            }`}
                            title={
                              bookmarkedIds.includes(material.id)
                                ? "Saved to Desk"
                                : "Save to Desk"
                            }
                          >
                            <BookmarkCheck size={14} />
                          </button>
                        )}

                        {material.type === "PDF" ||
                        material.type === "NOTES" ||
                        material.url.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onPreviewMaterial(material)}
                              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                              <FolderOpen size={12} /> Inspect
                            </button>
                            <a
                              href={material.url}
                              download
                              target="_blank"
                              rel="noreferrer noopener"
                              className="p-2 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded transition-colors flex items-center justify-center"
                              title="Download PDF directly"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        ) : (
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="px-4 py-2 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                          >
                            <ExternalLink size={12} /> Visit Page
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Dynamic Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-150 text-[11px] select-none text-slate-500 font-bold uppercase tracking-wide">
              <div>
                Showing{" "}
                <span className="font-extrabold text-slate-900">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-extrabold text-slate-900">
                  {endIndex}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-slate-900">
                  {totalItems}
                </span>{" "}
                results
              </div>
              <div className="flex items-center gap-1.5 font-sans">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    document
                      .getElementById("materials-aggregator-root")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-3 py-2 border-y border-x-0 sm:border sm:border-x rounded hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 bg-white text-[10px] uppercase font-black ${
                    currentPage === 1
                      ? "opacity-40 cursor-not-allowed hover:border-slate-200 hover:text-slate-500 bg-slate-50"
                      : ""
                  }`}
                >
                  <ChevronLeft size={12} className="stroke-[2.5px]" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      totalPages > 6 &&
                      page !== 1 &&
                      page !== totalPages &&
                      Math.abs(page - currentPage) > 1
                    ) {
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <span key={page} className="px-1 text-slate-305">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => {
                          setCurrentPage(page);
                          document
                            .getElementById("materials-aggregator-root")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`min-w-8 h-8 flex items-center justify-center border-y border-x-0 sm:border sm:border-x rounded transition-colors cursor-pointer font-black text-[10px] ${
                          currentPage === page
                            ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-900 hover:border-slate-900"
                            : "bg-white border-slate-200 hover:border-emerald-600 hover:text-emerald-600 text-slate-600"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    document
                      .getElementById("materials-aggregator-root")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-3 py-2 border-y border-x-0 sm:border sm:border-x rounded hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 bg-white text-[10px] uppercase font-black ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed hover:border-slate-200 hover:text-slate-500 bg-slate-50"
                      : ""
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight size={12} className="stroke-[2.5px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-slate-50 rounded-none sm:rounded-apple border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
            No resources matched this query subset.
          </p>
        </div>
      )}
    </div>
  );
}
