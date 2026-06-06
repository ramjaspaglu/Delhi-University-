# Materials-Discovery Website: Information Architecture & Spec

## 1. Site Information Architecture (IA)

The site is structured to prioritize immediate discovery (search-first) while providing a systematic browsing method for users who prefer navigating through categories.

*   **Home (Landing Page)**
    *   Centered, prominent search bar (Google-style).
    *   3-step simple instructions explaining "How to Search", "What is Included", and "Archive Browsing".
*   **Search Results (Dynamic View)**
    *   Appears reactively below the search bar.
    *   Contains Filter Pills ("All", "Question Paper", "Syllabus", "Notes", etc.).
    *   Paginated list of results (10-12 items per page).
    *   "Did you mean?" fuzzy matching suggestions for typos.
*   **Archive (Browsing View)**
    *   Directory-style navigation: Course -> Subject -> Year -> Resource.
    *   Integration with official repositories and community-uploaded materials.
*   **Contribute (Upload Page)**
    *   Form to submit new materials with metadata (Course, Subject, Year, Type).
    *   Pre-filled forms when a user saves directly from search results.

## 2. Key Pages & Components

*   **HomepageComponent (`Home` View):** Features a large hero search bar. Removes all internal AI/system jargon. Relies on the `LiveSearchEmbed` component to display results dynamically as the user types (after reaching >=2 characters).
*   **Results Component (`LiveSearchEmbed`):** 
    *   Renders list items with clear taxonomy labels (e.g., source type and material category).
    *   Includes a client-side pagination component.
    *   Direct links to the external document source (Google Drive, official PDFs).
*   **ArchiveComponent (`OfficialRepositoryBrowser` & Community Grid):** Shows grid of courses/departments. When diving in, lists subjects and their associated documents. 

## 3. Data Flow

1.  **Ingestion:**
    *   **Source:** Public endpoints like official university directory indices (e.g. `duExam.in` or equivalent public web directories).
    *   **Mechanism:** Server-side Express API (`/api/aggregate-du`) acts as an aggregator. It makes HTTP GET requests, parses HTML using `cheerio`, extracts links, and normalizes file names.
2.  **Storage/Index:**
    *   *Real-time Engine:* Metadata is categorized on-the-fly (`Question Paper`, `Syllabus`, `Notes`) based on keyword heuristics.
    *   *Persistent Store (Future/Partial):* User contributions (via "Contribute") are saved to Firebase Firestore with strict schema structures.
3.  **Retrieval:**
    *   The React frontend queries the `/api/aggregate-du` endpoint passing the user string.
    *   The aggregator returns clean JSON containing filtered results.
    *   The frontend calculates Levenshtein distance for spellcheck suggestions and paginates the array.

## 4. Pagination Approach

*   **Logic:** Client-side pagination applied to the aggregated results returned from the backend. 
*   **UX:** Numbered pages with "Previous" and "Next" arrows. Displays "Showing X to Y of Z results".
*   **Design Consideration:** Avoids infinite scroll to prevent overwhelming users and to keep footer/navigation links accessible.

## 5. Homepage UI Copy

*   **Headline:** "Discover Materials Instantly."
*   **Search Placeholder:** "Search by subject, topic or course code..."
*   **Cards:**
    *   *How to Search:* "Just type a subject name like "Political Theory" or a course code. We will instantly retrieve relevant documents."
    *   *What is Included:* "Our index covers thousands of official previous year question papers, syllabi, notes, and study guides."
    *   *Archive Browsing:* "Prefer to browse? Click on "Archive" in the menu to explore subjects and folders systematically."
