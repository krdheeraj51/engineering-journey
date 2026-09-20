(() => {
  let entries = [];
  let selectedDate = null;
  let activeTopic = null;
  let weekStart = null;

  const elements = {
    content: document.getElementById("learning-content"),
    list: document.getElementById("entry-list"),
    search: document.getElementById("search-input"),
    topics: document.getElementById("topic-list")
  };

  // The script is loaded at the bottom of index.html, but this also works
  // if the script is moved to <head> later.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  async function init() {
    try {
      const manifest = await ManifestService.load();

      entries = Array.isArray(manifest.entries)
        ? [...manifest.entries].sort((a, b) => b.date.localeCompare(a.date))
        : [];

      if (!entries.length) {
        renderEmpty();
        return;
      }

      selectedDate = chooseInitialDate();
      weekStart = getWeekStart(selectedDate);

      bindControls();
      renderList();
      renderTopics();
      renderWeek();
      await renderSelected();

    } catch (error) {
      console.error("Engineering Journey initialization failed:", error);
      renderFatalError(error);
    }
  }

  function chooseInitialDate() {
    const today = DateUtils.today();
    return ManifestService.findByDate(today)?.date || entries[0].date;
  }

  function bindControls() {
    DateSelector.init(selectDate);

    WeekSelector.init({
      onPrevious: () => moveWeek(-1),
      onNext: () => moveWeek(1)
    });

    if (elements.search) {
      elements.search.addEventListener("input", renderList);
    }
  }

  // Sunday -> Saturday, matching the Quiz application's week display.
  function getWeekStart(dateString) {
    const date = DateUtils.parseDate(dateString);
    date.setDate(date.getDate() - date.getDay());
    return DateUtils.formatISO(date);
  }

  function getWeekEnd(startDate) {
    return DateUtils.addDays(startDate, 6);
  }

  function getWeekEntries() {
    const weekEnd = getWeekEnd(weekStart);

    return entries
      .filter(entry => entry.date >= weekStart && entry.date <= weekEnd)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function hasEntriesInWeek(startDate) {
    const endDate = getWeekEnd(startDate);

    return entries.some(entry =>
      entry.date >= startDate && entry.date <= endDate
    );
  }

  function moveWeek(amount) {
    const targetWeek = DateUtils.addWeeks(weekStart, amount);

    // Never navigate into an empty week.
    if (!hasEntriesInWeek(targetWeek)) {
      return;
    }

    weekStart = targetWeek;

    const weekEntries = getWeekEntries();
    selectedDate = weekEntries.length ? weekEntries[0].date : null;
    activeTopic = null;

    renderWeek();
    renderList();

    if (selectedDate) {
      renderSelected();
    }
  }

  function selectDate(date) {
    const entry = ManifestService.findByDate(date);

    if (!entry) {
      return;
    }

    selectedDate = entry.date;
    weekStart = getWeekStart(selectedDate);
    activeTopic = null;

    renderWeek();
    renderList();
    renderSelected();
  }

  function renderWeek() {
    const weekEntries = getWeekEntries();

    const previousWeek = DateUtils.addWeeks(weekStart, -1);
    const nextWeek = DateUtils.addWeeks(weekStart, 1);

    const previousAvailable = hasEntriesInWeek(previousWeek);
    const nextAvailable = hasEntriesInWeek(nextWeek);

    if (!weekEntries.some(entry => entry.date === selectedDate)) {
      selectedDate = weekEntries.length ? weekEntries[0].date : null;
    }

    WeekSelector.render({
      startDate: weekStart,
      endDate: getWeekEnd(weekStart),
      availableCount: weekEntries.length,
      previousAvailable,
      nextAvailable
    });

    DateSelector.render(weekEntries, selectedDate);

    const monthDate = selectedDate || weekStart;
    const monthElement = document.getElementById("current-month");

    if (monthElement) {
      monthElement.textContent = DateUtils.monthYear(monthDate);
    }
  }

  async function renderSelected() {
    const entry = ManifestService.findByDate(selectedDate);

    if (!entry) {
      elements.content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📖</div>
          <h2>No learning entry for this date</h2>
          <p>Select a learning date from the dropdown.</p>
        </div>
      `;
      return;
    }

    DateSelector.set(entry.date);
    LearningMeta.update(entry.date, entries.length);

    elements.content.innerHTML = `
      <div class="loading-state">
        Loading ${escapeHtml(entry.title)}...
      </div>
    `;

    try {
      const raw = await LearningService.load(entry);
      LearningRenderer.render(elements.content, entry, raw);
      highlightSelected();
    } catch (error) {
      console.error("Unable to render learning note:", error);
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
          <button
            class="entry-item ${entry.date === selectedDate ? "selected" : ""}"
            data-date="${entry.date}"
          >
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
        <button class="topic-button ${!activeTopic ? "active" : ""}" data-topic="">
          All topics
        </button>
        ${topics.map(topic => `
          <button class="topic-button" data-topic="${escapeHtml(topic)}">
            ${escapeHtml(topic)}
          </button>
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

  function renderFatalError(error) {
    const message = error?.message || String(error);

    if (elements.content) {
      elements.content.innerHTML = `
        <div class="error-state">
          <h2>Engineering Journey could not load</h2>
          <p>${escapeHtml(message)}</p>
          <p class="muted">
            Open the browser console for the technical error.
          </p>
        </div>
      `;
    }
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
