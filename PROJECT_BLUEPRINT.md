# Projects & Features Core Blueprint Spec

Comprehensive architectural handbook, interactive component documentation, and strategic next-generation update roadmap for the Delhi University (DU) Materials-Discovery and Resource Aggregator platform.

---

## 1. System Architecture & Dual-Engine Data Flow

The DU Materials-Discovery Platform operates on a secure, low-latency React SPA frontend backed by standard cloud persistence (Cloud Firestore) and an on-demand Express aggregator. It establishes absolute security boundaries via structural security invariants enforced by Attribute-Based Access Control (ABAC) in production rules.

```
                  +----------------------------------------------+
                  |               USER CLIENT (SPA)              |
                  +-----------------------+----------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
    (Aggregation & PDF Extraction)           (User Profile, Material Submissions,
                      |                       Votes, Community Feature Proposals)
                      v                                       |
          +-----------+-----------+                           v
          |      EXPRESS API      |               +-----------+-----------+
          |      (server.ts)      |               |    CLOUD FIRESTORE    |
          +-----------+-----------+               |    (firestore.rules)  |
                      |                           +-----------+-----------+
                      v                                       ^
          +-----------+-----------+                           |
          | DU Syllabi / Folders  | (Strict ABAC Rules validation filters writes
          |     (Public HTML)     |  against spoofing, poison tags, & privilege bypass)
          +-----------------------+
```

### Ingestion & Web Mining Logic (`server.ts`)
1. **Source Resolution**: The Aggregator hits the DU public exam domains, crawling core folders, syllabus sheets, and archival indexes.
2. **Parsing & Normalization**: Extracts links matching `Question Paper`, `Syllabus`, and `Notes` keywords on the fly, applying clean labeling and grouping formats.
3. **Lazy-Initialization Cache**: Avoids heavy startup calculations by lazy-aggregating when users type fuzzy query keywords inside the main bar.

### User Data & Persistent Storage Engine (`firestore.rules`)
All write operations for courses, subjects, materials, profiles, and feature proposals undergo rigorous structural evaluation at the database level. Direct modification of documents is protected via matching security rules, rejecting unsigned requests or modifications to immutable keys like roles.

---

## 2. Directory of Existing Visual Components

Here is a microscopic breakdown of every component file in `/src/components` and its tactical role in the overall architecture.

### 1. `LiveSearch.tsx`
*   **Purpose**: The central "Google-style" entryway to the entire platform. Renders the real-time search interface, filters pills, and results cards.
*   **UX Experience**:
    *   Large input field featuring responsive focus-ring offsets.
    *   Dynamic filter chips ("ALL", "QUESTION PAPERS", "SYLLABUS", "NOTES", "VIDEOS").
    *   Typo correction fuzzy spellcheck rendering "Did you mean?" triggers when search matches fall below high confidence thresholds but align with closest dictionary tags.
    *   Clean client-side pagination allowing browsing of results in neat 10-item pages.

### 2. `AdminPanel.tsx`
*   **Purpose**: The central command deck for the "Scholarly Aggregator Council." Reserved exclusively for the primary administrator (`pk950364@gmail.com`).
*   **Sub-Modules**:
    *   *AI Automation & Autopilot Copilot*: Handles batch syncing of courses, processing auto-moderation weights, and automated verification thresholds.
    *   *Syllabus URL Ingestor (Fetcher)*: Directly grabs, extracts, and parses external folders into subjects and materials collections.
    *   *Course Directory Manager*: Create, update, or remove UG/PG degrees.
    *   *Subject Taxonomy Manager*: Maps individual subjects to semesters under a chosen degree.
    *   *Submissions Moderation Desk*: View, approve, or reject user contributions.
    *   *Study Directory Material Manager*: Full tabular view of approved PDFs and metadata.
    *   *Student Directory*: Detailed view of all registered student profiles.
    *   *Behavior Telemetry Center*: Summarizes aggregate analytics logs, metrics, searches, and clicks.
    *   *Security Guard (Active ABAC Sentinel Enforcer)*: Interactive sandbox with real-time logs demonstrating the "Dirty Dozen" (12 complex access threats) getting repelled at the Firestore boundary.

### 3. `AIFeatures.tsx`
*   **Purpose**: Interactive portal housing smart AI features to augment student studies.
*   **Capabilities**:
    *   *Syllabus Tracker*: Analyzes complex syllabi texts to extract core themes, structural chapters, and estimated study weights.
    *   *AI Mock Exam Engine*: Generates dynamic questions based on subject, semester, and topic choice for personal testing.
    *   *Study Guide Planner*: Deconstructs thick topics into bite-sized summaries and logical study milestones.

### 4. `Chat.tsx`
*   **Purpose**: Real-time collaborative peer workspace and study group simulator.
*   **Capabilities**:
    *   Message sending and channel listing mechanics.
    *   Mock collaborative channels mapped to specific subjects, maintaining transient state of user message collections with clean, distraction-free typographic styling.

### 5. `CollegesBrowser.tsx`
*   **Purpose**: Elegant directory for browsing institutions affiliated with Delhi University.
*   **Features**:
    *   Responsive campus pills ("North Campus", "South Campus", "Off-Campus") for interactive categorization.
    *   Beautiful card grid showing established year, descriptions, address, courses offered, and campus flags.
    *   Rich search-by-college input field.

### 6. `CourseMaterialsCount.tsx`
*   **Purpose**: Micro data-tracker that monitors resource counts per course in real-time.
*   **Features**:
    *   Calculates relative distribution percents.
    *   Renders elegant, stylized percentage tracks to map materials density, visual statistics, and directory readiness scorecards.

### 7. `HealthPage.tsx`
*   **Purpose**: Diagnostic dashboard inspecting the core health parameters of the multi-system application.
*   **Inspected Systems**:
    *   *Database Engine (Firestore)*: Latency, connection state, schema compliance.
    *   *File Servers (PDF Repositories)*: Download availability, indexing velocity.
    *   *Internal API Gateways*: Routing checks, latency metrics, JSON payload sizes.
    *   *TLS Transport Standard*: Verifies standard end-to-end transport encryption.

### 8. `Loader.tsx`
*   **Purpose**: Systematic global loader animation.
*   **Styling**: High-contrast, clean minimalist spinner with precise speed-curve loops.

### 9. `MainFeaturesList.tsx`
*   **Purpose**: Feature list dashboard showcasing available tools to newly onboarded or prospective students.
*   **Navigation Actions**: Interacts with the global navigation controller to guide page redirections seamlessly.

### 10. `OnboardingModal.tsx`
*   **Purpose**: Zero-distraction student onboarding wizard.
*   **Data Fields Enforced**: Full Name, College Name, Department, Roll Number, Phone Number, and Consent Checklist.
*   **Behavior**: Blocks general actions until a user profile is compiled and persisted in Firestore, immediately resolving user setup context.

### 11. `PdfPreviewModal.tsx`
*   **Purpose**: Highly versatile inline document and media inspector.
*   **Capabilities**:
    *   Dual-mode: Custom inline preview utilizing secure iframe wrappers or static download guides.
    *   Aesthetic UI containing full fullscreen guides, quick tag metadata, upvote/downvote shortcuts, and bug-reporting.

### 12. `ProfilePage.tsx`
*   **Purpose**: Interactive student card holding academic identity parameters.
*   **Features**:
    *   Editable profile form with input fields for full name, college, roll number, and department.
    *   Comprehensive user activity statistics trackers (number of materials uploaded, active votes, approved submissions count).

### 13. `ResourceAggregator.tsx`
*   **Purpose**: Systematic dashboard representing materials grouped by Course -> Semester -> Subject -> Material.
*   **Features**:
    *   Enables full directory browsing from scratch for users who prefer navigation over typing search queries.
    *   Provides quick upload redirects and upvote controllers on study items.

### 14. `Roadmap.tsx`
*   **Purpose**: Shared collaborative space where students propose, discuss, and vote on potential platform enhancements.
*   **Features**:
    *   Active status filters ("PROPOSED", "IN RESEARCH", "UNDER CONSTRUCTION", "COMPLETED").
    *   Voting increment mechanisms and real-time proposal forms.

---

## 3. Persistent Database Schema Verification

Our application data rules are structured across eight distinct Firestore collections.

### 1. `/courses/{courseId}`
*   **Properties**: `name` (string), `description` (string, optional), `level` ('UG' | 'PG'), `durationYears` (integer), `nepBased` (boolean).
*   **Safety Rule**: Read: Public. Write: Admin-only.

### 2. `/subjects/{subjectId}`
*   **Properties**: `courseId` (string, must exist), `semester` (integer 1-8), `name` (string), `code` (string, optional), `description` (string, optional).
*   **Safety Rule**: Read: Public. Write: Admin-only.

### 3. `/materials/{materialId}`
*   **Properties**: `subjectId` (string), `title` (string), `url` (string), `type` ('PDF' | 'VIDEO' | 'LINK' | 'NOTES'), `tags` (array of strings, limit: 10), `isApproved` (boolean), `upvotes`/`downvotes` (integers), `submittedBy` (string).
*   **Safety Rule**: Read: Public. Write: Authenticated students can create (size restricted to 4 core keys). Limit updates strictly to votes (`affectedKeys().hasOnly(['upvotes', 'downvotes', 'flags'])`).

### 4. `/materials/{materialId}/votes/{userId}`
*   **Properties**: `userId` (string), `type` ('UP' | 'DOWN'), `timestamp` (string).
*   **Safety Rule**: Read: Public. Write: Owner matches request UID and parent material exists.

### 5. `/submissions/{submissionId}`
*   **Properties**: `submissionType` (MATERIAL/SUBJECT_PROPOSAL), `courseName` (string), `subjectName` (string), `status` (PENDING/APPROVED/REJECTED), `semester` (integer), `submittedByEmail` (string).
*   **Safety Rule**: Read: Admins OR submitter match. Write: Strict status guard (must start at PENDING unless admin).

### 6. `/users/{userId}`
*   **Properties**: `fullName` (string), `email` (string), `collegeName` (string), `department` (string), `rollNumber` (string), `phoneNumber` (string), `hasConsented` (boolean), `onboardedAt` (string).
*   **Safety Rule**: Read: Owner or Admin. Write: Owner only. Structural check completely bans modifying administrative keys (`role` or `isAdmin`) during registration updates.

### 7. `/feature_proposals/{proposalId}`
*   **Properties**: `title` (string), `description` (string), `subject` (string), `votes` (integer), `status` ('PROPOSED' | 'IN_RESEARCH' | 'UNDER_CONSTRUCTION' | 'COMPLETED'), `submittedBy` (string).
*   **Safety Rule**: Read: Public. Write: Incremental votes update permitted for all verified users. Complete description editing reserved for author.

### 8. `/user_behavior_logs/{logId}`
*   **Properties**: `userId` (string, optional), `action` (string), `timestamp` (string).
*   **Safety Rule**: Read: Admin-only. Create: Authenticated-only. Update/Delete: Disabled.

---

## 4. Next-Generation Updates Plan (Roadmap Phases)

The strategic path forward dictates transitioning to richer, deeper, and more context-aware academic capabilities.

```
+-----------------------------------------------------------------------------------------+
|                                    STRATEGIC ROADMAP                                    |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  PHASE 1: INTEGRITY STABILIZATION & SPEED                                                |
|  - Real-time caching on aggregator responses (Redis/Memory Cache layer).               |
|  - Advanced file verification algorithms checking dead links automatically.              |
|                                                                                         |
|  PHASE 2: DEEP CONTEXT-AWARE KNOWLEDGE GRAPHS                                           |
|  - Expand subject entities into multi-dimensional "Knowledge Graphs".                   |
|  - Link topics list, official reading guidelines, and reference textbooks directly.    |
|                                                                                         |
|  PHASE 3: COMPREHENSIVE AI MOCK TESTING RUNTIME                                         |
|  - Fully integrate server-side AI evaluation utilizing the official Gemini SDK.         |
|  - Implement dynamic marking rubrics evaluating student mock paper responses.           |
|                                                                                         |
|  PHASE 4: ACADEMIC PROGRESS INSIGHTS DASHBOARD                                          |
|  - Track student preparation metrics based on documents viewed and mock tests taken.     |
|  - Render beautiful charts plotting user mastery indices across academic semesters.    |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### Phase 1: Integrity Stabilization & Response Speed
*   **Objective**: Optimize aggregation lookups and secure URL verification.
*   **Actions**:
    *   Introduce an in-memory Redis or Node Cache layer to cache search outputs for highly queried subjects.
    *   Add an automated background broker check that tests external URLs and flags dead links of resources.

### Phase 2: Deep Context-Aware Knowledge Graphs
*   **Objective**: Transform subjects into comprehensive study guides rather than static document lists.
*   **Actions**:
    *   Create relational schemas detailing unit outlines and syllabus targets.
    *   Add a direct correlation mapping matching textbook recommendations to active library directories.

### Phase 3: Comprehensive AI Mock Testing Runtime
*   **Objective**: Transform the client-side mock tests from flat query generators into real-time grading platforms.
*   **Actions**:
    *   Incorporate AI evaluation engines using the cloud-native Gemini API to read student handwritten text photos, transcribe, and grade response outputs against marking criteria.
    *   Establish detailed breakdown report cards highlighting weaknesses in conceptual understanding.

### Phase 4: Academic Progress Insights Dashboard
*   **Objective**: Empower students to map their degree preparation pathways visually.
*   **Actions**:
    *   Calculate study progress based on materials marked as "Read" or "Completed".
    *   Incorporate charts tracking test trends, historical performance metrics, and subject readiness scores across semestrial milestones.
