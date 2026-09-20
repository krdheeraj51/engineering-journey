window.LearningRenderer = (() => {
  function render(container, entry, raw) {
    const parsed = LearningParser.parse(raw);
    const meta = parsed.frontMatter;

    const topics = Array.isArray(meta.topics)
      ? meta.topics
      : meta.topics
        ? [meta.topics]
        : (entry.topics || []);

    const markdownHtml = marked.parse(parsed.markdown);

    container.innerHTML = `
      <div class="learning-header">
        <div>
          <p class="eyebrow">${escapeHtml(meta.category || entry.category || "Engineering")}</p>
          <h1>${escapeHtml(meta.title || entry.title || "Learning Note")}</h1>
          <p class="learning-date">${DateUtils.formatLong(entry.date)}</p>
        </div>
        <div class="status-badge">${escapeHtml(meta.status || entry.status || "learning")}</div>
      </div>

      <div class="topic-chips">
        ${topics.map(topic => `<span>${escapeHtml(topic)}</span>`).join("")}
      </div>

      <div class="markdown-body">
        ${markdownHtml}
      </div>

      <div class="note-footer">
        <span>📅 ${escapeHtml(entry.date)}</span>
        <span>📚 ${topics.length} topic${topics.length === 1 ? "" : "s"}</span>
      </div>
    `;

    container.querySelectorAll("a").forEach(link => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  function renderError(container, message) {
    container.innerHTML = `
      <div class="error-state">
        <h2>Unable to load this learning note</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return { render, renderError };
})();
