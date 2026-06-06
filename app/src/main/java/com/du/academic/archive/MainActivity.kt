package com.du.academic.archive

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.ui.viewinterop.AndroidView

// ==========================================
// DATA MODELS
// ==========================================

data class Material(
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val url: String,
    val type: String, // PDF, VIDEO, NOTES, LINK
    var upvotes: Int = 0,
    var downvotes: Int = 0
)

data class Subject(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val code: String,
    val semester: Int,
    val description: String,
    val materials: List<Material> = emptyList()
)

data class Course(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String,
    val durationYears: Int,
    val level: String, // UG, PG
    val nepBased: Boolean,
    val subjects: List<Subject>
)

data class FolderLink(
    val term: String,
    val url: String
)

data class BrowserCourse(
    val name: String,
    val links: List<FolderLink>
)

data class BrowserCategory(
    val category: String,
    val courses: List<BrowserCourse>
)

data class Contribution(
    val id: String = UUID.randomUUID().toString(),
    val submissionType: String, // MATERIAL or SUBJECT_PROPOSAL
    val courseName: String,
    val subjectName: String,
    val semester: Int,
    val title: String,
    val url: String,
    val description: String,
    val submittedBy: String,
    val timestamp: String
)

data class College(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val campus: String, // North Campus, South Campus, Off-Campus
    val established: Int,
    val address: String,
    val imageUrl: String = "",
    val description: String,
    val courseNames: List<String>
)

// ==========================================
// MAIN ACTIVITY
// ==========================================

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DUTheme {
                MainApp()
            }
        }
    }
}

// ==========================================
// CORE SEED DATABASE (KOTLIN MAP)
// ==========================================

object AppDatabase {
    val courses = mutableStateListOf<Course>(
        Course(
            name = "B.Sc. (Hons) Computer Science",
            description = "Honors degree in Computer Science under Delhi University NEP.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Programming using Python",
                    code = "DSC-01",
                    semester = 1,
                    description = "Foundational programming concepts, control structures, list/dictionary comprehensions, and basic OOP with Python.",
                    materials = listOf(
                        Material(title = "DU Python Official Syllabus & Practical List", url = "https://www.du.ac.in/uploads/new-web/syllabi-nep-2022/B.Sc.%20(Hons)%20Computer%20Science.pdf", type = "PDF"),
                        Material(title = "DU 2022 Previous Year Solved Question Paper", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/1st%20Sem/Programming%20using%20Python/Python-2022-PYQ.pdf", type = "PDF"),
                        Material(title = "Programming using Python Complete Course Handwritten Notes", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/Semester-1/Python/Python-Complete-Notes.pdf", type = "NOTES"),
                        Material(title = "Python Lab Journal / Practical File with Solved Code", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-1/Python/Python-Lab-Journal.pdf", type = "NOTES"),
                        Material(title = "Python for Beginners - Video Lecture Series", url = "https://www.youtube.com/watch?v=rfscVS0vtbw", type = "VIDEO")
                    )
                ),
                Subject(
                    name = "Computer System Architecture",
                    code = "DSC-02",
                    semester = 1,
                    description = "Registers, ALU, micro-operations, CPU organisation, assembly instructions, pipeline and memory hierarchy.",
                    materials = listOf(
                        Material(title = "Computer System Architecture Complete Units Notes", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-1/CSA/CSA-Unit-1-4-Complete.pdf", type = "NOTES"),
                        Material(title = "CSA 2022 Previous Year Exam Question Paper", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/1st%20Sem/Computer%20System%20Architecture/CSA-2022-PYQ.pdf", type = "PDF"),
                        Material(title = "Mano Computer Architecture Complete Concepts Lecture Series", url = "https://www.youtube.com/watch?v=leALX1885i0", type = "VIDEO")
                    )
                ),
                Subject(
                    name = "Object Oriented Programming in C++",
                    code = "DSC-04",
                    semester = 2,
                    description = "Fundamentals of C++, inheritance, runtime polymorphism, exception handling, and Standard Template Library (STL).",
                    materials = listOf(
                        Material(title = "OOP using C++ Complete Theory Study Guide", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-2/Object-Oriented-Programming/OOP-C%2B%2B-Theory-Guide.pdf", type = "NOTES"),
                        Material(title = "C++ Programming Solved Practicals & Lab Journal", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-2/Object-Oriented-Programming/C%2B%2B-Lab-Programs.pdf", type = "NOTES"),
                        Material(title = "OOP C++ 2022 Previous Year Question Paper", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/2nd%20Sem/Object%20Oriented%20Programming/OOP-C%2B%2B-2022-PYQ.pdf", type = "PDF")
                    )
                ),
                Subject(
                    name = "Discrete Mathematical Structures",
                    code = "DSC-05",
                    semester = 2,
                    description = "Sets, relations, functions, recursion, logic, graph theory, trees, and generating functions.",
                    materials = listOf(
                        Material(title = "Discrete Structures Complete Exam Revision notes", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-2/Discrete-Structures/Discrete-Structures-Handwritten-Notes.pdf", type = "NOTES"),
                        Material(title = "Discrete Mathematics Previous Year Papers Compiled with Solutions", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/2nd%20Sem/Discrete%20Structures/DS-PYQ-Solutions.pdf", type = "PDF")
                    )
                ),
                Subject(
                    name = "Data Structures",
                    code = "DSC-07",
                    semester = 3,
                    description = "Stacks, Queues, Linked Lists, Trees, Graphs, Sorting algorithms, and AVL trees mapped to DU curriculum.",
                    materials = listOf(
                        Material(title = "Data Structures Theory Lectures Notes (C++)", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-3/Data-Structures/DS-Theory-Complete-Notes.pdf", type = "NOTES"),
                        Material(title = "DS Solved Practical Lab Problems Guide", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-3/Data-Structures/DS-Lab-Practical-Set.pdf", type = "NOTES"),
                        Material(title = "Data Structures 2022 Exam Question Paper", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/3rd%20Sem/Data%20Structures/DS-2022-PYQ.pdf", type = "PDF")
                    )
                ),
                Subject(
                    name = "Operating Systems",
                    code = "DSC-08",
                    semester = 3,
                    description = "Processes, Threads, Semaphores, CPU Scheduling, Deadlocks, Memory paging, and Linux filesystem.",
                    materials = listOf(
                        Material(title = "Operating Systems Lecture Notes & Diagrams", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-3/Operating-Systems/OS-Lecture-Notes.pdf", type = "NOTES"),
                        Material(title = "OS Past Year Compiled Question Papers (SOL & Colleges)", url = "https://github.com/shubham-saini/DU-CS-BSc-H-Resources/raw/master/3rd%20Sem/Operating%20Systems/OS-Compiled-PYQs.pdf", type = "PDF"),
                        Material(title = "Operating Systems Concepts - Video Lectures", url = "https://www.youtube.com/watch?v=vBURTt97EkA", type = "VIDEO")
                    )
                ),
                Subject(
                    name = "Design and Analysis of Algorithms",
                    code = "DSC-10",
                    semester = 4,
                    description = "Divide and conquer, greedy methods, dynamic programming, backtracking, branch-bound, and P vs NP concepts.",
                    materials = listOf(
                        Material(title = "DAA Unit-wise Handwritten Classroom Notes", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/Algorithms/DAA-Handwritten-Notes.pdf", type = "NOTES"),
                        Material(title = "Algorithms Exam Study Guides & Pseudocodes Booklet", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/Algorithms/DAA-Exam-Reference-Booklet.pdf", type = "PDF")
                    )
                ),
                Subject(
                    name = "Database Management Systems",
                    code = "DSC-11",
                    semester = 4,
                    description = "Relational models, ER-Diagrams, advanced SQL commands, normalization forms (1NF to BCNF) and transactions.",
                    materials = listOf(
                        Material(title = "DBMS Complete Revision notes (University Prep)", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/DBMS/DBMS-Complete-Revision.pdf", type = "NOTES"),
                        Material(title = "DBMS Lab Practical File with Solved SQL Queries", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/Semester-4/DBMS/DBMS-Solved-MySQL-Lab-Journal.pdf", type = "NOTES")
                    )
                )
            )
        ),
        Course(
            name = "B.Com (Hons)",
            description = "Premium undergraduate Business Commerce honors courses at Delhi University.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Financial Accounting",
                    code = "BCH-1.1",
                    semester = 1,
                    description = "Conceptual frameworks, double-entry ledgers, depreciation calculations, final company accounts.",
                    materials = listOf(
                        Material(title = "B.Com Hons Financial Accounting Complete Syllabus Grid", url = "https://www.du.ac.in/uploads/new-web/syllabi-nep-2022/bcom-hons.pdf", type = "PDF"),
                        Material(title = "Financial Accounting 10-Year Compilation of Exam Papers", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Financial-Accounting-DU-10Year.pdf", type = "PDF")
                    )
                ),
                Subject(
                    name = "Business Law",
                    code = "BCH-1.2",
                    semester = 1,
                    description = "Indian Contract Act 1872, special contracts, pledge and bailment, Sale of Goods Act, and limited liability partnership.",
                    materials = listOf(
                        Material(title = "Business Law Cases Interpretation & Guidelines", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Business-Law-Model-Paper.pdf", type = "NOTES"),
                        Material(title = "Business Law 2023 Solved Ten-Year Questions", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/BCom-Resources/Business-Law-Solved-TenYear.pdf", type = "PDF")
                    )
                )
            )
        ),
        Course(
            name = "B.A. (Hons) Political Science",
            description = "Renowned political systems, theoretical insights and diplomacy studies program.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Understanding Political Theory",
                    code = "DSC-1",
                    semester = 1,
                    description = "Introduction to Political Theory, concepts of power, citizenship, democracy, freedom, and state structures.",
                    materials = listOf(
                        Material(title = "Understanding Political Theory official DU SOL textbook", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-PolSci/Understanding-Political-Theory-SOL-Ebook.pdf", type = "PDF"),
                        Material(title = "DU SOL Political Theory Core Essay notes", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-PolSci/Political-Theory-Liberalism-Marxism.pdf", type = "NOTES")
                    )
                ),
                Subject(
                    name = "Constitutional Government and Democracy in India",
                    code = "DSC-2",
                    semester = 1,
                    description = "Analysis of the Indian Constitution, framing, fundamental rights & duties, federal structures, parliament and judiciary.",
                    materials = listOf(
                        Material(title = "Constitutional Government and Democracy in India 2022 Paper", url = "https://github.com/asmit-0/du-cs-study-material/raw/main/BA-PolSci/Constitutional-Government-PYQ-2022.pdf", type = "PDF")
                    )
                )
            )
        ),
        Course(
            name = "B.Sc. (Hons) Physics",
            description = "Fundamental study of universe's laws from quantum scales to interstellar galaxies mapped to DU NEP.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Mathematical Physics I",
                    code = "PH-101",
                    semester = 1,
                    description = "Calculus, vector algebra, orthogonal curvilinear coordinates and introductory differential equations.",
                    materials = listOf(
                        Material(title = "Mathematical Physics Complete Hand-written Reference Notes", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BSc-Physics/Math-Physics-I-Notes.pdf", type = "NOTES")
                    )
                ),
                Subject(
                    name = "Mechanics",
                    code = "PH-102",
                    semester = 1,
                    description = "Rotational motion, gravitation, elasticity, central forces, special theory of relativity and frame kinematics.",
                    materials = listOf(
                        Material(title = "Mechanics 2022 Solved Question Paper Compilation", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BSc-Physics/Mechanics-PYQ-2022.pdf", type = "PDF")
                    )
                )
            )
        ),
        Course(
            name = "B.Sc. (Hons) Mathematics",
            description = "Rigorous analytical and abstract algebra foundations designed for premier mathematical scholars.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Calculus",
                    code = "MATH-101",
                    semester = 1,
                    description = "Limit, continuity, differentiability, asymptotes, tracing of curves, and application of integration.",
                    materials = listOf(
                        Material(title = "Calculus Theory Guide & Solved Practical Sets", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BSc-Math/Calculus-Practical-Set.pdf", type = "NOTES")
                    )
                ),
                Subject(
                    name = "Algebra",
                    code = "MATH-102",
                    semester = 1,
                    description = "Complex numbers, theory of equations, matrices, linear transformations and group properties.",
                    materials = listOf(
                        Material(title = "Algebra Solved Ten Year Class Papers", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BSc-Math/Algebra-Solved-DU-PYQ.pdf", type = "PDF")
                    )
                )
            )
        ),
        Course(
            name = "B.A. (Hons) Economics",
            description = "Theoretical, mathematical and quantitative framework for interpreting socio-financial systems.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Introductory Microeconomics",
                    code = "ECO-101",
                    semester = 1,
                    description = "Consumer preferences, budget constraints, utility functions, market structure and price mechanism.",
                    materials = listOf(
                        Material(title = "Microeconomics Standard Study Notes & Graphs Booklet", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-Economics/Intro-Micro-Notes.pdf", type = "NOTES")
                    )
                ),
                Subject(
                    name = "Mathematical Methods for Economics I",
                    code = "ECO-102",
                    semester = 1,
                    description = "Functions, differential calculus, matrix theory and unconstrained optimization for economic paradigms.",
                    materials = listOf(
                        Material(title = "MME-1 2023 Solved Delhi University Question Sheet", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-Economics/MME1-2023-Solved.pdf", type = "PDF")
                    )
                )
            )
        ),
        Course(
            name = "B.A. (Hons) English",
            description = "Chronological survey of international literature, criticism, critical essays, and social movements.",
            durationYears = 3,
            level = "UG",
            nepBased = true,
            subjects = listOf(
                Subject(
                    name = "Introduction to Literary Studies",
                    code = "ENG-101",
                    semester = 1,
                    description = "Exploration of genre, narrative methodologies, poetry mechanics and essential analytical essays.",
                    materials = listOf(
                        Material(title = "Literary Studies Standard Critical Guide", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/BA-English/Literary-Studies-Guide.pdf", type = "NOTES")
                    )
                )
            )
        ),
        Course(
            name = "M.Sc. Computer Science",
            description = "Advanced research concepts, algorithm optimization, deep neural nets and parallel CPU computing.",
            durationYears = 2,
            level = "PG",
            nepBased = false,
            subjects = listOf(
                Subject(
                    name = "Advanced Algorithms",
                    code = "MCS-101",
                    semester = 1,
                    description = "Amortized analysis, randomized algorithms, flow networks, approximation techniques and NP-completeness.",
                    materials = listOf(
                        Material(title = "Advanced Algorithms Exam Preparatory Reference Materials", url = "https://raw.githubusercontent.com/asmit-0/du-cs-study-material/main/MSC-CS/Advanced-Algorithms-Notes.pdf", type = "NOTES")
                    )
                )
            )
        )
    )

    val colleges = listOf<College>(
        College(
            name = "Ramjas College",
            campus = "North Campus",
            established = 1917,
            address = "University Enclave, Delhi - 110007",
            description = "One of the oldest and most prestigious colleges of Delhi University, offering pristine laboratories, dynamic student atmosphere, and premier faculty.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "Hindu College",
            campus = "North Campus",
            established = 1899,
            address = "University Enclave, Delhi - 110007",
            description = "Consistently ranked among India's top colleges, known for academic excellence, intellectual legacy, and standard policy debates.",
            courseNames = listOf("B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "St. Stephen's College",
            campus = "North Campus",
            established = 1881,
            address = "University Enclave, Delhi - 110007",
            description = "A premier Christian minority institution celebrated for producing global leaders, rigorous tutorials, and a highly cultured leafy campus.",
            courseNames = listOf("B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "Hansraj College",
            campus = "North Campus",
            established = 1948,
            address = "Malka Ganj, Delhi - 110007",
            description = "Founded in memory of Mahatma Hansraj, it is a prominent center for sciences, arts, and commerce placements.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) English")
        ),
        College(
            name = "Kirori Mal College",
            campus = "North Campus",
            established = 1954,
            address = "University Enclave, Delhi - 110007",
            description = "Distinguished of high scientific research alongside a stellar dramatic society (The Players) and liberal arts program.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science")
        ),
        College(
            name = "Miranda House",
            campus = "North Campus",
            established = 1948,
            address = "University Enclave, Delhi - 110007",
            description = "Consistently ranked #1 in NIRF ranking for colleges across India, specializing in women's empowerment through top-class sciences and research.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.A. (Hons) Political Science", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "Shri Ram College of Commerce",
            campus = "North Campus",
            established = 1926,
            address = "University Enclave, Delhi - 110007",
            description = "The absolute pioneer of commerce education in Asia, producing elite business executives, chartered accountants, and economists.",
            courseNames = listOf("B.Com (Hons)", "B.A. (Hons) Economics")
        ),
        College(
            name = "Lady Shri Ram College",
            campus = "South Campus",
            established = 1956,
            address = "Lajpat Nagar IV, New Delhi - 110024",
            description = "An eminent institution for women's higher education, famous for world-class liberal arts, statistics, and editorial leadership.",
            courseNames = listOf("B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "Sri Venkateswara College",
            campus = "South Campus",
            established = 1961,
            address = "Benito Juarez Road, Dhaula Kuan, New Delhi - 110021",
            description = "Popularly known as Venky, it is the crown jewel of South Campus offering premium lab research, botanical gardens, and stellar commerce courses.",
            courseNames = listOf("B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) English")
        ),
        College(
            name = "Delhi College of Arts & Commerce",
            campus = "South Campus",
            established = 1987,
            address = "Netaji Nagar, New Delhi - 110023",
            description = "A premier co-educational hub known for professional journalism, marketing courses, and highly progressive debate forums.",
            courseNames = listOf("B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) Economics", "B.A. (Hons) English")
        ),
        College(
            name = "Gargi College",
            campus = "South Campus",
            established = 1967,
            address = "Siri Fort Road, New Delhi - 110049",
            description = "Top-tier multi-disciplinary college for women with vibrant arts societies, dedicated bioinformatics facility, and supportive teaching panels.",
            courseNames = listOf("B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) English")
        ),
        College(
            name = "Atma Ram Sanatan Dharma College",
            campus = "South Campus",
            established = 1959,
            address = "Dhaula Kuan, New Delhi - 110021",
            description = "Celebrated for its highly advanced research centers, rising NIRF rankings, and spacious state-of-the-art campus infrastructure.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science")
        ),
        College(
            name = "Deen Dayal Upadhyaya College",
            campus = "Off-Campus",
            established = 1990,
            address = "Sector-3, Dwarka, New Delhi - 110078",
            description = "Fully funded by Government of NCT, boasting a brand-new high-tech multistory campus with smart hostels and elite science labs.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)")
        ),
        College(
            name = "Keshav Mahavidyalaya",
            campus = "Off-Campus",
            established = 1994,
            address = "H-4-5 Zone, Pitampura, Delhi - 110034",
            description = "Best recognized for its superlative computer science labs, rich technical library, and strong record of software industry internships.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Mathematics")
        ),
        College(
            name = "Sri Guru Tegh Bahadur Khalsa College",
            campus = "North Campus",
            established = 1951,
            address = "Mall Road, Delhi - 110007",
            description = "A historical institution with sports dominance and an exceptional standard of education across experimental physics and economics.",
            courseNames = listOf("B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics", "B.Com (Hons)", "B.A. (Hons) Political Science", "B.A. (Hons) Economics")
        ),
        College(
            name = "Acharya Narendra Dev College",
            campus = "Off-Campus",
            established = 1991,
            address = "Govindpuri, Kalkaji, New Delhi - 110019",
            description = "A unique single-faculty institution focusing entirely on pure sciences, fostering student startups through incubation centers.",
            courseNames = listOf("B.Sc. (Hons) Computer Science", "B.Sc. (Hons) Physics", "B.Sc. (Hons) Mathematics")
        )
    )

    val browserCategories = listOf(
        BrowserCategory(
            category = "Arts & Humanities",
            courses = listOf(
                BrowserCourse(
                    name = "B.A. (Programme)",
                    links = listOf(
                        FolderLink("May-June/July 2025", "https://drive.google.com/drive/folders/1xTXjZMcwng1eKgyinlScId_28-rGHo24?usp=sharing"),
                        FolderLink("Dec-Jan 2025-26", "https://drive.google.com/drive/folders/1c_9RbWwqeIefLriJEWs9LHjiH0iBLoaf?usp=sharing")
                    )
                ),
                BrowserCourse(
                    name = "B.A. (Hons) Economics",
                    links = listOf(
                        FolderLink("May-June/July 2025", "https://drive.google.com/drive/folders/1j4_6R220GFw00jxL1O9Li7_tUkoT69YT?usp=sharing"),
                        FolderLink("Dec-Jan 2025-26", "https://drive.google.com/drive/folders/1TxebBhtmPvj3cW2wSSIQ3cT8SnWe9aVH?usp=sharing")
                    )
                ),
                BrowserCourse(
                    name = "B.A. (Hons) English",
                    links = listOf(
                        FolderLink("May-June/July 2025", "https://drive.google.com/drive/folders/1BBAEGGfUhIsmrg67jPeqjX89L55HVYZ8?usp=sharing")
                    )
                )
            )
        ),
        BrowserCategory(
            category = "Commerce & Business",
            courses = listOf(
                BrowserCourse(
                    name = "B.Com. (Programme)",
                    links = listOf(
                        FolderLink("May-June/July 2025", "https://drive.google.com/drive/folders/18XF2dar08cQlsMTd-37ZzqiLkotaAm9R?usp=sharing")
                    )
                ),
                BrowserCourse(
                    name = "B.Com. (Hons)",
                    links = listOf(
                        FolderLink("May-June/July 2025", "https://drive.google.com/drive/folders/1C9Ow7ihRpfNOd-lOThzBRVQ0s0HOJ8kL?usp=sharing")
                    )
                )
            )
        )
    )

    val contributions = mutableStateListOf<Contribution>(
        Contribution(
            submissionType = "MATERIAL",
            courseName = "B.Sc. (Hons) Computer Science",
            subjectName = "Programming using Python",
            semester = 1,
            title = "PYQ Solved - Compilers Lab",
            url = "https://github.com/shubham-saini/",
            description = "Complete lab problems solved with Python code, verified against DU NEP metrics.",
            submittedBy = "ramjascollege2022@gmail.com",
            timestamp = "2026-05-19"
        )
    )
}

// ==========================================
// THEME & COLOR PALETTE
// ==========================================

@Composable
fun DUTheme(content: @Composable () -> Unit) {
    val darkColorPalette = lightColorScheme(
        primary = Color(0xFF10B981), // Emerald 600
        secondary = Color(0xFF0F766E), // Teal 700
        background = Color(0xFFFCFCFD), // Soft Off-White
        surface = Color.White,
        onPrimary = Color.White,
        onSecondary = Color.White,
        onBackground = Color(0xFF0F172A), // Slate 900
        onSurface = Color(0xFF0F172A)
    )
    MaterialTheme(
        colorScheme = darkColorPalette,
        typography = Typography(),
        content = content
    )
}

// ==========================================
// NAVIGATION TABS
// ==========================================

enum class AppTab(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    HOME("Courses", Icons.Default.LibraryBooks),
    BROWSE("Archives", Icons.Default.FolderOpen),
    SAVED("Saved", Icons.Default.Bookmark),
    CONTRIBUTE("Share", Icons.Default.AddCircle),
    ACTIVITY("Stats", Icons.Default.BarChart)
}

// ==========================================
// CORE LAYOUT / APP ROOT
// ==========================================

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun MainApp() {
    var activeTab by remember { mutableStateOf(AppTab.HOME) }
    var selectedCourse by remember { mutableStateOf<Course?>(null) }
    var selectedSubject by remember { mutableStateOf<Subject?>(null) }
    var selectedCollege by remember { mutableStateOf<College?>(null) }
    var previewMaterial by remember { mutableStateOf<Material?>(null) }
    val savedMaterials = remember { mutableStateListOf<Material>() }

    Scaffold(
        topBar = {
            Column {
                SmallTopAppBar(
                    title = {
                        Text(
                            text = "DU ACADEMIC ARCHIVE",
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.SansSerif,
                            fontSize = 18.sp,
                            color = Color(0xFF1E293B),
                            letterSpacing = 1.sp
                        )
                    },
                    colors = TopAppBarDefaults.smallTopAppBarColors(
                        containerColor = Color.White
                    ),
                    navigationIcon = {
                        IconButton(onClick = { }) {
                            Icon(Icons.Default.School, contentDescription = "DU Code", tint = Color(0xFF10B981))
                        }
                    },
                    actions = {
                        // Community Profile tag indicating current user
                        Box(
                            modifier = Modifier
                                .padding(end = 12.dp)
                                .clip(RoundedCornerShape(30.dp))
                                .background(Color(0xFFECFDF5))
                                .padding(horizontal = 10.dp, vertical = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "RAMJAS",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF059669)
                            )
                        }
                    }
                )
                Divider(color = Color(0xFFF1F5F9))
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                AppTab.values().forEach { tab ->
                    NavigationBarItem(
                        selected = activeTab == tab,
                        onClick = {
                            selectedSubject = null
                            selectedCourse = null
                            selectedCollege = null
                            activeTab = tab
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label, fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF10B981),
                            selectedTextColor = Color(0xFF10B981),
                            unselectedIconColor = Color(0xFF64748B),
                            unselectedTextColor = Color(0xFF64748B),
                            indicatorColor = Color(0xFFECFDF5)
                        )
                    )
                }
            }
        },
        containerColor = Color(0xFFFCFCFD)
    ) { innerPadding ->
        AnimatedContent(
            targetState = activeTab,
            transitionSpec = {
                fadeIn(animationSpec = tween(150)) with fadeOut(animationSpec = tween(150))
            },
            modifier = Modifier.padding(innerPadding)
        ) { targetTab ->
            when (targetTab) {
                AppTab.HOME -> {
                    val context = LocalContext.current
                    if (selectedSubject != null) {
                        SubjectDetailScreen(
                            subject = selectedSubject!!,
                            onBack = { selectedSubject = null },
                            onMaterialClick = { previewMaterial = it },
                            savedMaterials = savedMaterials,
                            onSaveToggle = { mat ->
                                if (savedMaterials.any { it.id == mat.id }) {
                                    savedMaterials.removeAll { it.id == mat.id }
                                } else {
                                    savedMaterials.add(mat)
                                }
                            }
                        )
                    } else if (selectedCourse != null) {
                        CourseDetailsScreen(
                            course = selectedCourse!!,
                            onSubjectClick = { selectedSubject = it },
                            onBack = { selectedCourse = null }
                        )
                    } else if (selectedCollege != null) {
                        CollegeDetailScreen(
                            college = selectedCollege!!,
                            onCourseClick = { courseName ->
                                val course = AppDatabase.courses.find { it.name.equals(courseName, ignoreCase = true) }
                                if (course != null) {
                                    selectedCourse = course
                                } else {
                                    Toast.makeText(context, "Course details pending addition.", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onBack = { selectedCollege = null }
                        )
                    } else {
                        HomeScreen(
                            onCourseClick = { selectedCourse = it },
                            onCollegeClick = { selectedCollege = it }
                        )
                    }
                }
                AppTab.BROWSE -> ArchiveBrowserScreen()
                AppTab.SAVED -> SavedForRevisionScreen(
                    savedMaterials = savedMaterials,
                    onMaterialClick = { previewMaterial = it },
                    onRemoveClick = { mat ->
                        savedMaterials.removeAll { it.id == mat.id }
                    }
                )
                AppTab.CONTRIBUTE -> ContributionScreen(onSuccess = { activeTab = AppTab.ACTIVITY })
                AppTab.ACTIVITY -> StatisticsScreen()
            }
        }
    }

    if (previewMaterial != null) {
        PdfPreviewDialog(
            material = previewMaterial!!,
            onClose = { previewMaterial = null }
        )
    }
}

// ==========================================
// SCREEN: HOME / COURSE SEARCH
// ==========================================

@Composable
fun HomeScreen(
    onCourseClick: (Course) -> Unit,
    onCollegeClick: (College) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var activeSubTab by remember { mutableStateOf("COURSES") } // "COURSES" or "COLLEGES"

    val matchingCourses = remember(searchQuery) {
        AppDatabase.courses.filter { course ->
            course.name.contains(searchQuery, ignoreCase = true) ||
                    course.subjects.any { it.name.contains(searchQuery, ignoreCase = true) }
        }
    }

    val matchingColleges = remember(searchQuery) {
        AppDatabase.colleges.filter { college ->
            college.name.contains(searchQuery, ignoreCase = true) ||
                    college.campus.contains(searchQuery, ignoreCase = true) ||
                    college.courseNames.any { it.contains(searchQuery, ignoreCase = true) }
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "Delhi University Academics".toUpperCase(),
                    fontSize = 11.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "NEP Study Archive",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A),
                    letterSpacing = (-0.5).sp
                )
                Text(
                    text = "A community-focused engine index mapping Delhi University honors papers & lecture coordinates.",
                    fontSize = 12.sp,
                    color = Color(0xFF64748B),
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 4.dp),
                    lineHeight = 18.sp
                )
            }
        }

        // Tab Selector (Sub-tabs with proper alignment, direct flat colors, no gradients)
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9), shape = RoundedCornerShape(12.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Courses Tab Option
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (activeSubTab == "COURSES") Color.White else Color.Transparent)
                        .clickable { 
                            activeSubTab = "COURSES" 
                            searchQuery = ""
                        }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "COURSES (${AppDatabase.courses.size})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (activeSubTab == "COURSES") Color(0xFF0F172A) else Color(0xFF64748B)
                    )
                }

                // Colleges Tab Option
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (activeSubTab == "COLLEGES") Color.White else Color.Transparent)
                        .clickable { 
                            activeSubTab = "COLLEGES" 
                            searchQuery = ""
                        }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "COLLEGES (${AppDatabase.colleges.size})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (activeSubTab == "COLLEGES") Color(0xFF0F172A) else Color(0xFF64748B)
                    )
                }
            }
        }

        // Search text box
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { 
                    Text(
                        text = if (activeSubTab == "COURSES") "Search by Course or Subject..." else "Search by College name, campus or course offering...", 
                        fontSize = 13.sp, 
                        color = Color(0xFF94A3B8)
                    ) 
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, shape = RoundedCornerShape(12.dp)),
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = Color(0xFF64748B)) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFFE2E8F0)
                )
            )
        }

        if (activeSubTab == "COURSES") {
            item {
                Text(
                    text = "Course Blocks // NEP 2022 Curriculum".toUpperCase(),
                    fontSize = 10.sp,
                    color = Color(0xFF94A3B8),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            if (matchingCourses.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No matching modules mapped yet.",
                            color = Color(0xFF94A3B8),
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                items(matchingCourses) { course ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onCourseClick(course) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFF1F5F9)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(30.dp))
                                        .background(Color(0xFFF1F5F9))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = course.level + " // " + if(course.nepBased) "NEP" else "OLD",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF64748B),
                                        letterSpacing = 0.5.sp
                                    )
                                }
                                Text(
                                    text = "${course.durationYears} Years",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF64748B)
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = course.name,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0F172A)
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = course.description,
                                fontSize = 12.sp,
                                color = Color(0xFF64748B),
                                lineHeight = 18.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Divider(color = Color(0xFFF1F5F9))

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "${course.subjects.size} SUBJECT MODULES",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF10B981),
                                    letterSpacing = 1.sp
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowForward,
                                    contentDescription = "View course",
                                    tint = Color(0xFF10B981),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        } else {
            item {
                Text(
                    text = "Delhi University Affiliated Colleges".toUpperCase(),
                    fontSize = 10.sp,
                    color = Color(0xFF94A3B8),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            if (matchingColleges.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No matching colleges found.",
                            color = Color(0xFF94A3B8),
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            } else {
                items(matchingColleges) { college ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onCollegeClick(college) },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(30.dp))
                                        .background(
                                            when (college.campus) {
                                                "North Campus" -> Color(0xFFECFDF5)
                                                "South Campus" -> Color(0xFFEFF6FF)
                                                else -> Color(0xFFF1F5F9)
                                            }
                                        )
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = college.campus.toUpperCase(),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Black,
                                        color = when (college.campus) {
                                            "North Campus" -> Color(0xFF047857)
                                            "South Campus" -> Color(0xFF1D4ED8)
                                            else -> Color(0xFF475569)
                                        },
                                        letterSpacing = 0.5.sp
                                    )
                                }
                                Text(
                                    text = "Estd. ${college.established}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF94A3B8)
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = college.name,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0F172A)
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = college.description,
                                fontSize = 12.sp,
                                color = Color(0xFF64748B),
                                lineHeight = 18.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Divider(color = Color(0xFFF1F5F9))

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "${college.courseNames.size} DEGREES OFFERED",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF10B981),
                                    letterSpacing = 1.sp
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowForward,
                                    contentDescription = "View college detail",
                                    tint = Color(0xFF10B981),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CollegeDetailScreen(
    college: College,
    onCourseClick: (String) -> Unit,
    onBack: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onBack() }
                    .padding(vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color(0xFF10B981),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "BACK TO ARCHIVES HOME",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF10B981),
                    letterSpacing = 1.sp
                )
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(30.dp))
                                .background(Color(0xFFECFDF5))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = college.campus.toUpperCase(),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF047857),
                                letterSpacing = 0.5.sp
                            )
                        }
                        Text(
                            text = "ESTD. ${college.established}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = college.name,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Address: ${college.address}",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B),
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Divider(color = Color(0xFFF1F5F9))

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Institutional Profile",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF1E293B),
                        letterSpacing = 0.5.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = college.description,
                        fontSize = 13.sp,
                        color = Color(0xFF475569),
                        lineHeight = 20.sp
                    )
                }
            }
        }

        item {
            Text(
                text = "Offered Courses & Syllabus Matrices".toUpperCase(),
                fontSize = 10.sp,
                color = Color(0xFF94A3B8),
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        items(college.courseNames) { courseName ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onCourseClick(courseName) },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFF1F5F9))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                         Icon(
                            imageVector = Icons.Default.Book,
                            contentDescription = "Course icon",
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = courseName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Open course page",
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// ==========================================
// SCREEN: COURSE DETAIL & SEMESTER NAVIGATION
// ==========================================

@Composable
fun CourseDetailsScreen(
    course: Course,
    onSubjectClick: (Subject) -> Unit,
    onBack: () -> Unit
) {
    var selectedSemester by remember { mutableStateOf<Int?>(null) }
    val subjectsFiltered = if (selectedSemester == null) {
        course.subjects
    } else {
        course.subjects.filter { it.semester == selectedSemester }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onBack() }
                    .padding(vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color(0xFF64748B),
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Back to Courses",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B)
                )
            }
        }

        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = course.level + " // DU SEMESTER MATRIX",
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = course.name,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = course.description,
                    fontSize = 12.sp,
                    color = Color(0xFF64748B),
                    lineHeight = 18.sp
                )
            }
        }

        // Semester Pills
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val totalSemesters = course.durationYears * 2
                // "ALL" Semester tab
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (selectedSemester == null) Color(0xFF10B981) else Color(0xFFF1F5F9))
                        .clickable { selectedSemester = null }
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "ALL SEMS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = if (selectedSemester == null) Color.White else Color(0xFF64748B)
                    )
                }

                (1..totalSemesters).forEach { sem ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedSemester == sem) Color(0xFF10B981) else Color(0xFFF1F5F9))
                            .clickable { selectedSemester = sem }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "SEM $sem",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = if (selectedSemester == sem) Color.White else Color(0xFF64748B)
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Academic Subjects".toUpperCase(),
                fontSize = 10.sp,
                color = Color(0xFF94A3B8),
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp,
                modifier = Modifier.padding(bottom = 2.dp)
            )
        }

        if (subjectsFiltered.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No subjects registered for this semester.",
                        color = Color(0xFF94A3B8),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            items(subjectsFiltered) { subject ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSubjectClick(subject) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFF1F5F9))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Code: " + subject.code,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981)
                            )
                            Text(
                                text = "Semester ${subject.semester}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = subject.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF0F172A)
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = subject.description,
                            fontSize = 12.sp,
                            color = Color(0xFF64748B),
                            lineHeight = 18.sp,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "${subject.materials.size} RESOURCES ACTIVE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF0F172A),
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }
        }
    }
}

// ==========================================
// SCREEN: SUBJECT MATERIALS DETAILS
// ==========================================

@Composable
fun SubjectDetailScreen(
    subject: Subject,
    onBack: () -> Unit,
    onMaterialClick: (Material) -> Unit,
    savedMaterials: List<Material> = emptyList(),
    onSaveToggle: (Material) -> Unit = {}
) {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf<String?>("ALL") }
    val materialsFiltered = if (selectedFilter == "ALL" || selectedFilter == null) {
        subject.materials
    } else {
        subject.materials.filter { it.type.uppercase() == selectedFilter!!.uppercase() }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onBack() }
                    .padding(vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color(0xFF64748B),
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Back to Course",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B)
                )
            }
        }

        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "Subject Node // Code " + subject.code,
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subject.name,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subject.description,
                    fontSize = 12.sp,
                    color = Color(0xFF64748B),
                    lineHeight = 18.sp
                )
            }
        }

        // Sub Filter Tabs
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("ALL", "PDF", "NOTES", "VIDEO").forEach { filter ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selectedFilter == filter) Color(0xFF10B981) else Color(0xFFF1F5F9))
                            .clickable { selectedFilter = filter }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = filter,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = if (selectedFilter == filter) Color.White else Color(0xFF64748B)
                        )
                    }
                }
            }
        }

        if (materialsFiltered.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No study material uploaded under this category.",
                        color = Color(0xFF94A3B8),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            items(materialsFiltered) { material ->
                var votes by remember { mutableStateOf(material.upvotes - material.downvotes) }
                var userVotedUp by remember { mutableStateOf(false) }
                var userVotedDown by remember { mutableStateOf(false) }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            val isPdf = material.type.uppercase() == "PDF" || 
                                        material.type.uppercase() == "NOTES" || 
                                        material.url.lowercase().endsWith(".pdf")
                            if (isPdf) {
                                onMaterialClick(material)
                            } else {
                                try {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(material.url))
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    Toast
                                        .makeText(context, "Could not open document link.", Toast.LENGTH_SHORT)
                                        .show()
                                }
                            }
                        },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFF1F5F9))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(
                                        when (material.type.uppercase()) {
                                            "PDF" -> Color(0xFFFEE2E2)
                                            "VIDEO" -> Color(0xFFFEF3C7)
                                            "NOTES" -> Color(0xFFD1FAE5)
                                            else -> Color(0xFFE0F2FE)
                                        }
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = material.type.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    color = when (material.type.uppercase()) {
                                        "PDF" -> Color(0xFF991B1B)
                                        "VIDEO" -> Color(0xFF92400E)
                                        "NOTES" -> Color(0xFF065F46)
                                        else -> Color(0xFF075985)
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.clickable { /* Prevents parent card opening */ }
                            ) {
                                IconButton(
                                    onClick = {
                                        if (userVotedUp) {
                                            userVotedUp = false
                                            votes--
                                        } else {
                                            userVotedUp = true
                                            if (userVotedDown) {
                                                userVotedDown = false
                                                votes += 2
                                            } else {
                                                votes++
                                            }
                                        }
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ThumbUp,
                                        contentDescription = "Upvote",
                                        tint = if (userVotedUp) Color(0xFF10B981) else Color(0xFF94A3B8),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Text(
                                    text = votes.toString(),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A),
                                    modifier = Modifier
                                        .align(Alignment.CenterVertically)
                                        .padding(horizontal = 6.dp)
                                )
                                IconButton(
                                    onClick = {
                                        if (userVotedDown) {
                                            userVotedDown = false
                                            votes++
                                        } else {
                                            userVotedDown = true
                                            if (userVotedUp) {
                                                userVotedUp = false
                                                votes -= 2
                                            } else {
                                                votes--
                                            }
                                        }
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ThumbDown,
                                        contentDescription = "Downvote",
                                        tint = if (userVotedDown) Color(0xFFEF4444) else Color(0xFF94A3B8),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                val isSaved = savedMaterials.any { it.id == material.id }
                                IconButton(
                                    onClick = { onSaveToggle(material) },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                        contentDescription = "Save material",
                                        tint = if (isSaved) Color(0xFF10B981) else Color(0xFF94A3B8),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = material.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1E293B)
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "URL Host: " + Uri.parse(material.url).host,
                            fontSize = 11.sp,
                            color = Color(0xFF94A3B8),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Launch,
                                contentDescription = "Launch resource",
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "OPEN RESOURCE LAB LINK",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF10B981),
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// SCREEN: PUBLIC ARCHIVE BROWSER
// ==========================================

@Composable
fun ArchiveBrowserScreen() {
    var selectedCategory by remember { mutableStateOf<BrowserCategory?>(null) }
    val context = LocalContext.current

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        if (selectedCategory != null) {
            item {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedCategory = null }
                        .padding(vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Back to Categories",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF64748B)
                    )
                }
            }

            item {
                Column {
                    Text(
                        text = "Delhi University Directory Archive".toUpperCase(),
                        fontSize = 10.sp,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = selectedCategory!!.category,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )
                }
            }

            items(selectedCategory!!.courses) { browsecourse ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFF1F5F9))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = browsecourse.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF0F172A)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        browsecourse.links.forEach { link ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFF8FAFC))
                                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(8.dp))
                                    .clickable {
                                        try {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link.url))
                                            context.startActivity(intent)
                                        } catch (e: Exception) {
                                            Toast
                                                .makeText(context, "Could not open drive directory.", Toast.LENGTH_SHORT)
                                                .show()
                                        }
                                    }
                                    .padding(12.dp)
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column {
                                        Text(
                                            text = "Term / Session".toUpperCase(),
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF94A3B8)
                                        )
                                        Text(
                                            text = link.term,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF1E293B)
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0xFFECFDF5))
                                            .padding(horizontal = 8.dp, vertical = 6.dp)
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.CloudDownload,
                                                contentDescription = "Cloud download",
                                                tint = Color(0xFF10B981),
                                                modifier = Modifier.size(12.dp)
                                            )
                                            Text(
                                                text = "DRIVE SYNC",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Black,
                                                color = Color(0xFF059669)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } else {
            item {
                Column(modifier = Modifier.padding(vertical = 8.dp)) {
                    Text(
                        text = "Delhi University Directory Files".toUpperCase(),
                        fontSize = 10.sp,
                        color = Color(0xFF10B981),
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Resource Directories",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )
                }
            }

            items(AppDatabase.browserCategories) { category ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedCategory = category },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Directory Hub".toUpperCase(),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = category.category,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0F172A)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${category.courses.size} Active Courses Node Linked",
                                fontSize = 12.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                        IconButton(onClick = { selectedCategory = category }) {
                            Icon(
                                imageVector = Icons.Default.Folder,
                                contentDescription = "Explore dir",
                                tint = Color(0xFF10B981)
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// SCREEN: CONTRIBUTION FORM (MATERIAL / PROPOSAL)
// ==========================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContributionScreen(onSuccess: () -> Unit) {
    var submissionType by remember { mutableStateOf("MATERIAL") } // MATERIAL or PROPOSAL
    var selectedCourseName by remember { mutableStateOf(AppDatabase.courses.firstOrNull()?.name ?: "") }
    var subjectName by remember { mutableStateOf("") }
    var materialTitle by remember { mutableStateOf("") }
    var urlLink by remember { mutableStateOf("") }
    var selectedSemester by remember { mutableStateOf("1") }
    var selectedMaterialType by remember { mutableStateOf("PDF") }
    var descriptionText by remember { mutableStateOf("") }
    val context = LocalContext.current

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "Delhi University Global Grid".toUpperCase(),
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Share Resource",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
            }
        }

        // Segmented Switcher buttons
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                listOf("MATERIAL" to "Material", "PROPOSAL" to "Suggest Subject").forEach { (type, label) ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (submissionType == type) Color.White else Color.Transparent)
                            .clickable { submissionType = type }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (submissionType == type) Color(0xFF10B981) else Color(0xFF64748B)
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Course Match".toUpperCase(),
                fontSize = 10.sp,
                color = Color(0xFF94A3B8),
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )
        }

        item {
            var expanded by remember { mutableStateOf(false) }
            Box(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = selectedCourseName,
                    onValueChange = { },
                    readOnly = true,
                    label = { Text("Associated Course Node", fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        IconButton(onClick = { expanded = !expanded }) {
                            Icon(Icons.Default.ArrowDropDown, contentDescription = "expanded icon")
                        }
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF10B981),
                        unfocusedBorderColor = Color(0xFFE2E8F0)
                    )
                )
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.fillMaxWidth(0.9f)
                ) {
                    AppDatabase.courses.forEach { course ->
                        DropdownMenuItem(
                            text = { Text(course.name, fontSize = 13.sp) },
                            onClick = {
                                selectedCourseName = course.name
                                expanded = false
                            }
                        )
                    }
                }
            }
        }

        item {
            OutlinedTextField(
                value = subjectName,
                onValueChange = { subjectName = it },
                label = { Text("Subject / Exam Unit Name", fontSize = 12.sp) },
                placeholder = { Text("e.g. Programming using Python") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFFE2E8F0)
                )
            )
        }

        if (submissionType == "MATERIAL") {
            item {
                OutlinedTextField(
                    value = materialTitle,
                    onValueChange = { materialTitle = it },
                    label = { Text("Material Label / Title", fontSize = 12.sp) },
                    placeholder = { Text("e.g. Unit 3 Compilers Notes Sem 2") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF10B981),
                        unfocusedBorderColor = Color(0xFFE2E8F0)
                    )
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    var expandedSem by remember { mutableStateOf(false) }
                    var expandedType by remember { mutableStateOf(false) }

                    // Semester Dropdown
                    Box(modifier = Modifier.weight(1f)) {
                        OutlinedTextField(
                            value = "Sem $selectedSemester",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Semester", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            trailingIcon = {
                                IconButton(onClick = { expandedSem = !expandedSem }) {
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF10B981)
                            )
                        )
                        DropdownMenu(
                            expanded = expandedSem,
                            onDismissRequest = { expandedSem = false }
                        ) {
                            (1..8).forEach { sem ->
                                DropdownMenuItem(
                                    text = { Text("Sem $sem") },
                                    onClick = {
                                        selectedSemester = sem.toString()
                                        expandedSem = false
                                    }
                                )
                            }
                        }
                    }

                    // Material Type Dropdown
                    Box(modifier = Modifier.weight(1f)) {
                        OutlinedTextField(
                            value = selectedMaterialType,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Type", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            trailingIcon = {
                                IconButton(onClick = { expandedType = !expandedType }) {
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF10B981)
                            )
                        )
                        DropdownMenu(
                            expanded = expandedType,
                            onDismissRequest = { expandedType = false }
                        ) {
                            listOf("PDF", "NOTES", "VIDEO", "LINK").forEach { type ->
                                DropdownMenuItem(
                                    text = { Text(type) },
                                    onClick = {
                                        selectedMaterialType = type
                                        expandedType = false
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            OutlinedTextField(
                value = urlLink,
                onValueChange = { urlLink = it },
                label = { Text(if (submissionType == "MATERIAL") "Google Drive / Resource link" else "Syllabus Link (Optional)", fontSize = 12.sp) },
                placeholder = { Text("https://drive.google.com/...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFFE2E8F0)
                )
            )
        }

        item {
            OutlinedTextField(
                value = descriptionText,
                onValueChange = { descriptionText = it },
                label = { Text("Description / Study notes details", fontSize = 12.sp) },
                placeholder = { Text("Enter detail regarding content information, DU batch, solved codes...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                shape = RoundedCornerShape(12.dp),
                maxLines = 4,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF10B981),
                    unfocusedBorderColor = Color(0xFFE2E8F0)
                )
            )
        }

        item {
            Button(
                onClick = {
                    if (subjectName.isBlank()) {
                        Toast.makeText(context, "Please enter subject name.", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    if (submissionType == "MATERIAL" && (materialTitle.isBlank() || urlLink.isBlank())) {
                        Toast.makeText(context, "Material title and valid URL links required.", Toast.LENGTH_SHORT).show()
                        return@Button
                    }

                    val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

                    if (submissionType == "MATERIAL") {
                        // Find matching course
                        val courseIdx = AppDatabase.courses.indexOfFirst { it.name == selectedCourseName }
                        if (courseIdx != -1) {
                            val course = AppDatabase.courses[courseIdx]
                            val targetSubjectIdx = course.subjects.indexOfFirst { it.name.trim().lowercase() == subjectName.trim().lowercase() }

                            val targetMaterial = Material(
                                title = materialTitle,
                                url = urlLink,
                                type = selectedMaterialType
                            )

                            if (targetSubjectIdx != -1) {
                                // Subject exists, append material
                                val sj = course.subjects[targetSubjectIdx]
                                val mutableMaterialList = sj.materials.toMutableList()
                                mutableMaterialList.add(targetMaterial)
                                val updatedSj = sj.copy(materials = mutableMaterialList)

                                val mutableSubjectsList = course.subjects.toMutableList()
                                mutableSubjectsList[targetSubjectIdx] = updatedSj
                                AppDatabase.courses[courseIdx] = course.copy(subjects = mutableSubjectsList)
                            } else {
                                // Create subject and add material
                                val newSj = Subject(
                                    name = subjectName,
                                    code = "DSC-SU-${(10..99).random()}",
                                    semester = selectedSemester.toIntOrNull() ?: 1,
                                    description = "Community contributed course modules",
                                    materials = listOf(targetMaterial)
                                )
                                val mutableSubjectsList = course.subjects.toMutableList()
                                mutableSubjectsList.add(newSj)
                                AppDatabase.courses[courseIdx] = course.copy(subjects = mutableSubjectsList)
                            }
                        }
                    }

                    // Register Contribution Log entry
                    AppDatabase.contributions.add(
                        Contribution(
                            submissionType = submissionType,
                            courseName = selectedCourseName,
                            subjectName = subjectName,
                            semester = selectedSemester.toIntOrNull() ?: 1,
                            title = if (submissionType == "MATERIAL") materialTitle else "Proposed: $subjectName",
                            url = urlLink,
                            description = descriptionText,
                            submittedBy = "ramjascollege2022@gmail.com",
                            timestamp = dateStr
                        )
                    )

                    Toast.makeText(context, "Public Uplink Action Complete!", Toast.LENGTH_LONG).show()
                    onSuccess()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Icon(Icons.Default.CloudUpload, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Public Uplink Protocol".toUpperCase(),
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}

// ==========================================
// SCREEN: STATS & CONTRIBUTIONS METRICS FEED
// ==========================================

@Composable
fun StatisticsScreen() {
    val totalCourses = AppDatabase.courses.size
    val totalSubjects = AppDatabase.courses.flatMap { it.subjects }.size
    val totalMaterials = AppDatabase.courses.flatMap { it.subjects }.flatMap { it.materials }.size

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "DU ARCHIVE METRICS",
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Intel Stats",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
            }
        }

        // Metrics Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                listOf(
                    Triple("COURSES", totalCourses.toString(), Color(0xFFEFF6FF)),
                    Triple("SUBJECTS", totalSubjects.toString(), Color(0xFFECFDF5)),
                    Triple("MATERIALS", totalMaterials.toString(), Color(0xFFFFFBEB))
                ).forEach { (label, value, bg) ->
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = bg),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(text = label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "Recent Community Submissions".toUpperCase(),
                fontSize = 11.sp,
                color = Color(0xFF0F172A),
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        if (AppDatabase.contributions.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "Awaiting first community uplink...", color = Color(0xFF94A3B8))
                }
            }
        } else {
            items(AppDatabase.contributions.reversed()) { contribution ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFF1F5F9))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Author: " + contribution.submittedBy.split("@")[0].toUpperCase(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981)
                            )
                            Text(
                                text = contribution.timestamp,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = contribution.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1E293B)
                        )

                        Spacer(modifier = Modifier.height(2.dp))

                        Text(
                            text = "Course: ${contribution.courseName} (Sem ${contribution.semester})",
                            fontSize = 11.sp,
                            color = Color(0xFF64748B),
                            fontWeight = FontWeight.Medium
                        )

                        if (contribution.description.isNotBlank()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = contribution.description,
                                fontSize = 12.sp,
                                color = Color(0xFF475569),
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// SCREEN: ABOUT & PRIVACY SAFETY LOGS
// ==========================================

@Composable
fun AboutScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "NEP ALIGNMENT",
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Safety & Scope",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, Color(0xFFF1F5F9))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = "01 // Community Verification",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "All uploaded resources go through a community validation workflow. We ensure academic fidelity is sustained, protecting structural materials while contributing node archives to Delhi University students.",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "02 // Academic Honesty Policy",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Resources hosted here are collected strictly from public domains, course syllabi, and student-shared notebooks. We maintain 100% human-verified credit attributions on all study modules.",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "03 // Safe Storage Shield",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "No private personal profiles are tracked. Access Google Drive indexes and educational materials completely sandboxed safely and offline.",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 18.sp
                    )
                }
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "LAST SYNCED: MAY 2026 // EMULATOR DEVICE RUNTIME",
                    fontSize = 9.sp,
                    color = Color(0xFF94A3B8),
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}

@Composable
fun PdfPreviewDialog(material: Material, onClose: () -> Unit) {
    var useGoogleViewer by remember { mutableStateOf(true) }
    val originalUrl = material.url
    
    // Transform standard URLs to highly embeddable counterparts
    val activeUrl = remember(originalUrl, useGoogleViewer) {
        if (originalUrl.contains("drive.google.com/file/d/")) {
            val driveRegex = Regex("drive\\.google\\.com/file/d/([a-zA-Z0-9_-]+)")
            val driveMatch = driveRegex.find(originalUrl)
            if (driveMatch != null) {
                "https://drive.google.com/file/d/${driveMatch.groupValues[1]}/preview"
            } else {
                originalUrl
            }
        } else if (useGoogleViewer) {
            "https://docs.google.com/gview?url=${Uri.encode(originalUrl)}&embedded=true"
        } else {
            originalUrl
        }
    }

    val context = LocalContext.current

    androidx.compose.ui.window.Dialog(
        onDismissRequest = onClose,
        properties = androidx.compose.ui.window.DialogProperties(
            usePlatformDefaultWidth = false
        )
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.85f)
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header of previewer
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF8FAFC))
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = "PDF Icon",
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "LOBAL NODE // PREVIEWING ${material.type.uppercase()}",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981),
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = material.title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1E293B),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Row {
                        IconButton(onClick = { useGoogleViewer = !useGoogleViewer }) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Toggle Mode",
                                tint = Color(0xFF64748B)
                            )
                        }
                        IconButton(onClick = {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(originalUrl))
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "Could not open link", Toast.LENGTH_SHORT).show()
                            }
                        }) {
                            Icon(
                                imageVector = Icons.Default.Launch,
                                contentDescription = "Open External",
                                tint = Color(0xFF64748B)
                            )
                        }
                        IconButton(onClick = onClose) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Color(0xFF64748B)
                            )
                        }
                    }
                }

                // Banner explaining mode
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFECFDF5))
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Viewing through: ${if (useGoogleViewer) "Google Doc Viewer" else "Native WebFrame"}. If blank, click launch icon.",
                        fontSize = 11.sp,
                        color = Color(0xFF047857),
                        fontWeight = FontWeight.Medium
                    )
                }

                // WebView Container
                Box(modifier = Modifier.fillMaxSize().weight(1f)) {
                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.useWideViewPort = true
                                settings.loadWithOverviewMode = true
                                webViewClient = object : WebViewClient() {
                                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                        return false
                                    }
                                }
                                loadUrl(activeUrl)
                            }
                        },
                        update = { webView ->
                            webView.loadUrl(activeUrl)
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}

@Composable
fun SavedForRevisionScreen(
    savedMaterials: List<Material>,
    onMaterialClick: (Material) -> Unit,
    onRemoveClick: (Material) -> Unit
) {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(vertical = 8.dp)) {
                Text(
                    text = "REVISION REPOSITORY",
                    fontSize = 10.sp,
                    color = Color(0xFF10B981),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Saved for revision",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${savedMaterials.size} Items Saved",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B)
                        )
                    }
                }
            }
        }

        if (savedMaterials.isEmpty()) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.BookmarkBorder,
                            contentDescription = "No Saved Items",
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No saved revision logs.",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Add reference study units of any subject under courses to compile a quick revision repository.",
                            fontSize = 12.sp,
                            color = Color(0xFF64748B),
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        } else {
            items(savedMaterials) { material ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onMaterialClick(material) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFF1F5F9))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(
                                        when (material.type.uppercase()) {
                                            "PDF" -> Color(0xFFFEE2E2)
                                            "VIDEO" -> Color(0xFFFEF3C7)
                                            "NOTES" -> Color(0xFFD1FAE5)
                                            else -> Color(0xFFE0F2FE)
                                        }
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = material.type.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Black,
                                    color = when (material.type.uppercase()) {
                                        "PDF" -> Color(0xFF991B1B)
                                        "VIDEO" -> Color(0xFF92400E)
                                        "NOTES" -> Color(0xFF065F46)
                                        else -> Color(0xFF075985)
                                    }
                                )
                            }

                            IconButton(
                                onClick = { onRemoveClick(material) },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Bookmark,
                                    contentDescription = "Remove Bookmark",
                                    tint = Color(0xFF10B981),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = material.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1E293B)
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "URL Host: " + Uri.parse(material.url).host,
                            fontSize = 11.sp,
                            color = Color(0xFF94A3B8),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Launch,
                                contentDescription = "Launch resource",
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "OPEN RESOURCE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF10B981),
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
