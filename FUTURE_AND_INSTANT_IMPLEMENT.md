# Future and Instant Implementations Roadmap

This document outlines the strategic roadmap for the application, divided into instant capabilities (ready for immediate integration) and future-state structural architectures.

## 1. Instant Implementations (Short-Term & Quick Wins)

These are high-impact, low-friction features that can be instantly integrated into the current architecture with minimal disruption:

*   **Fuzzy-Logic Deduplication Extension:** Upgrade the existing Deduplication Engine to use Levenshtein distance (fuzzy string matching) to catch materials with slight typos in their titles (e.g., "Physics Notes" vs "Physics Note").
*   **Student Local Bookmarks:** Implement client-side `localStorage` array to allow students to instantly bookmark and save their favorite materials and subjects for offline/quick access without modifying the backend schema.
*   **Virtualized Admin Data Grids:** Integrate `react-window` or `react-virtuoso` to lazy-render the massive behavior logs and material lists in the Admin Panel to prevent browser memory freezing when datasets exceed 10,000+ rows.
*   **One-Click "Ghost" Mode:** A toggle for Admins to view the student portal exactly as a registered student would, bypassing the Admin Dashboard interfaces for UI/UX testing.
*   **Rich Markdown Render for Materials:** Use `react-markdown` to allow material descriptions and AI-generated study notes to render complex mathematics (LaTeX), code blocks, and rich text natively in the browser.

## 2. Near-Term Structural Upgrades (Next 30-60 Days)

*   **AI Study Plan Synthesizer:** Users select their current Semester and Course, and the AI agent cross-references the curriculum database to generate a day-by-day study roadmap, weighting harder subjects based on historical behavior logs.
*   **Community Upvote / Reputation Engine:** Move beyond static materials by allowing logged-in students to upvote the best notes. Materials with the highest entropy/upvotes rise to the top of the Subject pages.
*   **Automated Harvester V2 (Cron Service):** Decouple the manual Admin "Fetcher" tool into a serverless Cloud Run / Cloud Scheduler cron job that checks university domains weekly for syllabus updates perfectly autonomously.
*   **Global Export:** A feature that allows students to bulk-download everything inside a Subject node as a single, compressed ZIP file for offline archiving.

## 3. Future Architectures (Deep Tech & Long-Term)

*   **Deep Research Agent (Antigravity Protocol):** Allow users to run complex, multi-step AI research sweeps. Instead of reading pre-defined PDFs, the user asks an academic question, and the app spawns a background agent to scrape the web, synthesize answers, and cite sources in real-time.
*   **Offline-First Native Synchronization:** Convert the React app into a true offline-capable Progressive Web App (PWA). Wrap the Firestore database in aggressive offline persistence mode and utilize Service Workers so students can browse cached subjects in dead-zones (subways, rural areas).
*   **Academic Graph Topology:** Migrate from flat NoSQL subject lists to a Graph-based recommendation engine. The system will map neural relationships (e.g., "Students who struggled in *Linear Algebra* spent 40% more time on *Quantum Physics* prerequisites") to automatically surface bridging material.
*   **Live Multi-User Canvas:** Integration of WebSockets / WebRTC to allow students to form virtual study rooms, drawing on a shared whiteboard or collaboratively editing study notes in real-time.
