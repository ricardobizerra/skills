#!/usr/bin/env node
/**
 * Zero-dependency repository validator for ricardobizerra/skills.
 * Validates skill frontmatter, marketplace.json parity, README catalog parity,
 * evals.json schemas, relative Markdown links, and bundled script syntax.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills", "engineering");

const errors = [];
const checks = [];

function pass(label) {
  checks.push({ ok: true, label });
}

function fail(label, detail) {
  checks.push({ ok: false, label });
  errors.push(`${label}: ${detail}`);
}

function listMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      fields[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return fields;
}

function stripCodeBlocksAndInlineCode(markdown) {
  // Remove fenced code blocks (``` or ~~~)
  const withoutFenced = markdown.replace(/^(`{3,}|~{3,})[\s\S]*?^\1[ \t]*$/gm, "");
  // Remove inline code spans
  return withoutFenced.replace(/`[^`\n]+`/g, "");
}

// 1. Discover skills and validate SKILL.md frontmatter + evals/evals.json
const skillDirs = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (skillDirs.length === 0) {
  fail("Skill discovery", "No skill directories found under skills/engineering/");
} else {
  pass(`Discovered ${skillDirs.length} skills under skills/engineering/`);
}

for (const skill of skillDirs) {
  const skillMdPath = path.join(SKILLS_DIR, skill, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    fail(`Skill ${skill}`, "Missing SKILL.md");
  } else {
    const content = fs.readFileSync(skillMdPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      fail(`Skill ${skill}`, "Missing YAML frontmatter in SKILL.md");
    } else {
      if (fm.name !== skill) {
        fail(`Skill ${skill}`, `Frontmatter name "${fm.name}" does not match directory "${skill}"`);
      }
      if (!fm.description) {
        fail(`Skill ${skill}`, "Missing non-empty frontmatter description");
      }
      if (fm.name === skill && fm.description) {
        pass(`Frontmatter valid for ${skill}`);
      }
    }
  }

  const evalsPath = path.join(SKILLS_DIR, skill, "evals", "evals.json");
  if (!fs.existsSync(evalsPath)) {
    fail(`Evals ${skill}`, "Missing evals/evals.json");
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(evalsPath, "utf8"));
      if (data.skill_name !== skill) {
        fail(`Evals ${skill}`, `skill_name "${data.skill_name}" does not match "${skill}"`);
      } else if (!Array.isArray(data.evals) || data.evals.length === 0) {
        fail(`Evals ${skill}`, "evals must be a non-empty array");
      } else {
        let evalValid = true;
        for (const item of data.evals) {
          if (
            typeof item.id !== "number" ||
            typeof item.prompt !== "string" ||
            item.prompt.trim() === "" ||
            typeof item.expected_output !== "string" ||
            item.expected_output.trim() === "" ||
            !Array.isArray(item.files) ||
            !Array.isArray(item.assertions) ||
            item.assertions.length === 0
          ) {
            fail(`Evals ${skill}`, `Invalid eval entry id=${String(item.id)}`);
            evalValid = false;
          }
        }
        if (evalValid) {
          pass(`Evals schema valid for ${skill} (${data.evals.length} cases)`);
        }
      }
    } catch (err) {
      fail(`Evals ${skill}`, `Invalid JSON: ${err.message}`);
    }
  }
}

// 2. Marketplace parity
const marketplacePath = path.join(ROOT, ".claude-plugin", "marketplace.json");
if (!fs.existsSync(marketplacePath)) {
  fail("Marketplace", "Missing .claude-plugin/marketplace.json");
} else {
  try {
    const mp = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
    const version = mp?.metadata?.version;
    if (typeof version !== "string" || !/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
      fail("Marketplace", `Invalid semver metadata.version: ${String(version)}`);
    }
    const listed = (mp?.plugins?.[0]?.skills ?? [])
      .map((s) => s.replace(/^\.\/skills\/engineering\//, ""))
      .sort();
    const missingInMarketplace = skillDirs.filter((s) => !listed.includes(s));
    const orphanedInMarketplace = listed.filter((s) => !skillDirs.includes(s));
    if (missingInMarketplace.length > 0) {
      fail("Marketplace", `Missing skills: ${missingInMarketplace.join(", ")}`);
    }
    if (orphanedInMarketplace.length > 0) {
      fail("Marketplace", `Orphaned skills: ${orphanedInMarketplace.join(", ")}`);
    }
    if (missingInMarketplace.length === 0 && orphanedInMarketplace.length === 0) {
      pass("Marketplace 1:1 parity verified");
    }
  } catch (err) {
    fail("Marketplace", `Invalid JSON: ${err.message}`);
  }
}

// 3. README catalog parity
const readmePath = path.join(ROOT, "README.md");
if (!fs.existsSync(readmePath)) {
  fail("README", "Missing README.md");
} else {
  const readmeContent = fs.readFileSync(readmePath, "utf8");
  const missingInReadme = skillDirs.filter(
    (s) => !readmeContent.includes(`skills/engineering/${s}/SKILL.md`),
  );
  if (missingInReadme.length > 0) {
    fail("README", `Skills missing from README catalog: ${missingInReadme.join(", ")}`);
  } else {
    pass("README catalog parity verified");
  }
}

// 4. Relative Markdown link integrity
const mdFiles = listMarkdownFiles(ROOT);
let brokenLinks = 0;
const linkRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;

for (const mdFile of mdFiles) {
  const raw = fs.readFileSync(mdFile, "utf8");
  const cleaned = stripCodeBlocksAndInlineCode(raw);
  for (const match of cleaned.matchAll(linkRegex)) {
    const targetRaw = match[1].trim().split(/\s+/)[0];
    if (
      !targetRaw ||
      targetRaw.startsWith("http://") ||
      targetRaw.startsWith("https://") ||
      targetRaw.startsWith("mailto:") ||
      targetRaw.startsWith("#") ||
      targetRaw.startsWith("<")
    ) {
      continue;
    }
    const targetPathOnly = targetRaw.split("#")[0];
    if (!targetPathOnly) continue;
    const resolved = path.resolve(path.dirname(mdFile), targetPathOnly);
    if (!fs.existsSync(resolved)) {
      const relSource = path.relative(ROOT, mdFile);
      fail("Markdown link", `${relSource} -> broken link "${targetRaw}"`);
      brokenLinks += 1;
    }
  }
}
if (brokenLinks === 0) {
  pass(`All relative Markdown links resolved across ${mdFiles.length} files`);
}

// 5. Bundled Node script syntax check
const scriptTargets = [
  "scripts/validate-repo.mjs",
  "skills/engineering/verify/scripts/verify-smoke.mjs",
];
for (const relScript of scriptTargets) {
  const absScript = path.join(ROOT, relScript);
  if (!fs.existsSync(absScript)) {
    fail("Script syntax", `Missing ${relScript}`);
    continue;
  }
  try {
    execFileSync(process.execPath, ["--check", absScript], { stdio: "pipe" });
    pass(`Syntax check passed: ${relScript}`);
  } catch (err) {
    fail("Script syntax", `${relScript}: ${err.stderr?.toString() || err.message}`);
  }
}

// Report
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.label}`);
}

if (errors.length > 0) {
  console.error(`\nValidation failed with ${errors.length} error(s):`);
  for (const e of errors) {
    console.error(` - ${e}`);
  }
  process.exit(1);
}

console.log(`\nAll ${checks.length} repository checks passed.`);
