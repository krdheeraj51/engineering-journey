const fs = require("fs");
const path = require("path");

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dateStr = getTodayString();
  let title = "";

  for (const arg of args) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      dateStr = arg;
    } else if (!title) {
      title = arg;
    }
  }

  return { dateStr, title };
}

function main() {
  const { dateStr, title } = parseArgs();
  const [year, month, day] = dateStr.split("-");

  const targetDir = path.join(process.cwd(), "learning", year, month);
  const targetFile = path.join(targetDir, `${day}.md`);
  const templatePath = path.join(process.cwd(), "templates", "daily_learning_template.md");

  if (fs.existsSync(targetFile)) {
    console.log(`⚠️  Note already exists at: ${path.relative(process.cwd(), targetFile)}`);
    console.log("To avoid losing progress, this file was not overwritten.");
    return;
  }

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found at: ${templatePath}`);
    process.exit(1);
  }

  let templateContent = fs.readFileSync(templatePath, "utf8");
  templateContent = templateContent.replace(/date: YYYY-MM-DD/, `date: ${dateStr}`);
  
  if (title) {
    templateContent = templateContent.replace(/title: "Today's Learning Title"/, `title: "${title}"`);
    templateContent = templateContent.replace(/# Today's Learning Title/, `# ${title}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, templateContent, "utf8");

  const relativePath = path.relative(process.cwd(), targetFile).split(path.sep).join("/");
  console.log(`✅ Created daily learning note: ${relativePath}`);
  console.log(`👉 Open it up, fill in today's details, and run "npm run build" when ready!`);
}

main();
