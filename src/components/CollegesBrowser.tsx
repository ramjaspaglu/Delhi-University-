import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  List,
} from "lucide-react";
import { College } from "../types";
import { DU_COLLEGES_DATA } from "../data";

interface CollegesBrowserProps {
  onSelectCourseByName: (courseName: string) => void;
}

export default function CollegesBrowser({
  onSelectCourseByName,
}: CollegesBrowserProps) {
  const [selectedCampus, setSelectedCampus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const campuses = ["All", "North Campus", "South Campus", "Off-Campus"];

  // Map DU_COLLEGES_DATA to typed College array
  const colleges: College[] = DU_COLLEGES_DATA.map((col, index) => ({
    id: `college-${index}`,
    name: col.name,
    campus: col.campus,
    established: col.established,
    address: col.address,
    description: col.description,
    courseNames: col.courseNames,
  }));

  const filteredColleges = colleges.filter((college) => {
    const matchesCampus =
      selectedCampus === "All" || college.campus === selectedCampus;
    const matchesSearch =
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.courseNames.some((cName) =>
        cName.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesCampus && matchesSearch;
  });

  return (
    <div className="space-y-8" id="colleges-browser-container">
      {/* Search, Filters, and Layout Switcher Strip */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-5 rounded-none sm:rounded-none sm:rounded-apple-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search colleges, campus, or course details..."
            className="w-full bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 focus:border-emerald-600 pl-11 pr-4 py-3 text-[11px] font-bold outline-none transition-all placeholder:text-slate-400 rounded-none sm:rounded-apple uppercase tracking-wider text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Campus filters */}
          <div className="flex items-center gap-1 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-1 rounded-none sm:rounded-apple max-w-full overflow-x-auto no-scrollbar flex-nowrap scroll-smooth">
            {campuses.map((campus) => (
              <button
                key={campus}
                onClick={() => setSelectedCampus(campus)}
                className={`px-3 sm:px-4 py-2 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  selectedCampus === campus
                    ? "bg-emerald-600 text-white"
                    : "bg-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {campus}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-1 rounded-none sm:rounded-apple">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-slate-100 text-emerald-600"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-100 text-emerald-600"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {filteredColleges.length > 0 ? (
        viewMode === "list" ? (
          /* Proper Tabular List Format */
          <div className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-2xl overflow-hidden shadow-sm">
            {/* Headers */}
            <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">College Profile</div>
              <div className="col-span-2">Campus Zone</div>
              <div className="col-span-1">Established</div>
              <div className="col-span-5">
                Offered Degree Nodes (Click to load syllabus)
              </div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100">
              {filteredColleges.map((college, idx) => (
                <motion.div
                  key={college.id || idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: Math.min(idx * 0.03, 0.3),
                  }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start lg:items-center px-6 py-6 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Title & Description column */}
                  <div className="col-span-12 lg:col-span-4 space-y-2">
                    <div className="space-y-0.5">
                      <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                        {college.name}
                      </h3>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} className="text-slate-300" />
                        <span>{college.address}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight">
                      {college.description}
                    </p>
                  </div>

                  {/* Campus Zone column */}
                  <div className="col-span-6 lg:col-span-2">
                    <span
                      className={`inline-block px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded ${
                        college.campus === "North Campus"
                          ? "bg-indigo-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-indigo-100 text-indigo-700"
                          : college.campus === "South Campus"
                            ? "bg-amber-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-amber-100 text-amber-700"
                            : "bg-slate-100 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 text-slate-700"
                      }`}
                    >
                      {college.campus}
                    </span>
                  </div>

                  {/* Estd column */}
                  <div className="col-span-6 lg:col-span-1">
                    <div className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1 lg:block">
                      <span className="lg:hidden text-[9px] text-slate-400 uppercase tracking-widest block font-black mr-1">
                        ESTD:
                      </span>
                      <Calendar
                        size={12}
                        className="inline-block lg:hidden mr-1 text-slate-300"
                      />
                      <span>{college.established}</span>
                    </div>
                  </div>

                  {/* Syllabus / Courses column */}
                  <div className="col-span-12 lg:col-span-5">
                    <div className="flex flex-wrap gap-1.5">
                      {college.courseNames.map((courseName) => (
                        <button
                          key={courseName}
                          onClick={() => onSelectCourseByName(courseName)}
                          className="px-2 py-1 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 hover:border-emerald-600 text-[8px] font-black text-slate-600 hover:text-emerald-700 transition-all rounded uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                        >
                          <GraduationCap
                            size={10}
                            className="text-slate-300 shrink-0"
                          />
                          <span>{courseName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View Layout (with correct matching properties) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college, idx) => (
              <motion.div
                key={college.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.4) }}
                className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-2xl p-6 hover:shadow-md hover:border-emerald-500/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span
                      className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded ${
                        college.campus === "North Campus"
                          ? "bg-indigo-50 text-indigo-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-indigo-100"
                          : college.campus === "South Campus"
                            ? "bg-amber-50 text-amber-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-amber-100"
                            : "bg-slate-50 text-slate-700 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200"
                      }`}
                    >
                      {college.campus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={11} /> ESTD {college.established}
                    </span>
                  </div>

                  {/* Title and location */}
                  <div className="space-y-1">
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                      {college.name}
                    </h3>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-start gap-1">
                      <MapPin
                        className="shrink-0 text-slate-300 mt-0.5"
                        size={11}
                      />
                      <span>{college.address}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight line-clamp-3">
                    {college.description}
                  </p>

                  {/* Course links */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                      Available Cycles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {college.courseNames.map((courseName) => (
                        <button
                          key={courseName}
                          onClick={() => onSelectCourseByName(courseName)}
                          className="px-2 py-1 bg-slate-50/80 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 text-[8px] font-black text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 uppercase tracking-widest rounded transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <GraduationCap size={9} />
                          <span>{courseName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-slate-300">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Delhi University Affiliated
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="py-24 text-center bg-slate-50 rounded-none sm:rounded-none sm:rounded-apple-2xl border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-dashed border-slate-200">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
            No matching DU colleges found
          </p>
        </div>
      )}
    </div>
  );
}
