// migrate.js
const fs = require("fs");
const path = require("path");

// 👇 CHANGE THIS PATH to point at your JSON file
const INPUT_FILE = path.join(__dirname, "data", "problems.json");
const OUTPUT_FILE = INPUT_FILE; // overwrite in place (a .backup is created)

// ============================================================
// ALL NEW FIELDS + their defaults
// ============================================================
const DEFAULTS = {
  // --- Metadata (derived from existing data, not user-owned) ---
  "Question Name": "",           // derived from Slug
  Slug: "",                      // derived from URL
  Platform: "LeetCode",          // platform
  Pattern: "",                   // main algorithm pattern
  "Sub-Pattern": "",             // finer pattern
  "Video Solution URL": "",      // e.g. NeetCode
  "Editorial URL": "",           // LC editorial
  "Similar Questions": [],       // array of IDs

  // --- USER FIELDS (personal progress; stored in localStorage at runtime) ---
  Status: "Not Started",         // Not Started | In Progress | Solved | Needs Review | Failed
  Confidence: 0,                 // 0-5
  Attempts: 0,                   // number
  "Time Taken (min)": "",        // number or ""
  "Hints Used": 0,               // number
  "Solved Without Help": false,  // boolean
  Bookmarked: false,             // boolean
  "Revision Count": 0,           // number
  "Last Attempted": "",          // ISO date string
  "Next Review Date": "",        // ISO date string
  "Short Notes": "",             // free text
  "Key Insight": "",             // free text
  "Mistakes Made": "",           // free text
  "Code Snippet": "",            // free text
  Language: "javascript",        // code language
  "Custom Tags": [],             // personal tags
};

// ============================================================
// Helpers to derive data from existing fields
// ============================================================

/**
 * URL → slug. "https://leetcode.com/problems/two-sum/description/" → "two-sum"
 */
function slugFromUrl(url) {
  if (!url) return "";
  const m = url.match(/\/problems\/([^/]+)/);
  return m ? m[1] : "";
}

/**
 * Slug → Title Case. "two-sum" → "Two Sum"
 */
function nameFromSlug(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => (w[0]?.toUpperCase() || "") + w.slice(1))
    .join(" ");
}

/**
 * Parse Topics. Handles both string "['Array', 'Hash Table']" and array.
 */
function parseTopics(topics) {
  if (Array.isArray(topics)) return topics;
  if (typeof topics !== "string") return [];
  return topics
    .replace(/[\[\]']/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse Companies. Handles comma-string and array.
 */
function parseCompanies(companies) {
  if (Array.isArray(companies)) return companies;
  if (typeof companies !== "string") return [];
  return companies
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ============================================================
// Main migration
// ============================================================

function migrate() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ File not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  // Backup original
  const backupPath = `${INPUT_FILE}.backup-${Date.now()}.json`;
  fs.copyFileSync(INPUT_FILE, backupPath);
  console.log(`📦 Backup created: ${backupPath}`);

  // Read
  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  let questions = JSON.parse(raw);

  // Handle both { problems: [...] } and [...]
  const isWrapped =
    !Array.isArray(questions) && Array.isArray(questions.problems);
  if (isWrapped) questions = questions.problems;

  console.log(`📖 Loaded ${questions.length} questions`);

  // Migrate each
  let newFieldsAdded = 0;
  let topicsFixed = 0;
  let companiesFixed = 0;

  const migrated = questions.map((q) => {
    const existing = { ...q };

    // --- Derive slug & name if missing ---
    const slug = existing.Slug || slugFromUrl(existing.URL);
    const name =
      existing["Question Name"] && existing["Question Name"] !== ""
        ? existing["Question Name"]
        : nameFromSlug(slug);

    // --- Fix Topics → array ---
    const topics = parseTopics(existing.Topics);
    if (typeof existing.Topics === "string") topicsFixed++;

    // --- Fix Companies → array ---
    const companies = parseCompanies(existing.Companies);
    if (typeof existing.Companies === "string") companiesFixed++;

    // --- Drop Company Count if it exists (redundant) ---
    //   Actually keep it — some code may reference it. We'll just leave it.

    // --- Build new object: defaults first, then existing (so existing wins) ---
    const merged = {
      ...DEFAULTS,
      ...existing,
      // Force-correct derived fields
      Slug: slug,
      "Question Name": name,
      Topics: topics,
      Companies: companies,
    };

    // Count how many NEW keys were added
    for (const key of Object.keys(DEFAULTS)) {
      if (!(key in existing)) newFieldsAdded++;
    }

    return merged;
  });

  // Write back
  const output = isWrapped ? { problems: migrated } : migrated;
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");

  console.log("─".repeat(50));
  console.log(`✅ Migration complete`);
  console.log(`   Questions processed : ${migrated.length}`);
  console.log(`   New fields added    : ${newFieldsAdded}`);
  console.log(`   Topics → array      : ${topicsFixed}`);
  console.log(`   Companies → array   : ${companiesFixed}`);
  console.log("─".repeat(50));

  // Show sample
  console.log("\n🔍 Sample (first question):\n");
  console.log(JSON.stringify(migrated[0], null, 2));
}

migrate();
