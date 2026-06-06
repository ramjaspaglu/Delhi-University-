// Let's import interfaces or define them directly here for compatibility.
import { SCIENCE_COURSES_SEED } from './courses_science_group';
import { HUMANITIES_COURSES_SEED } from './courses_humanities_group';

export interface SeedMaterial {
  title: string;
  url: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'NOTES';
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
  level: 'UG' | 'PG';
  nepBased: boolean;
  subjects: SeedSubject[];
}

const DU_BASE_DATA: SeedCourse[] = [
  {
    name: "B.Sc. (Hons) Computer Science",
    description: "Honors degree in Computer Science under Delhi University NEP.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Programming using Python",
        code: "DSC-01",
        semester: 1,
        description: "Foundational programming concepts, control structures, list/dictionary comprehensions, and basic OOP with Python.",
        materials: [
          { title: "Delhi University Python Official Syllabus & Practical List", url: "https://www.du.ac.in/uploads/new-web/syllabi-nep-2022/B.Sc.%20(Hons)%20Computer%20Science.pdf", type: "PDF" },
          { title: "DU 2022 Previous Year Solved Question Paper", url: "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/1st%20Sem/Programming%20using%20Python/Python-2022-PYQ.pdf", type: "PDF" },
          { title: "Programming using Python Complete Course Handwritten Notes", url: "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/Semester-1/Python/Python-Complete-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Computer System Architecture",
        code: "DSC-02",
        semester: 1,
        description: "Registers, micro-operations, assembly instructions, memory hierarchy.",
        materials: [
          { title: "Computer System Architecture Complete Units Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-1/CSA/CSA-Unit-1-4-Complete.pdf", type: "NOTES" },
          { title: "Mano Computer Architecture Complete Concepts Video Lectures", url: "https://www.youtube.com/watch?v=leALX1885i0", type: "VIDEO" }
        ]
      },
      {
        name: "Object Oriented Programming in C++",
        code: "DSC-04",
        semester: 2,
        description: "Fundamentals of C++, inheritance, runtime polymorphism, and STL.",
        materials: [
          { title: "OOP using C++ Complete Theory Study Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-2/Object-Oriented-Programming/OOP-C%2B%2B-Theory-Guide.pdf", type: "NOTES" },
          { title: "OOP C++ 2022 Previous Year Question Paper", url: "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/2nd%20Sem/Object%20Oriented%20Programming/OOP-C%2B%2B-2022-PYQ.pdf", type: "PDF" }
        ]
      },
      {
        name: "Discrete Mathematical Structures",
        code: "DSC-05",
        semester: 2,
        description: "Sets, relations, logic, graph theory, trees, and generating functions.",
        materials: [
          { title: "Discrete Structures Complete Exam Revision notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-2/Discrete-Structures/Discrete-Structures-Handwritten-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Data Structures",
        code: "DSC-07",
        semester: 3,
        description: "Stacks, Queues, Linked Lists, Trees, Graphs, and AVL trees.",
        materials: [
          { title: "Data Structures Theory Lectures Notes (C++)", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-3/Data-Structures/DS-Theory-Complete-Notes.pdf", type: "NOTES" },
          { title: "Data Structures 2022 Exam Question Paper", url: "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/3rd%20Sem/Data%20Structures/DS-2022-PYQ.pdf", type: "PDF" }
        ]
      },
      {
        name: "Operating Systems",
        code: "DSC-08",
        semester: 3,
        description: "Processes, CPU Scheduling, Deadlocks, Memory paging, and Linux.",
        materials: [
          { title: "Operating Systems Lecture Notes & Diagrams", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-3/Operating-Systems/OS-Lecture-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Design and Analysis of Algorithms",
        code: "DSC-10",
        semester: 4,
        description: "Divide and conquer, greedy methods, dynamic programming, backtracking, P vs NP.",
        materials: [
          { title: "DAA Unit-wise Handwritten Classroom Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/Algorithms/DAA-Handwritten-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Database Management Systems",
        code: "DSC-11",
        semester: 4,
        description: "Relational models, ER-Diagrams, advanced SQL, normalization (1NF to BCNF).",
        materials: [
          { title: "DBMS Complete Revision notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/DBMS/DBMS-Complete-Revision.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Software Engineering",
        code: "DSC-13",
        semester: 5,
        description: "Software lifecycle models, requirements engineering, design principles, testing and maintenance.",
        materials: [
          { title: "Software Engineering Core Notes & UML Cheat Sheet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-5/SE/Software-Engineering-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Theory of Computation",
        code: "DSC-14",
        semester: 5,
        description: "Finite automata, regular expressions, context-free grammars, Turing machines, and decidability.",
        materials: [
          { title: "TOC Formal Languages & Automata Exam Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-5/TOC/Theory-Of-Computation-Guide.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Artificial Intelligence",
        code: "DSC-16",
        semester: 6,
        description: "Heuristic search, game playing, knowledge representation, expert systems, and intro to neural nets.",
        materials: [
          { title: "AI Core Tutorial Guides & Heuristic Algorithms Sheet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-6/AI/AI-Revision-Guide.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Computer Graphics",
        code: "DSC-17",
        semester: 6,
        description: "Rasterization, clipping algorithms, 3D transformations, projections, and light calculations.",
        materials: [
          { title: "Computer Graphics Lectures Handouts & Projections Cheat Sheet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-6/CG/Computer-Graphics-Compiled-Handouts.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Machine Learning",
        code: "DSC-19",
        semester: 7,
        description: "Supervised and unsupervised learning, decision trees, support vector machines, and neural model optimization.",
        materials: [
          { title: "ML Core Regression and Classification Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-7/ML/ML-Theory-Revision.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Web Technologies",
        code: "DSC-20",
        semester: 7,
        description: "Modern frontend frameworks, server-side JS, REST endpoints, and database binding.",
        materials: [
          { title: "Web Technologies Full Stack Handbook", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-7/Web/Web-Tech-Handbook.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Cloud Computing & Services",
        code: "DSC-22",
        semester: 8,
        description: "Virtualization, SaaS/PaaS/IaaS, serverless configurations, containers, and deployment microservices.",
        materials: [
          { title: "Cloud Architectures & Deployment Strategies Reference Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-8/Cloud/Cloud-Computing-Study-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Minor Dissertation / Project Work",
        code: "DSC-24",
        semester: 8,
        description: "Semester-long industrial project research, thesis documentation, and system architecture design implementation.",
        materials: [
          { title: "Research Project Abstract & Thesis Writing Guidelines", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-8/Project/Project-Thesis-Guidelines.pdf", type: "NOTES" }
        ]
      }
    ]
  },
  {
    name: "B.Com (Hons)",
    description: "Premium undergraduate Business Commerce honors courses at Delhi University.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Financial Accounting",
        code: "BCH-1.1",
        semester: 1,
        description: "Conceptual frameworks, double-entry ledgers, depreciation calculations, final accounts.",
        materials: [
          { title: "Accounting Principles & Depreciation Methods Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Financial-Accounting-Unit1-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Business Law",
        code: "BCH-1.2",
        semester: 1,
        description: "Indian Contract Act 1872, special indemnity contracts, pledge and bailment.",
        materials: [
          { title: "Business Law Cases Interpretation & Guidelines", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Business-Law-Model-Paper.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Corporate Accounting",
        code: "BCH-2.1",
        semester: 2,
        description: "Amortisation structures, corporate share forfeitures, corporate mergers.",
        materials: [
          { title: "Corporate Accounting Unit 1 & 2 Core Equations", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Corporate-Accounting-FormulaSheet.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Company Law",
        code: "BCH-2.2",
        semester: 2,
        description: "Incorporation rules, Memorandum of Association, capital fundraising channels and directors.",
        materials: [
          { title: "Indian Company Act 2013 Key Provisions Handbook", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Company-Law-Handout.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Income Tax Law & Practice",
        code: "BCH-3.1",
        semester: 3,
        description: "Heads of income, residential status, salary computations, house property tax.",
        materials: [
          { title: "Income Tax Calculation Guide & Exemptions Sheet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Income-Tax-Formulas.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Human Resource Management",
        code: "BCH-3.2",
        semester: 3,
        description: "Recruitment, training, performance evaluations, employee grievances and labor laws under DU.",
        materials: [
          { title: "HRM Concept Summaries and Case Studies Booklet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/HRM-CaseStudies.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Cost Accounting",
        code: "BCH-4.1",
        semester: 4,
        description: "Material pricing, labor costing, overhead allocation, process costing and contract sheets.",
        materials: [
          { title: "Cost Accounting Formula Cards & Process Accounts Example", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Cost-Accounting-Formulas.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Business Mathematics",
        code: "BCH-4.2",
        semester: 4,
        description: "Matrices, calculus application to business optimization, compound interest and annuities.",
        materials: [
          { title: "Business Mathematics Problem Sets & Solved Theorems", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Business-Math-ProblemSets.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Principles of Marketing",
        code: "BCH-5.1",
        semester: 5,
        description: "Market segmentation, branding, pricing strategies, 4 Ps of marketing mix and consumer behavior.",
        materials: [
          { title: "Marketing Strategy Core Frameworks & Brand Cases", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Marketing-Principles-Frameworks.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Financial Management",
        code: "BCH-5.2",
        semester: 5,
        description: "Capital budgeting, cost of capital, capital structure theories, dividend policy decision nodes.",
        materials: [
          { title: "Financial Management Capital Budgeting Formulas", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Financial-Management-Formulas.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Auditing & Corporate Governance",
        code: "BCH-6.1",
        semester: 6,
        description: "Internal control, voucher verification, audit reports, codes of corporate governance ethics.",
        materials: [
          { title: "Auditing Standards & Governance Code Summaries", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Auditing-Standards-Summary.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Indirect Tax Laws (GST)",
        code: "BCH-6.2",
        semester: 6,
        description: "Introduction to GST, supply vectors, input tax credits, return filings, and customs regulations.",
        materials: [
          { title: "GST Input Tax Credit Verification Rules", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/GST-Rules-Guide.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Corporate Tax Planning",
        code: "BCH-7.1",
        semester: 7,
        description: "Tax planning vs avoidance, location based tax benefits, mergers restructuring planning.",
        materials: [
          { title: "Corporate Tax Planning Strategies Study Note", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Tax-Planning-Strategies.pdf", type: "NOTES" }
        ]
      },
      {
        name: "International Business",
        code: "BCH-7.2",
        semester: 7,
        description: "Globalization, trade theories, tariffs and FDI, regional trading blocks, IMF & World Bank.",
        materials: [
          { title: "International Trade Theories Quick Review Booklet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Trade-Theories-Review.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Financial Markets & Institutions",
        code: "BCH-8.1",
        semester: 8,
        description: "Money markets, stock exchange indices, banking structure, RBI control mechanisms, SEBI regulations.",
        materials: [
          { title: "Financial Markets Structure & SEBI Guidelines Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Financial-Markets-Structure.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Research Project / Dissertation",
        code: "BCH-8.2",
        semester: 8,
        description: "Formulation of research gaps, collection of primary commerce datasets, statistical analysis, and thesis defense.",
        materials: [
          { title: "Commerce Dissertation Structure & Data Modeling Guidelines", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Dissertation-Guidelines.pdf", type: "NOTES" }
        ]
      }
    ]
  },
  {
    name: "B.A. (Hons) Political Science",
    description: "Renowned political systems, theoretical insights and diplomacy studies program.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Understanding Political Theory",
        code: "DSC-1",
        semester: 1,
        description: "Concepts of power, citizenship, democracy, freedom, and state structures.",
        materials: [
          { title: "Understanding Political Theory official DU SOL textbook", url: "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-PolSci/Understanding-Political-Theory-SOL-Ebook.pdf", type: "PDF" }
        ]
      },
      {
        name: "Constitutional Government and Democracy in India",
        code: "DSC-2",
        semester: 1,
        description: "Framing, Fundamental Rights, directive principles, federal structures, and parliamentary operations.",
        materials: [
          { title: "Constitutional Government and Democracy in India 2022 Paper", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Constitutional-Government-PYQ-2022.pdf", type: "PDF" }
        ]
      },
      {
        name: "Political Theory - Concepts and Debates",
        code: "DSC-3",
        semester: 2,
        description: "Negative vs Positive Liberty, Justice theories (Rawls), Equality of opportunity, Rights, and State Obligations.",
        materials: [
          { title: "Political Theory Key Debates Class Compilation", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Political-Theory-Concepts-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Political Process in India",
        code: "DSC-4",
        semester: 2,
        description: "Party systems, voting behavior patterns, regional movements, caste politics, and secular debate nodes.",
        materials: [
          { title: "Political Process in India Study Guide & Essays", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Political-Process-India-Essays.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Intro to Comparative Government",
        code: "DSC-5",
        semester: 3,
        description: "Analyzing regimes, capitalist vs socialist models, historical decolonization processes.",
        materials: [
          { title: "Comparative Politics Core Methods & Concepts Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Comparative-Gov-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Public Policy in India",
        code: "DSC-6",
        semester: 3,
        description: "Policy formulations, institutions, evaluation indexes, and public development programs in India.",
        materials: [
          { title: "Public Policy Formulation Schemes & Case Studies Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Public-Policy-Formulation.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Comparative Institutions",
        code: "DSC-8",
        semester: 4,
        description: "Executive and legislative designs, electoral models, and federalism implementations globally.",
        materials: [
          { title: "Electoral Systems & Federal Balance Comparison Sheets", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Electoral-Systems-Comparisons.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Public Administration Models",
        code: "DSC-9",
        semester: 4,
        description: "Classical bureau models, scientific management, human relations theories, and new public governance.",
        materials: [
          { title: "Public Administration Classical and Modern Theories", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Public-Admin-Theories.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Classical Political Philosophy",
        code: "DSC-11",
        semester: 5,
        description: "Plato, Aristotle, Machiavelli, Hobbes, Locke, Rousseau, and historical concepts of state and republic.",
        materials: [
          { title: "Plato and Aristotle Theories of Ideal State Highlights", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Classical-Philosophy-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Indian Political Thought-I",
        code: "DSC-12",
        semester: 5,
        description: "Manu, Kautilya, Barani, Kabir, and conceptualizations of kingship, statecraft, justice, and social folds.",
        materials: [
          { title: "Kautilya Arthashastra Statecraft Principles Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Kautilya-Statecraft-Principles.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Modern Political Philosophy",
        code: "DSC-13",
        semester: 6,
        description: "Marx, John Stuart Mill, Mary Wollstonecraft, and theories of liberty, class struggle, and gender equal status.",
        materials: [
          { title: "Marxist Class Struggle & JS Mill Liberty Concepts Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Modern-Philosophy-Highlights.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Indian Political Thought-II",
        code: "DSC-14",
        semester: 6,
        description: "Ram Mohan Roy, Vivekananda, Gandhi, Ambedkar, Nehru, Savarkar, and debates on social reforms and nationalism.",
        materials: [
          { title: "Ambedkar Caste Annihilation and Gandhi Swaraj Concept Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Indian-Political-Thought-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Indian Foreign Policy",
        code: "DSC-15",
        semester: 7,
        description: "Non-alignment legacy, strategic autonomy, neighborhood policies, balance of power, and global organizations (UN, BRICS).",
        materials: [
          { title: "Indian Foreign Policy Non-Alignment and Strategic Shifts Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Foreign-Policy-Syllabus-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Feminism & Indian Politics",
        code: "DSC-16",
        semester: 7,
        description: "Historical waves, intersectionality, personal is political, patriarchy, and women's political representation inside DU system.",
        materials: [
          { title: "Feminism Movements and Legal Acts in India Reference Booklet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Feminism-Legal-Acts.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Understanding South Asia",
        code: "DSC-17",
        semester: 8,
        description: "Strategic balances, SAARC, border disputes, climate integration, and water diplomacy across South Asian corridors.",
        materials: [
          { title: "South Asia Border Settlements & Cooperative Pacts Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/South-Asia-Diplomacy.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Research Methodology / Thesis",
        code: "DSC-18",
        semester: 8,
        description: "Formulation of qualitative theories, hypothesis structures, research ethics, and final thesis defense.",
        materials: [
          { title: "BA PolSci Honors Thesis Preparation Instructions", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Thesis-Writing-Guide.pdf", type: "NOTES" }
        ]
      }
    ]
  },
  {
    name: "B.Sc. (Hons) Mathematics",
    description: "Delhi University honors program in core & advanced mathematics under NEP.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Algebra",
        code: "MATH-DSC-1",
        semester: 1,
        description: "Complex numbers, theory of equations, matrix operations.",
        materials: [
          { title: "Algebra Compiled Notes For Class Review", url: "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/1st%20Sem/Algebra/Algebra-Notes-Compiled.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Calculus",
        code: "MATH-DSC-2",
        semester: 1,
        description: "Limits, continuity, differentiability, Curve tracing.",
        materials: [
          { title: "Syllabus Guided Complete Calculus Notes", url: "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/1st%20Sem/Calculus/Calculus-Reference-Text.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Differential Equations",
        code: "MATH-DSC-4",
        semester: 2,
        description: "First order differential equations, second-order linear homogeneous ODEs.",
        materials: [
          { title: "Differential Equations Comprehensive Problems Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Differential-Equations-Workbook.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Real Analysis",
        code: "MATH-DSC-5",
        semester: 2,
        description: "Bounded sequences, supremum/infimum, Bolzano-Weierstrass theorem, convergence limits of infinite series.",
        materials: [
          { title: "Real Analysis Sequences and Series Study Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Real-Analysis-Guide.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Group Theory-I",
        code: "MATH-DSC-7",
        semester: 3,
        description: "Groups, subgroups, cyclic groups, Lagrange's theorem, normal subgroups, and homomorphisms.",
        materials: [
          { title: "Group Theory-I Group Homomorphisms Notes Sheet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Group-Theory-1-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Theory of Real Functions",
        code: "MATH-DSC-8",
        semester: 3,
        description: "Limits of functions, sequential criteria, Uniform continuity, derivatives, and Rolle's Theorem.",
        materials: [
          { title: "Theory of Real Functions Intermediate Value theorems", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Real-Functions-Theorems.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Partial Differential Equations",
        code: "MATH-DSC-10",
        semester: 4,
        description: "Pfaffian differential equations, Monge's method, wave/heat transfer partial systems.",
        materials: [
          { title: "Syllabus Guided Heat & Wave Equations Solution notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Heat-Wave-Equations.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Riemann Integration",
        code: "MATH-DSC-11",
        semester: 4,
        description: "Riemann sums, integrals, fundamental theorem of calculus, improper files integration.",
        materials: [
          { title: "Riemann Integration Theorem Proofs Compilation", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Riemann-Integration-Proofs.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Metric Spaces",
        code: "MATH-DSC-13",
        semester: 5,
        description: "Open/closed balls, Cantor's theorem, completeness, compactness, Baire Category Theorem.",
        materials: [
          { title: "Metric Spaces Cauchy Sequences Completeness Notes", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Metric-Spaces-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Linear Algebra-I",
        code: "MATH-DSC-14",
        semester: 5,
        description: "Vector spaces, basis and dimension, linear transformations, rank-nullity, coordinates changes.",
        materials: [
          { title: "Linear Algebra-I Rank-Nullity Theorem Solved Examples", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Linear-Algebra-1-Solved.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Complex Analysis",
        code: "MATH-DSC-16",
        semester: 6,
        description: "Analytic functions, CR equations, contour integrals, Cauchy's Integral formula, residues and poles theory.",
        materials: [
          { title: "Complex Analysis Contour Integration & Residues Guide", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Complex-Analysis-Integration.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Ring Theory",
        code: "MATH-DSC-17",
        semester: 6,
        description: "Rings, ideals, quotient rings, prime and maximal ideals, integral domains, PID / UFD properties.",
        materials: [
          { title: "Ring Theory Ideals and Quotient Rings Theorems", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Ring-Theory-Theorems.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Probability & Statistics",
        code: "MATH-DSC-19",
        semester: 7,
        description: "Sample spaces, probability distributions, Chebyshev's Inequality, law of large numbers.",
        materials: [
          { title: "Probability Distributions & CLT Mathematical Proofs", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Probability-Proofs.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Numerical Analysis",
        code: "MATH-DSC-20",
        semester: 7,
        description: "Interpolations, Newton-Raphson methods, Euler's and Runge-Kutta numerical differential tools.",
        materials: [
          { title: "Numerical Methods Solved MATLAB Practicals File", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Numerical-Analysis-Solved.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Topology",
        code: "MATH-DSC-22",
        semester: 8,
        description: "Topological spaces, basis, product topology, Hausdorff separation criteria.",
        materials: [
          { title: "Topology Spaces separation axioms and connectedness", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Topology-Axioms.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Dissertation & Defense",
        code: "MATH-DSC-24",
        semester: 8,
        description: "Undergraduate research thesis in pure or applied mathematical modeling.",
        materials: [
          { title: "Mathematics Thesis Template and Presentation Guidelines", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Math-Resources/Thesis_Guidelines.pdf", type: "NOTES" }
        ]
      }
    ]
  },
  {
    name: "B.Sc. Physical Science (CS)",
    description: "Delhi University's versatile program blending Physics, Mathematics, and Computer Science.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Problem Solving using Computer",
        code: "CS-DSC-1",
        semester: 1,
        description: "Problem-solving techniques, Python programming variables.",
        materials: [
          { title: "Python Programming DU SOL Learning Booklet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/Python-Syllabus-Overview.pdf", type: "PDF" }
        ]
      },
      {
        name: "Database Management Systems",
        code: "CS-DSC-2",
        semester: 2,
        description: "Introduction to databases, ER modeling, SQL basics.",
        materials: [
          { title: "DBMS Lecture Guide for Physical Science Students", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/Database-Management-Lecture-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Operating Systems",
        code: "CS-DSC-3",
        semester: 3,
        description: "Processes, scheduling, thread concepts, memory structures, and file systems under CS progression.",
        materials: [
          { title: "Operating Systems Unit Summaries Booklet", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/OS-Unit-Summary.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Computer Networks",
        code: "CS-DSC-4",
        semester: 4,
        description: "Data communication, OSI physical link layer, TCP/IP routing algorithms, and DNS systems.",
        materials: [
          { title: "Computer Networks Routing Protocols Highlights", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/CN-Protocols-Notes.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Software Engineering Practice",
        code: "CS-DSC-5",
        semester: 5,
        description: "Software engineering concepts, testing protocols, design models, and coding standards.",
        materials: [
          { title: "Software Engineering Process Models Guidelines", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/SE-Process-Models.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Data Structures in C++",
        code: "CS-DSC-6",
        semester: 6,
        description: "Concept of linear data arrays, linked lists, binary tree properties and sorting algorithms.",
        materials: [
          { title: "Data Structures Arrays & Stack Recursion Guides", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/DS-Arrays-Guide.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Artificial Intelligence Core",
        code: "CS-DSC-7",
        semester: 7,
        description: "State-space searches, DFS/BFS algorithms, logic programming models.",
        materials: [
          { title: "AI state-space searches and resolution exercises", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/AI-Search-Proofs.pdf", type: "NOTES" }
        ]
      },
      {
        name: "Machine Learning Foundations",
        code: "CS-DSC-8",
        semester: 8,
        description: "ML core models, classification trees, naive bayes classifications, and evaluation tools.",
        materials: [
          { title: "ML Classifiers and Data Validation Sheets", url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Physical-Science/ML-Classifiers.pdf", type: "NOTES" }
        ]
      }
    ]
  }
];

export const DU_SEED_DATA: SeedCourse[] = [
  ...DU_BASE_DATA,
  ...SCIENCE_COURSES_SEED,
  ...HUMANITIES_COURSES_SEED
];

