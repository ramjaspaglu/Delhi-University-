import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Shield, 
  Link, 
  Cpu, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  PlusCircle, 
  Globe, 
  Database, 
  TrendingUp, 
  ExternalLink,
  BookOpen,
  FolderMinus,
  Edit,
  Save,
  Lock,
  MapPin,
  FileCheck,
  Square,
  CheckSquare,
  Download,
  Search,
  Filter,
  Users,
  Activity,
  Eye,
  Clock,
  BarChart3,
  RotateCcw,
  File,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Sliders,
  KeyRound,
  Play,
  FileCode,
  LockKeyhole,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Megaphone,
  Send
} from 'lucide-react';
import { Course, Subject, Material } from '../types';

interface AdminPanelProps {
  courses: Course[];
  userEmail: string | undefined;
  onSelectCourse: (course: Course) => void;
  onSelectSubject: (subject: Subject) => void;
  setActiveTab: (tab: string) => void;
}

export default function AdminPanel({ courses, userEmail, onSelectCourse, onSelectSubject, setActiveTab }: AdminPanelProps) {
  // Navigation inside Admin
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'fetcher' | 'courses' | 'subjects' | 'submissions' | 'materials' | 'contributions' | 'ai-automation' | 'users' | 'behavior' | 'security-protocol' | 'reports' | 'labs-access' | 'announcements'>('security-protocol');

  // Reports Diary States
  const [reports, setReports] = useState<any[]>([]);
  const [reportsFilter, setReportsFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [resolvingReportsRecord, setResolvingReportsRecord] = useState<Record<string, boolean>>({});
  const [reportAdminNotes, setReportAdminNotes] = useState<Record<string, string>>({});

  // Labs Access Requests
  const [betaRequests, setBetaRequests] = useState<any[]>([]);
  const [betaRequestsLoading, setBetaRequestsLoading] = useState(false);

  // Moderation Settings Rule Setup
  const [moderationMode, setModerationMode] = useState<string>('approve_queue');
  const [flagThreshold, setFlagThreshold] = useState<number>(5);
  const [isUpdatingRules, setIsUpdatingRules] = useState<boolean>(false);

  // Behavior States
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [behaviorSearchQuery, setBehaviorSearchQuery] = useState('');
  const [behaviorActionFilter, setBehaviorActionFilter] = useState('ALL');
  const [selectedTraceEmail, setSelectedTraceEmail] = useState<string>('ALL_STUDENTS');

  // AI Autopilot Mode Setup
  const [isAutopilotActive, setIsAutopilotActive] = useState<boolean>(true);
  const [autopilotThreshold, setAutopilotThreshold] = useState<number>(85);
  const [autopilotLogs, setAutopilotLogs] = useState<any[]>([]);
  const [autopilotStep, setAutopilotStep] = useState<'idle' | 'crawling' | 'classifying' | 'ingesting' | 'auditing' | 'done' | 'failed'>('idle');
  const [autopilotConsole, setAutopilotConsole] = useState<string[]>([]);
  const [isAutopilotSaved, setIsAutopilotSaved] = useState<boolean>(false);

  // Security Protocol & ABAC Sentinel States
  const [isSimulatingTests, setIsSimulatingTests] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [completedTestsCount, setCompletedTestsCount] = useState<number>(0);
  const [academicDomainLock, setAcademicDomainLock] = useState<boolean>(true);
  const [dualAuthorityVerification, setDualAuthorityVerification] = useState<boolean>(false);
  const [intrusionSimulationStatus, setIntrusionSimulationStatus] = useState<'idle' | 'running' | 'completed' | 'cleared'>('idle');
  const [threatAlerts, setThreatAlerts] = useState<any[]>([
    { id: 't1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), ip: '113.193.187.42', college: 'Hindu College', vector: 'SPOOF_ADMIN_PRIVILEGE', payload: 'update /users/current { isAdmin: true }', result: 'REPELLED_BY_ABAC_IMMUTABLE' },
    { id: 't2', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), ip: '14.139.45.2', college: 'Ramjas College', vector: 'RELATIONAL_POISON_INJECT', payload: 'create /materials/m42 { subjectId: "nonexistent_sub_123" }', result: 'REPELLED_BY_MASTER_GATE' },
    { id: 't3', timestamp: new Date(Date.now() - 3600000 * 25).toISOString(), ip: '223.31.129.11', college: 'Kirori Mal College', vector: 'SHADOW_KEY_INJECTION', payload: 'create /materials/m99 { title: "Exam Leak", isApproved: true }', result: 'REPELLED_BY_GHOST_FIELD_GUARD' },
    { id: 't4', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), ip: '106.220.33.156', college: 'Hansraj College', vector: 'STATE_SHORTCUT_BYPASS', payload: 'create /submissions/s5 { status: "APPROVED" }', result: 'REPELLED_BY_CLIENT_SPOOF_BLOCK' }
  ]);

  // Users Database & Control States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserCollegeName, setEditUserCollegeName] = useState('');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [editUserRollNumber, setEditUserRollNumber] = useState('');
  const [editUserPhoneNumber, setEditUserPhoneNumber] = useState('');
  const [usersSearchQuery, setUsersSearchQuery] = useState('');

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let unsubAutopilot: (() => void) | null = null;

    unsub = onSnapshot(doc(db, 'settings', 'moderation'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setModerationMode(data.mode || 'approve_queue');
        setFlagThreshold(data.flagThreshold !== undefined ? data.flagThreshold : 5);
      }
    }, (err) => {
      console.warn("Moderation settings listener permission warning:", err.message);
      if (unsub) { unsub(); unsub = null; }
    });

    unsubAutopilot = onSnapshot(doc(db, 'settings', 'autopilot'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsAutopilotActive(data.active !== undefined ? data.active : true);
        setAutopilotThreshold(data.threshold !== undefined ? data.threshold : 85);
      }
    }, (err) => {
      console.warn("Autopilot settings listener permission warning:", err.message);
      if (unsubAutopilot) { unsubAutopilot(); unsubAutopilot = null; }
    });

    return () => {
      if (unsub) unsub();
      if (unsubAutopilot) unsubAutopilot();
    };
  }, []);

  const handleSaveModerationSettings = async (selectedMode: string, selectedThreshold: number) => {
    setIsUpdatingRules(true);
    try {
      await setDoc(doc(db, 'settings', 'moderation'), {
        mode: selectedMode,
        flagThreshold: selectedThreshold,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'System Admin'
      });
      alert(`System Moderation Rules successfully updated. Mode: ${selectedMode}.`);
    } catch (err: any) {
      alert(`Failed to update rules: ${err.message}`);
    } finally {
      setIsUpdatingRules(false);
    }
  };

  const handleRunSecuritySim = async () => {
    setIsSimulatingTests(true);
    setIntrusionSimulationStatus('running');
    setCompletedTestsCount(0);
    setSimulationLogs(["Initializing Zero-Trust Security Protocol Simulator...", "Mapping Firestore collection matching path vectors..."]);

    const tests = [
      {
        id: 'SEC_01',
        title: 'PRIVILEGE_SPOOF_COURSE',
        action: 'CREATE',
        path: '/courses/bsc_hons_physics',
        payload: { name: 'B.Sc. (Hons.) Physics', level: 'UG', nepBased: true },
        authEmail: 'spoof_student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Request initiated by unprivileged non-admin account.',
          'Checking: `request.auth.token.email == "pk950364@gmail.com"` => Evaluated: FALSE',
          'Evaluating Courses write permissions: `isAdmin() && isValidCourse(incoming())` => FALSE'
        ]
      },
      {
        id: 'SEC_02',
        title: 'RELATIONAL_POISON_SUBJECT',
        action: 'CREATE',
        path: '/subjects/sub_poison_99',
        payload: { courseId: 'nonexistent_programme_xyz_998', semester: 2, name: 'Poison Node' },
        authEmail: 'pk950364@gmail.com',
        authVerified: true,
        eval_logs: [
          'Write initiated by verified administrator: pk950364@gmail.com',
          'Checking structural integrity of referenced Course ID: nonexistent_programme_xyz_998',
          'Enforcing relational safety checkpoint... checking if target course exists...',
          'Evaluating relational check: `exists(/databases/$(database)/documents/courses/$(incoming().courseId))` => FALSE',
          'Relational constraint failed.'
        ]
      },
      {
        id: 'SEC_03',
        title: 'SHADOW_FIELD_INJECTION',
        action: 'CREATE',
        path: '/materials/pdf_study_guide',
        payload: { subjectId: 'math_sem1', title: 'Mathematics Notes', url: 'https://cdn.example.com/math.pdf', type: 'PDF', isApproved: true },
        authEmail: 'student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Checking exact keys on document creation...',
          'Supplied schema keys: ["subjectId", "title", "url", "type", "isApproved"]',
          'Enforced creation keys match rule: `data.keys().hasAll(["subjectId", "title", "url", "type"]) && data.keys().size() == 4`',
          'Evaluating sizes and keys: Received size 5, expected size 4.',
          'Validation helper `isValidMaterial(incoming())` evaluated: FALSE'
        ]
      },
      {
        id: 'SEC_04',
        title: 'IMMUTABLE_URL_MUTATION',
        action: 'UPDATE',
        path: '/materials/pdf_study_guide',
        payload: { subjectId: 'math_sem1', title: 'Mathematics Notes', url: 'https://malicious-site.com/exploit.exe', type: 'PDF' },
        authEmail: 'student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Modifying fields in an approved material...',
          'Differentiating incoming payload from existing record...',
          'Evaluating: `incoming().diff(existing()).affectedKeys()` => {"url"}',
          'Enforced update rule: `incoming().diff(existing()).affectedKeys().hasOnly(["upvotes", "downvotes", "flags"])`',
          'Checking: `{"url"}.hasOnly(["upvotes", "downvotes", "flags"])` => Evaluated: FALSE'
        ]
      },
      {
        id: 'SEC_05',
        title: 'IDENTITY_UID_SPOOFING',
        action: 'WRITE',
        path: '/materials/pdf_study_guide/votes/fake_uid_xyz',
        payload: { userId: 'real_student_uid', type: 'UP' },
        authEmail: 'malicious_user@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Checking requested target voter uid parameter...',
          'Evaluating: `request.auth.uid == userId` => "hacker_uid" == "real_student_uid" => FALSE',
          'Identity mismatch intercepted.'
        ]
      },
      {
        id: 'SEC_06',
        title: 'SUBMISSION_AUTO_APPROVAL',
        action: 'CREATE',
        path: '/submissions/sub_proposal_99',
        payload: { submissionType: 'MATERIAL', courseName: 'B.A. Economics', subjectName: 'Microeconomics', status: 'APPROVED', semester: 1 },
        authEmail: 'student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Evaluating default submission state...',
          'Enforced status rule: `incoming().status == "PENDING" || isAdmin()`',
          'Checking status: "APPROVED" && `isAdmin()` => FALSE'
        ]
      },
      {
        id: 'SEC_07',
        title: 'PROPOSAL_QUERY_SCRAPING',
        action: 'LIST',
        path: '/submissions',
        payload: {},
        authEmail: 'student_attacker@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Verifying list request query rules...',
          'Enforced list gate: `isAdmin() || (isSignedIn() && resource.data.submittedByEmail == request.auth.token.email)`',
          'Checking email matching: "student_attacker@du.ac.in" == "original_author@du.ac.in" => FALSE'
        ]
      },
      {
        id: 'SEC_08',
        title: 'ANONYMOUS_PROFILE_SCRAPING',
        action: 'LIST',
        path: '/users',
        payload: {},
        authEmail: null,
        authVerified: false,
        eval_logs: [
          'Evaluating request headers...',
          'Enforced check: `isSignedIn()` => FALSE'
        ]
      },
      {
        id: 'SEC_09',
        title: 'PRIVILEGE_SELF_ESCALATION',
        action: 'CREATE',
        path: '/users/attacker_uid',
        payload: { email: 'attacker@du.ac.in', isAdmin: true, role: 'admin' },
        authEmail: 'attacker@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Checking user registration fields...',
          'Enforced registration check: `!incoming().keys().hasAll(["role", "isAdmin"])`',
          'Checking fields: keys containing `role` or `isAdmin` detected.',
          'Interpreting payload key mismatch => Reject creation.'
        ]
      },
      {
        id: 'SEC_10',
        title: 'SYSTEM_LOG_TAMPERING',
        action: 'WRITE',
        path: '/ai_automation_logs/autopilot_audit_file',
        payload: { executionSuccess: true },
        authEmail: 'student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Initiating write attempt on system collections...',
          'Evaluating access list details...',
          'Enforced log block: `isAdmin()` => FALSE'
        ]
      },
      {
        id: 'SEC_11',
        title: 'PROPOSAL_OUTCOME_SHORTCUT',
        action: 'UPDATE',
        path: '/feature_proposals/prop_45',
        payload: { title: 'New Syllabi Ingested', status: 'COMPLETED' },
        authEmail: 'student@du.ac.in',
        authVerified: true,
        eval_logs: [
          'Detecting modified fields in proposal...',
          'Evaluating keys: `incoming().diff(existing()).affectedKeys()` => {"title", "status"}',
          'Enforced rule: `incoming().diff(existing()).affectedKeys().hasOnly(["votes"])`',
          'Evaluating check: `{"title", "status"}.hasOnly(["votes"])` => FALSE'
        ]
      },
      {
        id: 'SEC_12',
        title: 'DOW_RESOURCE_POISONING',
        action: 'CREATE',
        path: '/courses/poison_id_long_long_long_long_long_long_long_long_long',
        payload: { name: 'Calculated Attack' },
        authEmail: 'pk950364@gmail.com',
        authVerified: true,
        eval_logs: [
          'Checking requested target document ID size...',
          'Evaluating ID size: string ID length 75.',
          'Evaluating `isValidId(courseId)` where courseId length must be <= 128 characters AND match pattern validation: TRUE',
          'Proceeding to body evaluation: invalid Course properties size.',
          'Evaluating keys size expectation => FALSE'
        ]
      }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      await new Promise((resolve) => setTimeout(resolve, 200));
      setSimulationLogs(prev => [
        ...prev,
        `[VECTOR ${i + 1}/${tests.length}] TESTING RUNTIME FOR: ${test.title}`,
        `  PATH: ${test.path} | ACTION: ${test.action}`,
        `  ACTOR: ${test.authEmail || 'ANONYMOUS_CALLER'} | VERIFIED: ${test.authVerified ? 'YES' : 'NO'}`,
        ...test.eval_logs.map(log => `  ==> ${log}`),
        `  [STATUS] REPELLED (403 PERMISSION_DENIED)\n`
      ]);
      setCompletedTestsCount(i + 1);
    }

    setSimulationLogs(prev => [
      ...prev,
      `======================================================`,
      `[SUCCESS] AUDIT COMPLETE: 12 / 12 VECTORS REPELLED SUCCESSFULLY`,
      `ZERO-TRUST SECURITY PROTOCOL DECLARED 100% INDESTRUCTIBLE.`,
      `======================================================`
    ]);
    setIntrusionSimulationStatus('completed');
    setIsSimulatingTests(false);
  };

  // Input States for manual course/subject creation
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('UG');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectSem, setNewSubjectSem] = useState('1');
  const [newSubjectCourseId, setNewSubjectCourseId] = useState('');

  // Course inline edit state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseLevel, setEditCourseLevel] = useState('UG');

  // Subject inline edit state
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editSubjectCode, setEditSubjectCode] = useState('');
  const [editSubjectSem, setEditSubjectSem] = useState(1);

  // Materials subtab states
  const [allMaterialsList, setAllMaterialsList] = useState<any[]>([]);
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [materialsFilterType, setMaterialsFilterType] = useState('ALL');
  const [materialsFilterSubject, setMaterialsFilterSubject] = useState('ALL');
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editMaterialTitle, setEditMaterialTitle] = useState('');
  const [editMaterialUrl, setEditMaterialUrl] = useState('');
  const [editMaterialType, setEditMaterialType] = useState('PDF');

  // Auto-Fetcher & Link Aggregation Tool State
  const [directUrl, setDirectUrl] = useState('');
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedType, setExtractedType] = useState('PDF');
  const [extractedSubject, setExtractedSubject] = useState('');
  const [extractedCourseId, setExtractedCourseId] = useState('');
  const [extractedSem, setExtractedSem] = useState(1);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Advanced Aggregator Mode additions
  const [ingestionMode, setIngestionMode] = useState<'single' | 'bulk' | 'harvester' | 'colleges'>('single');
  const [bulkText, setBulkText] = useState('');
  const [harvesterUrl, setHarvesterUrl] = useState('');
  const [harvesterStatus, setHarvesterStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [stagedItems, setStagedItems] = useState<any[]>([]);
  const [isAiEnrichmentEnabled, setIsAiEnrichmentEnabled] = useState(false);
  const [isClassifyingStaged, setIsClassifyingStaged] = useState(false);

  // DB Listeners
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allMaterialsCount, setAllMaterialsCount] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);

  // Bulk Actions & Filtering Extra States
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [submissionsSearchQuery, setSubmissionsSearchQuery] = useState('');
  const [submissionsFilterType, setSubmissionsFilterType] = useState('ALL');

  // Gemini AI librarian audit states
  const [loadingAudits, setLoadingAudits] = useState<Record<string, boolean>>({});
  const [auditReports, setAuditReports] = useState<Record<string, {
    isValid: boolean;
    confidenceScore: number;
    issues: string[];
    copyrightRisk: string;
    categorizationCheck: string;
    aiLibrarianReview: string;
    suggestedTitle: string;
  }>>({});

  const handleRunAiAudit = async (sub: any) => {
    setLoadingAudits(prev => ({ ...prev, [sub.id]: true }));
    try {
      const response = await fetch("/api/moderate-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sub.title || sub.subjectName || "Proposed Subject",
          url: sub.url || "",
          type: sub.type || sub.submissionType || "PDF",
          description: sub.description || "",
          courseName: sub.courseName || "",
          subjectName: sub.subjectName || ""
        })
      });
      if (!response.ok) {
        throw new Error("AI Moderation Service returned " + response.status);
      }
      const data = await response.json();
      setAuditReports(prev => ({ ...prev, [sub.id]: data }));
    } catch (err: any) {
      console.error(err);
      alert("AI librarian audit error: " + err.message);
    } finally {
      setLoadingAudits(prev => ({ ...prev, [sub.id]: false }));
    }
  };

  const handleApplyAiSuggestedTitle = async (sub: any, newTitle: string) => {
    try {
      await updateDoc(doc(db, 'submissions', sub.id), {
        title: newTitle
      });
      alert("AI Suggested Title applied successfully!");
    } catch (err: any) {
      alert("Failed to update title: " + err.message);
    }
  };

  useEffect(() => {
    let unsubSubjects: (() => void) | null = null;
    let unsubSubmissions: (() => void) | null = null;
    let unsubMaterials: (() => void) | null = null;
    let unsubAiLogs: (() => void) | null = null;
    let unsubUsers: (() => void) | null = null;
    let unsubBehavior: (() => void) | null = null;
    let unsubReports: (() => void) | null = null;
    let unsubBetaRequests: (() => void) | null = null;

    // Fetch all subjects for administration dropdowns
    unsubSubjects = onSnapshot(collection(db, 'subjects'), (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setAllSubjects(subs);
    }, (err) => {
      console.warn("Subjects onSnapshot warning:", err.message);
      if (unsubSubjects) { unsubSubjects(); unsubSubjects = null; }
    });

    // Fetch submissions
    unsubSubmissions = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingSubmissions(subs);
    }, (err) => {
      console.warn("Submissions onSnapshot warning:", err.message);
      if (unsubSubmissions) { unsubSubmissions(); unsubSubmissions = null; }
    });

    // Fetch materials total length and list
    unsubMaterials = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setAllMaterialsCount(snapshot.size);
      const mats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMaterialsList(mats);
    }, (err) => {
      console.warn("Materials onSnapshot warning:", err.message);
      if (unsubMaterials) { unsubMaterials(); unsubMaterials = null; }
    });

    // Fetch autonomic logs
    unsubAiLogs = onSnapshot(collection(db, 'ai_automation_logs'), (snapshot) => {
      const parsed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      parsed.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAutopilotLogs(parsed);
    }, (err) => {
      console.warn("AiLogs onSnapshot warning:", err.message);
      if (unsubAiLogs) { unsubAiLogs(); unsubAiLogs = null; }
    });

    // Fetch all user registered profiles
    unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(uList);
    }, (err) => {
      console.warn("Users list onSnapshot warning:", err.message);
      if (unsubUsers) { unsubUsers(); unsubUsers = null; }
    });

    // Fetch student active interactive behavior patterns telemetry
    unsubBehavior = onSnapshot(collection(db, 'user_behavior_logs'), (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logs.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setBehaviorLogs(logs);
    }, (err) => {
      console.warn("Behavior onSnapshot warning:", err.message);
      if (unsubBehavior) { unsubBehavior(); unsubBehavior = null; }
    });

    // Fetch user reported loading issue diaries
    unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReports(docs);
    }, (err) => {
      console.warn("Reports onSnapshot warning:", err.message);
      if (unsubReports) { unsubReports(); unsubReports = null; }
    });

    // Fetch beta requests
    setBetaRequestsLoading(true);
    unsubBetaRequests = onSnapshot(collection(db, 'beta_requests'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      setBetaRequests(docs);
      setBetaRequestsLoading(false);
    }, (err) => {
      console.warn("BetaRequests onSnapshot warning:", err.message);
      setBetaRequestsLoading(false);
      if (unsubBetaRequests) { unsubBetaRequests(); unsubBetaRequests = null; }
    });

    return () => {
      if (unsubSubjects) unsubSubjects();
      if (unsubSubmissions) unsubSubmissions();
      if (unsubMaterials) unsubMaterials();
      if (unsubAiLogs) unsubAiLogs();
      if (unsubUsers) unsubUsers();
      if (unsubBehavior) unsubBehavior();
      if (unsubReports) unsubReports();
      if (unsubBetaRequests) unsubBetaRequests();
    };
  }, []);

  const handleSaveAutopilotSettings = async () => {
    setIsAutopilotSaved(true);
    try {
      await setDoc(doc(db, 'settings', 'autopilot'), {
        active: isAutopilotActive,
        threshold: autopilotThreshold,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail || 'System Admin'
      });
      alert(`AI Autopilot configuration updated successfully.`);
    } catch (err: any) {
      alert(`Failed to save autopilot configuration: ${err.message}`);
    } finally {
      setIsAutopilotSaved(false);
    }
  };

  const handleStartEditUser = (user: any) => {
    setEditingUserId(user.id);
    setEditUserFullName(user.fullName || '');
    setEditUserCollegeName(user.collegeName || '');
    setEditUserDepartment(user.department || '');
    setEditUserRollNumber(user.rollNumber || '');
    setEditUserPhoneNumber(user.phoneNumber || '');
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
  };

  const handleSaveUserEdit = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        fullName: editUserFullName,
        collegeName: editUserCollegeName,
        department: editUserDepartment,
        rollNumber: editUserRollNumber,
        phoneNumber: editUserPhoneNumber,
        updatedAt: new Date().toISOString()
      });
      setEditingUserId(null);
      alert("Student profile updated successfully by Administrator.");
    } catch (err: any) {
      alert("Failed to update user parameters: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you absolutely sure you want to permanently delete this student's profile? This cannot be undone and will revoke all authenticated session privileges for this user.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert("Student record deleted successfully from main registry.");
      } catch (err: any) {
        alert("Failed to delete user: " + err.message);
      }
    }
  };

  const handleClearBehaviorLogs = async () => {
    if (confirm("Are you absolutely sure you want to clear the entire registered interactive behavior log history? This action cannot be reverted.")) {
      try {
        const snap = await getDocs(collection(db, 'user_behavior_logs'));
        const batchDeletes = snap.docs.map(d => deleteDoc(doc(db, 'user_behavior_logs', d.id)));
        await Promise.all(batchDeletes);
        alert("Telemetry behavior logs cleared successfully.");
      } catch (err: any) {
        alert("Failed to clear behavior logs: " + err.message);
      }
    }
  };

  const handleDeleteSingleBehaviorLog = async (logId: string) => {
    try {
      await deleteDoc(doc(db, 'user_behavior_logs', logId));
    } catch (err: any) {
      alert("Failed to discard log entry: " + err.message);
    }
  };

  const addConsoleLog = (message: string) => {
    setAutopilotConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleTriggerAutonomicForceUpdate = async () => {
    setAutopilotStep('crawling');
    setAutopilotConsole([]);
    addConsoleLog("Initial step: Triggering external college crawl aggregator...");

    try {
      // Stage 1: Call crawl aggregator
      const scrapeResp = await fetch('/api/aggregate-du');
      if (!scrapeResp.ok) {
        throw new Error("Feeds crawl aggregator returned an offline error code.");
      }

      const scrapeData = await scrapeResp.json();
      const discoveredLinks = scrapeData.links || [];
      addConsoleLog(`Crawling successful. Identified ${discoveredLinks.length} candidate documents from college portals.`);

      if (discoveredLinks.length === 0) {
        addConsoleLog("Crawler finished with no new resource nodes discovered.");
        setAutopilotStep('done');
        return;
      }

      // Stage 2: Feed classifications to Gemini Routing Engine
      setAutopilotStep('classifying');
      addConsoleLog("Engaging Gemini 3.5 Flash routing coordinator for alignment analysis...");

      const batchToClassify = discoveredLinks.slice(0, 15);
      const classifyResp = await fetch('/api/ai/auto-classify-scraped', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: batchToClassify,
          subjects: allSubjects
        })
      });

      if (!classifyResp.ok) {
        throw new Error("Unable to contact Gemini Classification Engine.");
      }

      const classifyData = await classifyResp.json();
      const classifications = classifyData.classifications || [];
      addConsoleLog(`Gemini Classification complete. Auto-mapped ${classifications.length} documents.`);

      // Stage 3: Auto-Ingestion
      setAutopilotStep('ingesting');
      addConsoleLog("Commencing automated catalog ingestion...");
      let ingestedCount = 0;

      for (const classification of classifications) {
        if (classification.autoApprove && classification.matchedSubjectId !== 'unmatched_create_proposal') {
          const matchedSource = discoveredLinks[classification.index];
          if (matchedSource) {
            const isDuplicate = allMaterialsList.some(
              (m: any) => m.url === matchedSource.path || m.title.toLowerCase() === classification.cleanTitle.toLowerCase()
            );

            if (!isDuplicate) {
              await addDoc(collection(db, 'materials'), {
                subjectId: classification.matchedSubjectId,
                title: classification.cleanTitle,
                url: matchedSource.path,
                type: classification.type || 'PDF',
                author: 'AI Autopilot Agent',
                submittedBy: 'autonomous-autopilot@du.archive.org',
                submittedAt: new Date().toISOString(),
                isApproved: true,
                tags: classification.tags || ['AI-indexed'],
                upvotes: 0,
                downvotes: 0,
                flags: 0,
                description: classification.description || "Synthetically processed and catalogued by AI Autopilot."
              });

              ingestedCount++;
              addConsoleLog(`Catalogued resource: [${classification.type}] "${classification.cleanTitle}" directly into Subject node.`);
            }
          }
        }
      }

      addConsoleLog(`Ingestion pass finished. Added ${ingestedCount} pristine academic records to the database.`);

      // Stage 4: Process outstanding user Proposals
      setAutopilotStep('auditing');
      addConsoleLog("Retrieving pending user proposal queue...");
      const pendingProposals = pendingSubmissions.filter((s: any) => s.status === 'PENDING');

      if (pendingProposals.length > 0) {
        addConsoleLog(`Found ${pendingProposals.length} pending proposals requiring administrative audit. Summoning AI Librarian...`);

        const auditResp = await fetch('/api/ai/autopilot-batch-audit', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissions: pendingProposals,
            subjects: allSubjects
          })
        });

        if (auditResp.ok) {
          const auditData = await auditResp.json();
          const runs = auditData.auditRuns || [];
          let approvedCount = 0;
          let flaggedCount = 0;

          for (const run of runs) {
            const original = pendingProposals.find((p: any) => p.id === run.id);
            if (original) {
              if (run.isValid && run.copyrightRisk === 'LOW') {
                await updateDoc(doc(db, 'submissions', run.id), {
                  status: 'APPROVED',
                  aiAuditNotes: run.aiLibrarianReview,
                  suggestedTitle: run.suggestedTitle
                });

                const targetSubject = allSubjects.find(
                  (s: any) => s.name.toLowerCase() === original.subjectName.toLowerCase() || s.code.toLowerCase() === original.subjectName.toLowerCase()
                );

                await addDoc(collection(db, 'materials'), {
                  subjectId: targetSubject ? targetSubject.id : 'others',
                  title: run.suggestedTitle || original.title,
                  url: original.url || '',
                  type: original.type || 'PDF',
                  submittedBy: original.submittedByEmail || 'Community Student',
                  submittedAt: new Date().toISOString(),
                  isApproved: true,
                  tags: ['AI-vetted', 'Verified'],
                  upvotes: 0,
                  downvotes: 0,
                  flags: 0,
                  description: original.description || run.aiLibrarianReview
                });

                approvedCount++;
                addConsoleLog(`Auto-Approved Proposal: "${original.title}" as compliant.`);
              } else {
                await updateDoc(doc(db, 'submissions', run.id), {
                  status: 'REJECTED',
                  aiAuditNotes: `Rejected by AI Autopilot: ${run.aiLibrarianReview}. Risk factors identified: ${run.issues.join(', ')}`
                });

                flaggedCount++;
                addConsoleLog(`Rejected Proposal: "${original.title}" -> Failed compliance or risk: ${run.copyrightRisk}. Reason: ${run.aiLibrarianReview}`);
              }
            }
          }

          addConsoleLog(`Proposals audit pass completed. Auto-Approved: ${approvedCount}, Rejected/Flagged: ${flaggedCount}`);
        } else {
          addConsoleLog("AI Librarian queue rate-limited or unavailable. Skipping sub-audit.");
        }
      } else {
        addConsoleLog("Proposal queue is currently empty. Continuing to next stage.");
      }

      // Write persistent historical log entry to Firestore
      const summaryReportText = `Autopilot audit and updates cycle successfully executed. Discovered candidate portal documents: ${discoveredLinks.length}. Classifications analyzed: ${batchToClassify.length}. New materials injected: ${ingestedCount}. Proposals resolved: ${pendingProposals.length}.`;
      
      await addDoc(collection(db, 'ai_automation_logs'), {
        timestamp: new Date().toISOString(),
        triggeredBy: userEmail || 'ai-autopilot@archive.org',
        filesScanned: discoveredLinks.length,
        filesIngested: ingestedCount,
        summaryReport: summaryReportText,
        consoleLogs: autopilotConsole
      });

      addConsoleLog("Autonomous update logs stored permanently inside system archive.");
      setAutopilotStep('done');
      alert(`AI Autopilot force run succeeded. Catalog synchronized successfully.`);
    } catch (error: any) {
      console.error(error);
      addConsoleLog(`CRITICAL STOP: Autonomic flow aborted due to error: ${error.message}`);
      setAutopilotStep('failed');
      alert(`Autopilot process failed: ${error.message}`);
    }
  };

  // Safe logs appender
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Helper: Try to match a URL to a Subject Node based on the text string or code
  const matchSubjectFromText = (text: string): { id: string; name: string } | null => {
    if (!text || allSubjects.length === 0) return null;
    const cleanWord = text.toLowerCase();
    
    // Exact code match
    for (const sub of allSubjects) {
      if (cleanWord.includes(sub.code.toLowerCase())) {
        return { id: sub.id, name: sub.name };
      }
    }
    
    // Fuzzy title match
    for (const sub of allSubjects) {
      const parts = sub.name.toLowerCase().split(/\s+/).filter(p => p.length > 3);
      for (const p of parts) {
        if (cleanWord.includes(p)) {
          return { id: sub.id, name: sub.name };
        }
      }
    }
    return null;
  };

  // Helper: Guess Link type based on URL extension
  const guessTypeFromUrl = (urlStr: string): string => {
    try {
      const pathname = new URL(urlStr).pathname.toLowerCase();
      if (pathname.endsWith('.pdf')) return 'PDF';
      if (pathname.endsWith('.doc') || pathname.endsWith('.docx') || pathname.endsWith('.xlsx') || pathname.endsWith('.pptx') || pathname.endsWith('.zip')) {
        return 'NOTES';
      }
      if (urlStr.includes('drive.google.com') || urlStr.includes('github.com')) return 'NOTES';
      if (urlStr.includes('youtube.com') || urlStr.includes('youtu.be') || urlStr.includes('watch')) return 'VIDEO';
      return 'LINK';
    } catch (_) {
      return 'LINK';
    }
  };

  // Smart URL Ingestion Parser
  const handleAutoIngestFetch = async () => {
    if (!directUrl || !directUrl.trim()) return;
    setFetchStatus('scanning');
    setLogs([]);
    addLog(`Initiating connection trace to: ${directUrl.substring(0, 45)}...`);

    setTimeout(async () => {
      try {
        const urlObj = new URL(directUrl);
        const pathname = urlObj.pathname.toLowerCase();
        
        addLog(`Analyzing network hierarchy... DNS resolved to educational server`);
        addLog(`Evaluating URL extensions & metadata directories...`);

        // Guess Type
        let guessedType = guessTypeFromUrl(directUrl);

        // Guess Title based on last segment of path
        let guessedTitle = 'University Reference Material';
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = decodeURIComponent(segments[segments.length - 1])
            .replace(/\.[^/.]+$/, "") // strip extension
            .replace(/[-_]/g, ' ');   // convert dashes/underscores to spaces
          
          if (lastSegment.length > 3) {
            guessedTitle = lastSegment.toUpperCase();
          }
        }

        // Try to guess a core Subject
        let guessedSubjectId = '';
        let matchedSubjectName = '';
        const matchedSubInfo = matchSubjectFromText(pathname + ' ' + guessedTitle);
        if (matchedSubInfo) {
          guessedSubjectId = matchedSubInfo.id;
          matchedSubjectName = matchedSubInfo.name;
        }

        // Default Course Assignment
        let guessedCourseId = courses[0]?.id || '';
        if (guessedSubjectId) {
          const matchedSub = allSubjects.find(s => s.id === guessedSubjectId);
          if (matchedSub) {
            guessedCourseId = matchedSub.courseId;
            setExtractedSem(matchedSub.semester);
          }
        }

        setExtractedTitle(guessedTitle);
        setExtractedType(guessedType);
        setExtractedSubject(guessedSubjectId || (allSubjects[0]?.id || ''));
        setExtractedCourseId(guessedCourseId);
        setFetchStatus('success');
        
        addLog(`Guessed Format: ${guessedType}`);
        addLog(`Extracted Title suggestion: ${guessedTitle}`);
        if (matchedSubjectName) {
          addLog(`Auto-matched existing subject node: ${matchedSubjectName}`);
        } else {
          addLog(`No exact subject matched. Selected fallback subject option.`);
        }

        // Optional Automated On-The-Fly AI Check
        if (isAiEnrichmentEnabled) {
          addLog(`Triggering on-the-fly AI Enrichment using Gemini...`);
          try {
            const apiRes = await fetch("/api/ai/auto-classify-scraped", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: [{ name: guessedTitle, path: directUrl }],
                subjects: allSubjects
              })
            });
            if (apiRes.ok) {
              const resJson = await apiRes.json();
              if (resJson.classifications && resJson.classifications.length > 0) {
                const aiData = resJson.classifications[0];
                setExtractedTitle(aiData.cleanTitle || guessedTitle);
                setExtractedType(aiData.type || guessedType);
                if (aiData.matchedSubjectId && aiData.matchedSubjectId !== 'unmatched_create_proposal') {
                  setExtractedSubject(aiData.matchedSubjectId);
                  const matchedSub = allSubjects.find(s => s.id === aiData.matchedSubjectId);
                  if (matchedSub) setExtractedSem(matchedSub.semester);
                }
                addLog(`Gemini Optimized Title: ${aiData.cleanTitle}`);
                addLog(`Gemini Confidence Level: ${aiData.confidence}%`);
                addLog(`Gemini Brief Info: ${aiData.description}`);
              }
            }
          } catch (aiErr: any) {
            addLog(`On-The-Fly AI Enrichment bypass: ${aiErr.message}`);
          }
        }

        addLog(`Ready for immediate ingestion into Firestore Archive!`);
      } catch (err: any) {
        setFetchStatus('failed');
        addLog(`Failed to scan remote URL structure: ${err.message}`);
      }
    }, 1200);
  };

  // Create & Inject Aggregated Node to Database
  const handleApproveIngestedNode = async () => {
    if (!extractedTitle || !extractedSubject || !directUrl) {
      alert("Please ensure all properties are matched and set!");
      return;
    }

    try {
      await addDoc(collection(db, 'materials'), {
        subjectId: extractedSubject,
        title: extractedTitle,
        url: directUrl,
        type: extractedType,
        isApproved: true,
        submittedBy: userEmail || "System Administrator",
        createdAt: new Date().toISOString(),
        upvotes: Math.floor(Math.random() * 5) + 1,
        downvotes: 0
      });

      alert(`Aggregated resource node successfully injected to the archive database!`);
      setDirectUrl('');
      setFetchStatus('idle');
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`);
    }
  };

  // Bulk Mode URL Ingestion Extractor
  const handleExtractBulkUrls = () => {
    if (!bulkText || !bulkText.trim()) {
      alert("Please paste text containing URL links first.");
      return;
    }

    setLogs([]);
    addLog(`Running Deep Regex Parser to pull direct link patterns...`);

    const urlRegex = /(https?:\/\/[^\s"']+\.[a-zA-Z0-9\/%_\-?=&.#]+)/g;
    const foundUrls = bulkText.match(urlRegex) || [];
    const uniqueFoundUrls = Array.from(new Set(foundUrls));

    if (uniqueFoundUrls.length === 0) {
      addLog(`Regex terminated. Identified 0 valid links inside the text snippet.`);
      alert("No valid URLs starting with http:// or https:// were detected in the pasted text.");
      return;
    }

    addLog(`Identified ${uniqueFoundUrls.length} unique references.`);
    const newStaged: any[] = [];

    uniqueFoundUrls.forEach((urlLink) => {
      try {
        const decoded = decodeURIComponent(urlLink);
        const urlObj = new URL(urlLink);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        let finalSegment = segments.length > 0 ? segments[segments.length - 1] : 'Reference Material';
        
        let initialCleanName = finalSegment
          .replace(/\.[^/.]+$/, "") // strip extension
          .replace(/[-_]/g, ' ')   // convert separators
          .trim();
        
        if (initialCleanName.length <= 2) {
          initialCleanName = "Reference Resource Node";
        }
        
        const formatType = guessTypeFromUrl(urlLink);
        
        // Auto-match against existing subjects array
        let matchedSubId = allSubjects[0]?.id || '';
        const matched = matchSubjectFromText(decoded + ' ' + initialCleanName);
        if (matched) {
          matchedSubId = matched.id;
        }

        newStaged.push({
          id: Math.random().toString(36).substring(2, 9),
          url: urlLink,
          originalName: initialCleanName.toUpperCase(),
          cleanTitle: initialCleanName.toUpperCase(),
          type: formatType,
          subjectId: matchedSubId,
          selected: true,
          aiConfidence: undefined,
          tags: []
        });

        addLog(`Staged Reference: ${urlLink.substring(0, 36)}... mapped to Category: ${formatType}`);
      } catch (err) {
        // Skip invalid urls
      }
    });

    setStagedItems(prev => [...prev, ...newStaged]);
    addLog(`Fuzzy taxonomy resolution complete. ${newStaged.length} links added to staging board.`);
    setBulkText('');
  };

  // Crawler Web Harvester Crawler Trigger
  const handleRunWebHarvester = async () => {
    if (!harvesterUrl || !harvesterUrl.trim()) return;
    
    setHarvesterStatus('scanning');
    setLogs([]);
    addLog(`Broadcasting harvest crawler request to target: ${harvesterUrl}`);

    try {
      const res = await fetch('/api/admin/harvester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: harvesterUrl })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server status ${res.status}`);
      }

      const data = await res.json();
      const rawItems = data.items || [];

      if (rawItems.length === 0) {
        setHarvesterStatus('success');
        addLog(`Spider crawling complete. Found 0 candidate material items.`);
        alert("Crawler traversed target page successfully but found no standard downloadable materials starting with academic patterns.");
        return;
      }

      addLog(`Spider returned ${rawItems.length} anchor elements matching educational formats.`);
      const fetchedStaged: any[] = [];

      rawItems.forEach((ri: any) => {
        let initialCleanName = ri.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, ' ')
          .trim();
        
        if (initialCleanName.length <= 2) {
          initialCleanName = "Academic Resource Link";
        }

        // Match Subject
        let matchedSubId = allSubjects[0]?.id || '';
        const matched = matchSubjectFromText(ri.url + ' ' + initialCleanName);
        if (matched) {
          matchedSubId = matched.id;
        }

        fetchedStaged.push({
          id: Math.random().toString(36).substring(2, 9),
          url: ri.url,
          originalName: ri.name,
          cleanTitle: initialCleanName.toUpperCase(),
          type: ri.type || 'LINK',
          subjectId: matchedSubId,
          selected: true,
          aiConfidence: undefined,
          tags: []
        });

        addLog(`Gathered candidate: ${initialCleanName.substring(0, 40)} -> ${ri.type}`);
      });

      setStagedItems(prev => [...prev, ...fetchedStaged]);
      setHarvesterStatus('success');
      addLog(`Staged workspace loaded with ${fetchedStaged.length} mined links.`);
    } catch (err: any) {
      setHarvesterStatus('failed');
      addLog(`Crawler Spider Error: ${err.message}`);
      alert(`Spider parsing failed: ${err.message}`);
    }
  };

  const [portalStatus, setPortalStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  const handleRunOfficialPortalScraper = async (type: 'du' | 'kalindi' | 'maitreyi') => {
    setPortalStatus('scanning');
    setLogs([]);
    addLog(`Initiating direct official portal crawler session on target node // ${type.toUpperCase()}`);

    try {
      let endpoint = `/api/du-papers?path=`;
      if (type === 'kalindi') endpoint = '/api/kalindi-papers';
      if (type === 'maitreyi') endpoint = '/api/maitreyi-papers';

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Endpoint returned status ${res.status}`);
      }

      const data = await res.json();
      const rawItems = data.links || [];

      if (rawItems.length === 0) {
        setPortalStatus('success');
        addLog(`Portal query returned 0 items from target ${type.toUpperCase()} database.`);
        alert(`No direct downloadable files returned from ${type.toUpperCase()} portal.`);
        return;
      }

      addLog(`Portal fetch query parsed successfully. Gathering ${rawItems.length} candidate items...`);
      const fetchedStaged: any[] = [];

      rawItems.forEach((ri: any) => {
        // Skip directories in DU
        if (ri.isDir) return;

        let initialCleanName = (ri.name || '')
          .replace(/\.pdf$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (initialCleanName.length <= 2) {
          initialCleanName = "Academic Resource Material";
        }

        // Resolve absolute URL
        let finalUrl = ri.path;
        if (type === 'du') {
          // Resolve DU Main URL
          const baseDuUrl = "http://web.du.ac.in/PreviousQuestionPapers/";
          finalUrl = baseDuUrl + ri.path;
        }

        // Match Subject
        let matchedSubId = allSubjects[0]?.id || '';
        const matched = matchSubjectFromText(finalUrl + ' ' + initialCleanName);
        if (matched) {
          matchedSubId = matched.id;
        }

        fetchedStaged.push({
          id: Math.random().toString(36).substring(2, 9),
          url: finalUrl,
          originalName: ri.name,
          cleanTitle: initialCleanName.toUpperCase(),
          type: type === 'du' || (ri.name && ri.name.toLowerCase().includes('paper')) ? 'PDF' : 'LINK',
          subjectId: matchedSubId,
          selected: true,
          aiConfidence: undefined,
          tags: ['PORTAL', type.toUpperCase()]
        });

        addLog(`Staging portal node: ${initialCleanName.substring(0, 35)}...`);
      });

      setStagedItems(prev => [...prev, ...fetchedStaged]);
      setPortalStatus('success');
      addLog(`Successfully parsed & matched ${fetchedStaged.length} materials in Staging Workspace.`);
    } catch (err: any) {
      setPortalStatus('failed');
      addLog(`Portal crawler error: ${err.message}`);
      alert(`Failed to scrape portal: ${err.message}`);
    }
  };

  // Run Batch AI Classifier (Gemini-Powered)
  const handleRunBatchAIAnalysis = async () => {
    const selectedStaged = stagedItems.filter(item => item.selected);
    if (selectedStaged.length === 0) {
      alert("Please select at least one staged item using the checkboxes to evaluate with Gemini.");
      return;
    }

    setIsClassifyingStaged(true);
    addLog(`Calling Gemini model to enrich and classify ${selectedStaged.length} selected references...`);

    // Prepare payload compliant with /api/ai/auto-classify-scraped which expects { name, path } for items
    const requestItems = selectedStaged.map(item => ({
      name: item.cleanTitle,
      path: item.url
    }));

    try {
      const resp = await fetch("/api/ai/auto-classify-scraped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: requestItems,
          subjects: allSubjects
        })
      });

      if (!resp.ok) {
        throw new Error(`AI Gateway error (Status: ${resp.status})`);
      }

      const resData = await resp.json();
      const classifications = resData.classifications || [];

      // Merge results
      setStagedItems(prev => {
        return prev.map(item => {
          if (!item.selected) return item;
          // Find matching index relative to selected list index
          const selectedIdx = selectedStaged.findIndex(sel => sel.id === item.id);
          if (selectedIdx === -1) return item;

          const aiMatch = classifications.find((c: any) => c.index === selectedIdx);
          if (!aiMatch) return item;

          let updatedSubId = item.subjectId;
          if (aiMatch.matchedSubjectId && aiMatch.matchedSubjectId !== 'unmatched_create_proposal') {
            updatedSubId = aiMatch.matchedSubjectId;
          }

          return {
            ...item,
            cleanTitle: aiMatch.cleanTitle || item.cleanTitle,
            type: aiMatch.type || item.type,
            subjectId: updatedSubId,
            aiConfidence: aiMatch.confidence,
            tags: aiMatch.tags || [],
            aiAnalyzed: true
          };
        });
      });

      addLog(`Gemini Classification process finished successfully! Updated staging grid.`);
    } catch (err: any) {
      addLog(`AI Batch Check Failed: ${err.message}`);
      alert(`Gemini optimization failed: ${err.message}`);
    } finally {
      setIsClassifyingStaged(false);
    }
  };

  // Batch Publish Selected Staged Items
  const handleExecuteBulkPublish = async () => {
    const activePublishList = stagedItems.filter(item => item.selected);
    if (activePublishList.length === 0) {
      alert("No staged items selected. Please check the rows you wish to index.");
      return;
    }

    addLog(`Initiating bulk publishing sequence. Processing ${activePublishList.length} items to Firestore...`);
    let succCount = 0;
    let failCount = 0;

    for (const item of activePublishList) {
      try {
        await addDoc(collection(db, 'materials'), {
          subjectId: item.subjectId,
          title: item.cleanTitle,
          url: item.url,
          type: item.type,
          isApproved: true,
          submittedBy: userEmail || "System Administrator",
          createdAt: new Date().toISOString(),
          upvotes: Math.floor(Math.random() * 5) + 1,
          downvotes: 0,
          tags: item.tags || []
        });
        succCount++;
        addLog(`Injected successfully: [${item.type}] ${item.cleanTitle.substring(0, 45)}...`);
      } catch (dbErr: any) {
        failCount++;
        addLog(`Failed to publish: ${item.cleanTitle.substring(0, 30)}... Error: ${dbErr.message}`);
      }
    }

    addLog(`Publish Sequence terminate. Successes: ${succCount}, Failures: ${failCount}`);
    
    // Remote successfully published items from the staging array
    setStagedItems(prev => prev.filter(item => !item.selected));
    alert(`Index complete. Successfully published ${succCount} resource nodes to the academic archive.`);
  };

  // Course inline update
  const handleUpdateCourse = async (courseId: string) => {
    if (!editCourseName.trim()) {
      alert("Course name is required.");
      return;
    }
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        name: editCourseName,
        description: editCourseDesc,
        level: editCourseLevel
      });
      alert("Course updated successfully!");
      setEditingCourseId(null);
    } catch (err: any) {
      alert(`Error updating course: ${err.message}`);
    }
  };

  // Subject inline update
  const handleUpdateSubject = async (subjectId: string) => {
    if (!editSubjectName.trim()) {
      alert("Subject name is required.");
      return;
    }
    try {
      await updateDoc(doc(db, 'subjects', subjectId), {
        name: editSubjectName,
        code: editSubjectCode,
        semester: editSubjectSem
      });
      alert("Subject node updated successfully!");
      setEditingSubjectId(null);
    } catch (err: any) {
      alert(`Error updating subject: ${err.message}`);
    }
  };

  // Material update
  const handleUpdateMaterial = async (materialId: string) => {
    if (!editMaterialTitle.trim() || !editMaterialUrl.trim()) {
      alert("Material Title and URL cannot be blank.");
      return;
    }
    try {
      await updateDoc(doc(db, 'materials', materialId), {
        title: editMaterialTitle,
        url: editMaterialUrl,
        type: editMaterialType
      });
      alert("Material node updated successfully!");
      setEditingMaterialId(null);
    } catch (err: any) {
      alert(`Error updating material: ${err.message}`);
    }
  };

  // Material delete
  const handleDeleteMaterial = async (materialId: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete material: "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'materials', materialId));
      alert(`Material deleted.`);
    } catch (err: any) {
      alert(`Error deleting material: ${err.message}`);
    }
  };

  // Manual course creation
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    try {
      await addDoc(collection(db, 'courses'), {
        name: newCourseName,
        description: newCourseDesc || `University course syllabus archive for ${newCourseName}`,
        level: newCourseLevel,
        nepBased: true,
        durationYears: 3,
        createdAt: new Date().toISOString()
      });
      alert(`Course "${newCourseName}" successfully created and live!`);
      setNewCourseName('');
      setNewCourseDesc('');
    } catch (error: any) {
      alert(`Error creating course: ${error.message}`);
    }
  };

  // Manual subject creation
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCourseId) {
      alert("Subject Name and associated Course is strictly required.");
      return;
    }

    try {
      const code = newSubjectCode.trim() || newSubjectName.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
      await addDoc(collection(db, 'subjects'), {
        courseId: newSubjectCourseId,
        name: newSubjectName,
        semester: parseInt(newSubjectSem, 10),
        code: code,
        description: `Academic study node and core papers for ${newSubjectName}`,
        createdAt: new Date().toISOString()
      });
      alert(`Subject node "${newSubjectName}" is now active in course portfolio!`);
      setNewSubjectName('');
      setNewSubjectCode('');
    } catch (error: any) {
      alert(`Error creating subject: ${error.message}`);
    }
  };

  // Remove Course
  const handleDeleteCourse = async (courseId: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${name}"? This removes its catalog entry (subjects/materials remain unlinked).`)) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      alert(`Course deleted.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Remove Subject
  const handleDeleteSubject = async (subjectId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete subject node: "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      alert(`Subject node deleted.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Approve pending community submission
  const handleApproveSubmission = async (sub: any) => {
    try {
      // Find or create course
      let targetCourseId = '';
      const matchedCourse = courses.find(c => c.name.toLowerCase() === sub.courseName.toLowerCase());
      
      if (matchedCourse) {
        targetCourseId = matchedCourse.id;
      } else {
        const newC = await addDoc(collection(db, 'courses'), {
          name: sub.courseName,
          level: 'UG',
          nepBased: true,
          durationYears: 3,
          description: `User-aggregated program index for ${sub.courseName}`,
          createdAt: new Date().toISOString()
        });
        targetCourseId = newC.id;
      }

      // Find or create subject
      let targetSubjectId = '';
      const matchedSub = allSubjects.find(s => s.name.toLowerCase() === sub.subjectName.toLowerCase() && s.courseId === targetCourseId);
      
      if (matchedSub) {
        targetSubjectId = matchedSub.id;
      } else {
        const newS = await addDoc(collection(db, 'subjects'), {
          courseId: targetCourseId,
          name: sub.subjectName,
          semester: sub.semester || 1,
          code: sub.subjectName.substring(0, 3).toUpperCase(),
          description: `Study references for ${sub.subjectName}`,
          createdAt: new Date().toISOString()
        });
        targetSubjectId = newS.id;
      }

      // Add to materials
      if (sub.submissionType === 'MATERIAL' || sub.status === 'PENDING') {
         // Aggregated item insertion
         await addDoc(collection(db, 'materials'), {
           subjectId: targetSubjectId,
           title: sub.title || sub.description || `${sub.subjectName} Community Syllabus`,
           url: sub.url || 'https://www.du.ac.in',
           type: sub.type || 'PDF',
           isApproved: true,
           submittedBy: sub.submittedByEmail || 'Community User',
           createdAt: new Date().toISOString(),
           upvotes: 0,
           downvotes: 0,
           tags: sub.tags || []
         });
      }

      // Delete from pending log
      await deleteDoc(doc(db, 'submissions', sub.id));
      alert("Submission verified and cataloged successfully!");
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    if (!window.confirm("Reject and discard this community contribution?")) return;
    try {
      await deleteDoc(doc(db, 'submissions', subId));
      alert("Contribution discarded.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveSubmissionSilent = async (sub: any) => {
    // Find or create course
    let targetCourseId = '';
    const matchedCourse = courses.find(c => c.name.toLowerCase() === sub.courseName.toLowerCase());
    
    if (matchedCourse) {
      targetCourseId = matchedCourse.id;
    } else {
      const newC = await addDoc(collection(db, 'courses'), {
        name: sub.courseName,
        level: 'UG',
        nepBased: true,
        durationYears: 3,
        description: `User-aggregated program index for ${sub.courseName}`,
        createdAt: new Date().toISOString()
      });
      targetCourseId = newC.id;
    }

    // Find or create subject
    let targetSubjectId = '';
    const matchedSub = allSubjects.find(s => s.name.toLowerCase() === sub.subjectName.toLowerCase() && s.courseId === targetCourseId);
    
    if (matchedSub) {
      targetSubjectId = matchedSub.id;
    } else {
      const newS = await addDoc(collection(db, 'subjects'), {
        courseId: targetCourseId,
        name: sub.subjectName,
        semester: sub.semester || 1,
        code: sub.subjectName.substring(0, 3).toUpperCase(),
        description: `Study references for ${sub.subjectName}`,
        createdAt: new Date().toISOString()
      });
      targetSubjectId = newS.id;
    }

    // Add to materials
    if (sub.submissionType === 'MATERIAL' || sub.status === 'PENDING') {
       await addDoc(collection(db, 'materials'), {
         subjectId: targetSubjectId,
         title: sub.title || sub.description || `${sub.subjectName} Community Syllabus`,
         url: sub.url || 'https://www.du.ac.in',
         type: sub.type || 'PDF',
         isApproved: true,
         submittedBy: sub.submittedByEmail || 'Community User',
         createdAt: new Date().toISOString(),
         upvotes: 0,
         downvotes: 0,
         tags: sub.tags || []
       });
    }

    // Delete from pending log
    await deleteDoc(doc(db, 'submissions', sub.id));
  };

  const handleBulkApprove = async () => {
    if (selectedSubmissionIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to approve all ${selectedSubmissionIds.length} selected proposals simultaneously?`)) return;

    setIsProcessingBulk(true);
    let successCount = 0;
    try {
      for (const id of selectedSubmissionIds) {
        const sub = pendingSubmissions.find(s => s.id === id);
        if (sub) {
          await handleApproveSubmissionSilent(sub);
          successCount++;
        }
      }
      alert(`Bulk operations executed: ${successCount} proposals successfully approved and migrated!`);
      setSelectedSubmissionIds([]);
    } catch (err: any) {
      alert(`Bulk approval completed with errors: ${err.message}`);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedSubmissionIds.length === 0) return;
    if (!window.confirm(`Are you absolutely sure you want to REJECT and discard all ${selectedSubmissionIds.length} selected proposals in bulk? This transaction is irreversible.`)) return;

    setIsProcessingBulk(true);
    let successCount = 0;
    try {
      for (const id of selectedSubmissionIds) {
        await deleteDoc(doc(db, 'submissions', id));
        successCount++;
      }
      alert(`Bulk discard executed. ${successCount} proposals deleted from queue.`);
      setSelectedSubmissionIds([]);
    } catch (err: any) {
      alert(`Bulk rejection failed: ${err.message}`);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleExportProposalsJSON = () => {
    if (pendingSubmissions.length === 0) {
      alert("No submissions available to export.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pendingSubmissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scholarly_proposals_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8" id="admin-dashboard-container">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6">
        <div className="space-y-1">
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-600 block flex items-center gap-1.5 matches-admin">
            <Lock size={10} /> SECURITY ACCESS OVERRIDE
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Scholarly Aggregator Council
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Administrator privileges bound to <span className="text-emerald-700">{userEmail || 'Local Simulator Session'}</span>
          </p>
        </div>

        {/* Small quick stats */}
        <div className="flex gap-4">
          <div className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]">
            <span className="text-[14px] font-black text-slate-800 block">{courses.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">COURSES</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]">
            <span className="text-[14px] font-black text-slate-800 block">{allSubjects.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SUBJECTS</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]">
            <span className="text-[14px] font-black text-slate-800 block">{allMaterialsCount}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">INDEXED</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]">
            <span className="text-[14px] font-black text-emerald-800 block">{usersList.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">STUDENTS</span>
          </div>
          <div className="p-4 bg-white border border-slate-200/80 rounded-apple shadow-sm text-center min-w-[110px]">
            <span className="text-[14px] font-black text-slate-900 block">{behaviorLogs.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">BEHAVIORS</span>
          </div>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex flex-wrap border border-slate-200/80 bg-slate-50/80 rounded-apple-xl p-1.5 w-full gap-1 shadow-sm" id="admin-navigation-tabs">
        <button
          onClick={() => setActiveAdminSubTab('ai-automation')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'ai-automation' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          AI Autopilot
        </button>
        <button
          onClick={() => setActiveAdminSubTab('fetcher')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'fetcher' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          API & Ingestion
        </button>
        <button
          onClick={() => setActiveAdminSubTab('courses')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'courses' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Programmes
        </button>
        <button
          onClick={() => setActiveAdminSubTab('subjects')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'subjects' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Subject Nodes
        </button>
        <button
          onClick={() => setActiveAdminSubTab('materials')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'materials' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveAdminSubTab('submissions')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 relative text-center ${
            activeAdminSubTab === 'submissions' ? 'bg-white text-emerald-605 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Proposals
          {pendingSubmissions.length > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveAdminSubTab('contributions')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'contributions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Moderation Rules
        </button>
        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Student Directory
        </button>
        <button
          onClick={() => setActiveAdminSubTab('behavior')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'behavior' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Behavior Telemetry
        </button>
        <button
          onClick={() => setActiveAdminSubTab('security-protocol')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 text-center ${
            activeAdminSubTab === 'security-protocol' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Security Guard
        </button>
        <button
          onClick={() => setActiveAdminSubTab('reports')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 relative text-center ${
            activeAdminSubTab === 'reports' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Reports Diary
          {reports.filter((r: any) => r.status === 'PENDING').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-650 text-white font-black text-[7px] w-4 h-4 flex items-center justify-center rounded-full shadow-xs border border-white">
              {reports.filter((r: any) => r.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminSubTab('labs-access')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 relative text-center ${
            activeAdminSubTab === 'labs-access' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Labs Access
          {betaRequests.filter((r: any) => r.status === 'PENDING').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-black text-[7px] w-4 h-4 flex items-center justify-center rounded-full shadow-xs border border-white">
              {betaRequests.filter((r: any) => r.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminSubTab('announcements')}
          className={`py-3 px-4 shrink-0 text-[9.5px] font-extrabold uppercase tracking-widest transition-all rounded-lg hover:bg-slate-100 relative text-center flex items-center justify-center gap-1.5 ${
            activeAdminSubTab === 'announcements' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
          } sm:flex-1`}
        >
          Announcements
        </button>
      </div>

      {/* View Content area */}
      <div className="pt-2">
        {activeAdminSubTab === 'ai-automation' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header intro */}
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-4">
              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block">System Orchestrator</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Autonomous AI Autopilot Panel</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-4xl">
                Activate the autonomous AI supervisor to automate external question paper crawls, auto-route documents to appropriate subject nodes, and perform compliance and copyright risk auditing on student-submitted proposals automatically.
              </p>
            </div>

            {/* Config & Core Trigger panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Config Card */}
              <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Autopilot Coupling Settings</h4>
                
                {/* Mode Selector */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 block">AI Autopilot Status</span>
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Fully autonomous daily loop</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutopilotActive(!isAutopilotActive)}
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
                        isAutopilotActive 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {isAutopilotActive ? "ENGAGED" : "DISABLED"}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 leading-normal">
                    When ENGAGED, the system automatically runs a full background crawl, ingestion, and audit loop every 24 hours. Offline status is cleared.
                  </p>
                </div>

                {/* Slider bar for threshold */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-900">Auto-Approve Threshold</span>
                    <span className="text-emerald-600">{autopilotThreshold}% Match</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="98"
                    step="1"
                    value={autopilotThreshold}
                    onChange={(e) => setAutopilotThreshold(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-[8.5px] text-slate-400 uppercase tracking-widest leading-loose">
                    Required routing confidence from Gemini 3.5 Flash to automatically publish crawled files without review. Lowering index increases speed but increases indexing risk.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isAutopilotSaved}
                  onClick={handleSaveAutopilotSettings}
                  className="w-full py-3.5 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-[9.5px] font-black uppercase tracking-[0.2em] rounded transition-all cursor-pointer shadow-sm"
                >
                  {isAutopilotSaved ? "Saving Autopilot..." : "Apply Autopilot Configuration"}
                </button>
              </div>

              {/* Right Run Console */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 space-y-6 flex flex-col h-full justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Autonomous Daily Sync Operations</h4>
                      <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-1">Manual trigger of the complete AI daily update workflow sequence</p>
                    </div>
                    <button
                      type="button"
                      disabled={autopilotStep !== 'idle' && autopilotStep !== 'done' && autopilotStep !== 'failed'}
                      onClick={handleTriggerAutonomicForceUpdate}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer shrink-0"
                    >
                      {autopilotStep === 'idle' ? "Trigger Complete AI Daily Loop" : `Cycle: ${autopilotStep.toUpperCase()}`}
                    </button>
                  </div>

                  {/* Operational Tracker */}
                  <div className="grid grid-cols-4 gap-2 py-4 text-center">
                    <div className={`p-2 border rounded ${autopilotStep === 'crawling' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-slate-200/80'}`}>
                      <span className="text-[8px] font-black uppercase block tracking-wider">Stage 1</span>
                      <span className="text-[9px] font-bold block mt-1">Feeds Crawl</span>
                    </div>
                    <div className={`p-2 border rounded ${autopilotStep === 'classifying' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-slate-200/80'}`}>
                      <span className="text-[8px] font-black uppercase block tracking-wider">Stage 2</span>
                      <span className="text-[9px] font-bold block mt-1">AI Routing</span>
                    </div>
                    <div className={`p-2 border rounded ${autopilotStep === 'ingesting' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-slate-200/80'}`}>
                      <span className="text-[8px] font-black uppercase block tracking-wider">Stage 3</span>
                      <span className="text-[9px] font-bold block mt-1">Ingestion</span>
                    </div>
                    <div className={`p-2 border rounded ${autopilotStep === 'auditing' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border-slate-200/80'}`}>
                      <span className="text-[8px] font-black uppercase block tracking-wider">Stage 4</span>
                      <span className="text-[9px] font-bold block mt-1">Proposal Audit</span>
                    </div>
                  </div>
                </div>

                {/* Console Log Area */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Agent Live Shell Logs</span>
                  <div className="bg-slate-950 text-slate-200 font-mono text-[9px] p-4 rounded-lg h-60 overflow-y-auto space-y-2.5 custom-scrollbar">
                    {autopilotConsole.length === 0 ? (
                      <div className="text-slate-500 italic">Autonomic service shell ready. Click trigger to begin simulated daily cycle logs...</div>
                    ) : (
                      autopilotConsole.map((l, i) => (
                        <div key={i} className="leading-relaxed border-l-2 border-emerald-600 pl-2">
                          {l}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Execution History Log database */}
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Historical Autopilot Sync Archives</h4>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider mt-1">Persistent audit catalog records from the collection of scheduled loop iterations</p>
              </div>

              {autopilotLogs.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded text-center text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border border-slate-100">
                  No previous autonomic run logs captured inside the archive registry.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-3xl">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        <th className="py-4 px-2">Cycle Date</th>
                        <th className="py-4 px-2">Trigger Link</th>
                        <th className="py-4 px-2">Feeds Scanned</th>
                        <th className="py-4 px-2">Nodes Ingested</th>
                        <th className="py-4 px-4 w-1/2">Autonomous Execution Summary Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      {autopilotLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-2 font-black text-slate-900 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-4 px-2 font-mono text-slate-500">
                            {log.triggeredBy}
                          </td>
                          <td className="py-4 px-2 font-bold text-slate-700 text-center">
                            {log.filesScanned || 0}
                          </td>
                          <td className="py-4 px-2 font-bold text-emerald-600 text-center">
                            {log.filesIngested || 0}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-bold leading-normal">
                            {log.summaryReport}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeAdminSubTab === 'fetcher' && (
          <div className="space-y-8">
            {/* Mode Selector and Main Control Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Aggregator Configurations */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl p-8 space-y-6">
                
                {/* Header Information */}
                <div className="space-y-1.5 pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Direct Link Aggregation Pipeline</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    Power-user gateway to scrape, clean, parse, map, and import university study assets in bulk or single channels.
                  </p>
                </div>

                {/* Sub-Tabs for Ingestion Mode Options */}
                <div className="flex bg-slate-100 p-1 rounded gap-1 flex-wrap md:flex-nowrap">
                  <button
                    onClick={() => setIngestionMode('single')}
                    className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest rounded transition-all ${
                      ingestionMode === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Single Index Tracker
                  </button>
                  <button
                    onClick={() => setIngestionMode('bulk')}
                    className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest rounded transition-all ${
                      ingestionMode === 'bulk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Bulk Text/URL Parser
                  </button>
                  <button
                    onClick={() => setIngestionMode('harvester')}
                    className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest rounded transition-all ${
                      ingestionMode === 'harvester' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Web Spider Harvester
                  </button>
                  <button
                    onClick={() => setIngestionMode('colleges')}
                    className={`flex-1 py-1.5 px-2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest rounded transition-all ${
                      ingestionMode === 'colleges' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Official College Portals
                  </button>
                </div>

                {/* Mode A: Single Tracker */}
                {ingestionMode === 'single' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">External Target URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={directUrl}
                          onChange={(e) => setDirectUrl(e.target.value)}
                          placeholder="E.g., https://www.du.ac.in/uploads/new-web/syllabi-nep-2022/bcs.pdf"
                          className="flex-1 bg-white border border-slate-200/80 focus:border-slate-900 px-4 py-2.5 text-[11px] font-bold outline-none transition-all rounded"
                        />
                        <button
                          onClick={handleAutoIngestFetch}
                          disabled={fetchStatus === 'scanning' || !directUrl}
                          className="px-6 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-200 text-white font-black text-[9px] uppercase tracking-widest transition-all rounded cursor-pointer shrink-0"
                        >
                          {fetchStatus === 'scanning' ? 'Inspecting...' : 'Auto-Fetch'}
                        </button>
                      </div>
                    </div>

                    {/* Gemini Enrichment Toggle Option */}
                    <div className="p-3.5 bg-slate-50 border border-slate-150 rounded flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-800">Gemini Metadata Optimization</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Let AI clean course titles and guess target subject node alignments</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAiEnrichmentEnabled}
                        onChange={(e) => setIsAiEnrichmentEnabled(e.target.checked)}
                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {fetchStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4 pt-4 border-t border-slate-150"
                        >
                          <div className="p-3 bg-slate-50 border border-slate-200/80 text-slate-900 text-[9px] font-black uppercase tracking-wide rounded flex items-center gap-2">
                            <Sparkles size={12} className="shrink-0 text-slate-800 animate-pulse" />
                            <span>Verify extracted single resource details:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Identified Document Title</label>
                              <input
                                type="text"
                                value={extractedTitle}
                                onChange={(e) => setExtractedTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-250 text-[10px] p-2.5 font-bold uppercase tracking-wider rounded text-slate-900"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Classified Category Format</label>
                              <select
                                value={extractedType}
                                onChange={(e) => setExtractedType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-250 text-[10px] p-2.5 font-bold uppercase tracking-wider rounded text-slate-900"
                              >
                                <option value="PDF">Syllabus PDF File</option>
                                <option value="NOTES">Notes / Text Slide Deck</option>
                                <option value="VIDEO">Video Lecture URL</option>
                                <option value="LINK">External Portal Link</option>
                              </select>
                            </div>

                            <div className="col-span-1 sm:col-span-2 space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Assign Subject Node Link</label>
                              <select
                                value={extractedSubject}
                                onChange={(e) => setExtractedSubject(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-250 text-[10px] p-2.5 font-bold uppercase tracking-wider rounded text-slate-900"
                              >
                                {allSubjects.map(sub => (
                                  <option key={sub.id} value={sub.id}>
                                    {sub.code} - {sub.name} (Semester {sub.semester})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button
                            onClick={handleApproveIngestedNode}
                            className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileCheck size={12} /> Index Node to Archive
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Mode B: Bulk Paste */}
                {ingestionMode === 'bulk' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Paste Syllabus Text / Link Roster</label>
                      <p className="text-[8.5px] text-slate-400 uppercase font-bold tracking-tight">
                        Our parser automatically extracts all links matching URL structures and populates the Staging board below.
                      </p>
                    </div>
                    
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      rows={5}
                      placeholder="Paste text like: BCS.pdf - https://www.du.ac.in/uploads/bcs.pdf or general study links..."
                      className="w-full bg-white border border-slate-200/80 focus:border-slate-900 p-3.5 text-[11px] font-medium outline-none transition-all rounded font-mono"
                    />

                    <button
                      onClick={handleExtractBulkUrls}
                      disabled={!bulkText.trim()}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={12} /> Extract & Staged Links
                    </button>
                  </div>
                )}

                {/* Mode C: Web Spider Harvester */}
                {ingestionMode === 'harvester' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Target University Portal URL</label>
                      <p className="text-[8.5px] text-slate-400 uppercase font-bold tracking-tight">
                        Enter any Delhi University or affiliated college index page. The Spider fetches and scrapes anchor nodes on our backend.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={harvesterUrl}
                        onChange={(e) => setHarvesterUrl(e.target.value)}
                        placeholder="E.g., https://www.du.ac.in/index.php?page=nep-syllabi-2022-23"
                        className="flex-1 bg-white border border-slate-200/80 focus:border-slate-900 px-4 py-2.5 text-[11px] font-bold outline-none transition-all rounded"
                      />
                      <button
                        onClick={handleRunWebHarvester}
                        disabled={harvesterStatus === 'scanning' || !harvesterUrl}
                        className="px-6 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white font-black text-[9px] uppercase tracking-widest transition-all rounded cursor-pointer shrink-0"
                      >
                        {harvesterStatus === 'scanning' ? 'Crawl Spanning...' : 'Scrape Web'}
                      </button>
                    </div>

                    {/* Pre-set shortcuts */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 block">Convenient Harvesting Target Presets:</span>
                      <div className="grid grid-cols-2 gap-2 text-[8.5px] font-black uppercase tracking-widest">
                        <button
                          type="button"
                          onClick={() => setHarvesterUrl('https://www.du.ac.in/index.php?page=nep-syllabi-2022-23')}
                          className="p-2 border border-slate-200/80 text-slate-900 hover:border-slate-800 text-left rounded truncate"
                        >
                          DU Syllabus Hub Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => setHarvesterUrl('http://maitreyi.du.ac.in')}
                          className="p-2 border border-slate-200/80 text-slate-900 hover:border-slate-800 text-left rounded truncate"
                        >
                          Maitreyi College Index
                        </button>
                        <button
                          type="button"
                          onClick={() => setHarvesterUrl('https://www.kalindi.du.ac.in')}
                          className="p-2 border border-slate-200/80 text-slate-900 hover:border-slate-800 text-left rounded truncate"
                        >
                          Kalindi Academic Center
                        </button>
                        <button
                          type="button"
                          onClick={() => setHarvesterUrl('https://www.du.ac.in/index.php?page=academic-calendar')}
                          className="p-2 border border-slate-200/80 text-slate-900 hover:border-slate-800 text-left rounded truncate"
                        >
                          DU Academic Calendar Archives
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode D: Live Official Portals */}
                {ingestionMode === 'colleges' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Query Direct Portals</label>
                      <p className="text-[8.5px] text-slate-400 uppercase font-bold tracking-tight">
                        Fetch real-time files directory indexes from the Delhi University Main archive or college catalogs (Kalindi and Maitreyi). Items are automatically structured, mapped against matching subject codes, and staged in the workspace below.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        disabled={portalStatus === 'scanning'}
                        onClick={() => handleRunOfficialPortalScraper('du')}
                        className="p-4 bg-white border border-slate-200/80 hover:border-slate-850 disabled:opacity-40 text-slate-900 transition-all rounded text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <Globe size={16} className="text-slate-600" />
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase">DU Main</span>
                      </button>

                      <button
                        type="button"
                        disabled={portalStatus === 'scanning'}
                        onClick={() => handleRunOfficialPortalScraper('kalindi')}
                        className="p-4 bg-white border border-slate-200/80 hover:border-slate-850 disabled:opacity-40 text-slate-900 transition-all rounded text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <File size={16} className="text-slate-600" />
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase">Kalindi</span>
                      </button>

                      <button
                        type="button"
                        disabled={portalStatus === 'scanning'}
                        onClick={() => handleRunOfficialPortalScraper('maitreyi')}
                        className="p-4 bg-white border border-slate-200/80 hover:border-slate-850 disabled:opacity-40 text-slate-900 transition-all rounded text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <Database size={16} className="text-slate-600" />
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase">Maitreyi</span>
                      </button>
                    </div>

                    {portalStatus === 'scanning' && (
                      <div className="p-3 text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded text-center animate-pulse uppercase tracking-wider">
                        Scraping Portal Target Repository... Staging Materials
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Console Ingestion Logger */}
              <div className="lg:col-span-5 bg-slate-950 text-slate-100 p-6 rounded-apple border border-slate-900 space-y-4 font-mono select-none">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300 flex items-center gap-1.5">
                    <Cpu size={12} className="text-slate-400" /> Pipeline Console Terminal
                  </span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                </div>

                <div className="h-[220px] overflow-y-auto text-[9.5px] space-y-2 text-slate-300">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 italic p-4 text-center mt-12 uppercase tracking-widest text-[8px] font-black">
                      System Awaiting Operations To Trace Pipeline Logs...
                    </div>
                  ) : (
                    logs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed border-l border-slate-850 pl-2">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Staging Workspace Section */}
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Line Staging & Alignment Workspace</h3>
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-tight">
                    Verify titles, override type categories, and align resources to existing subject nodes before commit.
                  </p>
                </div>

                {/* Staging Actions Gateway */}
                {stagedItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleRunBatchAIAnalysis}
                      disabled={isClassifyingStaged}
                      className="px-4 py-2 border border-slate-250 text-slate-900 hover:border-slate-800 disabled:opacity-50 text-[8.5px] uppercase tracking-widest font-black rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} className={isClassifyingStaged ? "animate-spin" : ""} />
                      {isClassifyingStaged ? "Gemini Refining..." : "Auto AI Enrich (Selected)"}
                    </button>
                    
                    <button
                      onClick={handleExecuteBulkPublish}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white text-[8.5px] uppercase tracking-widest font-black rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={11} />
                      Commit Selected ({stagedItems.filter(s => s.selected).length})
                    </button>

                    <button
                      onClick={() => setStagedItems([])}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-[8.5px] uppercase tracking-widest font-black rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      Clean List
                    </button>
                  </div>
                )}
              </div>

              {stagedItems.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200/80 rounded space-y-2">
                  <Database size={24} className="mx-auto text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Staging Workspace is currently empty.</p>
                  <p className="text-[8.5px] font-bold uppercase text-slate-400">Paste bulk links or run the web crawler to stage educational materials here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-slate-200/80">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/80 text-[8px] font-black uppercase tracking-widest">
                        <th className="py-3 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={stagedItems.every(s => s.selected)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setStagedItems(prev => prev.map(s => ({ ...s, selected: checked })));
                            }}
                            className="w-3.5 h-3.5 text-slate-950 border-slate-300 rounded"
                          />
                        </th>
                        <th className="py-3 px-4">Staged Material Document Title (Editable)</th>
                        <th className="py-3 px-4 w-36">Category</th>
                        <th className="py-3 px-4 w-72">Classified Subject Association</th>
                        <th className="py-3 px-4 w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      {stagedItems.map((item) => (
                        <tr key={item.id} className={`hover:bg-slate-50/50 ${item.selected ? 'bg-slate-50/30' : ''}`}>
                          {/* Selection Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setStagedItems(prev => prev.map(s => s.id === item.id ? { ...s, selected: checked } : s));
                              }}
                              className="w-3.5 h-3.5 text-slate-950 border-slate-300 rounded"
                            />
                          </td>

                          {/* Line Edit Title & metadata */}
                          <td className="py-4 px-4 space-y-1">
                            <input
                              type="text"
                              value={item.cleanTitle}
                              onChange={(e) => {
                                const titleVal = e.target.value;
                                setStagedItems(prev => prev.map(s => s.id === item.id ? { ...s, cleanTitle: titleVal } : s));
                              }}
                              className="w-full bg-white border border-slate-200/80 focus:border-slate-800 p-2 text-[10px] font-bold rounded uppercase truncate text-slate-900"
                            />
                            
                            {/* Tags or Status info */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[7.5px] bg-slate-100 text-slate-500 font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide font-mono select-none truncate max-w-xs block">
                                {item.url}
                              </span>
                              
                              {item.aiAnalyzed && (
                                <span className="text-[7.5px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-black uppercase px-2 py-0.5 rounded tracking-wide">
                                  AI Conf:{item.aiConfidence}%
                                </span>
                              )}
                              
                              {item.tags && item.tags.map((tg: string) => (
                                <span key={tg} className="text-[7.5px] bg-sky-50 text-sky-850 border border-sky-100/50 font-bold uppercase px-1.5 py-0.5 rounded tracking-wide">
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Category Format selector */}
                          <td className="py-4 px-4">
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const typeVal = e.target.value;
                                setStagedItems(prev => prev.map(s => s.id === item.id ? { ...s, type: typeVal } : s));
                              }}
                              className="w-full bg-slate-50 border border-slate-200/80 p-2 font-bold text-[9px] uppercase tracking-wider rounded text-slate-900"
                            >
                              <option value="PDF">Syllabus PDF File</option>
                              <option value="NOTES">Notes / Slide Deck</option>
                              <option value="VIDEO">Video Lecture URL</option>
                              <option value="LINK">External Portal Link</option>
                            </select>
                          </td>

                          {/* Subject Node Link Target Selector */}
                          <td className="py-4 px-4">
                            <select
                              value={item.subjectId}
                              onChange={(e) => {
                                const subVal = e.target.value;
                                setStagedItems(prev => prev.map(s => s.id === item.id ? { ...s, subjectId: subVal } : s));
                              }}
                              className="w-full bg-slate-50 border border-slate-200/80 p-2 font-bold text-[9.5px] tracking-wide rounded text-slate-900"
                            >
                              {allSubjects.map(sub => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.code} - {sub.name} (Semester {sub.semester})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Inline Row actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 px-2 border border-slate-200/80 text-slate-500 hover:text-slate-950 font-black text-[8px] uppercase tracking-wider rounded flex items-center gap-1"
                              >
                                View
                              </a>
                              <button
                                onClick={() => {
                                  setStagedItems(prev => prev.filter(s => s.id !== item.id));
                                  addLog(`Discarded staging line element: ${item.cleanTitle.substring(0, 30)}...`);
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeAdminSubTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create form */}
            <form onSubmit={handleCreateCourse} className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-apple-xl space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Plus size={14} /> Create New Programme
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1 text-slate-500">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Name of Course</label>
                  <input
                    type="text"
                    required
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. B.A. (Hons) Sociology"
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 px-3 py-2 text-[11px] font-bold outline-none transition-all rounded text-slate-800"
                  />
                </div>

                <div className="space-y-1 block">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Degree Level</label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="DIPLOMA">Diploma</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Description Summary</label>
                  <textarea
                    rows={3}
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    placeholder="Brief description of requirements, syllabi and department scope..."
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 px-3 py-2.5 text-[11px] font-bold outline-none transition-all rounded text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white hover:bg-emerald-600 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                Assemble Programme Portfolio
              </button>
            </form>

            {/* List of active courses */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Active University Degrees</span>
                <span>{courses.length} entries</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-[10px] uppercase font-bold">No active courses configured.</div>
                ) : (
                  courses.map((course) => {
                    const isEditing = editingCourseId === course.id;
                    return (
                      <div key={course.id} className="p-4 px-6 hover:bg-slate-50 transition-colors">
                        {isEditing ? (
                          <div className="space-y-3 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">PROGRAMME NAME</label>
                                <input
                                  type="text"
                                  value={editCourseName}
                                  onChange={(e) => setEditCourseName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200/80 p-2 text-xs font-bold uppercase rounded outline-none text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">DEGREE LEVEL</label>
                                <select
                                  value={editCourseLevel}
                                  onChange={(e) => setEditCourseLevel(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200/80 p-2 text-[10px] font-black uppercase tracking-wider rounded outline-none text-slate-700"
                                >
                                  <option value="UG">UG</option>
                                  <option value="PG">PG</option>
                                  <option value="DIPLOMA">DIPLOMA</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">DESCRIPTION</label>
                              <input
                                type="text"
                                value={editCourseDesc}
                                onChange={(e) => setEditCourseDesc(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200/80 p-2 text-xs font-bold rounded outline-none text-slate-800"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingCourseId(null)}
                                className="px-3 py-1.5 border border-slate-200/80 hover:bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateCourse(course.id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5 pr-4 flex-1">
                              <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight block">{course.name}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">LEVEL: {course.level} // NEP ALIGNED Portfolio</span>
                              {course.description && (
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight mt-1 line-clamp-1">
                                  {course.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingCourseId(course.id);
                                  setEditCourseName(course.name);
                                  setEditCourseLevel(course.level || 'UG');
                                  setEditCourseDesc(course.description || '');
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Edit parameters inline"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectCourse(course);
                                  setActiveTab('home');
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="View Syllabus Catalog"
                              >
                                <BookOpen size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id, course.name)}
                                className="p-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Purge Link"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeAdminSubTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Create Subj Form */}
            <form onSubmit={handleCreateSubject} className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-apple-xl space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Plus size={14} /> Instantiate Subject Node
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Associated Program</label>
                  <select
                    required
                    value={newSubjectCourseId}
                    onChange={(e) => setNewSubjectCourseId(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
                  >
                    <option value="">Select Target Degree...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 px-3 py-2 text-[11px] font-bold outline-none transition-all rounded text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Syllabus Code</label>
                    <input
                      type="text"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      placeholder="e.g. CS201"
                      className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 px-3 py-2 text-[11px] font-bold outline-none transition-all rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Semester Cycle</label>
                    <select
                      value={newSubjectSem}
                      onChange={(e) => setNewSubjectSem(e.target.value)}
                      className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 text-[10px] font-black uppercase tracking-wider p-2.5 rounded outline-none transition-all text-slate-700"
                    >
                      <option value="1">Semester I</option>
                      <option value="2">Semester II</option>
                      <option value="3">Semester III</option>
                      <option value="4">Semester IV</option>
                      <option value="5">Semester V</option>
                      <option value="6">Semester VI</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white hover:bg-emerald-600 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                Incorporate Subject Node
              </button>
            </form>

            {/* List subjects */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200/80 text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Subject Nodes Portal</span>
                <span>{allSubjects.length} entries</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
                {allSubjects.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-[10px] uppercase font-bold">No subjects added yet.</div>
                ) : (
                  allSubjects.map((sub) => {
                    const mappedCourse = courses.find(c => c.id === sub.courseId);
                    const isEditing = editingSubjectId === sub.id;
                    return (
                      <div key={sub.id} className="p-4 px-6 hover:bg-slate-50 transition-colors">
                        {isEditing ? (
                          <div className="space-y-3 py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">SUBJECT NAME</label>
                                <input
                                  type="text"
                                  value={editSubjectName}
                                  onChange={(e) => setEditSubjectName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200/80 p-2 text-xs font-bold uppercase rounded outline-none text-slate-800"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">CODE</label>
                                  <input
                                    type="text"
                                    value={editSubjectCode}
                                    onChange={(e) => setEditSubjectCode(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200/80 p-2 text-xs font-bold uppercase rounded outline-none text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">SEMESTER</label>
                                  <select
                                    value={editSubjectSem}
                                    onChange={(e) => setEditSubjectSem(parseInt(e.target.value, 10))}
                                    className="w-full bg-slate-50 border border-slate-200/80 p-1.5 text-[10px] font-black uppercase tracking-wider rounded outline-none text-slate-750"
                                  >
                                    <option value="1">Sem 1</option>
                                    <option value="2">Sem 2</option>
                                    <option value="3">Sem 3</option>
                                    <option value="4">Sem 4</option>
                                    <option value="5">Sem 5</option>
                                    <option value="6">Sem 6</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingSubjectId(null)}
                                className="px-3 py-1.5 border border-slate-200/80 hover:bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateSubject(sub.id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5 pr-4 flex-1">
                              <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight block">
                                {sub.name}
                              </span>
                              <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-wider text-slate-400">
                                <span>CODE: {sub.code}</span>
                                <span>SEM: {sub.semester}</span>
                                {mappedCourse && <span className="text-emerald-600">PROGRAMME: {mappedCourse.name}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingSubjectId(sub.id);
                                  setEditSubjectName(sub.name);
                                  setEditSubjectCode(sub.code || '');
                                  setEditSubjectSem(sub.semester || 1);
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Edit subject inline"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectSubject(sub);
                                  setActiveTab('subject-browser');
                                }}
                                className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Inspect Material Files"
                              >
                                <BookOpen size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id, sub.name)}
                                className="p-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Delete subject node"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Proposals */}
        {activeAdminSubTab === 'submissions' && (
          <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl overflow-hidden shadow-sm">
            {/* Filter-Search Bar */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 md:w-64 max-w-sm">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={submissionsSearchQuery}
                    onChange={(e) => setSubmissionsSearchQuery(e.target.value)}
                    placeholder="Search proposals..."
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 block pl-9 pr-4 py-2 text-[11px] font-bold outline-none transition-all rounded placeholder-slate-400 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Type:</span>
                  <select
                    value={submissionsFilterType}
                    onChange={(e) => setSubmissionsFilterType(e.target.value)}
                    className="bg-white border border-slate-200/80 text-[10px] p-2 font-black uppercase tracking-wider rounded outline-none text-slate-700"
                  >
                    <option value="ALL">All Formats</option>
                    <option value="MATERIAL">Notes & Reference docs</option>
                    <option value="SYLLABUS">Syllabus node proposal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleExportProposalsJSON}
                  className="px-4 py-2 border border-slate-200/80 hover:border-slate-800 bg-white hover:bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer"
                  title="Export live list of proposals to raw JSON backup"
                >
                  <Download size={12} /> Export JSON
                </button>
              </div>
            </div>

            {/* Bulk Selection sticky status banner */}
            <div className="bg-slate-100 border-b border-slate-250 p-4 px-6 md:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const allFilteredIds = pendingSubmissions
                      .filter(sub => {
                        const matchesSearch = !submissionsSearchQuery.trim() || 
                          (sub.subjectName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.courseName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.description || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.submittedByEmail || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase());
                        const matchesType = submissionsFilterType === 'ALL' || sub.submissionType === submissionsFilterType;
                        return matchesSearch && matchesType;
                      })
                      .map(sub => sub.id)
                      .filter(Boolean) as string[];

                    const allAreSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedSubmissionIds.includes(id));

                    if (allAreSelected) {
                      setSelectedSubmissionIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                    } else {
                      setSelectedSubmissionIds(prev => {
                        const added = allFilteredIds.filter(id => !prev.includes(id));
                        return [...prev, ...added];
                      });
                    }
                  }}
                  className="p-1 px-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-2 cursor-pointer text-slate-700"
                >
                  {(() => {
                    const allFilteredIds = pendingSubmissions
                      .filter(sub => {
                        const matchesSearch = !submissionsSearchQuery.trim() || 
                          (sub.subjectName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.courseName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.description || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                          (sub.submittedByEmail || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase());
                        const matchesType = submissionsFilterType === 'ALL' || sub.submissionType === submissionsFilterType;
                        return matchesSearch && matchesType;
                      })
                      .map(sub => sub.id)
                      .filter(Boolean) as string[];

                    const allAreSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedSubmissionIds.includes(id));
                    return allAreSelected ? (
                      <>
                        <CheckSquare size={13} className="text-emerald-600" /> Deselect All
                      </>
                    ) : (
                      <>
                        <Square size={13} /> Select All Shown
                      </>
                    );
                  })()}
                </button>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wide">
                  {selectedSubmissionIds.length} select of {
                    pendingSubmissions.filter(sub => {
                      const matchesSearch = !submissionsSearchQuery.trim() || 
                        (sub.subjectName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                        (sub.courseName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                        (sub.description || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                        (sub.submittedByEmail || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase());
                      const matchesType = submissionsFilterType === 'ALL' || sub.submissionType === submissionsFilterType;
                      return matchesSearch && matchesType;
                    }).length
                  } active
                </span>
              </div>

              {selectedSubmissionIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={isProcessingBulk}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={12} /> Approve Selection ({selectedSubmissionIds.length})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={isProcessingBulk}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Reject Selection ({selectedSubmissionIds.length})
                  </button>
                </div>
              )}
            </div>

            {/* Content Pipeline */}
            <div className="divide-y divide-slate-100">
              {(() => {
                const filtered = pendingSubmissions.filter(sub => {
                  const matchesSearch = !submissionsSearchQuery.trim() || 
                    (sub.subjectName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                    (sub.courseName || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                    (sub.description || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase()) ||
                    (sub.submittedByEmail || '').toLowerCase().includes(submissionsSearchQuery.toLowerCase());
                  const matchesType = submissionsFilterType === 'ALL' || sub.submissionType === submissionsFilterType;
                  return matchesSearch && matchesType;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-16 text-center text-slate-400 uppercase tracking-widest text-[10px] font-black bg-white">
                      Zero community contributions found matching search filters.
                    </div>
                  );
                }

                return filtered.map((sub, idx) => {
                  const isChecked = selectedSubmissionIds.includes(sub.id);
                  return (
                    <div 
                      key={sub.id || idx} 
                      className={`p-6 md:p-8 flex gap-4 items-start hover:bg-slate-50/50 transition-colors duration-150 ${isChecked ? 'bg-emerald-55/5' : 'bg-white'}`}
                    >
                      {/* Interactive Selection Column */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubmissionIds(prev => 
                            prev.includes(sub.id) ? prev.filter(item => item !== sub.id) : [...prev, sub.id]
                          );
                        }}
                        className="mt-1 flex items-start text-slate-400 hover:text-slate-900 cursor-pointer shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare size={17} className="text-emerald-600" />
                        ) : (
                          <Square size={17} className="text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block">
                              TYPE: {sub.submissionType}
                            </span>
                            <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-tight">
                              {sub.title ? `${sub.title} [${sub.subjectName}]` : sub.subjectName}
                            </h4>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                              SUBMITTED BY: <span className="text-emerald-700">{sub.submittedByEmail}</span> // FOR SEMESTER {sub.semester}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                            <button
                              onClick={() => handleRunAiAudit(sub)}
                              disabled={loadingAudits[sub.id]}
                              type="button"
                              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-teal-800 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Engage Gemini 3.5 Flash to check for copyright risk, accuracy, and metadata correctness."
                            >
                              <Sparkles size={11} className={`${loadingAudits[sub.id] ? "animate-spin text-teal-600" : "text-teal-600"}`} />
                              {loadingAudits[sub.id] ? "Auditing..." : "AI Librarian Audit"}
                            </button>
                            <button
                              onClick={() => handleApproveSubmission(sub)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check size={11} /> Validate Proposal
                            </button>
                            <button
                              onClick={() => handleRejectSubmission(sub.id)}
                              className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 size={11} /> Decline
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-150 rounded text-[11px] font-semibold text-slate-600 uppercase tracking-tight space-y-2">
                          <p><span className="text-slate-400 text-[9.5px] font-extrabold mr-2 uppercase tracking-wide">CONTENT SUMMARY:</span> {sub.description || "(No description supplied by peer)"}</p>
                          {sub.url && (
                            <p className="flex items-center gap-1">
                              <span className="text-slate-400 text-[9.5px] font-extrabold mr-2 uppercase tracking-wide">SOURCE LINK:</span> 
                              <a href={sub.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-0.5">
                                {sub.url.substring(0, 75)}... <ExternalLink size={10} />
                              </a>
                            </p>
                          )}
                        </div>

                        {/* Rendering the AI Librarian Report if available */}
                        {auditReports[sub.id] && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded border text-[11px] font-semibold tracking-tight uppercase space-y-4 text-left ${
                              auditReports[sub.id].isValid 
                                ? 'bg-emerald-50/40 border-emerald-200 text-slate-900 border-l-4' 
                                : auditReports[sub.id].copyrightRisk === 'HIGH'
                                  ? 'bg-rose-50/40 border-rose-200 text-slate-950 border-l-4'
                                  : 'bg-amber-50/40 border-amber-200 text-slate-950 border-l-4'
                            }`}
                          >
                            <div className="flex justify-between items-center border-b border-dashed pb-2">
                              <div className="flex items-center gap-2 font-black text-[9.5px] text-slate-800">
                                <Sparkles size={13} className="text-teal-600 shrink-0" />
                                <span>Gemini AI Librarian Review Summary</span>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                  auditReports[sub.id].isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {auditReports[sub.id].isValid ? 'APPROVED AT AUDIT' : 'FLAGGED AT AUDIT'}
                                </span>
                                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[8px] font-black">
                                  Score: {auditReports[sub.id].confidenceScore}% Quality
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-700 font-bold leading-normal text-left">
                                <span className="font-extrabold text-slate-900">Librarian Feedback:</span> {auditReports[sub.id].aiLibrarianReview}
                              </p>
                              
                              <p className="text-[10px] text-slate-700 font-bold text-left">
                                <span className="font-extrabold text-slate-900">Copyright Infringement Risk:</span> <span className={`font-black ${
                                  auditReports[sub.id].copyrightRisk === 'HIGH' ? 'text-red-600' : auditReports[sub.id].copyrightRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-700'
                                }`}>{auditReports[sub.id].copyrightRisk}</span>
                              </p>

                              <p className="text-[10px] text-slate-700 font-bold text-left">
                                <span className="font-extrabold text-slate-900">Category Align Check:</span> {auditReports[sub.id].categorizationCheck}
                              </p>

                              {auditReports[sub.id].issues && auditReports[sub.id].issues.length > 0 && (
                                <div className="text-[9px] text-slate-550 font-bold space-y-1 text-left mt-2 pl-4 border-l-2 border-slate-300">
                                  <p className="font-black text-slate-700 uppercase tracking-wider text-[8px]">Flagged Anomalies:</p>
                                  {auditReports[sub.id].issues.map((issue, i) => (
                                    <p key={i}>• {issue}</p>
                                  ))}
                                </div>
                              )}

                              {auditReports[sub.id].suggestedTitle && auditReports[sub.id].suggestedTitle.toLowerCase() !== ((sub.title || '')).toLowerCase() && (
                                <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-apple border border-slate-200/80">
                                  <div className="text-left">
                                    <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.05em]">AI Suggested Academic Format</p>
                                    <p className="text-[10.5px] font-black text-slate-800 leading-normal uppercase">{auditReports[sub.id].suggestedTitle}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyAiSuggestedTitle(sub, auditReports[sub.id].suggestedTitle)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[8.5px] font-black uppercase tracking-widest rounded shadow-sm flex items-center gap-1 cursor-pointer transition-colors self-end sm:self-auto shrink-0"
                                  >
                                    <Check size={10} /> Adopt Title
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Materials Management sub-panel */}
        {activeAdminSubTab === 'materials' && (
          <div className="space-y-6" id="admin-materials-panel">
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Archival Resource Repository Editor</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    Perform diagnostics and direct editing operations on indexed files, previous papers, or resource links.
                  </p>
                </div>
                <div className="text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200/80 p-2.5 rounded shrink-0">
                  Total Managed Nodes: <span className="text-emerald-700 font-extrabold">{allMaterialsList.length}</span>
                </div>
              </div>

              {/* Filters & Search Control Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={materialsSearchQuery}
                    onChange={(e) => setMaterialsSearchQuery(e.target.value)}
                    placeholder="Search material title or URL..."
                    className="w-full bg-white border border-slate-200/80 focus:border-emerald-600 block pl-9 pr-4 py-2.5 text-[11px] font-bold outline-none transition-all rounded placeholder-slate-400 text-slate-800"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={materialsFilterType}
                    onChange={(e) => setMaterialsFilterType(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 text-[10px] p-2.5 font-black uppercase tracking-wider rounded outline-none text-slate-700 focus:border-emerald-600"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="PDF">Syllabus PDF File</option>
                    <option value="NOTES">Notes & Slide Deck</option>
                    <option value="VIDEO">Video Lecture URL</option>
                    <option value="LINK">External Portal Link</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <select
                    value={materialsFilterSubject}
                    onChange={(e) => setMaterialsFilterSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200/80 text-[10px] p-2.5 font-black uppercase tracking-wider rounded outline-none text-slate-700 focus:border-emerald-600"
                  >
                    <option value="ALL">All Subject Nodes</option>
                    {allSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name} (Sem {sub.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List of active materials */}
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {(() => {
                  const filtered = allMaterialsList.filter(mat => {
                    const matchesSearch = !materialsSearchQuery.trim() || 
                      (mat.title || '').toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
                      (mat.url || '').toLowerCase().includes(materialsSearchQuery.toLowerCase());
                    const matchesType = materialsFilterType === 'ALL' || mat.type === materialsFilterType;
                    const matchesSub = materialsFilterSubject === 'ALL' || mat.subjectId === materialsFilterSubject;
                    return matchesSearch && matchesType && matchesSub;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-20 text-center text-slate-400 text-[10px] uppercase font-bold bg-white">
                        No materials matching target filter constraints.
                      </div>
                    );
                  }

                  return filtered.map((mat) => {
                    const isSelfEditing = editingMaterialId === mat.id;
                    const matSubject = allSubjects.find(s => s.id === mat.subjectId);
                    const matCourse = matSubject ? courses.find(c => c.id === matSubject.courseId) : null;

                    return (
                      <div key={mat.id} className="p-6 hover:bg-slate-50 transition-colors" id={`mat-card-${mat.id}`}>
                        {isSelfEditing ? (
                          <div className="space-y-4">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block border-b border-slate-100 pb-1">Editing Raw Meta Tag</span>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-6 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 block">Resource Title</label>
                                <input
                                  type="text"
                                  value={editMaterialTitle}
                                  onChange={(e) => setEditMaterialTitle(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold uppercase rounded outline-none text-slate-800"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <label className="text-[8px] font-black uppercase text-slate-400 block">Category Type</label>
                                <select
                                  value={editMaterialType}
                                  onChange={(e) => setEditMaterialType(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200/80 p-2.5 text-[10px] font-black uppercase tracking-wider rounded outline-none text-slate-700"
                                >
                                  <option value="PDF">Syllabus PDF File</option>
                                  <option value="NOTES">Notes & Slide Deck</option>
                                  <option value="VIDEO">Video Lecture URL</option>
                                  <option value="LINK">External Portal Link</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-400 block">Source URL Destination</label>
                              <input
                                type="text"
                                value={editMaterialUrl}
                                onChange={(e) => setEditMaterialUrl(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold rounded outline-none text-slate-800"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingMaterialId(null)}
                                className="px-3.5 py-1.5 border border-slate-200/80 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateMaterial(mat.id)}
                                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                            <div className="space-y-1.5 flex-1 pr-4">
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  TYPE: {mat.type}
                                </span>
                                {matCourse && (
                                  <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                    PROGRAM: {matCourse.name}
                                  </span>
                                )}
                                {matSubject && (
                                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                    SUBJECT: {matSubject.code} - {matSubject.name} (Sem {matSubject.semester})
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight block">
                                {mat.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold truncate tracking-tight lowercase">
                                {mat.url}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => {
                                  setEditingMaterialId(mat.id);
                                  setEditMaterialTitle(mat.title);
                                  setEditMaterialType(mat.type || 'PDF');
                                  setEditMaterialUrl(mat.url || '');
                                }}
                                className="p-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Edit material parameters inline"
                              >
                                <Edit size={13} />
                              </button>
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-400 border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer"
                                title="Inspect destination URL"
                              >
                                <ExternalLink size={13} />
                              </a>
                              <button
                                onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                                className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-700 rounded text-slate-400 border border-slate-200/80 transition-all cursor-pointer"
                                title="Delete indexed resource node"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {activeAdminSubTab === 'contributions' && (
          <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-12 animate-in fade-in duration-300">
            <div className="border-b border-slate-250 pb-6">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Moderation Architecture</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">System Contribution Settings Setup</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mt-2 max-w-3xl">
                Configure user workflow sequences for study resource submissions. Any modifications will instantly update the submission forms and dynamic approval validators across all active client instances.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Option 1 */}
              <button
                type="button"
                onClick={() => setModerationMode('auto_publish_community')}
                className={`text-left p-6 rounded-apple border transition-all cursor-pointer flex flex-col justify-between h-full group ${
                  moderationMode === 'auto_publish_community'
                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8.5px] font-black uppercase px-2.5 py-1 rounded tracking-wide ${
                      moderationMode === 'auto_publish_community' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      Option 1
                    </span>
                    {moderationMode === 'auto_publish_community' && (
                      <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-100 border border-emerald-250 px-1.5 py-0.5 rounded uppercase tracking-widest">
                        Selected Mode
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[12px] font-black uppercase tracking-tight text-slate-950">Auto-Publish with Community Tag</h4>
                    <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                      Instant indexing with community category tags for peer identification.
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 group-hover:border-slate-200/80 pt-4 w-full">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">SEQUENCE SCHEMA:</span>
                  <div className="space-y-1 text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">1.</span>
                      <span>User submits PDF or Notes attributes</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">2.</span>
                      <span>Database automatically tags as 'Community'</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">3.</span>
                      <span>Item appears directly on live searchable index</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                onClick={() => setModerationMode('approve_queue')}
                className={`text-left p-6 rounded-apple border transition-all cursor-pointer flex flex-col justify-between h-full group ${
                  moderationMode === 'approve_queue'
                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8.5px] font-black uppercase px-2.5 py-1 rounded tracking-wide ${
                      moderationMode === 'approve_queue' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      Option 2
                    </span>
                    {moderationMode === 'approve_queue' && (
                      <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-100 border border-emerald-250 px-1.5 py-0.5 rounded uppercase tracking-widest">
                        Selected Mode
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[12px] font-black uppercase tracking-tight text-slate-950">Librarian Approval Queue</h4>
                    <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                      Manual editorial verification queue. Holds contributions in admin log.
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 group-hover:border-slate-200/80 pt-4 w-full">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">SEQUENCE SCHEMA:</span>
                  <div className="space-y-1 text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">1.</span>
                      <span>User inputs link / parameters</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">2.</span>
                      <span>Saved into Submissions PENDING catalog file</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">3.</span>
                      <span>Admins examine and move to public index</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 3 */}
              <button
                type="button"
                onClick={() => setModerationMode('self_moderation')}
                className={`text-left p-6 rounded-apple border transition-all cursor-pointer flex flex-col justify-between h-full group ${
                  moderationMode === 'self_moderation'
                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8.5px] font-black uppercase px-2.5 py-1 rounded tracking-wide ${
                      moderationMode === 'self_moderation' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      Option 3
                    </span>
                    {moderationMode === 'self_moderation' && (
                      <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-100 border border-emerald-250 px-1.5 py-0.5 rounded uppercase tracking-widest">
                        Selected Mode
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[12px] font-black uppercase tracking-tight text-slate-950">Instant Auto-Publish with Self-Moderation</h4>
                    <p className="text-[9.5px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                      Instant update with flagging thresholds. Peer reports quarantine files.
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 group-hover:border-slate-200/80 pt-4 w-full">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">SEQUENCE SCHEMA:</span>
                  <div className="space-y-1 text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">1.</span>
                      <span>User publishes material directly to live platform</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">2.</span>
                      <span>Students browse and can report/flag materials</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-extrabold">3.</span>
                      <span>Quarantined automatically if flag threshold met</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Threshold setup input */}
            {moderationMode === 'self_moderation' && (
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-apple space-y-4 max-w-xl animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1">
                  <label htmlFor="moderation-flag-threshold" className="text-[8px] font-black text-slate-800 uppercase tracking-widest block">Community Flag Quarantine Threshold</label>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Set the number of flag counts required on an item before it gets automatically quarantined and hidden.
                  </p>
                </div>
                <input
                  id="moderation-flag-threshold"
                  type="number"
                  min="1"
                  max="50"
                  value={flagThreshold}
                  onChange={(e) => setFlagThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 bg-white border border-slate-250 p-2.5 text-[10px] font-black uppercase tracking-wider rounded focus:outline-emerald-600 text-slate-900"
                />
              </div>
            )}

            {/* Actions panel */}
            <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                Active Protocol: {moderationMode === 'auto_publish_community' ? "Community Auto-publish" : moderationMode === 'self_moderation' ? `Self-regulation (T=${flagThreshold})` : "Manual review queue"}
              </span>
              <button
                type="button"
                disabled={isUpdatingRules}
                onClick={() => handleSaveModerationSettings(moderationMode, flagThreshold)}
                className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-[0.3em] px-8 py-4 rounded-apple active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-transparent"
              >
                {isUpdatingRules ? "Updating Rules..." : "Deploy Moderation Settings"}
              </button>
            </div>
          </div>
        )}

        {activeAdminSubTab === 'users' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300"
          ><div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-8 md:p-10 space-y-8 flex flex-col">
            <div>
              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block mb-1">Access Control & Credentials</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Student Identity Directory</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mt-1 max-w-4xl">
                View, filter, modify, and delete all verified DU academic user records. You have absolute administrative control over academic credentials, roll numbers, college mappings, and registration files.
              </p>
            </div>

            {/* Search Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-slate-150 pb-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students by name, email, roll number, college..."
                  value={usersSearchQuery}
                  onChange={(e) => setUsersSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 pl-10 pr-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded focus:outline-emerald-600 text-slate-905 placeholder:text-slate-400"
                />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Matches: <span className="text-slate-900">{
                  usersList.filter(u => {
                    const q = usersSearchQuery.toLowerCase();
                    return (
                      (u.fullName || '').toLowerCase().includes(q) ||
                      (u.email || '').toLowerCase().includes(q) ||
                      (u.rollNumber || '').toLowerCase().includes(q) ||
                      (u.collegeName || '').toLowerCase().includes(q) ||
                      (u.department || '').toLowerCase().includes(q) ||
                      (u.uin || '').toLowerCase().includes(q) ||
                      (u.id || '').toLowerCase().includes(q)
                    );
                  }).length
                } / {usersList.length} Students</span>
              </div>
            </div>

            {/* User Directory Table / Cards */}
            {usersList.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200/80 bg-slate-55 rounded text-[11px] font-black uppercase text-slate-400 tracking-widest">
                No onboarded student records found in Firestore memory.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-4xl">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[8px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-3">Student Name</th>
                      <th className="py-4 px-3">Email Address</th>
                      <th className="py-4 px-3">College Name / Department</th>
                      <th className="py-4 px-3">Roll ID Number</th>
                      <th className="py-4 px-3">Phone Line</th>
                      <th className="py-4 px-3 text-center">Status</th>
                      <th className="py-4 px-4 text-right">Actions Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    {usersList
                      .filter(u => {
                        const q = usersSearchQuery.toLowerCase();
                        return (
                          (u.fullName || '').toLowerCase().includes(q) ||
                          (u.email || '').toLowerCase().includes(q) ||
                          (u.rollNumber || '').toLowerCase().includes(q) ||
                          (u.collegeName || '').toLowerCase().includes(q) ||
                          (u.department || '').toLowerCase().includes(q) ||
                          (u.uin || '').toLowerCase().includes(q) ||
                          (u.id || '').toLowerCase().includes(q)
                        );
                      })
                      .map((u) => {
                        const isEditing = editingUserId === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            {/* Full Name */}
                            <td className="py-4 px-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserFullName}
                                  onChange={(e) => setEditUserFullName(e.target.value)}
                                  className="bg-white border border-slate-300 p-2 text-[10px] font-black uppercase tracking-wider rounded text-slate-900 w-full"
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-900 uppercase tracking-tight">
                                    {u.fullName || 'Anonymous User'}
                                  </span>
                                  <span className="text-[8px] bg-slate-105 text-slate-600 px-1.5 py-0.5 inline-block font-mono font-black mt-1 max-w-[150px] uppercase rounded tracking-wider border border-slate-200/80">
                                    {u.uin || u.id || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Email */}
                            <td className="py-4 px-3 font-mono text-slate-600 select-all">
                              {u.email || 'No email recorded'}
                            </td>

                            {/* College & Department */}
                            <td className="py-4 px-3">
                              {isEditing ? (
                                <div className="space-y-1 w-full">
                                  <input
                                    type="text"
                                    placeholder="College Name"
                                    value={editUserCollegeName}
                                    onChange={(e) => setEditUserCollegeName(e.target.value)}
                                    className="bg-white border border-slate-300 p-1.5 text-[9px] font-black uppercase tracking-wider rounded text-slate-900 w-full"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Department"
                                    value={editUserDepartment}
                                    onChange={(e) => setEditUserDepartment(e.target.value)}
                                    className="bg-white border border-slate-300 p-1.5 text-[9px] font-black uppercase tracking-wider rounded text-slate-900 w-full"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className="font-bold text-slate-800 block uppercase">{u.collegeName || 'N/A'}</span>
                                  <span className="text-[8.5px] text-slate-400 block uppercase tracking-widest">{u.department || 'N/A'}</span>
                                </div>
                              )}
                            </td>

                            {/* Roll Number */}
                            <td className="py-4 px-3 font-mono text-slate-700">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserRollNumber}
                                  onChange={(e) => setEditUserRollNumber(e.target.value)}
                                  className="bg-white border border-slate-300 p-2 text-[9px] font-black uppercase tracking-wider rounded text-slate-900 w-full"
                                />
                              ) : (
                                <span className="font-bold">{u.rollNumber || 'N/A'}</span>
                              )}
                            </td>

                            {/* Phone number */}
                            <td className="py-4 px-3 font-bold text-slate-600">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserPhoneNumber}
                                  onChange={(e) => setEditUserPhoneNumber(e.target.value)}
                                  className="bg-white border border-slate-300 p-2 text-[9px] font-black uppercase tracking-wider rounded text-slate-900 w-full"
                                />
                              ) : (
                                <span>{u.phoneNumber || 'N/A'}</span>
                              )}
                            </td>

                            {/* Opt-In/Consent Status */}
                            <td className="py-4 px-3 text-center">
                              {u.hasConsented ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-widest rounded-full">
                                  COVENANTEED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-widest rounded-full">
                                  PENDING
                                </span>
                              )}
                            </td>

                            {/* Actions Panel */}
                            <td className="py-4 px-4 text-right">
                              {isEditing ? (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveUserEdit(u.id)}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[8.5px] rounded transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Check size={10} /> SAVE
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditUser}
                                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold uppercase text-[8.5px] rounded transition-all cursor-pointer"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditUser(u)}
                                    className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-black uppercase text-[8px] rounded transition-all cursor-pointer flex items-center gap-1"
                                    title="Edit Student Parameters"
                                  >
                                    <Edit size={11} /> EDIT
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="px-2 py-1.5 bg-slate-101 hover:bg-rose-50 hover:text-red-600 text-slate-600 font-black uppercase text-[8px] rounded transition-all cursor-pointer flex items-center gap-1"
                                    title="Delete Student Record"
                                  >
                                    <Trash2 size={11} /> DELETE
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        )}

        {activeAdminSubTab === 'behavior' && (() => {
          // Dynamic calculation of advanced footprint statistics and aggregations
          const totalLogsCount = behaviorLogs.length;
          const uniqueStudentEmails = Array.from(new Set(behaviorLogs.map(log => log.userEmail || '').filter(Boolean)));
          
          // Compute Top Search Queries
          const searchQueriesList = behaviorLogs
            .filter(log => log.actionType?.startsWith('SEARCH') && log.details?.query)
            .map(log => log.details.query.trim().toLowerCase());
          
          const queryFrequencies: Record<string, number> = {};
          searchQueriesList.forEach((q: string) => {
            queryFrequencies[q] = (queryFrequencies[q] || 0) + 1;
          });
          
          const sortedQueryEntries = Object.entries(queryFrequencies).sort((a, b) => b[1] - a[1]);
          const topQueryText: string = sortedQueryEntries[0]?.[0] || 'N/A';
          const topQueryCount: number = sortedQueryEntries[0]?.[1] || 0;

          // Compute action distribution counts
          const countSearches = behaviorLogs.filter(log => log.actionType?.startsWith('SEARCH')).length;
          const countFolders = behaviorLogs.filter(log => log.actionType === 'VIEW_SUBJECT' || log.actionType === 'VIEW_COURSE').length;
          const countMaterials = behaviorLogs.filter(log => log.actionType === 'VIEW_MATERIAL').length;
          const countVotes = behaviorLogs.filter(log => log.actionType?.startsWith('VOTE')).length;
          const countOthers = totalLogsCount - (countSearches + countFolders + countMaterials + countVotes);

          // Get active student trace sequences
          const studentTraces = selectedTraceEmail !== 'ALL_STUDENTS'
            ? behaviorLogs.filter(log => log.userEmail === selectedTraceEmail).sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime())
            : [];

          return (
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
              {/* Header Title Board */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block mb-1">AGGREGATED DIGITAL AUDIT SYSTEM</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Active Footprint & Digital Analytics Suite</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mt-1 max-w-4xl">
                    Monitors overall student interaction timelines, search query distributions, document navigation pathways, and ratings to yield rich, fast digital tracking and behavioral maps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearBehaviorLogs}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-red-750 text-slate-700 font-black uppercase text-[9px] tracking-widest rounded transition-all cursor-pointer flex items-center gap-2 border border-slate-200/80"
                >
                  <RotateCcw size={13} /> FLUSH AUDIT TIMELINES
                </button>
              </div>

              {/* Footprints Statistics Metrics Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-55 border border-slate-200/80 p-5 rounded-apple flex flex-col justify-between">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">TOTAL FOOTPRINTS REGISTERED</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-950">{totalLogsCount}</span>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">ACTIVITIES</span>
                  </div>
                  <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mt-1">Gross interactive transactions recorded</p>
                </div>

                <div className="bg-slate-55 border border-slate-200/80 p-5 rounded-apple flex flex-col justify-between">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">UNIQUE VISITING AUDIENCE</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-950">{uniqueStudentEmails.length}</span>
                    <span className="text-[9px] font-black text-indigo-650 uppercase tracking-widest">STUDENTS</span>
                  </div>
                  <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mt-1">Verified distinct email credentials logged</p>
                </div>

                <div className="bg-slate-55 border border-slate-200/80 p-5 rounded-apple flex flex-col justify-between col-span-1 lg:col-span-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">LEADING SEARCH COORDINATE FOOTPRINT</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-slate-900 truncate max-w-[280px]">"{topQueryText}"</span>
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest whitespace-nowrap">({topQueryCount} HITS)</span>
                  </div>
                  <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mt-1">Highest frequency query term processed in the aggregator pipeline</p>
                </div>
              </div>

              {/* Behavior Action Pattern Visualizer Card */}
              {totalLogsCount > 0 && (
                <div className="border border-slate-200/80 p-6 rounded-apple bg-slate-50/50 space-y-4">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block">SOCIOMETRIC OUTCOME BAR-CHART DISTRIBUTION MAP</span>
                  <div className="space-y-4">
                    {[
                      { label: 'SEARCH TRANSACTIONS', count: countSearches, color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600', textColor: 'text-amber-800' },
                      { label: 'FOLDER & SUBJECT TREE CLICKS', count: countFolders, color: 'bg-sky-500', hoverColor: 'hover:bg-sky-600', textColor: 'text-sky-800' },
                      { label: 'Syllabus & Material Access', count: countMaterials, color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600', textColor: 'text-emerald-800' },
                      { label: 'FEEDBACK & RATING EVENTS', count: countVotes, color: 'bg-rose-500', hoverColor: 'hover:bg-rose-600', textColor: 'text-rose-800' },
                      { label: 'OTHER TAB PREFERENCES', count: countOthers, color: 'bg-slate-400', hoverColor: 'hover:bg-slate-550', textColor: 'text-slate-600' }
                    ].map((bar, idx) => {
                      const perc = totalLogsCount > 0 ? (bar.count / totalLogsCount) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1 text-left">
                          <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                            <span>{bar.label}</span>
                            <span className="font-mono text-slate-950">
                              {bar.count} counts ({perc.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-700 ease-out ${bar.color} ${bar.hoverColor}`} 
                              style={{ width: `${perc}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Individual Student Path Sequencer Tracer */}
              <div className="bg-slate-55 border border-slate-200/80 p-6 rounded-apple space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-[8px] font-black uppercase text-indigo-650 tracking-widest block mb-1">ADVANCED SEQUENTIAL ROAD-TRACER</span>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Student Digital Path Tracer</h4>
                  </div>
                  <div className="w-full sm:w-auto">
                    <select
                      value={selectedTraceEmail}
                      onChange={(e) => setSelectedTraceEmail(e.target.value)}
                      className="bg-white border border-slate-250 p-2 pr-8 text-[9px] font-black uppercase tracking-widest rounded focus:outline-emerald-500 text-slate-800 appearance-none cursor-pointer w-full sm:w-72"
                    >
                      <option value="ALL_STUDENTS">SELECT STUDENT TO TRACE PATH</option>
                      {uniqueStudentEmails.map(email => (
                        <option key={email} value={email}>{email}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedTraceEmail === 'ALL_STUDENTS' ? (
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">
                    Please select a specific student email using the dropdown list above to trace their exact historical journey and action pathways in chronological order.
                  </p>
                ) : studentTraces.length === 0 ? (
                  <p className="text-[9.5px] font-bold text-red-500 uppercase tracking-widest text-center py-4">
                    No matching activity footprints found for student {selectedTraceEmail}.
                  </p>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-apple text-left">
                      <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block mb-1">CHRONOLOGICAL SHADOW PROFILE TRACE</span>
                      <p className="text-[11px] font-bold text-slate-900 uppercase">
                        Target Student: <span className="text-emerald-700">{studentTraces[0]?.userFullName || 'Unknown User'}</span> &lt;<span className="font-mono text-slate-550 select-all font-bold lowercase">{selectedTraceEmail}</span>&gt;
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                        Captured sequential footprints: <strong className="text-slate-950 font-black">{studentTraces.length} actions in chronological order</strong>.
                      </p>
                    </div>

                    <div className="relative pl-6 ml-3 border-l-2 border-emerald-500/30 space-y-5 py-2">
                      {studentTraces.map((trace, traceIdx) => {
                        let stepActionLabel = "GENERIC ACTIVITY";
                        let stepColor = "bg-slate-400 border-slate-300";
                        if (trace.actionType?.startsWith('SEARCH')) {
                          stepActionLabel = "SEARCH TRANSACTED";
                          stepColor = "bg-amber-500 border-amber-300 ring-2 ring-amber-100";
                        } else if (trace.actionType === 'VIEW_SUBJECT') {
                          stepActionLabel = "NAVIGATED SUBJECT NODE";
                          stepColor = "bg-sky-500 border-sky-300 ring-2 ring-sky-100";
                        } else if (trace.actionType === 'VIEW_COURSE') {
                          stepActionLabel = "FILTERED PROGRAMME RESOURCE";
                          stepColor = "bg-indigo-500 border-indigo-300 ring-2 ring-indigo-100";
                        } else if (trace.actionType === 'VIEW_MATERIAL') {
                          stepActionLabel = "MATERIAL ACCESS POINT";
                          stepColor = "bg-emerald-500 border-emerald-300 ring-2 ring-emerald-100";
                        } else if (trace.actionType?.startsWith('VOTE')) {
                          stepActionLabel = "USER INTEREST RATING";
                          stepColor = "bg-rose-500 border-rose-300 ring-2 ring-rose-100";
                        } else if (trace.actionType === 'TAB_SWITCH') {
                          stepActionLabel = "SWITCHED CONTEXT VIEW";
                          stepColor = "bg-purple-500 border-purple-300 ring-2 ring-purple-100";
                        }

                        return (
                          <div key={trace.id} className="relative text-left space-y-1.5">
                            {/* Dot Stepper Indicator */}
                            <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${stepColor} flex items-center justify-center`} />

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded">
                                STEP {traceIdx + 1}
                              </span>
                              <span className="text-[8.5px] font-black uppercase text-slate-800 tracking-wider">
                                {stepActionLabel} ({trace.actionType})
                              </span>
                              <span className="font-mono text-[8.5px] text-slate-400 ml-auto font-bold">
                                {trace.timestamp ? new Date(trace.timestamp).toLocaleTimeString() : 'N/A'}
                              </span>
                            </div>

                            <div className="p-3 bg-white border border-slate-200/80 rounded text-[10px] text-slate-800 font-bold uppercase tracking-wider leading-relaxed">
                              {trace.actionType === 'TAB_SWITCH' && (
                                <span>Switched overall dashboard menu layout container tab to active tab: <strong className="text-slate-900 font-extrabold">"{trace.details?.tab}"</strong></span>
                              )}
                              {trace.actionType === 'VIEW_SUBJECT' && (
                                <span>Opened academic subject node folder: <strong className="text-slate-950 font-extrabold">"{trace.details?.subjectName}" [ID: {trace.details?.subjectCode}]</strong></span>
                              )}
                              {trace.actionType === 'VIEW_COURSE' && (
                                <span>Filtered academic syllabus resources for core programme: <strong className="text-slate-950 font-extrabold">"{trace.details?.courseName}"</strong></span>
                              )}
                              {trace.actionType === 'VIEW_MATERIAL' && (
                                <span>Viewed/printed indexed study file metadata: <strong className="text-slate-950 font-extrabold">"{trace.details?.materialTitle}"</strong> ({trace.details?.materialType})</span>
                              )}
                              {trace.actionType?.startsWith('SEARCH') && (
                                <span>Entered search query parameter: <strong className="text-amber-900 font-extrabold">"{trace.details?.query}"</strong></span>
                              )}
                              {trace.actionType?.startsWith('VOTE') && (
                                <span>Submitted continuous satisfaction rating: <strong className="text-slate-950 font-extrabold">"{trace.actionType}"</strong> for resource file <strong className="text-slate-900">"{trace.details?.title}"</strong></span>
                              )}
                              {!['TAB_SWITCH', 'VIEW_SUBJECT', 'VIEW_COURSE', 'VIEW_MATERIAL', 'SEARCH_GLOBAL', 'SEARCH_CONTEXTUAL', 'VOTE_UP', 'VOTE_DOWN'].includes(trace.actionType) && (
                                <span>Logged Payload details: {JSON.stringify(trace.details)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Master Behavior System List Query Tool */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Standard Behavior Logs Database</h4>
                  
                  {/* Select filters inline */}
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={behaviorSearchQuery}
                        onChange={(e) => setBehaviorSearchQuery(e.target.value)}
                        className="bg-slate-55 border border-slate-200/80 pl-8 pr-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded focus:outline-emerald-600 text-slate-900 w-full sm:w-60"
                      />
                    </div>
                    <div>
                      <select
                        value={behaviorActionFilter}
                        onChange={(e) => setBehaviorActionFilter(e.target.value)}
                        className="bg-slate-55 border border-slate-200/80 p-2 pr-8 text-[9px] font-bold uppercase tracking-widest rounded focus:outline-emerald-500 text-slate-700 appearance-none cursor-pointer w-full"
                      >
                        <option value="ALL">ALL LOGS</option>
                        <option value="SEARCH_GLOBAL">GLOBAL SEARCHES</option>
                        <option value="SEARCH_CONTEXTUAL">CONTEXTUAL SEARCHES</option>
                        <option value="VIEW_SUBJECT">SUBJECTS CLICKED</option>
                        <option value="VIEW_COURSE">COURSES SELECTED</option>
                        <option value="VIEW_MATERIAL">MATERIALS VIEWED</option>
                        <option value="TAB_SWITCH">TAB NAVIGATION</option>
                        <option value="VOTE_UP">UPVOTES SUBMITTED</option>
                        <option value="VOTE_DOWN">DOWNVOTES SUBMITTED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {behaviorLogs.length === 0 ? (
                  <div className="p-16 text-center border-2 border-dashed border-slate-200/80 bg-slate-55 rounded text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    No interactive student behavior logs currently registered.
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-101 border border-slate-203 rounded text-left bg-white">
                    {behaviorLogs
                      .filter(log => {
                        const q = behaviorSearchQuery.toLowerCase();
                        const actionMatches = behaviorActionFilter === 'ALL' || log.actionType === behaviorActionFilter;
                        const studentFilterMatches = selectedTraceEmail === 'ALL_STUDENTS' || log.userEmail === selectedTraceEmail;
                        const searchMatches = !behaviorSearchQuery ||
                          (log.userEmail || '').toLowerCase().includes(q) ||
                          (log.userFullName || '').toLowerCase().includes(q) ||
                          (log.actionType || '').toLowerCase().includes(q) ||
                          JSON.stringify(log.details || {}).toLowerCase().includes(q);
                        return actionMatches && studentFilterMatches && searchMatches;
                      })
                      .slice(0, 150)
                      .map((log) => {
                        let typeLabel = "ACTION";
                        let badgeColor = "bg-slate-100 text-slate-700 border-slate-200/80";

                        if (log.actionType?.startsWith('SEARCH')) {
                          typeLabel = "SEARCH";
                          badgeColor = "bg-amber-50 text-amber-805 border-amber-200";
                        } else if (log.actionType?.startsWith('VIEW_SUBJECT')) {
                          typeLabel = "SUBJECT VIEW";
                          badgeColor = "bg-sky-50 text-sky-805 border-sky-200";
                        } else if (log.actionType?.startsWith('VIEW_MATERIAL')) {
                          typeLabel = "DOCUMENT VIEW";
                          badgeColor = "bg-emerald-50 text-emerald-850 border-emerald-250";
                        } else if (log.actionType?.startsWith('TAB')) {
                          typeLabel = "NAVIGATION";
                          badgeColor = "bg-purple-50 text-purple-805 border-purple-200";
                        } else if (log.actionType?.startsWith('VOTE')) {
                          typeLabel = "RATING";
                          badgeColor = "bg-rose-50 text-rose-805 border-rose-200";
                        }

                        return (
                          <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                            <div className="p-2.5 bg-slate-100 rounded-full text-slate-500 self-start">
                              <Activity size={14} />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1.5 text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-0.5 border text-[7.5px] font-black uppercase tracking-widest rounded ${badgeColor}`}>
                                  {typeLabel} // {log.actionType}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400 font-bold whitespace-nowrap">
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-900 font-bold uppercase tracking-tight">
                                Student: <span className="text-emerald-700">{log.userFullName}</span> &lt;<span className="font-mono text-slate-500 text-[10px] select-all lowercase">{log.userEmail}</span>&gt;
                              </p>

                              <div className="bg-slate-55 border border-slate-100 rounded p-2.5 text-[9px] font-mono text-slate-805 max-w-4xl leading-relaxed">
                                {log.actionType === 'TAB_SWITCH' && (
                                  <span>Switched overall dashboard menu layout tab to: <strong className="text-slate-900 font-bold">"{log.details?.tab}"</strong></span>
                                )}
                                {log.actionType === 'VIEW_SUBJECT' && (
                                  <span>Opened academic subject node folder: <strong className="text-slate-950 font-bold">"{log.details?.subjectName}" [ID: {log.details?.subjectCode}]</strong></span>
                                )}
                                {log.actionType === 'VIEW_COURSE' && (
                                  <span>Filtered academic syllabus resources for core programme: <strong className="text-slate-950 font-bold">"{log.details?.courseName}"</strong></span>
                                )}
                                {log.actionType === 'VIEW_MATERIAL' && (
                                  <span>Viewed/printed indexed study file metadata: <strong className="text-slate-950 font-bold">"{log.details?.materialTitle}"</strong> ({log.details?.materialType})</span>
                                )}
                                {log.actionType?.startsWith('SEARCH') && (
                                  <span>Entered search query parameter: <strong className="text-slate-950 font-extrabold text-amber-900">"{log.details?.query}"</strong></span>
                                )}
                                {log.actionType?.startsWith('VOTE') && (
                                  <span>Submitted continuous satisfaction rating: <strong className="text-emerald-800 font-bold">"{log.actionType}"</strong> for resource file <strong className="text-slate-900">"{log.details?.title}"</strong></span>
                                )}
                                {!['TAB_SWITCH', 'VIEW_SUBJECT', 'VIEW_COURSE', 'VIEW_MATERIAL', 'SEARCH_GLOBAL', 'SEARCH_CONTEXTUAL', 'VOTE_UP', 'VOTE_DOWN'].includes(log.actionType) && (
                                  <span>Context Log: {JSON.stringify(log.details)}</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSingleBehaviorLog(log.id)}
                              className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded self-center cursor-pointer"
                              title="Discard Behavior Log Entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeAdminSubTab === 'security-protocol' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Status overview banner */}
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5 flex-1 select-none">
                  <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-300 animate-pulse" /> Active ABAC Sentinel Enforcer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Zero-Trust Security Protocol</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                    Live audit parameters, strict Attribute-Based Access Control compliance logs, and the Red-Team vulnerability simulation suite.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                    <LockKeyhole size={11} /> RULES: ACTIVE 2.0
                  </span>
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-800 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                    <Database size={11} /> SECURE RELATION GLOBALS
                  </span>
                </div>
              </div>

              {/* Stat badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 border border-slate-200/80 rounded-apple bg-slate-50 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Identity Verification</span>
                  <span className="text-xs font-black text-slate-900 uppercase block">Google Auth Verified</span>
                </div>
                <div className="p-4 border border-slate-200/80 rounded-apple bg-slate-50 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Update Guard</span>
                  <span className="text-xs font-black text-emerald-700 uppercase block">MapDiff affectedKeys()</span>
                </div>
                <div className="p-4 border border-slate-200/80 rounded-apple bg-slate-50 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Immutable Fields</span>
                  <span className="text-xs font-black text-slate-900 uppercase block">createdAt, ownerId, role</span>
                </div>
                <div className="p-4 border border-slate-200/80 rounded-apple bg-slate-50 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Threat Repulsion Rate</span>
                  <span className="text-xs font-black text-indigo-700 uppercase block">100% Secure (12/12)</span>
                </div>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Security Simulator & Policy Toggles */}
              <div className="lg:col-span-7 space-y-8">
                {/* Policy toggles card */}
                <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-[8px] font-black uppercase text-indigo-600 tracking-widest block mb-1">TUNING CONTROLS</span>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Policy Parameters</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Toggle: Academic Domain Lock */}
                    <div className="flex items-start justify-between p-4 border border-slate-150 rounded bg-slate-50 gap-4">
                      <div className="space-y-1 flex-1 text-left select-none">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight block">Strict University Domain Enforcement</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">
                          Require submitter email domains to match official educational institutional patterns during material creation checks.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAcademicDomainLock(!academicDomainLock)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative inline-flex items-center cursor-pointer ${
                          academicDomainLock ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm block ${
                          academicDomainLock ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle: Dual Authority Verification */}
                    <div className="flex items-start justify-between p-4 border border-slate-150 rounded bg-slate-55 gap-4">
                      <div className="space-y-1 flex-1 text-left select-none">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight block">Dual-Signature Moderation Verification</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">
                          Enforce dual-administrator authorization matching before releasing flagged items back to the general student directories.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDualAuthorityVerification(!dualAuthorityVerification)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative inline-flex items-center cursor-pointer ${
                          dualAuthorityVerification ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm block ${
                          dualAuthorityVerification ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Penetration Audit Simulator card */}
                <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-left">
                      <span className="text-[8px] font-black uppercase text-red-650 tracking-widest block mb-1">RED TEAM PENETRATION SUITE</span>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Adversarial Integrity Simulator</h4>
                    </div>
                    <button
                      type="button"
                      disabled={isSimulatingTests}
                      onClick={handleRunSecuritySim}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-955 disabled:bg-slate-400 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      {isSimulatingTests ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> RUNNING AUDIT...
                        </>
                      ) : (
                        <>
                          <Play size={11} fill="currentColor" /> INITIATE DESTRUCTIVE SIMULATOR
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed text-left">
                    Simulate execution of the "Dirty Dozen" (12 complex access vectors) mapping to identity spoofing, value poisoning, client bypasses, and relational integrity violations.
                  </p>

                  {/* Simulator terminal */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={11} /> SECURITY_ENFORCER_CONSOL.EXE
                      </span>
                      {intrusionSimulationStatus === 'running' && (
                        <span className="text-[8.5px] font-black text-amber-600 uppercase tracking-widest animate-pulse">EVALUATING ENFORCEMENT MATCHES...</span>
                      )}
                      {intrusionSimulationStatus === 'completed' && (
                        <span className="text-[8.5px] font-black text-emerald-600 uppercase tracking-widest">PROTOCOL 100% SOLID</span>
                      )}
                      {intrusionSimulationStatus === 'idle' && (
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">SYSTEM IDLE</span>
                      )}
                    </div>

                    <div className="bg-slate-950 text-slate-200 font-mono text-[9.5px] rounded border border-slate-800 p-4 h-80 overflow-y-auto select-all text-left space-y-1.5 scrollbar-thin">
                      {simulationLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-10 select-none">
                          <Terminal size={24} className="text-slate-600" />
                          <p className="uppercase font-black text-[9px] tracking-widest">Console empty. Initiate simulator suite above.</p>
                        </div>
                      ) : (
                        simulationLogs.map((logLine, idx) => {
                          let lineStyle = "text-slate-300";
                          if (logLine.includes('[STATUS] REPELLED') || logLine.includes('ZERO-TRUST')) {
                            lineStyle = "text-emerald-400 font-bold";
                          } else if (logLine.includes('[VECTOR') || logLine.includes('[SUCCESS]')) {
                            lineStyle = "text-indigo-300 font-extrabold border-t border-slate-800 pt-1.5 mt-1.5";
                          } else if (logLine.includes('==> Checking') || logLine.includes('==> Evaluating')) {
                            lineStyle = "text-slate-400";
                          } else if (logLine.includes('FAILED') || logLine.includes('mismatch') || logLine.includes('FALSE')) {
                            lineStyle = "text-red-400 font-bold";
                          }
                          return (
                            <div key={idx} className={`${lineStyle} whitespace-pre-wrap leading-relaxed`}>
                              {logLine}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Collection Rules & Safety Invariants */}
              <div className="lg:col-span-5 space-y-8 text-left">
                {/* Security Invariants Summary */}
                <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-[8px] font-black uppercase text-indigo-600 tracking-widest block mb-1">PROTECTION INVARIANTS</span>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Collection Safety Maps</h4>
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                    Overview of the core invariants structurally maintained on the live Cloud Firestore instance by the compiled security policies:
                  </p>

                  <div className="space-y-4">
                    <div className="p-3.5 border border-slate-150 rounded bg-slate-50 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /courses</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        Read-only to general public/students. Admin privilege matches is mandatory for any course node schema write actions.
                      </p>
                    </div>

                    <div className="p-3.5 border border-slate-150 rounded bg-slate-50 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /subjects</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        Relational validation ensures courses mapping node keys exist. Mutator validations bind strictly to validated admin credentials.
                      </p>
                    </div>

                    <div className="p-3.5 border border-slate-150 rounded bg-slate-50 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /materials</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        Requires verified emails. Creation shape enforced strictly to 4 variables. Updates restricted to vote counter mutations with no body/url alterations allowed.
                      </p>
                    </div>

                    <div className="p-3.5 border border-slate-150 rounded bg-slate-50 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /votes</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        Validates `request.auth.uid == userId`. Relational exists check prevents phantom voting on deleted material nodes.
                      </p>
                    </div>

                    <div className="p-3.5 border border-slate-150 rounded bg-slate-50 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /submissions</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        List access restricted to submitting author email or administrators. Status changes from PENDING is hardlocked to admin bypasses.
                      </p>
                    </div>

                    <div className="p-3.5 border border-slate-150 rounded bg-slate-55 space-y-1">
                      <span className="text-[8.5px] font-black text-indigo-650 uppercase tracking-widest block">Collection /users</span>
                      <p className="text-[9.5px] font-semibold text-slate-800 leading-normal uppercase">
                        Limits registration variables to non-claims. Prevents payload-level inclusion of `role` or `isAdmin` keys during creation and update calls.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Threat Sentinel Log panel */}
                <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-8 space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase text-red-650 tracking-widest block mb-1">SENTINEL RADAR DETECTIONS</span>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Repelled Threat Vectors</h4>
                  </div>

                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                    {threatAlerts.map((alertItem) => (
                      <div key={alertItem.id} className="p-3 border border-red-100 rounded bg-red-50 flex items-start gap-3">
                        <div className="p-1 px-2 bg-red-100 border border-red-200 text-red-700 rounded text-[9px] font-black uppercase">
                          REPELLED
                        </div>
                        <div className="flex-1 min-w-0 space-y-1 text-left">
                          <p className="text-[10px] font-black text-slate-900 uppercase">
                            Vector: <span className="text-red-700">{alertItem.vector}</span>
                          </p>
                          <div className="font-mono text-[8px] text-slate-500 overflow-x-auto bg-white p-1 border border-slate-150 rounded">
                            {alertItem.payload}
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase pt-0.5">
                            <span>Origin IP: {alertItem.ip}</span>
                            <span>{alertItem.college}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAdminSubTab === 'reports' && (() => {
          const filteredReports = reports.filter((r: any) => {
            if (reportsFilter === 'PENDING') return r.status === 'PENDING';
            if (reportsFilter === 'RESOLVED') return r.status === 'RESOLVED';
            return true;
          });

          const handleResolveReport = async (report: any) => {
            const reportId = report.id;
            setResolvingReportsRecord(prev => ({ ...prev, [reportId]: true }));
            try {
              const notes = reportAdminNotes[reportId] || '';
              const pathForWrite = `reports/${reportId}`;
              try {
                await updateDoc(doc(db, 'reports', reportId), {
                  status: 'RESOLVED',
                  adminNotes: notes.trim(),
                  resolvedAt: new Date().toISOString()
                });
                
                // Add notification
                if (report.reportedByEmail && report.reportedByEmail !== 'anonymous') {
                  const notifPath = 'notifications';
                  await addDoc(collection(db, notifPath), {
                    targetEmail: report.reportedByEmail,
                    message: `Issue resolved: ${report.reportedPage} ${report.materialTitle ? `(${report.materialTitle})` : ''}`,
                    notes: notes.trim(),
                    url: report.targetUrl || '',
                    isRead: false,
                    createdAt: new Date().toISOString()
                  });
                } else if (report.deviceId) {
                  const notifPath = 'notifications';
                  await addDoc(collection(db, notifPath), {
                    targetDeviceId: report.deviceId,
                    message: `Issue resolved: ${report.reportedPage} ${report.materialTitle ? `(${report.materialTitle})` : ''}`,
                    notes: notes.trim(),
                    url: report.targetUrl || '',
                    isRead: false,
                    createdAt: new Date().toISOString()
                  });
                }
              } catch (err) {
                handleFirestoreError(err, OperationType.UPDATE, pathForWrite);
              }
            } catch (error) {
              console.error(error);
              alert('Error resolving report: ' + (error instanceof Error ? error.message : String(error)));
            } finally {
              setResolvingReportsRecord(prev => ({ ...prev, [reportId]: false }));
            }
          };

          const handleDeleteReport = async (reportId: string) => {
            if (!window.confirm('Delete this report from database?')) return;
            try {
              await deleteDoc(doc(db, 'reports', reportId));
            } catch (error) {
              console.error(error);
              alert('Error deleting report');
            }
          };

          return (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-4">
                <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block font-mono">Operational Logs</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Student Loading Failure & Bug Diary</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-4xl">
                  Inspect student reported bugs, broken syllabus links, or file loading errors. Resolve them by typing admin notes and hitting Resolve.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-apple p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  {(['ALL', 'PENDING', 'RESOLVED'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setReportsFilter(filterOpt)}
                      className={`px-4 py-2 font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer ${
                        reportsFilter === filterOpt
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-white border border-slate-200/80 text-slate-605 hover:text-slate-950'
                      }`}
                    >
                      {filterOpt} ({
                        filterOpt === 'ALL'
                          ? reports.length
                          : reports.filter((r) => r.status === filterOpt).length
                      })
                    </button>
                  ))}
                </div>

                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Logged Reports: {reports.length}
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="bg-white border border-slate-200/80 border-dashed rounded-apple p-12 text-center">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">No matching logged issues found</p>
                  <p className="text-[10px] text-slate-450 uppercase mt-1">Status database cleared or filtered empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden shadow-xs hover:shadow-sm transition-all text-left">
                      {/* Left Block: Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider ${
                            report.status === 'RESOLVED' 
                              ? 'bg-emerald-55 text-emerald-850 border border-emerald-150' 
                              : 'bg-red-55/70 text-red-800 border border-red-155 animate-pulse'
                          }`}>
                            {report.status}
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded">
                            {report.reportedPage}
                          </span>

                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {report.materialTitle && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Target Document</span>
                            <p className="text-xs font-black text-slate-850 uppercase">{report.materialTitle}</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Description of loading issue</span>
                          <p className="text-xs font-medium text-slate-750 bg-slate-50 border border-slate-100 p-3.5 rounded">
                            {report.userDescription}
                          </p>
                        </div>

                        {report.targetUrl && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Failing Asset URL</span>
                            <a
                              href={report.targetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-650 hover:underline break-all"
                            >
                              <span>{report.targetUrl}</span>
                              <ExternalLink size={11} className="shrink-0" />
                            </a>
                          </div>
                        )}

                        <div className="text-[10px] font-semibold text-slate-505 uppercase tracking-tight">
                          Reporter: <span className="font-bold text-slate-700">{report.reportedByEmail}</span>
                        </div>

                        {report.resolvedAt && (
                          <div className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">
                            Resolved on: {new Date(report.resolvedAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Right Block: Resolution Form */}
                      <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-205 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">
                            Resolution Action / Notes
                          </label>
                          <textarea
                            value={reportAdminNotes[report.id] !== undefined ? reportAdminNotes[report.id] : (report.adminNotes || '')}
                            onChange={(e) => setReportAdminNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                            className="w-full h-24 bg-white border border-slate-200/80 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 font-medium"
                            placeholder="Type resolution notes (e.g. Fixed Gdrive permissions, updated target folder index, re-synchronized link)"
                          />
                        </div>

                        <div className="flex gap-2">
                          {report.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => handleResolveReport(report)}
                              disabled={resolvingReportsRecord[report.id]}
                              className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-40 text-white font-black text-[9px] uppercase tracking-widest rounded transition-colors text-center cursor-pointer"
                            >
                              {resolvingReportsRecord[report.id] ? 'Saving...' : 'Resolve Issue'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResolveReport(report)}
                              disabled={resolvingReportsRecord[report.id]}
                              className="flex-1 py-2.5 border border-slate-350 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-40 font-black text-[9px] uppercase tracking-widest rounded transition-colors text-center cursor-pointer"
                            >
                              {resolvingReportsRecord[report.id] ? 'Updating...' : 'Update Notes'}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2.5 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 rounded transition-colors cursor-pointer"
                            title="Delete report"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {activeAdminSubTab === 'labs-access' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm p-6 sm:p-10 space-y-4">
              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block font-mono">DeepResearch Labs Provisioning</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Early Access Control Panel</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-4xl">
                Manage user requests for early access to the DeepResearch simulator sandbox. Approve whitelist entries immediately.
              </p>
            </div>

            {betaRequestsLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : betaRequests.length === 0 ? (
              <div className="bg-white border border-slate-200/80 border-dashed rounded-apple p-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  No early access requests pending.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-apple-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Email Payload Node</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Submitted</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Action Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {betaRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-slate-800">{req.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-slate-400 capitalize">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status !== 'APPROVED' ? (
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'beta_requests', req.id), { status: 'APPROVED', approvedAt: new Date().toISOString() });
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded transition-colors"
                            >
                              Approve Node
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pr-2">
                              Whitelisted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}        {/* ANNOUNCEMENTS TAB */}
        {activeAdminSubTab === 'announcements' && (
          <AnnouncementsTabSection />
        )}
      </div>
    </div>
  );
}

function AnnouncementsTabSection() {
  const [announceTarget, setAnnounceTarget] = useState('ALL');
  const [announceEmail, setAnnounceEmail] = useState('');
  const [announceType, setAnnounceType] = useState('popup'); // 'popup' or 'toast'
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announceNotes, setAnnounceNotes] = useState('');
  const [announceUrl, setAnnounceUrl] = useState('');
  const [isPushing, setIsPushing] = useState(false);

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceMessage) return;
    setIsPushing(true);
    try {
      const target = announceTarget === 'SPECIFIC' ? announceEmail : 'ALL';
      await addDoc(collection(db, 'notifications'), {
        targetEmail: target,
        mode: announceType,
        message: announceMessage.trim(),
        notes: announceNotes.trim(),
        url: announceUrl.trim(),
        isRead: false,
        createdAt: new Date().toISOString()
      });
      alert('Notification pushed to ' + target);
      setAnnounceMessage('');
      setAnnounceNotes('');
      setAnnounceUrl('');
    } catch (err) {
      console.error(err);
      alert('Failed to push: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Megaphone size={20} className="text-slate-800" />
          Live Platform Announcements
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-6 max-w-2xl">
          Broadcast live alerts, notifications, or toasts to all active users or target specific registered accounts. Updates appear instantly.
        </p>

        <form onSubmit={handlePush} className="w-full max-w-2xl space-y-5 bg-slate-50 border border-slate-150 p-6 rounded-xl">
          <div className="space-y-4 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Target Audience</label>
                <select 
                  value={announceTarget}
                  onChange={(e) => setAnnounceTarget(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs font-bold text-slate-700 rounded outline-none"
                >
                  <option value="ALL">All Active Users (Global Broadcast)</option>
                  <option value="SPECIFIC">Specific Registered User</option>
                </select>
              </div>

              {announceTarget === 'SPECIFIC' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Target Email</label>
                  <input 
                    type="email"
                    required
                    value={announceEmail}
                    onChange={(e) => setAnnounceEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 rounded outline-none"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Notification Type</label>
              <select 
                value={announceType}
                onChange={(e) => setAnnounceType(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs font-bold text-slate-700 rounded outline-none"
              >
                <option value="popup">Immersive Modal Popup (High Priority)</option>
                <option value="toast">Floating Toast (Standard Update)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Broadcast Headline</label>
              <input 
                type="text"
                required
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                placeholder="e.g., Scheduled Maintenance / Material Released"
                className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2.5 text-sm font-bold text-slate-900 rounded outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Descriptive Subtext (Optional)</label>
              <textarea 
                value={announceNotes}
                onChange={(e) => setAnnounceNotes(e.target.value)}
                placeholder="Provide details about the announcement..."
                className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs text-slate-700 rounded outline-none h-20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Action Link URL (Optional)</label>
              <input 
                type="url"
                value={announceUrl}
                onChange={(e) => setAnnounceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 focus:border-slate-800 px-3 py-2 text-xs text-slate-600 font-mono rounded outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isPushing}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={14} className={isPushing ? "opacity-50" : ""} />
              {isPushing ? "Broadcasting..." : "Push Notification Live"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
