# Engineering Journey

**Learn • Build • Reflect • Evolve**

A GitHub Pages learning system for documenting my engineering journey across:

- AI / Generative AI
- Machine Learning
- Backend Engineering
- Databases
- Cloud
- DevOps
- System Design
- Architecture
- Certifications
- Projects
- Experiments

## Architecture

```text
Markdown = Knowledge
Manifest = Index
JavaScript = Website Logic
GitHub Actions = Automation
GitHub Pages = Presentation
```

## Repository structure

```text
engineering-journey/
├── learning/
│   └── YYYY/
│       └── MM/
│           └── DD.md
├── data/
│   └── manifest.json
├── js/
│   ├── app.js
│   ├── config/
│   ├── services/
│   ├── learning/
│   ├── ui/
│   └── utils/
├── css/
├── scripts/
├── .github/
│   └── workflows/
├── index.html
└── package.json
```

## Daily workflow

Create a new Markdown file:

```text
learning/2026/09/21.md
```

Use this template:

```markdown
---
date: 2026-09-21
title: What I Learned Today
topics: [Topic A, Topic B]
category: AI
status: completed
---

# What I Learned Today

## 🎯 Today's Focus

## 📚 What I Learned

## 💻 What I Built

## 💡 Key Takeaways

## ⚠️ What I Still Need To Learn

## 🔗 Resources

## 🔄 Revision Notes
```

Then commit and push:

```bash
git add .
git commit -m "docs: add learning note for 2026-09-21"
git push
```

GitHub Actions automatically regenerates `data/manifest.json`.

## Local development

Generate the manifest:

```bash
npm run build
```

For the website itself, use a local static server rather than opening `index.html` directly because browser `fetch()` requests can be blocked by `file://` restrictions.

For example, with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Future roadmap

- Topic dashboard
- Full-text search
- Monthly learning statistics
- Revision mode
- Knowledge notes
- Project pages
- Certification tracker
- Architecture decision records
- Learning streak
- Cross-links between daily notes and permanent knowledge
