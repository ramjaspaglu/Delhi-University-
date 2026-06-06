import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RhythmicScanner } from './Loader';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  ChevronRight
} from 'lucide-react';
import { Course, Subject, Material } from '../types';

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
  const sizes = ['1.2 MB', '2.4 MB', '1.8 MB', '3.5 MB', '4.2 MB', '850 KB', '5.1 MB', '3.9 MB', '2.3 MB', '6.1 MB', '7.4 MB', '1.5 MB', '4.8 MB'];
  const index = Math.abs(hash) % sizes.length;
  return sizes[index];
};

export default function ResourceAggregator({ 
  courses, 
  onPreviewMaterial,
  bookmarkedIds = [],
  onToggleBookmark
}: ResourceAggregatorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [externalMaterials, setExternalMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'alphabetical'>('upvotes');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourseId, selectedSemester, selectedType, sortBy, selectedTag]);

  // Real-time loading of subjects and materials
  useEffect(() => {
    setLoading(true);
    
    // 1. Listen to all approved subjects
    const unsubscribeSubjects = onSnapshot(
      collection(db, 'subjects'),
      (snapshot) => {
        const subList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Subject)
        );
        setSubjects(subList);
      },
      (error) => {
        console.error('Error fetching subjects:', error);
      }
    );

    // 2. Listen to approved materials
    const unsubscribeMaterials = onSnapshot(
      collection(db, 'materials'),
      (snapshot) => {
        const matList = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Material)
        );
        setMaterials(matList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching materials:', error);
        setLoading(false);
      }
    );

    // 3. Fetch external aggregated content
    fetch('/api/aggregate-du')
      .then(res => res.ok ? res.json() : { links: [] })
      .then(data => {
        if (data && data.links) {
          const externalFormat: Material[] = data.links.map((link: any, i: number) => ({
             id: `ext-${i}-${Math.random().toString(36).substring(2, 6)}`,
             subjectId: 'external', 
             title: link.cleanName || link.name || 'Untitled Source',
             url: link.path,
             type: (link.path.toLowerCase().endsWith('.pdf') ? 'PDF' : 'LINK'),
             author: link.source,
             submittedBy: link.sourceType || 'External Aggregator',
             submittedAt: new Date().toISOString(),
             isApproved: true,
             tags: [link.source, 'community', link.category],
             upvotes: 0,
             downvotes: 0,
             flags: 0,
             description: `Scraped from ${link.source}`
          }));
          setExternalMaterials(externalFormat);
        }
      })
      .catch(err => console.error("Aggregation scrape error:", err));

    return () => {
      unsubscribeSubjects();
      unsubscribeMaterials();
    };
  }, []);

  const handleUpvote = async (materialId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (materialId.startsWith('ext-')) return; // External links cannot be upvoted directly yet
    try {
      const docRef = doc(db, 'materials', materialId);
      await updateDoc(docRef, {
        upvotes: increment(1)
      });
    } catch (error) {
      console.error('Failed to increase upvotes:', error);
    }
  };

  // Build the list of items combined with course & subject data
  const aggregatedData: AggregatedItem[] = [...materials, ...externalMaterials].map((material) => {
    const subject = subjects.find((s) => s.id === material.subjectId) || null;
    const course = subject ? (courses.find((c) => c.id === subject.courseId) || null) : null;
    return { material, subject, course };
  });

  // Calculate popular tags from materials
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    [...materials, ...externalMaterials].forEach((m) => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach((tag) => {
          if (tag && typeof tag === 'string') {
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
      (subject && subject.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject && subject.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course && course.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCourse = selectedCourseId === 'all' || (subject && subject.courseId === selectedCourseId);
    
    const matchesSemester = selectedSemester === 'all' || (subject && subject.semester.toString() === selectedSemester);
    
    const matchesType = selectedType === 'all' || material.type === selectedType;

    const matchesTag = !selectedTag || (material.tags && material.tags.some(t => t.trim().toUpperCase() === selectedTag.toUpperCase()));

    return matchesSearch && matchesCourse && matchesSemester && matchesType && matchesTag;
  });

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = a.material.submittedAt || '';
      const dateB = b.material.submittedAt || '';
      return dateB.localeCompare(dateA);
    }
    if (sortBy === 'upvotes') {
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
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-apple shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query titles, codes, subjects or files..."
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 pl-11 pr-4 py-3 text-[11px] font-bold outline-none transition-all placeholder:text-slate-400 rounded-apple uppercase tracking-wider text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View selectors */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-apple">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tile View"
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Select boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Course filter */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Degree Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester filter */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Semester Level</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
            >
              <option value="all">All Semesters (I - VI)</option>
              <option value="1">Semester I</option>
              <option value="2">Semester II</option>
              <option value="3">Semester III</option>
              <option value="4">Semester IV</option>
              <option value="5">Semester V</option>
              <option value="6">Semester VI</option>
            </select>
          </div>

          {/* Resource Type list */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Resource Format</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
            >
              <option value="all">All Formats</option>
              <option value="PDF">Syllabus PDF</option>
              <option value="NOTES">Notes / Slides</option>
              <option value="VIDEO">Lectures / Media</option>
              <option value="LINK">Official Portal / links</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Rank Ordering</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-slate-200 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
            >
              <option value="upvotes">Upvoting Index (Highest)</option>
              <option value="newest">Freshly Indexed</option>
              <option value="alphabetical">Title Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Popular Tags Cloud */}
        <div className="border-t border-slate-200/85 pt-4 mt-2 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Popular Tags Cloud</span>
              {selectedTag && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] font-black uppercase tracking-wider rounded animate-pulse">
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
                  className={`px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest transition-colors rounded-apple border flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 ${
                    isActive
                      ? 'bg-slate-950 border-slate-950 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                  title={`Filter by tag #${tag}`}
                >
                  <span>#{tag}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none flex items-center justify-center ${
                    isActive ? 'bg-slate-800 text-slate-200 font-extrabold' : 'bg-slate-100 text-slate-500 font-bold'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
            {popularTags.length === 0 && (
              <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest leading-none py-1">No community keywords indexed yet.</p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div id="materials-loader-container" className="border border-dashed border-slate-200 rounded-apple-xl bg-slate-50/40">
          <RhythmicScanner label="Assembling and aggregating index files" />
        </div>
      ) : sortedData.length > 0 ? (
        <div className="space-y-8">
          {viewMode === 'list' ? (
          /* Table View formatting */
          <div className="border border-slate-200 rounded-apple overflow-hidden bg-white shadow-sm">
            <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-1">Type</div>
              <div className="col-span-4">Resource Target</div>
              <div className="col-span-3">Subject & Code</div>
              <div className="col-span-2">Affiliated Course</div>
              <div className="col-span-1 text-center">Score</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="divide-y divide-slate-100">
              {(() => {
                // Group the data by type
                const groups: Record<string, AggregatedItem[]> = {
                  PDF: [],
                  NOTES: [],
                  VIDEO: [],
                  LINK: [],
                  OTHER: []
                };

                paginatedData.forEach((item) => {
                  const type = item.material.type;
                  if (type === 'PDF' || type === 'NOTES' || type === 'VIDEO' || type === 'LINK') {
                    groups[type].push(item);
                  } else {
                    groups.OTHER.push(item);
                  }
                });

                const groupKeys = ['PDF', 'NOTES', 'VIDEO', 'LINK', 'OTHER'] as const;
                const labels: Record<string, string> = {
                  PDF: 'Syllabus PDFs',
                  NOTES: 'Academic Notes & Handouts',
                  VIDEO: 'Lectures & Explanations',
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

                let globalIndex = 0;

                return groupKeys.map((key) => {
                  const groupItems = groups[key];
                  if (!groupItems || groupItems.length === 0) return null;

                  const groupLabel = labels[key];
                  const IconComponent = categoryIcons[key] || FolderOpen;
                  const badgeStyle = categoryStyles[key] || 'bg-slate-100 text-slate-700 border border-slate-200';

                  return (
                    <div key={key} className="flex flex-col">
                      {/* Sub-header banner separating categories */}
                      <div className="bg-slate-50 border-y border-slate-200/65 px-6 py-2.5 flex items-center justify-between select-none">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center p-1 rounded ${badgeStyle}`}>
                            <IconComponent size={11} className="stroke-[2.5px]" />
                          </span>
                          {groupLabel}
                        </span>
                        <span className="text-[8px] font-mono font-black text-slate-400 uppercase bg-slate-100 border border-slate-200/30 px-1.5 py-0.5 rounded">
                          {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
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
                              transition={{ duration: 0.1, delay: Math.min(currentIndex * 0.02, 0.2) }}
                              className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-start lg:items-center px-6 py-4 hover:bg-slate-50/40 text-[11px] font-semibold text-slate-600"
                            >
                              {/* Badge type */}
                              <div className="col-span-1">
                                <span className={`inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${
                                  material.type === 'PDF' ? 'bg-red-50 border border-red-100 text-red-700' :
                                  material.type === 'NOTES' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                                  material.type === 'VIDEO' ? 'bg-amber-50 border border-amber-100 text-amber-700' :
                                  'bg-slate-50 border border-slate-200 text-slate-700'
                                }`}>
                                  {material.type}
                                </span>
                              </div>

                              {/* Title */}
                              <div className="col-span-4 space-y-0.5">
                                <div className="flex items-start gap-1.5 flex-wrap">
                                  {material.type === 'PDF' && (
                                    <>
                                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="PDF Document">
                                        <FileText size={10} className="stroke-[3px]" />
                                        <span>PDF</span>
                                      </span>
                                      <span className="inline-flex items-center gap-1 bg-slate-950 border border-slate-950 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-xs" title="PDF File Size">
                                        {getPdfSize(material.title, material.id)}
                                      </span>
                                    </>
                                  )}
                                  {material.type === 'NOTES' && (
                                    <>
                                      {(material.url.toLowerCase().endsWith('.pdf') || material.type === 'NOTES') && (
                                        <span className="inline-flex items-center gap-1 bg-slate-950 border border-slate-950 text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-xs" title="PDF Notes File Size">
                                          {getPdfSize(material.title, material.id)}
                                        </span>
                                      )}
                                    </>
                                  )}
                                  {(() => {
                                    const isOfficial = !material.tags?.some(tag => tag.toLowerCase().includes('community')) &&
                                                       (!material.submittedBy || material.submittedBy === 'System Seeder');
                                    return isOfficial ? (
                                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Official verified repository content">
                                        <ShieldCheck size={9} className="stroke-[2.5px]" />
                                        <span>Official</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Community-uploaded study material">
                                        <Users size={9} className="stroke-[2.5px]" />
                                        <span>Community</span>
                                      </span>
                                    );
                                  })()}
                                  <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-snug">
                                    {material.title}
                                  </h4>
                                </div>
                                {material.tags && material.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1.5">
                                    {material.tags.map((tag) => {
                                      const cleanTag = tag.trim().toUpperCase();
                                      if (!cleanTag) return null;
                                      const isFilterActive = selectedTag?.toUpperCase() === cleanTag;
                                      return (
                                        <button
                                          key={tag}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTag(isFilterActive ? null : cleanTag);
                                            document.getElementById('materials-aggregator-root')?.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className={`px-1.5 py-0.5 text-[7.5px] font-mono font-black uppercase tracking-wider rounded border transition-colors cursor-pointer ${
                                            isFilterActive
                                              ? 'bg-slate-950 border-slate-950 text-white'
                                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                                          }`}
                                          title={`Filter by tag #${cleanTag}`}
                                        >
                                          #{cleanTag}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {material.submittedBy && (
                                  <div className="pt-0.5">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                      INDEXED BY: {material.submittedBy}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Subject */}
                              <div className="col-span-3">
                                {subject ? (
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide block line-clamp-1">
                                      {subject.name}
                                    </span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                      CODE {subject.code} // SEMESTER {subject.semester}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 uppercase block text-[9px]">unmapped subject</span>
                                )}
                              </div>

                              {/* Course */}
                              <div className="col-span-2">
                                {course ? (
                                  <span className="text-[9px] font-bold text-slate-400 border border-slate-100 bg-slate-50/50 px-2 py-1 rounded line-clamp-1 uppercase tracking-widest inline-block">
                                    {course.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 uppercase block text-[9px]">unmapped course</span>
                                )}
                              </div>

                              {/* Upvote button inline */}
                              <div className="col-span-1 text-center flex lg:justify-center items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleUpvote(material.id, e)}
                                  className="p-1 px-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-slate-400 hover:text-emerald-600 rounded transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <ThumbsUp size={10} />
                                  <span>{material.upvotes || 0}</span>
                                </button>
                              </div>

                              {/* Download/preview trigger */}
                              <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                                {onToggleBookmark && (
                                  <button
                                    type="button"
                                    onClick={() => onToggleBookmark(material)}
                                    className={`p-1.5 rounded border transition-all cursor-pointer ${
                                      bookmarkedIds.includes(material.id)
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                                        : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'
                                    }`}
                                    title={bookmarkedIds.includes(material.id) ? "Saved to Desk" : "Save to Desk"}
                                  >
                                    <BookmarkCheck size={12} />
                                  </button>
                                )}

                                {(material.type === 'PDF' || material.type === 'NOTES' || material.url.toLowerCase().endsWith('.pdf')) ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => onPreviewMaterial(material)}
                                      className="px-2.5 py-1.5 bg-slate-800 text-white hover:bg-emerald-600 rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <FolderOpen size={11} />
                                      <span>View</span>
                                    </button>
                                    <a
                                      href={material.url}
                                      download
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded transition-all cursor-pointer flex items-center justify-center"
                                      title="Download PDF directly"
                                    >
                                      <Download size={11} className="stroke-[2.5px]" />
                                    </a>
                                  </div>
                                ) : (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 rounded text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1"
                                  >
                                    <ExternalLink size={10} />
                                    <span>Visit</span>
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
                  transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-white border border-slate-200 rounded-apple p-6 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${
                          material.type === 'PDF' ? 'bg-red-50 border border-red-100 text-red-700' :
                          material.type === 'NOTES' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                          material.type === 'VIDEO' ? 'bg-amber-50 border border-amber-100 text-amber-700' :
                          'bg-slate-50 border border-slate-200 text-slate-700'
                        }`}>
                          {material.type}
                        </span>
                        {(material.type === 'PDF' || material.type === 'NOTES' || material.url.toLowerCase().endsWith('.pdf')) && (
                          <span className="px-2 py-0.5 text-[8px] font-black font-mono uppercase tracking-widest rounded bg-slate-950 text-white border border-slate-950 shadow-xs" title="PDF File Size">
                            {getPdfSize(material.title, material.id)}
                          </span>
                        )}
                        {(() => {
                          const isOfficial = !material.tags?.some(tag => tag.toLowerCase().includes('community')) &&
                                             (!material.submittedBy || material.submittedBy === 'System Seeder');
                          return isOfficial ? (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Official verified repository content">
                              <ShieldCheck size={9} className="stroke-[2.5px]" />
                              <span>Official</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" title="Community-uploaded study material">
                              <Users size={9} className="stroke-[2.5px]" />
                              <span>Community</span>
                            </span>
                          );
                        })()}
                      </div>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                        SEM: {subject?.semester || 'N/A'}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight line-clamp-2">
                        {material.title}
                      </h3>
                      {course && (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                          {course.name}
                        </span>
                      )}
                    </div>

                    {material.tags && material.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {material.tags.map((tag) => {
                          const cleanTag = tag.trim().toUpperCase();
                          if (!cleanTag) return null;
                          const isFilterActive = selectedTag?.toUpperCase() === cleanTag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(isFilterActive ? null : cleanTag);
                                document.getElementById('materials-aggregator-root')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`px-1.5 py-0.5 text-[7.5px] font-mono font-black uppercase tracking-wider rounded border transition-colors cursor-pointer ${
                                isFilterActive
                                  ? 'bg-slate-950 border-slate-950 text-white'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                              title={`Filter by tag #${cleanTag}`}
                            >
                              #{cleanTag}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Metadata summary */}
                    {subject && (
                      <div className="p-3 bg-slate-50 rounded border border-slate-150 space-y-1 text-[10px]">
                        <span className="font-extrabold text-slate-700 block line-clamp-1">{subject.name}</span>
                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                          <span>CODE: {subject.code}</span>
                          <span>UPLOADS: SYSTEM SEED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer control panel */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(material.id, e)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-slate-500 hover:text-emerald-700 rounded transition-all text-[9.5px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <ThumbsUp size={11} />
                      <span>{material.upvotes || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {onToggleBookmark && (
                        <button
                          type="button"
                          onClick={() => onToggleBookmark(material)}
                          className={`p-1.5 rounded border transition-all cursor-pointer ${
                            bookmarkedIds.includes(material.id)
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-emerald-600 hover:bg-white'
                          }`}
                          title={bookmarkedIds.includes(material.id) ? "Saved to Desk" : "Save to Desk"}
                        >
                          <BookmarkCheck size={12} />
                        </button>
                      )}

                      {(material.type === 'PDF' || material.type === 'NOTES' || material.url.toLowerCase().endsWith('.pdf')) ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewMaterial(material)}
                            className="px-3 py-1.5 bg-slate-850 hover:bg-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <FolderOpen size={11} />
                            <span>Inspect</span>
                          </button>
                          <a
                            href={material.url}
                            download
                            target="_blank"
                            rel="noreferrer noopener"
                            className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded transition-all cursor-pointer flex items-center justify-center"
                            title="Download PDF directly"
                          >
                            <Download size={11} className="stroke-[2.5px]" />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-700 rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <ExternalLink size={10} />
                          <span>Visit Page</span>
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
              Showing <span className="font-extrabold text-slate-900">{startIndex + 1}</span> to <span className="font-extrabold text-slate-900">{endIndex}</span> of <span className="font-extrabold text-slate-900">{totalItems}</span> results
            </div>
            <div className="flex items-center gap-1.5 font-sans">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  document.getElementById('materials-aggregator-root')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-2 border rounded hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 bg-white text-[10px] uppercase font-black ${
                  currentPage === 1 ? 'opacity-40 cursor-not-allowed hover:border-slate-200 hover:text-slate-500 bg-slate-50' : ''
                }`}
              >
                <ChevronLeft size={12} className="stroke-[2.5px]" />
                <span>Prev</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (totalPages > 6 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-slate-305">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page);
                      document.getElementById('materials-aggregator-root')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`min-w-8 h-8 flex items-center justify-center border rounded transition-colors cursor-pointer font-black text-[10px] ${
                      currentPage === page
                        ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-900 hover:border-slate-900'
                        : 'bg-white border-slate-200 hover:border-emerald-600 hover:text-emerald-600 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  document.getElementById('materials-aggregator-root')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-2 border rounded hover:border-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1 bg-white text-[10px] uppercase font-black ${
                  currentPage === totalPages ? 'opacity-40 cursor-not-allowed hover:border-slate-200 hover:text-slate-500 bg-slate-50' : ''
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
        <div className="py-24 text-center bg-slate-50 rounded-apple border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No resources matched this query subset.</p>
        </div>
      )}
    </div>
  );
}
