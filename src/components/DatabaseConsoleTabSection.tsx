import React, { useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Lock,
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  Search,
  Filter,
  RefreshCw,
  Server,
  Terminal,
  Activity,
  PlusCircle,
  HelpCircle,
  X,
  FileText,
  Bookmark,
  Layers,
} from "lucide-react";

interface DatabaseConsoleProps {
  courses: any[];
  subjects: any[];
  materials: any[];
}

interface LogEntry {
  type: "info" | "success" | "error" | "sql";
  text: string;
  timestamp: string;
}

export function DatabaseConsoleTabSection({
  courses,
  subjects,
  materials,
}: DatabaseConsoleProps) {
  // Lock mechanism matches PIN 4809
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");

  // Mode: 'excel' (Spreadsheet Grid) | 'sql' (SQL Terminal CLI) | 'ai' (AI Consultaion)
  const [activeMode, setActiveMode] = useState<"excel" | "sql" | "ai">("excel");

  // Selected Active Spreadsheet/Table
  const [activeSheet, setActiveSheet] = useState<"courses" | "subjects" | "materials">("materials");

  // Filter/Search variables
  const [gridQuery, setGridQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // materials only
  const [filterSubject, setFilterSubject] = useState("ALL"); // materials only

  // Input states for INSERT ROW manually
  const [inCourseName, setInCourseName] = useState("");
  const [inCourseDesc, setInCourseDesc] = useState("");

  const [inSubjectName, setInSubjectName] = useState("");
  const [inSubjectCode, setInSubjectCode] = useState("");
  const [inSubjectSem, setInSubjectSem] = useState(1);
  const [inSubjectCourseId, setInSubjectCourseId] = useState("");
  const [inSubjectDesc, setInSubjectDesc] = useState("");

  const [inMaterialTitle, setInMaterialTitle] = useState("");
  const [inMaterialUrl, setInMaterialUrl] = useState("");
  const [inMaterialType, setInMaterialType] = useState<"PDF" | "VIDEO" | "LINK" | "NOTES">("PDF");
  const [inMaterialSubjectId, setInMaterialSubjectId] = useState("");
  const [inMaterialSynthId, setInMaterialSynthId] = useState("");
  const [inMaterialApproved, setInMaterialApproved] = useState(true);

  // Editing Row Tracking State (Excel Spreadsheet Mode)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<any>({});

  // Command-Line Raw SQL Module Variables
  const [sqlCommand, setSqlCommand] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([
    {
      type: "info",
      text: "System direct manual memory manager online. Connection authenticated.",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      type: "info",
      text: "Manual SQL command router deployed. Ready for direct catalog mutations.",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      type: "info",
      text: "Type SQL queries or tap quick-fill blueprints below to commit modifications manually.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // AI Chat Consultant variables
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: string; text: string }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const addTermLog = (type: LogEntry["type"], text: string) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // SQL REGEX PARSER AND MANUAL EXECUTIVE
  const handleExecuteRawSQL = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryStr = sqlCommand.trim();
    if (!queryStr) return;

    // Echo SQL statement
    addTermLog("sql", queryStr);
    setSqlCommand("");

    // Strip trailing semicolon
    const cleanQuery = queryStr.endsWith(";")
      ? queryStr.substring(0, queryStr.length - 1).trim()
      : queryStr;

    try {
      // 1. MATCH INSERT INTO courses
      const insertCourseMatch = cleanQuery.match(
        /INSERT\s+INTO\s+courses\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
      );
      if (insertCourseMatch) {
        addTermLog("info", "Compiling query: Mapped INSERT matching courses...");
        const fields = insertCourseMatch[1].split(",").map((f) => f.trim().replace(/['"`]/g, ""));
        const rawValues = insertCourseMatch[2].split(",");
        
        let name = "";
        let description = "";

        fields.forEach((field, idx) => {
          const val = (rawValues[idx] || "").trim().replace(/^'|'$/g, "").replace(/^"|"$/g, "");
          if (field.toLowerCase() === "name") name = val;
          if (field.toLowerCase() === "description") description = val;
        });

        if (!name) {
          throw new Error("Violates table constraints: 'name' is a required field for courses.");
        }

        const payload = { name, description };
        addTermLog("info", `Firebase mapping: addDoc(collection(db, "courses"), ${JSON.stringify(payload)})`);
        
        const docRef = await addDoc(collection(db, "courses"), payload);
        addTermLog("success", `Transaction complete. Row added. Document ID: ${docRef.id}`);
        return;
      }

      // 2. MATCH INSERT INTO subjects
      const insertSubjectMatch = cleanQuery.match(
        /INSERT\s+INTO\s+subjects\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
      );
      if (insertSubjectMatch) {
        addTermLog("info", "Compiling query: Mapped INSERT matching subjects...");
        const fields = insertSubjectMatch[1].split(",").map((f) => f.trim().replace(/['"`]/g, ""));
        const rawValues = insertSubjectMatch[2].split(",");

        let name = "";
        let code = "";
        let semester = 1;
        let courseId = "";
        let description = "";

        fields.forEach((field, idx) => {
          const val = (rawValues[idx] || "").trim().replace(/^'|'$/g, "").replace(/^"|"$/g, "");
          if (field.toLowerCase() === "name") name = val;
          if (field.toLowerCase() === "code") code = val;
          if (field.toLowerCase() === "semester") semester = parseInt(val) || 1;
          if (field.toLowerCase() === "courseid") courseId = val;
          if (field.toLowerCase() === "description") description = val;
        });

        if (!name || !code || !courseId) {
          throw new Error("Violates table constraints: 'name', 'code', 'courseId' are required fields for subjects.");
        }

        const payload = { name, code, semester, courseId, description };
        addTermLog("info", `Firebase mapping: addDoc(collection(db, "subjects"), ${JSON.stringify(payload)})`);

        const docRef = await addDoc(collection(db, "subjects"), payload);
        addTermLog("success", `Transaction complete. Row added. Document ID: ${docRef.id}`);
        return;
      }

      // 3. MATCH INSERT INTO materials
      const insertMaterialMatch = cleanQuery.match(
        /INSERT\s+INTO\s+materials\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
      );
      if (insertMaterialMatch) {
        addTermLog("info", "Compiling query: Mapped INSERT matching materials...");
        const fields = insertMaterialMatch[1].split(",").map((f) => f.trim().replace(/['"`]/g, ""));
        const rawValues = insertMaterialMatch[2].split(",");

        let title = "";
        let url = "";
        let type = "PDF";
        let subjectId = "";
        let synthId = "";
        let isApproved = true;

        fields.forEach((field, idx) => {
          const val = (rawValues[idx] || "").trim().replace(/^'|'$/g, "").replace(/^"|"$/g, "");
          if (field.toLowerCase() === "title") title = val;
          if (field.toLowerCase() === "url") url = val;
          if (field.toLowerCase() === "type") type = val;
          if (field.toLowerCase() === "subjectid") subjectId = val;
          if (field.toLowerCase() === "synthid") synthId = val;
          if (field.toLowerCase() === "isapproved") isApproved = val.toLowerCase() === "true" || val === "1";
        });

        if (!title || !url || !subjectId) {
          throw new Error("Violates table constraints: 'title', 'url', 'subjectId' are required fields for materials.");
        }

        const payload = {
          title,
          url,
          type: type as any,
          subjectId,
          synthId: synthId || null,
          isApproved,
          upvotes: 0,
          downvotes: 0,
          flags: 0,
          createdAt: new Date().toISOString(),
        };

        addTermLog("info", `Firebase mapping: addDoc(collection(db, "materials"), ${JSON.stringify(payload)})`);

        const docRef = await addDoc(collection(db, "materials"), payload);
        addTermLog("success", `Transaction complete. Row added. Document ID: ${docRef.id}`);
        return;
      }

      // 4. MATCH DELETE FROM
      const deleteMatch = cleanQuery.match(
        /DELETE\s+FROM\s+(courses|subjects|materials)\s+WHERE\s+id\s*=\s*'([^']+)'/i
      );
      if (deleteMatch) {
        const table = deleteMatch[1].toLowerCase();
        const docId = deleteMatch[2].trim();

        addTermLog("info", `Compiling query: Mapped DELETE FROM table ${table} with id ${docId}...`);
        addTermLog("info", `Firebase mapping: deleteDoc(doc(db, "${table}", "${docId}"))`);
        
        await deleteDoc(doc(db, table, docId));
        addTermLog("success", `Transaction complete. Document deleted from table '${table}'.`);
        return;
      }

      // 5. MATCH UPDATE
      const updateMatch = cleanQuery.match(
        /UPDATE\s+(courses|subjects|materials)\s+SET\s+([^]+)\s+WHERE\s+id\s*=\s*'([^']+)'/i
      );
      if (updateMatch) {
        const table = updateMatch[1].toLowerCase();
        const assignmentsStr = updateMatch[2].trim();
        const docId = updateMatch[3].trim();

        addTermLog("info", `Compiling query: Mapped UPDATE table '${table}' with target id '${docId}'...`);
        
        // Parse assignment assignments: e.g. title = 'value', isApproved = true
        const payload: any = {};
        const pairs = assignmentsStr.split(",");
        
        pairs.forEach((pair) => {
          const splitIdx = pair.indexOf("=");
          if (splitIdx === -1) return;
          const k = pair.substring(0, splitIdx).trim().replace(/['"`]/g, "");
          let v = pair.substring(splitIdx + 1).trim();

          // Clean values
          if (v.startsWith("'") && v.endsWith("'")) {
            v = v.substring(1, v.length - 1);
          } else if (v.startsWith('"') && v.endsWith('"')) {
            v = v.substring(1, v.length - 1);
          }

          // Parse Types
          if (v.toLowerCase() === "true") payload[k] = true;
          else if (v.toLowerCase() === "false") payload[k] = false;
          else if (!isNaN(Number(v)) && v !== "") payload[k] = Number(v);
          else payload[k] = v;
        });

        addTermLog("info", `Firebase mapping: updateDoc(doc(db, "${table}", "${docId}"), ${JSON.stringify(payload)})`);
        
        await updateDoc(doc(db, table, docId), payload);
        addTermLog("success", `Transaction complete. Document id '${docId}' cell state saved.`);
        return;
      }

      // If no regex match found
      addTermLog("error", "Syntax Error: Command could not be compiled. Unsupported command sequence.");
      addTermLog("info", "Supported Manual SQL Blueprint templates:");
      addTermLog("info", " - INSERT INTO courses (name, description) VALUES ('Name', 'Desc')");
      addTermLog("info", " - INSERT INTO subjects (name, code, semester, courseId) VALUES ('Name', 'Code', 1, 'courseDocId')");
      addTermLog("info", " - DELETE FROM materials WHERE id = 'documentID'");
      addTermLog("info", " - UPDATE materials SET title = 'New Title', isApproved = true WHERE id = 'documentID'");

    } catch (err: any) {
      addTermLog("error", `Runtime Transaction Fail: ${err.message}`);
    }
  };

  // MANUAL FORM INSERTS SHEET HANDLERS
  const handleInsertCourseManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCourseName.trim()) return;
    try {
      addTermLog("info", `Sending manual Excel payload for course: ${inCourseName}`);
      await addDoc(collection(db, "courses"), {
        name: inCourseName.trim(),
        description: inCourseDesc.trim(),
      });
      addTermLog("success", `Manually saved course: "${inCourseName}" to Firestore.`);
      setInCourseName("");
      setInCourseDesc("");
    } catch (err: any) {
      alert(`Course Save Error: ${err.message}`);
    }
  };

  const handleInsertSubjectManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inSubjectName.trim() || !inSubjectCode.trim() || !inSubjectCourseId) {
      alert("Missing required fields. Course assignment, Name, and Code are required.");
      return;
    }
    try {
      addTermLog("info", `Sending manual Excel payload for subject: ${inSubjectCode}`);
      await addDoc(collection(db, "subjects"), {
        name: inSubjectName.trim(),
        code: inSubjectCode.trim().toUpperCase(),
        semester: Number(inSubjectSem) || 1,
        courseId: inSubjectCourseId,
        description: inSubjectDesc.trim(),
      });
      addTermLog("success", `Manually saved subject: "${inSubjectName}" linked to course.`);
      setInSubjectName("");
      setInSubjectCode("");
      setInSubjectSem(1);
      setInSubjectDesc("");
    } catch (err: any) {
      alert(`Subject Save Error: ${err.message}`);
    }
  };

  const handleInsertMaterialManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inMaterialTitle.trim() || !inMaterialUrl.trim() || !inMaterialSubjectId) {
      alert("Missing required fields. Title, URL, and Subject connection are required.");
      return;
    }

    let finalSynthId = inMaterialSynthId.trim();
    if (!finalSynthId) {
      // Manual/semi-manual fallback synthid to keep integrity
      const shortTitle = inMaterialTitle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
      const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
      finalSynthId = `SYN-${shortTitle}-${hex}-MAN`;
    }

    try {
      addTermLog("info", `Sending manual Excel payload for material: ${inMaterialTitle}`);
      await addDoc(collection(db, "materials"), {
        title: inMaterialTitle.trim(),
        url: inMaterialUrl.trim(),
        type: inMaterialType,
        subjectId: inMaterialSubjectId,
        synthId: finalSynthId,
        isApproved: inMaterialApproved,
        upvotes: 0,
        downvotes: 0,
        flags: 0,
        createdAt: new Date().toISOString(),
      });
      addTermLog("success", `Manually saved material: "${inMaterialTitle}" with Synth ID ${finalSynthId}.`);
      setInMaterialTitle("");
      setInMaterialUrl("");
      setInMaterialSynthId("");
    } catch (err: any) {
      alert(`Material Save Error: ${err.message}`);
    }
  };

  // INLINE EXCEL SHEET CELL EDITS COMMITTER
  const handleStartEditRow = (rowId: string, currentData: any) => {
    setEditingId(rowId);
    setEditingFields({ ...currentData });
  };

  const handleSaveExcelCellState = async (table: string, id: string) => {
    try {
      addTermLog("info", `Saving inline Excel row update on table ${table}, ID: ${id}`);
      await updateDoc(doc(db, table, id), editingFields);
      addTermLog("success", `Updated direct Firestore document row: ${id} successfully.`);
      setEditingId(null);
    } catch (err: any) {
      addTermLog("error", `Edit Transaction Fail: ${err.message}`);
    }
  };

  const handleDeleteDocManual = async (table: string, id: string, name: string) => {
    const check = window.confirm(`PROMPT DELETION: Are you absolutely sure you want to drop row '${name}' from database [${table}]?`);
    if (!check) return;
    try {
      addTermLog("info", `Executing manual drop query on document ID: ${id} in collection ${table}`);
      await deleteDoc(doc(db, table, id));
      addTermLog("success", `Succesfully dropped document row ${id} from memory database.`);
    } catch (err: any) {
      addTermLog("error", `Delete Transaction Fail: ${err.message}`);
    }
  };

  // AI CONSULTANT RAG FOR CLIENT
  const handleConsultantPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = aiInput.trim();
    if (!queryText) return;

    setAiHistory((prev) => [...prev, { role: "user", text: queryText }]);
    setAiInput("");
    setIsAiTyping(true);

    try {
      const simplifiedState = {
        coursesCount: courses.length,
        subjectsCount: subjects.length,
        materialsCount: materials.length,
        courses: courses.slice(0, 15).map((c) => ({ id: c.id, name: c.name })),
        subjects: subjects.slice(0, 15).map((s) => ({ id: s.id, name: s.name, code: s.code })),
        materials: materials.slice(0, 15).map((m) => ({ id: m.id, title: m.title, synthId: m.synthId })),
      };

      const res = await fetch("/api/ai/rag-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          context: { dbState: simplifiedState },
        }),
      });
      const data = await res.json();
      setAiHistory((prev) => [
        ...prev,
        { role: "db", text: data.response || "No data synthesized from cluster." },
      ]);
    } catch (err: any) {
      setAiHistory((prev) => [
        ...prev,
        { role: "db", text: "ERROR: Consultation channel failed. " + err.message },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-xl p-6 sm:p-10 text-white font-mono min-h-[500px] flex flex-col items-center justify-center animate-in fade-in duration-300 mt-4">
        <Lock className="w-10 h-10 text-slate-500 mb-5" />
        <h2 className="text-emerald-400 font-bold block text-xs tracking-widest uppercase mb-2">
          Global Database Subsystem State Checked
        </h2>
        <p className="text-slate-400 text-[10px] text-center max-w-sm leading-relaxed mb-6">
          Access credentials required to perform direct CRUD modifications, spreadsheet updates, and write raw SQL entries.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="password"
            autoFocus
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-28 bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 rounded p-2.5 text-center tracking-[1.2em] text-white focus:outline-none focus:border-emerald-500 transition-colors text-xs"
            placeholder="****"
          />
        </div>
        <button
          onClick={() => {
            if (pin === "4809") setIsLocked(false);
            else {
              alert("CREDENTIAL DENIED");
              setPin("");
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-colors h-11 flex items-center justify-center cursor-pointer shadow-md"
        >
          Authenticate Terminal
        </button>
      </div>
    );
  }

  // Filter spreadsheet grids
  const filteredCourses = courses.filter((c) =>
    (c.name || "").toLowerCase().includes(gridQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter((s) => {
    const matchesQuery = (s.name || "").toLowerCase().includes(gridQuery.toLowerCase()) || 
                         (s.code || "").toLowerCase().includes(gridQuery.toLowerCase());
    return matchesQuery;
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesQuery = (m.title || "").toLowerCase().includes(gridQuery.toLowerCase()) ||
                         (m.synthId || "").toLowerCase().includes(gridQuery.toLowerCase()) ||
                         (m.url || "").toLowerCase().includes(gridQuery.toLowerCase());
    const matchesType = filterType === "ALL" || m.type === filterType;
    const matchesSub = filterSubject === "ALL" || m.subjectId === filterSubject;
    return matchesQuery && matchesType && matchesSub;
  });

  return (
    <div className="bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-xl p-5 sm:p-8 text-white font-mono min-h-[500px] flex flex-col mt-4">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest font-mono">
              Direct Memory Workbench (Locked to Manual)
            </span>
            <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[8px] font-bold uppercase tracking-wider rounded border-y border-x-0 sm:border sm:border-x border-rose-500/20">
              No Autopilot Action
            </span>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-1.5 leading-relaxed">
            Direct real-time relational editor. Excel-style cells, raw INSERT commands, and manual deletions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-teal-500/10 text-teal-400 text-[9px] uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-teal-500/20">
            {courses.length} courses
          </span>
          <span className="px-2 py-1 bg-sky-500/10 text-sky-400 text-[9px] uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-sky-500/20">
            {subjects.length} subjects
          </span>
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-indigo-500/20">
            {materials.length} resources
          </span>
          <button
            onClick={() => setIsLocked(true)}
            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-red-500/20 transition-colors ml-1"
          >
            Lock State
          </button>
        </div>
      </div>

      {/* Mode Switches */}
      <div className="flex border-b border-slate-800 mb-5">
        <button
          onClick={() => setActiveMode("excel")}
          className={`pb-3 px-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeMode === "excel"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Spreadsheet Grid (Excel style)
        </button>
        <button
          onClick={() => setActiveMode("sql")}
          className={`pb-3 px-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeMode === "sql"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          SQL Console (CLI Commands)
        </button>
        <button
          onClick={() => setActiveMode("ai")}
          className={`pb-3 px-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeMode === "ai"
              ? "border-emerald-500 text-emerald-400 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Database Consultant Assistance
        </button>
      </div>

      {/* --- MODE 1: EXCEL SPREADSHEET GRID --- */}
      {activeMode === "excel" && (
        <div className="space-y-6">
          {/* Table Spreadsheet Sheets Tabs */}
          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-lg border-y border-x-0 sm:border sm:border-x border-slate-800 self-start inline-flex">
            <button
              onClick={() => {
                setActiveSheet("courses");
                setEditingId(null);
              }}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                activeSheet === "courses"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              courses_table.xlsx ({courses.length})
            </button>
            <button
              onClick={() => {
                setActiveSheet("subjects");
                setEditingId(null);
              }}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                activeSheet === "subjects"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              subjects_table.xlsx ({subjects.length})
            </button>
            <button
              onClick={() => {
                setActiveSheet("materials");
                setEditingId(null);
              }}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                activeSheet === "materials"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              materials_table.xlsx ({materials.length})
            </button>
          </div>

          {/* SPREADSHEET INSERT PANEL (100% MANUAL ROWS) */}
          <div className="bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 rounded-xl p-4">
            <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" /> Commit SQL Insert Row Form (Manual Input)
            </h3>

            {/* Courses Manual Inserts */}
            {activeSheet === "courses" && (
              <form onSubmit={handleInsertCourseManual} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inCourseName}
                    onChange={(e) => setInCourseName(e.target.value)}
                    placeholder="e.g., B.Tech Computer Science"
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Course Description
                  </label>
                  <input
                    type="text"
                    value={inCourseDesc}
                    onChange={(e) => setInCourseDesc(e.target.value)}
                    placeholder="Brief outline"
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-widest p-2 rounded.5 h-9 transition-colors flex items-center justify-center gap-1"
                  >
                    Insert New row
                  </button>
                </div>
              </form>
            )}

            {/* Subjects Manual Inserts */}
            {activeSheet === "subjects" && (
              <form onSubmit={handleInsertSubjectManual} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inSubjectName}
                    onChange={(e) => setInSubjectName(e.target.value)}
                    placeholder="e.g. Advanced Calculus"
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={inSubjectCode}
                    onChange={(e) => setInSubjectCode(e.target.value)}
                    placeholder="e.g. MATH-201"
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={inSubjectSem}
                    onChange={(e) => setInSubjectSem(Number(e.target.value) || 1)}
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                    Link Course ID
                  </label>
                  <select
                    required
                    value={inSubjectCourseId}
                    onChange={(e) => setInSubjectCourseId(e.target.value)}
                    className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500 h-[34px]"
                  >
                    <option value="">Select Target Course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-widest p-2 rounded h-9 transition-colors flex items-center justify-center gap-1"
                  >
                    Insert New row
                  </button>
                </div>
              </form>
            )}

            {/* Materials Manual Inserts */}
            {activeSheet === "materials" && (
              <form onSubmit={handleInsertMaterialManual} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      required
                      value={inMaterialTitle}
                      onChange={(e) => setInMaterialTitle(e.target.value)}
                      placeholder="e.g. Physics Lab Manual"
                      className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Google Drive URL / Resource Target Link
                    </label>
                    <input
                      type="text"
                      required
                      value={inMaterialUrl}
                      onChange={(e) => setInMaterialUrl(e.target.value)}
                      placeholder="e.g. https://drive.google.com/pdf"
                      className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={inMaterialType}
                      onChange={(e) => setInMaterialType(e.target.value as any)}
                      className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500 h-[34px]"
                    >
                      <option value="PDF">PDF study guide</option>
                      <option value="VIDEO">Video lecture</option>
                      <option value="LINK">Reference link</option>
                      <option value="NOTES">Handwritten Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Link Subject ID
                    </label>
                    <select
                      required
                      value={inMaterialSubjectId}
                      onChange={(e) => setInMaterialSubjectId(e.target.value)}
                      className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500 h-[34px]"
                    >
                      <option value="">Select Target Subject...</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-slate-500 mb-1">
                      Manual Synth ID Allocation (Optional / Editable)
                    </label>
                    <input
                      type="text"
                      value={inMaterialSynthId}
                      onChange={(e) => setInMaterialSynthId(e.target.value)}
                      placeholder="e.g. SYN-PHYS-A1B2-MAN"
                      className="w-full bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="manualApprovedCheck"
                      checked={inMaterialApproved}
                      onChange={(e) => setInMaterialApproved(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-y border-x-0 sm:border sm:border-x border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="manualApprovedCheck" className="text-[10px] uppercase tracking-[0.05em] text-slate-400 select-none cursor-pointer">
                      Publish Approved Row (True)
                    </label>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-widest p-2 rounded h-9 transition-colors flex items-center justify-center gap-1"
                    >
                      Insert New row
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* SPREADSHEET CONTROLS BAR (SEARCH / FILTER CELLS) */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={gridQuery}
                onChange={(e) => setGridQuery(e.target.value)}
                placeholder="Search cell strings (IDs, titles, URL matches, Synth IDs)..."
                className="w-full bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 text-xs rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
              />
            </div>
            {activeSheet === "materials" && (
              <div className="flex gap-2.5">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 text-[10px] rounded-lg py-2 px-3 text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="PDF">PDFs</option>
                  <option value="VIDEO">Videos</option>
                  <option value="LINK">Links</option>
                  <option value="NOTES">Notes</option>
                </select>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 text-[10px] rounded-lg py-2 px-3 text-slate-300 focus:outline-none max-w-xs"
                >
                  <option value="ALL">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SPREADSHEET RESPONSIVE DATA GRID SHEET */}
          <div className="bg-slate-950 border-y border-x-0 sm:border sm:border-x border-slate-800 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-inner overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              
              {/* --- COURSES SHEET GRID --- */}
              {activeSheet === "courses" && (
                <table className="w-full text-left font-mono text-[10px] border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="p-3 border-r border-slate-800 w-44">Doc ID (Firestore PK)</th>
                      <th className="p-3 border-r border-slate-800 w-64">Course Name</th>
                      <th className="p-3 border-r border-slate-800">Description</th>
                      <th className="p-3 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          Empty sheet. Search matched zero rows.
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((c) => {
                        const isEditing = editingId === c.id;
                        return (
                          <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3 border-r border-slate-850 text-slate-500 font-mono text-[9px] select-all">
                              {c.id}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.name ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, name: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[10px]"
                                />
                              ) : (
                                <span className="text-slate-200 font-bold">{c.name}</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.description ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, description: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[10px]"
                                />
                              ) : (
                                <span className="text-slate-400">{c.description || "-"}</span>
                              )}
                            </td>
                            <td className="p-3 text-center flex justify-center items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveExcelCellState("courses", c.id)}
                                    className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded hover:bg-emerald-600/55 transition-colors border-y border-x-0 sm:border sm:border-x border-emerald-500/20"
                                    title="Commit Row (Save to Memory)"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-705 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-700"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEditRow(c.id, { name: c.name, description: c.description })}
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-750"
                                    title="Edit Row"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocManual("courses", c.id, c.name)}
                                    className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/35 transition-colors border-y border-x-0 sm:border sm:border-x border-red-500/20"
                                    title="Delete/Drop Row"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {/* --- SUBJECTS SHEET GRID --- */}
              {activeSheet === "subjects" && (
                <table className="w-full text-left font-mono text-[10px] border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="p-3 border-r border-slate-800 w-32">Doc ID</th>
                      <th className="p-3 border-r border-slate-800 w-28">Subject Code</th>
                      <th className="p-3 border-r border-slate-800 w-48">Subject Name</th>
                      <th className="p-3 border-r border-slate-800 w-20 text-center">Semester</th>
                      <th className="p-3 border-r border-slate-800 w-44">Linked Course (FK ID)</th>
                      <th className="p-3 border-r border-slate-800">Description</th>
                      <th className="p-3 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[9px]">
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Empty sheet. Search matched zero rows.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((s) => {
                        const isEditing = editingId === s.id;
                        const linkedCourse = courses.find((c) => c.id === s.courseId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3 border-r border-slate-850 text-slate-500 select-all">
                              {s.id}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.code ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, code: e.target.value.toUpperCase() })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px]"
                                />
                              ) : (
                                <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border-y border-x-0 sm:border sm:border-x border-emerald-500/20">
                                  {s.code}
                                </span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.name ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, name: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px]"
                                />
                              ) : (
                                <span className="text-slate-200 font-bold">{s.name}</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min={1}
                                  max={8}
                                  value={editingFields.semester ?? 1}
                                  onChange={(e) => setEditingFields({ ...editingFields, semester: Number(e.target.value) || 1 })}
                                  className="w-12 bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1 py-1 text-center text-[9px]"
                                />
                              ) : (
                                <span className="text-slate-300 font-bold">Sem {s.semester}</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850 font-sans">
                              {isEditing ? (
                                <select
                                  value={editingFields.courseId ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, courseId: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded p-1 text-[9px] h-7"
                                >
                                  {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-slate-450 text-[9px] block max-w-[150px] truncate" title={linkedCourse?.name || s.courseId}>
                                  {linkedCourse ? linkedCourse.name : `MISSING_FK: (${s.courseId})`}
                                </span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.description ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, description: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px]"
                                />
                              ) : (
                                <span className="text-slate-500">{s.description || "-"}</span>
                              )}
                            </td>
                            <td className="p-3 text-center flex justify-center items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveExcelCellState("subjects", s.id)}
                                    className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded hover:bg-emerald-600/55 transition-colors border-y border-x-0 sm:border sm:border-x border-emerald-500/20"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-705 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-70"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStartEditRow(s.id, {
                                        name: s.name,
                                        code: s.code,
                                        semester: s.semester,
                                        courseId: s.courseId,
                                        description: s.description,
                                      })
                                    }
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-750"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocManual("subjects", s.id, s.name)}
                                    className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/35 transition-colors border-y border-x-0 sm:border sm:border-x border-red-500/20"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {/* --- MATERIALS SHEET GRID --- */}
              {activeSheet === "materials" && (
                <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="p-3 border-r border-slate-800 w-24">Doc ID</th>
                      <th className="p-3 border-r border-slate-800 w-32">Unique Synth ID</th>
                      <th className="p-3 border-r border-slate-800 w-44">Title</th>
                      <th className="p-3 border-r border-slate-800 w-20 text-center">Type</th>
                      <th className="p-3 border-r border-slate-800 w-48">Google Drive Target Link</th>
                      <th className="p-3 border-r border-slate-800 w-36">Subject Connect</th>
                      <th className="p-3 border-r border-slate-800 w-20 text-center font-bold">Approved</th>
                      <th className="p-3 text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[9px]">
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          Empty sheet. Search matched zero rows.
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((m) => {
                        const isEditing = editingId === m.id;
                        const linkedSub = subjects.find((s) => s.id === m.subjectId);
                        return (
                          <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3 border-r border-slate-850 text-slate-500 text-[8px] select-all">
                              {m.id}
                            </td>
                            <td className="p-3 border-r border-slate-850 font-mono">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.synthId ?? ""}
                                  placeholder="SYN-ALLOC-..."
                                  onChange={(e) => setEditingFields({ ...editingFields, synthId: e.target.value })}
                                  className="w-full bg-slate-900 text-emerald-400 border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px] font-mono leading-none"
                                />
                              ) : (
                                <span className="text-emerald-400 font-bold font-mono">
                                  {m.synthId || "SYN-ALLOC-NULL"}
                                </span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.title ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, title: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px]"
                                />
                              ) : (
                                <span className="text-slate-200 font-extrabold">{m.title}</span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850 text-center">
                              {isEditing ? (
                                <select
                                  value={editingFields.type ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, type: e.target.value })}
                                  className="w-20 bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded p-1 text-[9px] h-7"
                                >
                                  <option value="PDF">PDF</option>
                                  <option value="VIDEO">VIDEO</option>
                                  <option value="LINK">LINK</option>
                                  <option value="NOTES">NOTES</option>
                                </select>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-slate-800 text-white font-black text-[8px] uppercase tracking-wider rounded border-y border-x-0 sm:border sm:border-x border-slate-700">
                                  {m.type}
                                </span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850 font-mono text-[9px] text-sky-400 truncate max-w-xs select-all">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFields.url ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, url: e.target.value })}
                                  className="w-full bg-slate-900 text-sky-300 border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1.5 py-1 text-[9px]"
                                />
                              ) : (
                                <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {m.url}
                                </a>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850">
                              {isEditing ? (
                                <select
                                  value={editingFields.subjectId ?? ""}
                                  onChange={(e) => setEditingFields({ ...editingFields, subjectId: e.target.value })}
                                  className="w-full bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded p-1 text-[9px] h-7"
                                >
                                  {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.code} - {s.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-slate-400 block max-w-[140px] truncate" title={linkedSub ? `${linkedSub.code} - ${linkedSub.name}` : m.subjectId}>
                                  {linkedSub ? `${linkedSub.code} - ${linkedSub.name}` : `MISSING_FK: (${m.subjectId})`}
                                </span>
                              )}
                            </td>
                            <td className="p-3 border-r border-slate-850 text-center">
                              {isEditing ? (
                                <select
                                  value={editingFields.isApproved === true ? "true" : "false"}
                                  onChange={(e) => setEditingFields({ ...editingFields, isApproved: e.target.value === "true" })}
                                  className="bg-slate-900 text-white border-y border-x-0 sm:border sm:border-x border-slate-700 rounded px-1 py-0.5 text-[9px]"
                                >
                                  <option value="true">YES</option>
                                  <option value="false">NO</option>
                                </select>
                              ) : m.isApproved ? (
                                <span className="px-1 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-emerald-500/20">
                                  APPROVED
                                </span>
                              ) : (
                                <span className="px-1 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest rounded border-y border-x-0 sm:border sm:border-x border-yellow-500/20 animate-pulse">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center flex justify-center items-center gap-1.5 h-full">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveExcelCellState("materials", m.id)}
                                    className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded hover:bg-emerald-600/55 transition-colors border-y border-x-0 sm:border sm:border-x border-emerald-500/20"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-705 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-70"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStartEditRow(m.id, {
                                        title: m.title,
                                        url: m.url,
                                        type: m.type,
                                        subjectId: m.subjectId,
                                        synthId: m.synthId,
                                        isApproved: m.isApproved ?? true,
                                      })
                                    }
                                    className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors border-y border-x-0 sm:border sm:border-x border-slate-755"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocManual("materials", m.id, m.title)}
                                    className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/35 transition-colors border-y border-x-0 sm:border sm:border-x border-red-500/20"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- MODE 2: DIRECT MANUAL SQL CONSOLE --- */}
      {activeMode === "sql" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border-y border-x-0 sm:border sm:border-x border-slate-205">
            <h3 className="text-[10px] font-bold uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" /> Direct SQL Executive transaction
            </h3>
            <p className="text-slate-500 text-[10px] mb-4 leading-relaxed uppercase">
              Submit direct catalog query statements to manipulate Firestore records instantly.
            </p>

            {/* Quick-fill SQL templates */}
            <div className="mb-4">
              <span className="text-[8px] text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick-insert Statements (Click to paste):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSqlCommand(
                      "INSERT INTO courses (name, description) VALUES ('B.Sc Bio-Chemistry', 'Core molecular biology curriculum');"
                    )
                  }
                  className="bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 px-2.5 py-1.5 text-[8.5px] text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all font-mono"
                  style={{ minHeight: "28px" }}
                >
                  INSERT course
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sampleCourseId = courses[0]?.id || "COURSE_ID";
                    setSqlCommand(
                      `INSERT INTO subjects (name, code, semester, courseId) VALUES ('Inorganic Chemistry', 'CHEM-102', 1, '${sampleCourseId}');`
                    );
                  }}
                  className="bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 px-2.5 py-1.5 text-[8.5px] text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all font-mono"
                  style={{ minHeight: "28px" }}
                >
                  INSERT subject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sampleSubjectId = subjects[0]?.id || "SUBJECT_ID";
                    setSqlCommand(
                      `INSERT INTO materials (title, url, type, subjectId, synthId) VALUES ('Periodic Table PDF', 'https://drive.google.com/periodic-table', 'PDF', '${sampleSubjectId}', 'SYN-CHEM-C111-MAN');`
                    );
                  }}
                  className="bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 px-2.5 py-1.5 text-[8.5px] text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all font-mono"
                  style={{ minHeight: "28px" }}
                >
                  INSERT material
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sampleMatId = materials[0]?.id || "MATERIAL_ID";
                    setSqlCommand(
                      `UPDATE materials SET title = 'Revised Syllabus Guide', isApproved = true WHERE id = '${sampleMatId}';`
                    );
                  }}
                  className="bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 px-2.5 py-1.5 text-[8.5px] text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-all font-mono"
                  style={{ minHeight: "28px" }}
                >
                  UPDATE row
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSqlCommand("DELETE FROM courses WHERE id = 'target_doc_id';")
                  }
                  className="bg-white border-y border-x-0 sm:border sm:border-x border-slate-200 px-2.5 py-1.5 text-[8.5px] text-slate-600 rounded-md hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all font-mono"
                  style={{ minHeight: "28px" }}
                >
                  DELETE row
                </button>
              </div>
            </div>

            {/* CommandLine shell input */}
            <form onSubmit={handleExecuteRawSQL} className="space-y-3">
              <textarea
                value={sqlCommand}
                onChange={(e) => setSqlCommand(e.target.value)}
                placeholder="INSERT INTO materials (title, url, type, subjectId, synthId) VALUES ('Organic Chemistry Book', 'https://link.com', 'PDF', 'sub123', 'SYN-CHEM-9F22-MAN');"
                className="w-full bg-white text-slate-800 border-y border-x-0 sm:border sm:border-x border-slate-250 focus:border-slate-400 rounded-lg p-3 text-xs font-mono font-medium outline-none h-24 focus:ring-0 custom-scrollbar shadow-inner"
              />
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">
                  Schema database mode: Automated transaction indexing active
                </span>
                <button
                  type="submit"
                  disabled={!sqlCommand.trim()}
                  className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-[9px] uppercase tracking-widest px-5 py-2.5 rounded border-y border-x-0 sm:border sm:border-x border-slate-800 shadow transition-all cursor-pointer h-[40px]"
                >
                  Execute raw transaction
                </button>
              </div>
            </form>
          </div>

          {/* ACTIVE RETRO TERMINAL LOGS FEEDBACK */}
          <div className="bg-slate-50 border-y border-x-0 sm:border sm:border-x border-slate-205 rounded-xl p-4 flex flex-col h-72">
            <span className="text-[8px] uppercase tracking-widest font-bold text-slate-500 mb-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-650" /> Database transaction logs sequence
            </span>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1.5 p-3 bg-white rounded-lg border-y border-x-0 sm:border sm:border-x border-slate-200 custom-scrollbar">
              {terminalLogs.map((log, idx) => {
                let colorClass = "text-slate-600 border-l border-slate-200 pl-2";
                if (log.type === "success") colorClass = "text-emerald-700 font-bold border-l-2 border-emerald-500 pl-2";
                if (log.type === "error") colorClass = "text-red-700 font-bold border-l-2 border-red-500 pl-2";
                if (log.type === "sql") colorClass = "text-amber-805 font-bold border-l-2 border-amber-500 bg-amber-50/20 py-0.5 rounded pl-2";

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed break-words`}>
                    <span className="text-slate-400 mr-2 text-[8px]">[{log.timestamp}]</span>
                    {log.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODE 3: DATABASE CONSULTANT RAG CHAT --- */}
      {activeMode === "ai" && (
        <div className="space-y-4">
          <div className="bg-slate-50 border-y border-x-0 sm:border sm:border-x border-slate-205 rounded-xl p-4">
            <h3 className="text-[10px] font-bold uppercase text-slate-700 tracking-wider mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Gemini AI Database Consultant
            </h3>
            <p className="text-slate-550 text-[10px] uppercase leading-relaxed mb-4">
              Submit questions regarding database hierarchies, syllabus relationships, and records instantly.
            </p>

            <div className="h-72 overflow-y-auto mb-4 border-y border-x-0 sm:border sm:border-x border-slate-202 bg-white rounded p-3 space-y-3 custom-scrollbar flex flex-col">
              {aiHistory.length === 0 && (
                <div className="text-center text-slate-400 text-[10px] my-auto py-10">
                  Ask a question to audit records, schema properties, or find specific document identifiers instantly.
                </div>
              )}
              {aiHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border-y border-x-0 sm:border sm:border-x max-w-[85%] text-[10px] ${
                    chat.role === "user"
                      ? "bg-slate-100 border-slate-200 text-slate-800 self-end"
                      : "bg-emerald-50 border-emerald-150 text-emerald-950 self-start"
                  }`}
                >
                  <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-widest mb-1 select-none">
                    {chat.role === "user" ? "USER PROMPT" : "CONSULTANT RESPONSE"}
                  </span>
                  <p className="whitespace-pre-wrap">{chat.text}</p>
                </div>
              ))}
              {isAiTyping && (
                <span className="text-slate-400 text-[9px] animate-pulse font-bold tracking-widest uppercase self-start">
                  Retrieving live dataset schema...
                </span>
              )}
            </div>

            <form onSubmit={handleConsultantPrompt} className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={isAiTyping}
                placeholder="Ask consultant... e.g., Show me all active subject codes"
                className="flex-1 bg-white border-y border-x-0 sm:border sm:border-x border-slate-300 rounded-lg p-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                style={{ minHeight: "44px" }}
              />
              <button
                type="submit"
                disabled={isAiTyping || !aiInput.trim()}
                className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-[9px] uppercase tracking-widest px-5 rounded h-11 transition-colors block shrink-0"
              >
                Send Query
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
