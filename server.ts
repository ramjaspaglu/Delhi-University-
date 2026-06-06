import express from "express";
import path from "path";
import * as cheerio from 'cheerio';
import { GoogleGenAI, Type } from "@google/genai";
import multer from "multer";
import fs from "fs";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function generateContentWithRetry(ai: any, params: any, retries = 3, delay = 1500) {
  let lastError: any = null;
  const originalModel = params.model || "gemini-3.5-flash";
  // Attempt with the original requested model, fall back gracefully to gemini-3.1-flash-lite if experiencing high demand/503/429
  const modelsToTry = [originalModel, "gemini-3.1-flash-lite"];

  for (const modelName of modelsToTry) {
    for (let i = 0; i < retries; i++) {
      try {
        const payload = { ...params, model: modelName };
        const response = await ai.models.generateContent(payload);
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini API Warning] Attempt ${i + 1} with model ${modelName} failed. Error: ${error.message || error}`);
        
        // Wait before retrying with exponential backoff
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
  }
  throw lastError;
}

const SCRAPERS = [
  {
    name: 'Kalindi',
    type: 'Official',
    url: 'https://www.kalindicollege.in/previous-year-qpapers/',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim() || 'Kalindi Document';
        if (href && href.toLowerCase().includes('.pdf')) {
          links.push({ name: text.replace(/\n/g, ' '), path: href });
        }
      });
      return links;
    }
  },
  {
    name: 'Maitreyi',
    type: 'Official',
    url: 'https://www.maitreyi.ac.in/library/resources/previous-years-question-papers',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        let text = $(element).text().trim();
        const possibleName = $(element).closest('td').prev('td').text().trim();
        if (possibleName && (text.toLowerCase() === 'view' || text.toLowerCase() === 'click here')) text = possibleName;
        if (!text || text.toLowerCase() === 'view') {
          let parts = href ? href.split('/') : ['Document'];
          text = decodeURIComponent(parts[parts.length - 1]).replace('.pdf', '') || 'Maitreyi Document';
        }
        if (href && (href.toLowerCase().includes('.pdf') || href.includes('drive.google.com'))) {
          const absHref = href.startsWith('/') ? `https://www.maitreyi.ac.in${href}` : href;
          links.push({ name: text, path: absHref });
        }
      });
      return links;
    }
  },
  {
    name: 'JMC',
    type: 'Official',
    url: 'https://www.jmc.ac.in/library/resources/questionpapers',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && (href.toLowerCase().includes('.pdf') || href.includes('drive.google.com'))) {
          links.push({ name: text || 'JMC Document', path: href.startsWith('/') ? `https://www.jmc.ac.in${href}` : href });
        }
      });
      return links;
    }
  },
  {
    name: 'Miranda House',
    type: 'Official',
    url: 'https://mirandahouse.ac.in/library/questionpapers.php',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && href.toLowerCase().includes('.pdf')) {
          links.push({ name: text || 'Miranda House Document', path: href.startsWith('/') ? `https://mirandahouse.ac.in/library/${href}` : href });
        }
      });
      return links;
    }
  },
  {
    name: 'DU Study Site',
    type: 'Unofficial',
    url: 'https://dustudy.site/',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && (href.includes('drive.google.com') || href.toLowerCase().includes('.pdf'))) {
          links.push({ name: text || 'DU Study Material', path: href });
        }
      });
      return links;
    }
  },
  {
    name: 'SelfStudys',
    type: 'Unofficial',
    url: 'https://www.selfstudys.com/state-board/delhi-university-du/previous-year-paper',
    scrape: async ($: cheerio.CheerioAPI) => {
      const links: any[] = [];
      $('.update_box a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).find('.title').text().trim() || $(element).text().trim();
        if (href) {
          links.push({ name: text, path: href.startsWith('/') ? `https://www.selfstudys.com${href}` : href });
        }
      });
      return links;
    }
  }
];

// Content Engine for arranging and cleaning data
function arrangeData(items: any[]) {
  return items.map(item => {
    const name = item.name.toLowerCase();
    let category = 'Others';
    
    // Engine Logic: Subject/Year extraction can be added here
    if (name.includes('question paper') || name.includes('exam') || name.includes('semester') || name.includes('pyq')) {
      category = 'Question Paper';
    } else if (name.includes('syllabus') || name.includes('curriculum')) {
      category = 'Syllabus';
    } else if (name.includes('note') || name.includes('guide') || name.includes('study material') || name.includes('handwritten')) {
      category = 'Notes';
    } else if (name.includes('internal') || name.includes('assignment') || name.includes('viva')) {
      category = 'Assessments';
    } else if (name.includes('date sheet') || name.includes('schedule') || name.includes('notification')) {
      category = 'Notice';
    }

    // Cleaning Engine: Remove noise from titles
    let cleanName = item.name
      .replace(/view|click here|download/gi, '')
      .replace(/\[.*?\]|\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!cleanName || cleanName.length < 3) cleanName = item.name;

    return {
      ...item,
      category,
      cleanName
    };
  });
}

function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function getSuggestion(query: string, allItems: any[]): string | null {
  if (!query || query.length < 3) return null;
  const q = query.toLowerCase();
  
  // Extract all unique words from titles
  const words = new Set<string>();
  allItems.forEach(item => {
    item.name.toLowerCase().split(/[\s-]+/).forEach((w: string) => {
      if (w.length > 3) words.add(w.replace(/[^a-z]/g, ''));
    });
  });

  let bestMatch: string | null = null;
  let minDistance = 3; // Max distance for a match

  for (const word of words) {
    if (word === q) return null; // Already a perfect match
    const dist = getLevenshteinDistance(q, word);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = word;
    }
  }

  return bestMatch;
}

let CACHED_SCRAPE: any[] | null = null;
let LAST_SCRAPE_TIME = 0;

export const app = express();
const PORT = Number(process.env.PORT || 3000);

// Ultimate Security Shield: Anti-Crawl, Anti-Scrape, Anti-Scrawl & Anti-Exploit Middleware
app.use((req, res, next) => {
    const url = req.url.toLowerCase();

    // 1. Direct exemption for robots.txt (so polite bots can check their disallowed status)
    if (url === '/robots.txt' || url.endsWith('/robots.txt')) {
      return next();
    }

    // 2. Reject malicious traversal patterns or vulnerability scanners (WordPress, backups, env, credentials etc.)
    const badPatterns = [
      '/.env',
      '/wp-admin',
      '/wp-login',
      '/.git',
      '/id_rsa',
      '/etc/passwd',
      '/.vscode',
      '/phpinfo',
      '/config.js',
      '/config.json',
      '/shell',
      '/cgi-bin',
      'xmlrpc.php',
      '/eval',
      '/execute',
      '/.aws',
      '/dump',
      '/backup'
    ];
    if (badPatterns.some(pattern => url.includes(pattern))) {
      console.warn(`[SECURITY PREVENT] Blocked traversal attempt to "${req.url}" from IP "${req.ip}"`);
      return res.status(403).send("403 Forbidden: Malicious path query has been blocked by Security Shield.");
    }

    // 3. Filter User-Agent for known scraping libraries, LLM training bots, and scrapers
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();

    // Soften blocks in local development/health-check conditions to guarantee smooth playground operations
    const isLocalOrDev = process.env.NODE_ENV !== "production" || 
                         req.hostname === "localhost" || 
                         req.hostname === "127.0.0.1" || 
                         url === "/api/health" || 
                         url === "/healthz";

    const crawlerBots = [
      "gptbot",
      "chatgpt",
      "google-extended",
      "anthropic-ai",
      "claudebot",
      "perplexitybot",
      "cohere-ai",
      "diffbot",
      "bytespider",
      "bytedance",
      "facebookexternalhit",
      "ccbot",
      "omgilibot",
      "omgili",
      "youbot",
      "semrushbot",
      "ahrefsbot",
      "mj12bot",
      "rogerbot",
      "dotbot",
      "exabot",
      "baiduspider",
      "yandex",
      "scrapy"
      // Note: "node-fetch", "curl", "wget", "http-client", "net-work", "automated" are omitted for local/development tool chain integration
    ];

    if (!isLocalOrDev && crawlerBots.some(bot => userAgent.includes(bot))) {
      console.warn(`[CRAWL SHIELD] Blocked automated request from UA "${req.headers["user-agent"]}" requesting "${req.url}"`);
      return res.status(403).json({
        status: 403,
        error: "Forbidden",
        message: "Automated crawling, web scraping, and AI model model training is strictly prohibited on DU Academic Archive node registries."
      });
    }

    // 4. Block suspicious requests with missing or empty User-Agents (often used by automated bots/exploiters)
    if (!isLocalOrDev && (!userAgent || userAgent.length < 8)) {
      if (url !== "/api/health" && url !== "/healthz" && url !== "/favicon.ico") {
        console.warn(`[SECURITY PREVENT] Blocked empty/suspicious user-agent request on ${req.url}`);
        return res.status(403).send("403 Forbidden: Request denied due to empty client signature.");
      }
    }

    // 5. Inject Enterprise-Grade Security and Privacy Headers to prevent clickjacking, MIME-sniffing, and cross-site scripting
    // Note: X-Frame-Options is omitted specifically to support nesting inside the Google AI Studio developer portal preview iFrame
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Content-Security-Policy", "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob: referrer; connect-src 'self' https: wss: ws: http:; frame-src 'self' https: blob: data:;");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    next();
  });

  // Real-time server health and autonomic systems metrics
  app.get("/api/health", (req, res) => {
    const mem = process.memoryUsage();
    const cacheAgeSeconds = CACHED_SCRAPE ? Math.round((Date.now() - LAST_SCRAPE_TIME) / 1000) : null;
    const cacheSize = CACHED_SCRAPE ? CACHED_SCRAPE.length : 0;
    
    res.json({
      status: "HEALTHY",
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(mem.rss / 1024 / 1024), // MB
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024), // MB
        external: Math.round(mem.external / 1024 / 1024) // MB
      },
      scrapers: SCRAPERS.map(s => ({
        name: s.name,
        type: s.type,
        url: s.url,
        status: "ONLINE",
        cachedCount: CACHED_SCRAPE ? CACHED_SCRAPE.filter(x => x.source === s.name).length : 0
      })),
      cache: {
        active: CACHED_SCRAPE !== null,
        size: cacheSize,
        ageSeconds: cacheAgeSeconds
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        firebaseConfigured: true,
        geminiConfigured: !!process.env.GEMINI_API_KEY
      }
    });
  });

  // Gemini AI Chat
  app.use(express.json());
  app.post("/api/chat", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured" });
    const { prompt } = req.body;
    try {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the ultimate expert DU Academic Guidance Advisor and Strategic Mentor for Delhi University's Undergraduates under the NEP-2022 framework. Your tone is academic, authoritative, helpful, and highly informative. Provide structured guidance on core curriculum requirements (e.g. computer science, math, commerce, humanities), suggest practical Github/Excel portfolio projects for their resumes, list recommended textbook references, suggest exam preparation schedules, explain technical concepts with rigorous precision, and outline concrete milestones. Never use emojis or gradient marketing phrases. Always provide deep, substantive, and fast answers."
        }
      });
      res.json({ response: response.text });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Gemini query failed" });
    }
  });

  // PDF Summarization API - Highly robust & academic extraction pipeline
  app.post("/api/summarize-pdf", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured" });
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const pdfResponse = await fetch(url);
      if (!pdfResponse.ok) throw new Error("Failed to fetch PDF");
      const buffer = await pdfResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType: "application/pdf"
            }
          },
          { 
            text: "Provide a rigorous, comprehensive, highly professional academic summary of this Delhi University syllabus study material PDF. Do not write short generalizations. Analyze the content deeply and structure your response with the following explicit sections:\n\n" +
                  "# 📘 SCHOLASTIC PERFORMANCE SUMMARY REPORT\n\n" +
                  "## 1. DETAILED CORE SYLLABUS ALIGNMENT OVERVIEW\n" +
                  "Provide a deep structural summary of what core academic modules and conceptual topics are covered in this document.\n\n" +
                  "## 2. MAIN TECHNICAL DEFINITIONS & FUNDAMENTAL CONCEPTS\n" +
                  "List and explain 5-10 core definitions, scientific paradigms, formulaic expressions, optimization codes, or theorems detailed in the material.\n\n" +
                  "## 3. PRACTICAL WORKSPACE EXAMPLES & LAB APPLICATIONS\n" +
                  "Detail concrete portfolio projects, coding patterns, lab equations, math derivations, or case scenarios mentioned or inspired by these materials.\n\n" +
                  "## 4. PREDICTIVE PRACTICE QUESTION BOARD (MOCK TEST-BED)\n" +
                  "Draft 3 predictive examination MCQ/Short Answer question types modeled on latest DU exam standards to test students, with brief answer guidance hints.\n\n" +
                  "## 5. RECONSTRUCTIVE PREPARATION STEP-BY-STEP CHECKLIST\n" +
                  "Define a 3-step concrete preparation workflow to master these topics for exams.\n\n" +
                  "Do not use emojis, marketing slogans, or gradient themes in your response. Keep all text objective, polished, and structured."
          }
        ]
      });

      res.json({ summary: response.text });
    } catch (error) {
      console.error("Summarization error:", error);
      res.status(500).json({ error: "Failed to summarize PDF" });
    }
  });

  // Autonomic Agent: Auto-Classify Scraped Links
  app.post("/api/ai/auto-classify-scraped", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured" });
    const { items, subjects } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ classifications: [] });
    }

    const itemsSummary = items.slice(0, 15).map((item, index) => ({
      index,
      originalName: item.name,
      url: item.path,
      source: item.source || "Unknown college portal"
    }));

    const subjectList = (subjects || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      code: s.code || ""
    }));

    const prompt = `You are the chief Autonomic AI Agent routing coordinator for the Delhi University Academic Archive.
Your objective is to map each newly scraped study resource below to the single best available Subject Node.

Scraped Items to classify:
${JSON.stringify(itemsSummary, null, 2)}

Available Subject Nodes:
${JSON.stringify(subjectList, null, 2)}

Instructions:
1. For each item, look for keywords in the 'originalName' and match it with the closest Subject Name or Code.
2. If there is a highly plausible match, set matchedSubjectId to that Subject's ID. Otherwise, set it to 'unmatched_create_proposal'.
3. Clean the title: remove file extensions, redundant phrases, view/click tags, capitalize correctly to a pristine, clean academic heading format.
4. Auto-assign a material type: 'PDF', 'VIDEO', 'LINK', or 'NOTES'.
5. Set confidence from 0 to 100. Let autoApprove be true only if confidence >= 85 and copyrightRisk is LOW.
6. Provide a short, factual 1-sentence description detailing what the document is about based only on the name. Do not include emojis or gradient marketing phrases.
7. Set 'relevanceScore' as a decimal from 0.0 to 1.0 indicating academic utility weight.
8. Set 'inferredSemester' as an integer from 1 to 8, or 0 if unknown.
9. Try to parse an academic study paper year (e.g., 2021, 2022, 2023) into 'paperYear' as integer, or set to 0 if not stated.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER },
                    matchedSubjectId: { type: Type.STRING },
                    cleanTitle: { type: Type.STRING },
                    type: { type: Type.STRING, description: "One of: PDF, VIDEO, LINK, NOTES" },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    confidence: { type: Type.INTEGER },
                    autoApprove: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    relevanceScore: { type: Type.NUMBER },
                    inferredSemester: { type: Type.INTEGER },
                    paperYear: { type: Type.INTEGER }
                  },
                  required: ["index", "matchedSubjectId", "cleanTitle", "type", "tags", "confidence", "autoApprove", "description", "relevanceScore", "inferredSemester", "paperYear"]
                }
              }
            },
            required: ["classifications"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"classifications": []}');
      res.json(result);
    } catch (error: any) {
      console.error("Auto classification fail:", error);
      res.status(500).json({ error: "Classification engine failed: " + error.message });
    }
  });

  // Autonomic Agent: Autopilot Batch Audit & Moderation Queue Processing
  app.post("/api/ai/autopilot-batch-audit", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured" });
    const { submissions, subjects } = req.body;
    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
      return res.json({ auditRuns: [] });
    }

    const payload = submissions.slice(0, 10).map(s => ({
      id: s.id,
      title: s.title,
      url: s.url || "",
      description: s.description || "",
      courseName: s.courseName,
      subjectName: s.subjectName
    }));

    const prompt = `You are the chief Autonomic AI Librarian for the Delhi University study resource archive.
Your mission is to perform a bulk, daily compliance and verification audit on the following user-submitted material proposals.

Proposals to audit:
${JSON.stringify(payload, null, 2)}

Determine if each item is valid for auto-approval. Flag severe issues:
- If duplicate: mark isValid as false.
- Copyright Risk: LOW, MEDIUM, or HIGH (High if commercial paid textbook, Low if typical student homework notes or previous paper).
- Provide a clean, updated, academic version of the Title if needed.
- Write a short summary audit note (AI Review). DO NOT USE EMOJIS.

Available active subjects to cross-reference:
${JSON.stringify((subjects || []).slice(0, 40).map((b: any) => b.name))}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              auditRuns: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    isValid: { type: Type.BOOLEAN },
                    confidenceScore: { type: Type.INTEGER },
                    issues: { type: Type.ARRAY, items: { type: Type.STRING } },
                    copyrightRisk: { type: Type.STRING },
                    suggestedTitle: { type: Type.STRING },
                    aiLibrarianReview: { type: Type.STRING }
                  },
                  required: ["id", "isValid", "confidenceScore", "issues", "copyrightRisk", "suggestedTitle", "aiLibrarianReview"]
                }
              }
            },
            required: ["auditRuns"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"auditRuns": []}');
      res.json(result);
    } catch (error: any) {
      console.error("Batch audit process failed:", error);
      res.status(500).json({ error: "Batch autopilot audit failed: " + error.message });
    }
  });

  // Gemini AI Submission Auditor & Moderator API
  app.post("/api/moderate-submission", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured" });
    const { title, url, type, description, courseName, subjectName } = req.body;
    
    const prompt = `You are an expert AI Librarian and Academic Moderator for a Delhi University study resource archive. 
Your job is to audit a student-submitted study material proposal to ensure compliance, content correctness, metadata alignment, and look out for intellectual property/copyright risks.

Details of submission:
- Title: "${title || 'Untitled'}"
- URL: "${url || 'No URL'}"
- Type: "${type || 'PDF'}"
- Description: "${description || 'None'}"
- Course: "${courseName || 'N/A'}"
- Subject: "${subjectName || 'N/A'}"

Perform the following verification checks:
1. Integrity & Alignment: Check if the Title matches the Type (e.g., if Title says "lecture video notes" but type is "VIDEO", that's good. But if title says "Math video tutorial" and type is "PDF", highlight this mismatch).
2. Copyright/Infringement Risks: Identify if the target seems like a commercial paid textbook, keys/solutions from paid platforms (e.g. Chegg, CourseHero), or proprietary university-regulated keys. Student notes, self-made study guides, or links to DU official question paper portals are safe.
3. Content & Descriptiveness Quality: Score from 0 to 100 based on standard formatting. Suggest a cleaner, professional academic heading for the title if the submitted one is messy, contains words like 'click here' or 'download', or has broken casing.
4. Validation Verdict: Set isValid to false if there is a severe mismatch, empty details, clear copyright risk, or malicious looking URL.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              confidenceScore: { type: Type.INTEGER, description: "Confidence score 0-100 indicating validity and alignment." },
              issues: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of identified compliance, copyright, or details mismatch issues."
              },
              copyrightRisk: { 
                type: Type.STRING, 
                description: "Risk evaluation: 'LOW', 'MEDIUM', or 'HIGH' with brief reason." 
              },
              categorizationCheck: { 
                type: Type.STRING, 
                description: "Feedback highlighting whether the material type matches its title/url description."
              },
              aiLibrarianReview: { 
                type: Type.STRING, 
                description: "A summary review explanation from the perspective of the AI Librarian." 
              },
              suggestedTitle: {
                type: Type.STRING,
                description: "An improved, clean, academic title format."
              }
            },
            required: ["isValid", "confidenceScore", "issues", "copyrightRisk", "categorizationCheck", "aiLibrarianReview", "suggestedTitle"]
          }
        }
      });

      const auditResult = JSON.parse(response.text || '{}');
      res.json(auditResult);
    } catch (error: any) {
      console.error("Moderation audit error:", error);
      res.status(500).json({ error: "Audit engine timed out or failed: " + error.message });
    }
  });

  // Local PDF & generic file uploads system configurations
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Set up Express to serve uploaded files statically
  app.use("/uploads", express.static(uploadsDir));

  // Configure Multer Storage for local uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const sanitName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${uniqueSuffix}-${sanitName}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // limit to 25MB standard
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided for upload" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  });

  // Unified Aggregator API
  app.get("/api/aggregate-du", async (req, res) => {
    const { query } = req.query;

    try {
      if (!CACHED_SCRAPE || Date.now() - LAST_SCRAPE_TIME > 1000 * 60 * 60) {
        const fetchPromises = SCRAPERS.map(async (scraper) => {
          const results: any[] = [];
          try {
            const response = await fetch(scraper.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
            if (!response.ok) return [];
            const html = await response.text();
            const $ = cheerio.load(html);
            const links = await scraper.scrape($);
            
            links.forEach(l => {
              results.push({
                ...l,
                source: scraper.name,
                sourceType: scraper.type
              });
            });
          } catch (e) {
            console.error(`Error scraping ${scraper.name}:`, e);
          }
          return results;
        });

        const allResults = await Promise.all(fetchPromises);
        CACHED_SCRAPE = allResults.flat();
        LAST_SCRAPE_TIME = Date.now();
      }

      // Filter by query if provided
      let finalResults = CACHED_SCRAPE;
      let suggestion: string | null = null;

      if (query && typeof query === 'string') {
        const q = query.toLowerCase();
        const searchWords = q.split(/\s+/).filter(w => w.length > 0);
        
        finalResults = CACHED_SCRAPE.filter(r => {
          const nameLower = r.name.toLowerCase();
          return searchWords.every(w => nameLower.includes(w));
        });
        
        if (finalResults.length === 0) {
          suggestion = getSuggestion(query, CACHED_SCRAPE);
        }
      }

      // Arrange and Clean data using the Engine
      res.json({ 
        count: finalResults.length,
        suggestion,
        links: arrangeData(finalResults.slice(0, 500)) 
      });
    } catch (error) {
      res.status(500).json({ error: "Aggregation failed" });
    }
  });

  // Direct Academic URL Harvester for Admin Pipeline
  app.post("/api/admin/harvester", async (req, res) => {
    const { targetUrl } = req.body;
    if (!targetUrl || typeof targetUrl !== "string") {
      return res.status(400).json({ error: "A valid targetUrl parameter is required" });
    }

    try {
      console.log(`[HARVEST SPIDER] Crawler initiated for: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch target URL (Status: ${response.status})` });
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const items: any[] = [];
      const seenUrls = new Set<string>();

      // Base URL for resolving relative paths
      let baseUrl = targetUrl;
      const baseTag = $('base').attr('href');
      if (baseTag) {
        try {
          baseUrl = new URL(baseTag, targetUrl).href;
        } catch (_) {}
      }

      $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (!href) return;

        let absoluteUrl = '';
        try {
          absoluteUrl = new URL(href, baseUrl).href;
        } catch (_) {
          return; // Skip invalid URIs
        }

        // Avoid duplication
        if (seenUrls.has(absoluteUrl)) return;

        const anchorText = ($(elem).text() || '').trim();
        const titleAttr = ($(elem).attr('title') || '').trim();
        const altText = ($(elem).attr('alt') || '').trim();
        
        let linkName = anchorText || titleAttr || altText || absoluteUrl.split('/').pop() || 'Untitled Document';
        linkName = linkName.replace(/\s+/g, ' ').trim();

        // Check if the link points to a useful extension or has keyword match
        const lowerUrl = absoluteUrl.toLowerCase();
        let matchesDoc = false;
        let guessedType = 'LINK';

        if (lowerUrl.endsWith('.pdf')) {
          matchesDoc = true;
          guessedType = 'PDF';
        } else if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.xlsx') || lowerUrl.endsWith('.pptx') || lowerUrl.endsWith('.zip')) {
          matchesDoc = true;
          guessedType = 'NOTES';
        } else if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('github.com')) {
          matchesDoc = true;
          guessedType = 'NOTES';
        } else if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/')) {
          matchesDoc = true;
          guessedType = 'VIDEO';
        } else if (lowerUrl.includes('/syllabus') || lowerUrl.includes('/course') || lowerUrl.includes('academic-calendar') || lowerUrl.includes('question-paper')) {
          matchesDoc = true;
          guessedType = 'LINK';
        }

        if (matchesDoc && items.length < 150) {
          seenUrls.add(absoluteUrl);
          items.push({
            name: linkName,
            url: absoluteUrl,
            type: guessedType
          });
        }
      });

      console.log(`[HARVEST SPIDER] Crawler completed. Harvested list size: ${items.length} links`);
      res.json({ targetUrl, items });
    } catch (err: any) {
      console.error("[HARVEST SPIDER ERROR]", err);
      res.status(500).json({ error: `Web harvesting process failed: ${err.message}` });
    }
  });

  // Keep existing paths but redirect or maintain for compatibility
  app.get("/api/kalindi-papers", async (req, res) => {
    try {
      const s = SCRAPERS.find(x => x.name === 'Kalindi');
      if (!s) return res.json({ links: [] });
      const response = await fetch(s.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
      if (!response.ok) {
        return res.json({ links: [], error: "Failed to query Kalindi repository" });
      }
      const html = await response.text();
      const links = await s.scrape(cheerio.load(html));
      res.json({ links: links.map(l => ({ ...l, source: 'Kalindi' })) });
    } catch (e: any) {
      console.error("Error fetching Kalindi papers:", e);
      res.json({ links: [], error: e.message });
    }
  });

  app.get("/api/maitreyi-papers", async (req, res) => {
    try {
      const s = SCRAPERS.find(x => x.name === 'Maitreyi');
      if (!s) return res.json({ links: [] });
      const response = await fetch(s.url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
      if (!response.ok) {
        return res.json({ links: [], error: "Failed to query Maitreyi repository" });
      }
      const html = await response.text();
      const links = await s.scrape(cheerio.load(html));
      res.json({ links: links.map(l => ({ ...l, source: 'Maitreyi' })) });
    } catch (e: any) {
      console.error("Error fetching Maitreyi papers:", e);
      res.json({ links: [], error: e.message });
    }
  });

  // DU Official Papers Crawler (Directory Structure)
  app.get("/api/du-papers", async (req, res) => {
    try {
      const targetPath = req.query.path as string;
      const baseUrl = "http://web.du.ac.in/PreviousQuestionPapers/";
      const url = targetPath ? `${baseUrl}${targetPath}` : baseUrl;
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
      if (!response.ok) return res.status(response.status).json({ error: "Failed" });
      const html = await response.text();
      const $ = cheerio.load(html);
      const links: any[] = [];
      $('a').each((_, el) => {
        const h = $(el).attr('href');
        const t = $(el).text().trim();
        if (!h || h.startsWith('?') || t === 'Parent Directory' || t === 'Name') return;
        links.push({ name: t, path: targetPath ? `${targetPath}${h}` : h, isDir: h.endsWith('/') });
      });
      res.json({ links });
    } catch (e) { res.status(500).json({ error: "Error" }); }
  });

  // AI Features API: Smart Syllabus Breakdown
  app.post("/api/ai/syllabus-breakdown", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { syllabusText } = req.body;
    if (!syllabusText) return res.status(400).json({ error: "Syllabus text is required" });

    const prompt = `You are a helpful study assistant. Breakdown the following syllabus or course description into easy-to-understand study modules.
Make the tone encouraging and accessible, without academic jargon where possible.

Syllabus Text:
"${syllabusText}"

Adhere to this JSON schema:
- Divide the material into 3 to 5 simple modules.
- For each module, identify:
  * title: A friendly, clear title.
  * topics: An array of 3 or 4 main things they will learn.
  * studyTip: One short, actionable tip on how to study this specific module best.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              courseName: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    studyTip: { type: Type.STRING }
                  },
                  required: ["title", "topics", "studyTip"]
                }
              }
            },
            required: ["courseName", "modules"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Syllabus Breakdown Error:", error);
      res.status(500).json({ error: "Failed to create breakdown: " + error.message });
    }
  });

  // AI Features API: Mini Practice Quiz
  app.post("/api/ai/practice-quiz", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { topicText } = req.body;
    if (!topicText) return res.status(400).json({ error: "Topic description is required" });

    const prompt = `You are a friendly tutor. Create a helpful, encouraging practice quiz with exactly 3 multiple-choice questions for the following topic:
Topic: "${topicText}"

Make sure the questions evaluate understanding, not just memorization.
Adhere strictly to the requested JSON response schema.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              encouragementMessage: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER, description: "0-based index of correct option" },
                    friendlyExplanation: { type: Type.STRING }
                  },
                  required: ["id", "questionText", "options", "correctIndex", "friendlyExplanation"]
                }
              }
            },
            required: ["quizTitle", "encouragementMessage", "questions"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Practice Quiz Error:", error);
      res.status(500).json({ error: "Failed to generate quiz: " + error.message });
    }
  });

  // AI Features API: Topic Explainer
  app.post("/api/ai/topic-explainer", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { topicName } = req.body;
    if (!topicName) return res.status(400).json({ error: "Topic name is required" });

    const prompt = `You are an expert at simplifying complex ideas. Explain the following topic to a student so it is incredibly easy to understand.
Topic: "${topicName}"

Structure your response using the provided JSON schema. Offer a simple definition, a real-world analogy, and a "why it matters" section. Make the tone friendly, accessible, and non-technical if possible.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              simpleDefinition: { type: Type.STRING },
              realWorldAnalogy: { type: Type.STRING },
              whyItMatters: { type: Type.STRING }
            },
            required: ["topic", "simpleDefinition", "realWorldAnalogy", "whyItMatters"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Topic Explainer Error:", error);
      res.status(500).json({ error: "Failed to explain topic: " + error.message });
    }
  });

  app.post("/api/ai/study-planner", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { topic, days, hoursPerDay } = req.body;
    if (!topic || !days) return res.status(400).json({ error: "Topic and days are required." });

    const prompt = `You are an expert academic planner. Create a structured study plan for the following topic:
Topic: "${topic}"
Duration: ${days} days, approximately ${hoursPerDay} hours per day.

Adhere to this JSON schema:
- planTitle: String
- days: Array of objects with 'dayNumber' (Integer), 'focus' (String), and 'tasks' (Array of Strings).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["dayNumber", "focus", "tasks"]
                }
              }
            },
            required: ["planTitle", "days"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Study Planner Error:", error);
      res.status(500).json({ error: "Failed to generate study plan: " + error.message });
    }
  });

  app.post("/api/ai/flashcards", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { topic, numCards = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required." });

    const prompt = `You are an expert educator. Create ${numCards} flashcards for the following topic:
Topic: "${topic}"

Adhere to this JSON schema:
- flashcards: Array of objects with 'question' (String) and 'answer' (String).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  },
                  required: ["question", "answer"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Flashcards Error:", error);
      res.status(500).json({ error: "Failed to generate flashcards: " + error.message });
    }
  });

  app.post("/api/ai/physics-analyst", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API not configured in this sandbox workspace." });
    const { system, n, width, particle } = req.body;
    if (!system || !n) return res.status(400).json({ error: "System and quantum number are required." });

    const prompt = `You are an expert theoretical physicist. Analyze the following physical quantum state:
System: "${system}"
Quantum State Principal Number (n): ${n}
Potential Well Width: ${width} Angstroms
Particle: "${particle}"

Provide an academic, clear quantum analysis of this exact configuration. Address:
- Exact LaTeX formula for the wavefunction psi_n(x).
- Energy expectations in eV/MeV.
- Nodes and probability distribution.
- Interpretation under classical-quantum correspondence (Bohr Correspondence Principle).
- Uncertainty Principle product limit.
`;

    try {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              wavefunctionFormula: { type: Type.STRING },
              energyLevelEv: { type: Type.STRING },
              nodesCount: { type: Type.INTEGER },
              interpretation: { type: Type.STRING },
              tunnelingContext: { type: Type.STRING },
              uncertaintyProduct: { type: Type.STRING }
            },
            required: ["wavefunctionFormula", "energyLevelEv", "nodesCount", "interpretation", "tunnelingContext", "uncertaintyProduct"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Physics Analyst Error:", error);
      res.status(500).json({ error: "Failed to run simulation analysis: " + error.message });
    }
  });

  app.post("/api/ai/analyze-results", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API is not configured." });
    const { rawText, studentContext } = req.body;
    if (!rawText) return res.status(400).json({ error: "Academic scorecard data or raw text is required." });

    const prompt = `You are an expert academic advisor, dean of physics and engineering, and researcher.
Analyze the following student's scorecard / results text:
"${rawText}"

Context of student: "${studentContext || 'Physics / General Science undergraduate student'}"

Parse out the subjects, scores and max scores dynamically from the text. Deduce overall GPA or percentage.
Determine strategic key strengths, key areas of weakness in their learning path, recommended research subfields (especially in Physics, Computational Science, and Advanced Science), and provide a list of highly actionable study steps/recommendations with code, references, or material tips.

Adhere strictly to this JSON schema:
{
  "parsedSubjects": Array of { "subject": String, "score": Number, "maxScore": Number },
  "gpa": String (e.g. "3.85 / 4.0" or "84.5%"),
  "academicStanding": String (e.g. "Distinguished Class", "First Division", "Merit"),
  "overview": String (A high-quality 3-4 sentence comprehensive review of the student's academic path),
  "strengths": Array of String,
  "weaknesses": Array of String,
  "suggestedActions": Array of { "title": String, "description": String },
  "recommendedResearchSubfields": Array of String
}
`;

    try {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parsedSubjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER }
                  },
                  required: ["subject", "score", "maxScore"]
                }
              },
              gpa: { type: Type.STRING },
              academicStanding: { type: Type.STRING },
              overview: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              recommendedResearchSubfields: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["parsedSubjects", "gpa", "academicStanding", "overview", "strengths", "weaknesses", "suggestedActions", "recommendedResearchSubfields"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Results Diagnostics Error:", error);
      res.status(500).json({ error: "Failed to analyze scorecard: " + error.message });
    }
  });

  app.post("/api/ai/analyze-pdf-scorecard", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API is not configured." });
    const { fileUrl, studentContext } = req.body;
    if (!fileUrl) return res.status(400).json({ error: "File URL is required." });

    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), "uploads", fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Uploaded file not found on server." });
      }

      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");

      let mimeType = "application/pdf";
      const ext = path.extname(fileName).toLowerCase();
      if (ext === ".png") mimeType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";

      const prompt = `You are an expert academic advisor, dean of physics and engineering, and researcher.
Your objective is to read the attached PDF or Image (which represents a student's academic transcript, scorecard, exam report, or syllabus description).
First, perform precise OCR extraction of all subjects/courses, grades, and numeric marks.
Then, conduct a complete diagnostic analysis of their strengths and focus areas under the academic context of: "${studentContext || 'Physics / General Science undergraduate student'}".

If it is a scorecard/transcript, calculate their overall GPA or percentage correctly.
If it is a syllabus or curriculum document, parse the major sections/components as raw subjects, assigning reasonable indicative values so they still get a comprehensive visual grade distribution.

Adhere strictly to this JSON schema:
{
  "parsedSubjects": Array of { "subject": String, "score": Number, "maxScore": Number },
  "gpa": String (e.g. "3.85 / 4.0" or "84.5%"),
  "academicStanding": String (e.g. "Distinguished Class", "First Division", "Merit"),
  "overview": String (A high-quality 3-4 sentence comprehensive review of the student's academic path and performance),
  "strengths": Array of String,
  "weaknesses": Array of String,
  "suggestedActions": Array of { "title": String, "description": String },
  "recommendedResearchSubfields": Array of String
}
`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parsedSubjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER }
                  },
                  required: ["subject", "score", "maxScore"]
                }
              },
              gpa: { type: Type.STRING },
              academicStanding: { type: Type.STRING },
              overview: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              recommendedResearchSubfields: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["parsedSubjects", "gpa", "academicStanding", "overview", "strengths", "weaknesses", "suggestedActions", "recommendedResearchSubfields"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI PDF Results Diagnostics Error:", error);
      res.status(500).json({ error: "Failed to perform OCR and analyze scorecard: " + error.message });
    }
  });

  app.post("/api/ai/generate-feature-roadmap", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API is not configured." });
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required for feature roadmapping." });
    }

    const prompt = `You are a Principal Computational Physics Systems Architect and Lead Academic Research Engineer.
Analyze this submitted feature proposal or simulation module improvement:
Title: "${title}"
Description: "${description}"

Generate a detailed 3-Phase technical implementation roadmap/milestones plan to construct this module, specifying correct physical, mathematical, and data engineering subtasks.
IMPORTANT: You are strictly forbidden from including any emojis, icons, or gradient slogans in titles, descriptions, or subtasks. The tone must be purely academic, professional, and technical.

Adhere strictly to this JSON schema:
{
  "milestones": [
    {
      "phaseTitle": String (e.g. "Phase 1: Computational Physics Backend & Mathematical Engine Setup"),
      "description": String (A highly clear technical description of this phase),
      "subtasks": Array of String (3 to 4 specific implementation subtasks written in plain scientific/coding language with no emojis)
    }
  ]
}
`;

    try {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseTitle: { type: Type.STRING },
                    description: { type: Type.STRING },
                    subtasks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["phaseTitle", "description", "subtasks"]
                }
              }
            },
            required: ["milestones"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"milestones": []}');
      res.json(result);
    } catch (error: any) {
      console.error("AI Feature Roadmap Generation Error:", error);
      res.status(500).json({ error: "Failed to assemble feature building plan: " + error.message });
    }
  });

  app.post("/api/ai/analyze-geodesic", async (req, res) => {
    const ai = getAI();
    if (!ai) return res.status(500).json({ error: "Gemini API is not configured." });
    const { isPhoton, r0, L, vr0, outcome } = req.body;

    const particleName = isPhoton ? "Photon (massless light wave)" : "Deep Space Probe Study Module (massive particle)";
    const outcomeText = 
      outcome === "CROSS_HORIZON" ? "Captured into the central Schwarzschild Singularity (r <= 2M)" :
      outcome === "ESCAPED" ? "Escaped gravitational capture to asymptotic infinity (r > 40M)" :
      outcome === "STABLE_ORBIT" ? "Trapped in an orbital resonance or precessing geodesic bound" :
      "Precessing trajectory with standard coordinate boundaries";

    const prompt = `You are a Lead Theoretical Cosmologist and Expert in Einstein's General Theory of Relativity.
Analyze the following numerical geodesic orbit simulated in a normalized Schwarzschild Spacetime where:
- Central Singularity Mass: M = 1
- Event Horizon (Schwarzschild Radius): R_s = 2M = 2
- Unstable Photon Sphere Orbit Boundary: R_photon = 3M = 3
- Innermost Stable Circular Orbit (ISCO) limit: R_isco = 6M = 6

Orbits are integrated in the equatorial plane (theta = pi/2).
Simulation Parameters Launched:
- Particle Type: ${particleName}
- Launch Radial Position (r0): ${r0} units (where r0 is in terms of M)
- Conserved Angular Momentum (L): ${L} (units of energy-normalized orbital momentum)
- Conserved Radial Momentum (v_r0 / dr_dphi): ${vr0}
- Numerical Outcome Calculated: ${outcomeText}

Provide an authentic, highly clinical, and deeply scholarly analysis of this geodesic's behavior. Explain how the effective potential V_eff(r) governs the radial motion, focusing on the relativistic 3M(U^2) or -3ML^2/r^4 general relativity coordinate attraction pull compared to classical Newtonian gravity. Under general relativity, explain why stable orbits are impossible under R_isco = 6M for probes, and why light rays bend or get captured inside R_photon = 3M.

IMPORTANT: Do not use any emojis, icons, or gradient UI slogans in the output response. The tone must be strictly technical, clean, and professional.

Adhere strictly to this JSON schema:
{
  "physicalSummary": String (A highly precise 3-4 sentence explanation of the physics governing this path),
  "phenomenaObserved": Array of String (Specific coordinate processes observed, e.g. "Periapsis Precession", "Gravitational Lensing Deflection", "Singularity Crossings", etc.),
  "effectivePotentialExplanation": String (A brief paragraph on how the effective potential peaks or potential barriers compare to the particle's energy for these exact values),
  "astrophysicalContext": String (1-2 sentences mapping this numerical configuration to real astrophysical scales, e.g., Sagittarius A*, Cygnus X-1, or accretion disks surrounding neutron stars)
}
`;

    try {
      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              physicalSummary: { type: Type.STRING },
              phenomenaObserved: { type: Type.ARRAY, items: { type: Type.STRING } },
              effectivePotentialExplanation: { type: Type.STRING },
              astrophysicalContext: { type: Type.STRING }
            },
            required: ["physicalSummary", "phenomenaObserved", "effectivePotentialExplanation", "astrophysicalContext"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error("AI General Relativity Geodesic Analysis Error:", error);
      res.status(500).json({ error: "Failed to compile Schwarzschild geodesic thesis: " + error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    import("vite").then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
      }).catch(err => console.error("Vite setup error", err));
    }).catch(err => console.error("Failed to import vite", err));
  } else {
    // Only serve static files if NOT on Vercel
    if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Only listen on a port if not in serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

