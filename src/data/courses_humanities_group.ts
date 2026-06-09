export interface SeedMaterial {
  title: string;
  url: string;
  type: "PDF" | "VIDEO" | "LINK" | "NOTES";
}

export interface SeedSubject {
  name: string;
  code: string;
  semester: number;
  description: string;
  materials: SeedMaterial[];
}

export interface SeedCourse {
  name: string;
  description: string;
  durationYears: number;
  level: "UG" | "PG";
  nepBased: boolean;
  subjects: SeedSubject[];
}

// Humanities, Economics, and Programme Course Seeds
export const HUMANITIES_COURSES_SEED: SeedCourse[] = [
  {
    name: "B.A. (Hons) English",
    description:
      "Detailed engagement with global literary structures, Indian classical works, and European dramatic lineages.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Introduction to Literary Studies",
        code: "EN-DSC-01",
        semester: 1,
        description:
          "Reading narratives, poetry, critical essays, and figurative languages.",
        materials: [
          {
            title: "Introduction to Literary Criticism and Genres Overview",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Eng-Resources/Lit-Criticism-Genres.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Indian Classical Literature",
        code: "EN-DSC-04",
        semester: 2,
        description:
          "Kalidasa, Vyasa, Silappadikaram, and ancient Sanskrit dramaturgy translations.",
        materials: [
          {
            title:
              "Indian Classical Literature Core Translations and Theme analysis",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Eng-Resources/Classical-Lit-Analysis.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.A. (Hons) Economics",
    description:
      "Elite theoretical and quantitative training in micro, macro, econometric methods and development fields.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Introductory Microeconomics",
        code: "EC-DSC-01",
        semester: 1,
        description:
          "Consumer theory, production costs, supply curves, elasticities, and market efficiency.",
        materials: [
          {
            title:
              "Introductory Microeconomics Consumer Preferences and Costs Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Econ-Resources/Micro-Consumer-Theory.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Mathematical Methods for Economics-I",
        code: "EC-DSC-02",
        semester: 1,
        description:
          "Set theory, matrix algebra, single-variable calculus, optimization models.",
        materials: [
          {
            title:
              "Mathematical Methods for Economics Functions and Optimization Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Econ-Resources/MME-Optimization-Functions.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Introductory Macroeconomics",
        code: "EC-DSC-04",
        semester: 2,
        description:
          "National income accounting, classical and Keynesian GDP determination, IS-LM framework base.",
        materials: [
          {
            title: "Introductory Macroeconomics National Income & IS-LM Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Econ-Resources/Macro-National-Income.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.A. (Hons) History",
    description:
      "Systematic investigation of Indian, global ancient, and modern Western historical dynamics.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Introducing Historiography",
        code: "HS-DSC-01",
        semester: 1,
        description:
          "Sources, interpretations, historical methods, and global trends in writing historical perspectives.",
        materials: [
          {
            title:
              "Introduction to Historiography & Primary Source Evaluation Guide",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Hist-Resources/Historiography-Source-Guide.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "History of India-I",
        code: "HS-DSC-02",
        semester: 1,
        description:
          "Paleolithic to proto-historic periods, Harappan civilization cultures, and Vedic transitions.",
        materials: [
          {
            title:
              "History of Ancient India Paleolithic & Harappan Societies Highlights",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Hist-Resources/Ancient-India-Harappan.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.A. Programme",
    description:
      "Flexible, multidisciplinary degree combining major options across economics, political science and literature.",
    durationYears: 3,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Principles of Microeconomics",
        code: "BAP-DSC-01",
        semester: 1,
        description:
          "Concepts of demand and supply, consumer utility, and competitive markets.",
        materials: [
          {
            title: "Principles of Microeconomics DU SOL Textbook Guides",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Prog-Resources/BAP-Microeconomics-Syllabus.pdf",
            type: "PDF",
          },
        ],
      },
      {
        name: "Contemporary India",
        code: "BAP-DSC-02",
        semester: 1,
        description:
          "Indian state patterns, democratic constitutional norms, and social structure transitions.",
        materials: [
          {
            title: "Contemporary India Social and Political Context Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Prog-Resources/BAP-Contemporary-India.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Com Programme",
    description:
      "Comprehensive foundational degree in accounting systems, business laws, management, and commercial audits.",
    durationYears: 3,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Business Organization and Management",
        code: "BCP-DSC-01",
        semester: 1,
        description:
          "Fundamentals of business systems, planning models, leadership, and human resources frameworks.",
        materials: [
          {
            title:
              "Business Organization Management Complete Semester Study Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Prog-Resources/BCP-BOM-Study-Notes.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Financial Accounting",
        code: "BCP-DSC-02",
        semester: 1,
        description:
          "Double-entry rules, ledgers, depreciation, partnership final accounts, and cash flows.",
        materials: [
          {
            title: "Financial Accounting Fundamental Principles Solved Ledgers",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Prog-Resources/BCP-Accounting-Solved-Ledgers.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
];
