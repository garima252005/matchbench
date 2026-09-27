import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ------------------------------------------------------------------ */
/* Health check — hit http://localhost:5000/api/health to confirm the  */
/* server and the API key are both wired up correctly.                 */
/* ------------------------------------------------------------------ */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(GEMINI_API_KEY),
    model: GEMINI_MODEL
  });
});

/* ------------------------------------------------------------------ */
/* POST /api/match                                                     */
/* Body: { name, course, branch, skills: string[], interest, level }   */
/* Returns: { ideas: [...] }                                           */
/* ------------------------------------------------------------------ */
app.post("/api/match", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY is not set on the server. Copy backend/.env.example to backend/.env and add your key."
      });
    }

    const { name, course, branch, skills, interest, level } = req.body || {};

    if (
      !name ||
      !course ||
      !branch ||
      !Array.isArray(skills) ||
      skills.length === 0 ||
      !interest ||
      !level
    ) {
      return res.status(400).json({
        error:
          "Missing or invalid fields. Required: name, course, branch, skills (non-empty array), interest, level."
      });
    }

    const ideas = await getProjectIdeasFromGemini({
      name,
      course,
      branch,
      skills,
      interest,
      level
    });

    res.json({ ideas });
  } catch (err) {
    console.error("Error in /api/match:", err);
    res.status(502).json({
      error: err.message || "Failed to generate project ideas."
    });
  }
});

/* ------------------------------------------------------------------ */
/* Gemini call + prompt construction                                   */
/* ------------------------------------------------------------------ */
async function getProjectIdeasFromGemini({ name, course, branch, skills, interest, level }) {
  const systemInstruction = `You are an expert academic project mentor and industry innovation consultant who designs student capstone and portfolio projects.
Respond with ONLY a valid JSON array — no markdown fences, no preamble, no trailing commentary. Generate exactly 5 innovative, feasible, and distinct project ideas.

Each array element must be an object with exactly these fields:
- "title": string, a specific, non-generic project name
- "tagline": string, one punchy sentence describing what it does
- "explanation": string, 3-4 sentences explaining what the project is, how it works, and what makes it innovative
- "skillsNeeded": array of strings, 5-8 skills — prioritize reusing the student's listed skills where genuinely relevant, plus 1-3 realistic stretch skills they'd need to learn
- "prerequisites": array of strings, 3-5 items — courses, foundational knowledge, or tools the student should have before starting
- "benefits": array of strings, 3-4 concrete learning/career benefits of building this
- "importance": string, 2-3 sentences on why this matters for the chosen field's future, industry relevance, and real-world impact
- "difficulty": must be exactly "${level}" for every single idea — this is the student's chosen level and is non-negotiable

Calibrate scope, tooling, and ambition strictly to the "${level}" level:
- Beginner (Easy): a scope achievable solo in a few weeks with mostly-familiar tools, minimal new theory, clear step-by-step structure.
- Intermediate (Medium): multi-component scope, a couple of new tools or concepts to learn, some independent design decisions.
- Advanced (Hard): open-ended, research-adjacent or production-grade scope, novel integration of tools, real architectural or algorithmic depth.

Tailor every idea specifically to the student's course, branch, selected skills, area of interest, and chosen level. Avoid generic ideas that ignore their branch. Do not repeat the same idea across students of different interests.`;

  const userPrompt = `Student profile:
- Name: ${name}
- Course: ${course}
- Branch/Specialization: ${branch}
- Selected technical skills: ${skills.join(", ")}
- Area of interest: ${interest}
- Desired project level: ${level}

Generate the 5 project ideas now as a raw JSON array, all at the "${level}" difficulty.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    let hint = "";
    if (response.status === 404) {
      hint = ` — the model "${GEMINI_MODEL}" is likely retired or unavailable to your key. Try setting GEMINI_MODEL=gemini-flash-latest (or gemini-3.6-flash) in backend/.env and restart the server.`;
    } else if (response.status === 400 || response.status === 403) {
      hint = " — double-check GEMINI_API_KEY in backend/.env is correct and has Gemini API access enabled.";
    }
    throw new Error(
      `Gemini API request failed (${response.status})${hint} Raw: ${errText.slice(0, 300)}`
    );
  }

  const data = await response.json();

  const candidate = data?.candidates?.[0];
  if (!candidate) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(
      blockReason
        ? `Gemini blocked the request (${blockReason}).`
        : "Gemini returned no candidates."
    );
  }

  const rawText = (candidate.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseIdeasJson(rawText);
}

function parseIdeasJson(rawText) {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();

  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Could not parse Gemini's response as JSON. Please try again and enter valid input data");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Gemini did not return any project ideas.");
  }

  return parsed;
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
  console.log(`✅ Skill Matcher backend running at http://localhost:${PORT}`);
  console.log(`   Model: ${GEMINI_MODEL}`);
  console.log(`   API key loaded: ${GEMINI_API_KEY ? "yes" : "NO — set it in backend/.env"}`);
});
