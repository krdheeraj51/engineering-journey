const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "learning");
const OUTPUT = path.join(process.cwd(), "data", "manifest.json");

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : fullPath;
  });
}

function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map(item => item.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, "");
    }

    data[key] = value;
  }

  return data;
}

function toPublicPath(filePath) {
  return filePath.split(path.sep).join("/");
}

const markdownFiles = walk(ROOT)
  .filter(file => file.endsWith(".md"));

const entries = markdownFiles.map(file => {
  const relative = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, "utf8");
  const meta = parseFrontMatter(content);

  const dateMatch = relative.match(/learning\/(\d{4})\/(\d{2})\/(\d{2})\.md$/);

  if (!dateMatch) {
    throw new Error(`Invalid learning file path: ${relative}`);
  }

  const [, year, month, day] = dateMatch;
  const date = meta.date || `${year}-${month}-${day}`;

  return {
    date,
    title: meta.title || `Learning — ${date}`,
    topics: Array.isArray(meta.topics) ? meta.topics : meta.topics ? [meta.topics] : [],
    category: meta.category || "Engineering",
    status: meta.status || "learning",
    path: toPublicPath(relative)
  };
}).sort((a, b) => b.date.localeCompare(a.date));

const manifest = {
  generatedAt: new Date().toISOString(),
  totalEntries: entries.length,
  entries
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Generated ${OUTPUT} with ${entries.length} entries.`);
