(() => {
  let entries = [];
  let selectedDate = null;
  let activeTopic = null;

  const elements = {
    content: document.getElementById("learning-content"),
    list: document.getElementById("entry-list"),
    search: document.getElementById("search-input"),
    topics: document.getElementById("topic-list")
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      const manifest = await ManifestService.load();
      entries = [...manifest.entries].sort((a, b) => b.date.localeCompare(a.date));

      if (!entries.length) {
        renderEmpty();
        return;
      }

      selectedDate = chooseInitialDate();
      bindControls();
      renderList();
      renderTopics();
      renderSelected();
    } catch (error) {
      LearningRenderer.renderError(elements.content, error.message);
    }
  }

  function chooseInitialDate() {
    const today = DateUtils.today();
    return ManifestService.findByDate(today)?.date || entries[0].date;
  }

  function bindControls() {
    DateSelector.init(date => selectDate(date));

    WeekSelector.init({
      onPrevious: () => selectDate(DateUtils.addWeeks(selectedDate, -1)),
      onNext: () => selectDate(DateUtils.addWeeks(selectedDate, 1)),
      onToday: () => selectDate(chooseInitialDate())
    });

    document.getElementById("prev-day").addEventListener("click", () => {
      selectNearest(DateUtils.addDays(selectedDate, -1), -1);
    });

    document.getElementById("next-day").addEventListener("click", () => {
      selectNearest(DateUtils.addDays(selectedDate, 1), 1);
    });

    elements.search.addEventListener("input", renderList);
  }

  function selectNearest(date, direction) {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const candidates = direction < 0
      ? sorted.filter(entry => entry.date < date).reverse()
      : sorted.filter(entry => entry.date > date);

    if (candidates.length) selectDate(candidates[0].date);
  }

  function selectDate(date) {
    const entry = ManifestService.findByDate(date);

    if (entry) {
      selectedDate = entry.date;
      activeTopic = null;
      DateSelector.set(selectedDate);
      renderList();
      renderSelected();
    } else {
      selectedDate = date;
      DateSelector.set(date);
      renderList();
      elements.content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📖</div>
          <h2>No learning entry for this date</h2>
          <p>There is no Markdown note for <strong>${date}</strong> yet.</p>
        </div>
      `;
    }

    document.getElementById("current-month").textContent = DateUtils.monthYear(date);
  }

  async function renderSelected() {
    const entry = ManifestService.findByDate(selectedDate);
    if (!entry) return;

    DateSelector.set(entry.date);
    LearningMeta.update(entry.date, entries.length);

    elements.content.innerHTML = `<div class="loading-state">Loading ${entry.title}...</div>`;

    try {
      const raw = await LearningService.load(entry);
      LearningRenderer.render(elements.content, entry, raw);
      highlightSelected();
    } catch (error) {
      LearningRenderer.renderError(elements.content, error.message);
    }
  }

  function renderList() {
    const query = elements.search.value.trim().toLowerCase();

    const filtered = entries.filter(entry => {
      const searchable = [
        entry.title,
        entry.date,
        entry.category,
        ...(entry.topics || [])
      ].join(" ").toLowerCase();

      const matchesSearch = !query || searchable.includes(query);
      const matchesTopic = !activeTopic || (entry.topics || []).includes(activeTopic);

      return matchesSearch && matchesTopic;
    });

    elements.list.innerHTML = filtered.length
      ? filtered.map(entry => `
          <button class="entry-item ${entry.date === selectedDate ? "selected" : ""}" data-date="${entry.date}">
            <span class="entry-date">${DateUtils.formatShort(entry.date)}</span>
            <strong>${escapeHtml(entry.title)}</strong>
            <small>${escapeHtml(entry.category || "Engineering")}</small>
          </button>
        `).join("")
      : `<p class="muted">No matching learning entries.</p>`;

    elements.list.querySelectorAll(".entry-item").forEach(button => {
      button.addEventListener("click", () => selectDate(button.dataset.date));
    });
  }

  function renderTopics() {
    const topics = ManifestService.getTopics();

    elements.topics.innerHTML = topics.length
      ? `
        <button class="topic-button ${!activeTopic ? "active" : ""}" data-topic="">All topics</button>
        ${topics.map(topic => `
          <button class="topic-button" data-topic="${escapeHtml(topic)}">${escapeHtml(topic)}</button>
        `).join("")}
      `
      : `<p class="muted">Topics will appear here.</p>`;

    elements.topics.querySelectorAll(".topic-button").forEach(button => {
      button.addEventListener("click", () => {
        activeTopic = button.dataset.topic || null;
        renderTopics();
        renderList();
      });
    });
  }

  function highlightSelected() {
    elements.list.querySelectorAll(".entry-item").forEach(button => {
      button.classList.toggle("selected", button.dataset.date === selectedDate);
    });
  }

  function renderEmpty() {
    elements.list.innerHTML = `<p class="muted">No learning entries yet.</p>`;
    elements.content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚀</div>
        <h2>Your journey starts here</h2>
        <p>Create your first file under <code>learning/YYYY/MM/DD.md</code>.</p>
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
})();
