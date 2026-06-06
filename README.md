# ⌬ DEEPRESEARCH LABS
**Cognitive Pipeline & Syllabus Topography Console**

> A premium, high-fidelity platform specialized in mapping Delhi University's syllabus structures and exam indices across dynamic learning nodes using simulated cognitive semantic parsing.

---

## ✦ 1. DESIGN PHILOSOPHY & AESTHETICS

DeepResearch Labs strictly adheres to a **Minimalist, High-Contrast Tech** aesthetic. It abandons visual clutter in favor of a clean, highly structured, grid-based "console" interface that feels like a professional engineering sandbox.

* **Typography Pairing**: Features bold, rigid tracking using `font-sans` (Inter) for primary readouts and `font-mono` (JetBrains Mono) for numerical data, coordinates, and system statuses.
* **Color Palette**: A subdued, eye-safe spectrum blending stark white/off-white (`slate-50`) backgrounds, deep charcoal (`slate-950`) elements, and distinct pulse-green (`emerald-500` to `emerald-800`) indicators for semantic matches.
* **Dimensional Interactivity**: Utilizes `motion/react` to project a hardware-accelerated **Full 3D Topological Grid**. The UI respects perspective tracking, responding linearly to the X/Y axes of user mouse movements to expose a simulated Z-axis layer depth.

---

## ✦ 2. SYSTEM ARCHITECTURE & BACKEND

The system is deployed as a highly performant Single Page Application (SPA), integrating cleanly with cloud infrastructure for secure, stateless persistence.

### Technology Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Client Core** | React 18 / TypeScript / Vite | Declarative view management and ultra-fast build tooling. |
| **Visual Styling** | Tailwind CSS | Utility-first styling enabling precise pixel layouts and strict grids. |
| **Physics/Animation**| Motion | 3D coordinate transformations, spring animations, and layout transitions. |
| **Backend & Auth** | Firebase Firestore | Cloud NoSQL database. Manages authorization queues and waitlists. |
| **Iconography** | Lucide React | Clean, geometric vector glyphs for system representations. |

### Waitlist Gateway Flow
The backend uses Firebase Firestore to gate early access. 
1. **User Request**: The visitor submits a University Domain Email.
2. **Database Write**: The semantic packet is sent to the `beta_requests` collection.
3. **Validation Polling**: The client polls Firestore to confirm if the user's logged-in identity matches an `APPROVED` state to expose the Stage 02 Matrix Canvas.

**Database Schema:** `beta_requests`
| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | String | User's institutional email address (e.g. `name@du.ac.in`) |
| `status` | Enum (String) | `PENDING`, `APPROVED`, `REJECTED` |
| `createdAt`| ISO Date | Timestamp of network request |

---

## ✦ 3. THE TOPOLOGICAL MATRIX (DATA & GRAPHS)

At the heart of the system is the **Relational Node Matrix Canvas**. It renders localized mapping routes and structural distance ratios for academic databases.

### Active Node Registry

The simulator provisions the following cognitive endpoints, distributed across specific bandwidth channels to isolate concurrent harvesting.

| Node ID | Designation | Category | Operating Freq. | Base Packets | State |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | SEMANTIC CORE ENGINE | SYSTEM CENTRAL | 8.40 GHZ | 4,291 | `COHESIVE` |
| **02** | NEP COURSE INTEGRATOR | SYLLABI PARSER | 5.20 GHZ | 1,205 | `COHESIVE` |
| **03** | PREVIOUS YEAR BLUEPRINTS | DECODING NODE | 2.40 GHZ | 3,410 | `BYPASS` |
| **04** | CONCURRENT HARVESTER | WEB SCRAPER | 5.20 GHZ | 981 | `BYPASS` |
| **05** | COGNITIVE BLUEPRINT UNIT | VECTOR STACK | 8.40 GHZ | 2,154 | `COHESIVE` |
| **06** | TAXONOMY MAPPING CORNER | BLUEPRINT HEURISTICS | 2.40 GHZ | 692 | `BYPASS` |

### Crawler Configurations
The engine can be tuned via the **Matrix Settings Console v3** applying varying constraints on network scrapes.

| Protocol Configuration | Technical Purpose | Bandwidth Load |
| :--- | :--- | :--- |
| **AUTO_EMBED** | Semantic Embed Matcher (Low Latency) | Sub 100 KBPS |
| **DEEP_SCAN** | Deep Multi-Hop Root Scan (Aggressive) | Variable Peak |
| **CONCURRENT_HARVEST** | Concurrent Subject Harvester (Batching) | Sustained High |

### Active Routing Paths Breakdown
Telemetry data travels through dedicated architectural scopes:
* `GATEWAY_PRIMARY // SECURE.01`
* `GATEWAY_REDUNDANT // SYLC.02`
* `GATEWAY_DISTRIBUTED // COGN.03`

---

## ✦ 4. DEPLOYMENT & LOCAL BOOT PROTOCOL

To instantiate the console on local developer environments:

**1. Define the Environmental Core**
Secure the database references required for the waitlist gateway.
```bash
cp .env.example .env
```
*(Ensure `VITE_FIREBASE_*` properties are defined as per Firebase console.)*

**2. Initialize Node Modules**
Compile the required system packages.
```bash
npm install
```

**3. Ignite the Engine**
Mount the Vite development server to begin routing operations.
```bash
npm run dev
```

The primary interface will securely bind to port `3000`. Navigate to `http://localhost:3000` via your trusted browser tunnel.

---
> *DELHI UNIVERSITY RESEARCH ENGINE // ALL REGISTERED PROTOCOLS COMPLIANT WITH OPEN ARCHIVES.*
