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

// Pure and Applied Sciences Course Seeds
export const SCIENCE_COURSES_SEED: SeedCourse[] = [
  {
    name: "B.Sc. (Hons) Physics",
    description:
      "Rigorous honors sequence exploring core experimental and theoretical physical sciences under NEP guidelines.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Mathematical Physics-I",
        code: "PH-DSC-01",
        semester: 1,
        description:
          "Vector calculus, ordinary differential equations, orthogonal curvilinear coordinates.",
        materials: [
          {
            title: "Mathematical Physics-I Vector Fields & Integration Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/Math-Phys1-Vector-Fields.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Mechanics",
        code: "PH-DSC-02",
        semester: 1,
        description:
          "Inertial frames, rotational dynamics, central force motion, relativity basics.",
        materials: [
          {
            title: "Classical Mechanics Rotational Inertia Solved Problems",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/Mechanics-Rotational-Problems.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Electricity and Magnetism",
        code: "PH-DSC-04",
        semester: 2,
        description:
          "Electrostatics, Laplace/Poisson equations, magnetostatic fields, electromagnetic induction.",
        materials: [
          {
            title:
              "Electricity & Magnetism Electrostatics & Maxwell Derivations",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/EM-Maxwell-Derivations.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Thermal Physics",
        code: "PH-DSC-07",
        semester: 3,
        description:
          "Laws of thermodynamics, thermodynamic potentials, kinetic theory of gases.",
        materials: [
          {
            title: "Thermodynamics Potentials & Kinetic Theory summaries",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/Thermal-Thermodynamic-Potentials.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Quantum Mechanics & Applications",
        code: "PH-DSC-13",
        semester: 5,
        description:
          "Schrodinger wave equations, 1D harmonic oscillator, hydrogen atom model.",
        materials: [
          {
            title:
              "Quantum Mechanics Wave Equation & Probability Densities Guide",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/Quantum-Mechanics-Wave-Equations.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Solid State Physics",
        code: "PH-DSC-14",
        semester: 6,
        description:
          "Crystal structures, reciprocal lattice, free electron theory of metals, band theory.",
        materials: [
          {
            title: "Solid State Physics Crystals & Band Theory Reference Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Phys-Resources/Solid-State-Crystal-Bands.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Sc. (Hons) Chemistry",
    description:
      "Detailed study of inorganic, organic, physical and computational chemical sciences.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Inorganic Chemistry-I",
        code: "CH-DSC-01",
        semester: 1,
        description:
          "Atomic structure, chemical bonding, ionic bonding, valence bond theory.",
        materials: [
          {
            title: "Inorganic Chemistry Periodicity & Chemical Bonding Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Chem-Resources/Inorganic-Periodicity-Bonding.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Physical Chemistry-I",
        code: "CH-DSC-02",
        semester: 1,
        description:
          "Gaseous state, liquid state, solid state, ionic equilibria.",
        materials: [
          {
            title: "Physical Chemistry Gaseous and Liquid States Exercises",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Chem-Resources/Physical-Gaseous-Liquid-Exercises.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Organic Chemistry-I",
        code: "CH-DSC-04",
        semester: 2,
        description:
          "Basics of organic chemistry, stereochemistry, aliphatic hydrocarbons.",
        materials: [
          {
            title:
              "Organic Chemistry Stereochemistry & Aliphatic Reactions Guide",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Chem-Resources/Organic-Stereochemistry-Aliphatic.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Inorganic Chemistry-II",
        code: "CH-DSC-07",
        semester: 3,
        description:
          "General principles of metallurgy, chemistry of s and p block elements.",
        materials: [
          {
            title:
              "S and P Block Elements Group Properties & Coordination Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Chem-Resources/Inorganic-S-P-Block.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Sc. (Hons) Botany",
    description:
      "In-depth study of plant biology, biotechnology, molecular biology, and ecological sciences.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Phycology and Microbiology",
        code: "BT-DSC-01",
        semester: 1,
        description:
          "Introduction to microbial world, virus and bacteria, and phycology.",
        materials: [
          {
            title: "Phycology & Microbial World Lab Observations File",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Bot-Resources/Phycology-Microbial-World.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Mycology and Phytopathology",
        code: "BT-DSC-04",
        semester: 2,
        description:
          "True fungi, allied fungi, oomycota, and diseases of economic plant species.",
        materials: [
          {
            title: "Fungal Pathogens and Phytopathology Handbook",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Bot-Resources/Fungal-Pathogens-Phytopathology.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Sc. (Hons) Zoology",
    description:
      "Comprehensive study of animal diversity, genetics, cell biology, and evolutionary dynamics.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Non-Chordates I",
        code: "ZL-DSC-01",
        semester: 1,
        description:
          "General characteristics and classification up to classes of Protista to Pseudocoelomates.",
        materials: [
          {
            title: "Non-Chordates Classification and Morphological Charts",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Zoo-Resources/Non-Chordates-Classification.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Cell Biology",
        code: "ZL-DSC-04",
        semester: 2,
        description:
          "Structure and function of plasma membrane, mitochondria, golgi complex, and nucleus.",
        materials: [
          {
            title: "Cell Organelles structure, replication, and transport",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Zoo-Resources/Cell-Organelles-Structure.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Sc. Life Sciences",
    description:
      "Multidisciplinary program integrating key modules across Chemistry, Botany, and Zoology.",
    durationYears: 3,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Cell and Molecular Biology",
        code: "LS-DSC-01",
        semester: 1,
        description:
          "Prokaryotic and eukaryotic cells, genetic code, translation, and replication.",
        materials: [
          {
            title:
              "Cell & Molecular Biology Complete Combined Syllabus Study Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Life-Resources/Cell-Molecular-Syllabus-Notes.pdf",
            type: "PDF",
          },
        ],
      },
      {
        name: "Biodiversity",
        code: "LS-DSC-02",
        semester: 1,
        description:
          "Microbes, Algae, Fungi, Archegoniatae, and Protozoa profiles.",
        materials: [
          {
            title: "Biodiversity Microbes and Plant Groups Overview",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Life-Resources/Biodiversity-Microbes-Overview.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
  {
    name: "B.Sc. (Hons) Electronics",
    description:
      "Advanced engineering sequence covering circuit networks, microprocessors, and digital system designs.",
    durationYears: 4,
    level: "UG",
    nepBased: true,
    subjects: [
      {
        name: "Basic Circuit Theory",
        code: "EL-DSC-01",
        semester: 1,
        description:
          "AC and DC circuit networks, mesh & nodal analysis, Thevenin, Norton, and Superposition theorems.",
        materials: [
          {
            title: "Circuit Theorems & AC Mesh Analysis Notes",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Elec-Resources/Circuit-Theorems-Mesh.pdf",
            type: "NOTES",
          },
        ],
      },
      {
        name: "Semiconductor Devices",
        code: "EL-DSC-04",
        semester: 2,
        description:
          "PN junction diodes, BJTs, JFETs, and MOSFETs characteristic curves.",
        materials: [
          {
            title: "Semiconductor Device Physics and Characteristic Curves",
            url: "https://github.com/asmit-0/du-cs-study-material/raw/main/Elec-Resources/Semiconductor-Device-Physics.pdf",
            type: "NOTES",
          },
        ],
      },
    ],
  },
];
