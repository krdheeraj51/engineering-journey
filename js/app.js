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

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    try {
      const manifest = await ManifestService.load();

      entries = [...manifest.entries]
        .sort((a, b) => b.date.localeCompare(a.date));

      if (!entries.length) {
        renderEmpty();
        return;
      }

      // Use today's entry if available.
      // Otherwise use the latest available learning entry.
      selectedDate = chooseInitialDate();

      // Engineering Journey week:
      // Sunday -> Saturday
      weekStart = getWeekStart(selectedDate);

      bindControls();

      renderList();
      renderTopics();
      renderWeek();
      renderSelected();

    } catch (error) {
      LearningRenderer.renderError(
        elements.content,
        error.message
      );
    }
  }

  function chooseInitialDate() {
    const today = DateUtils.today();

    return (
      ManifestService.findByDate(today)?.date ||
      entries[0].date
    );
  }

  /*
   * Bind UI controls.
   */
  function bindControls() {

    // Learning date dropdown
    DateSelector.init(date => {
      selectDate(date);
    });

    // Previous / Next week
    WeekSelector.init({
      onPrevious: () => moveWeek(-1),
      onNext: () => moveWeek(1)
    });

    // Search
    elements.search.addEventListener(
      "input",
      renderList
    );
  }

  /*
   * Get Sunday of the selected week.
   *
   * Example:
   * 20 Sep 2026 = Sunday
   *
   * Week:
   * 20 Sep -> 26 Sep
   */
  function getWeekStart(dateString) {
    const date = DateUtils.parseDate(dateString);

    const day = date.getDay();

    // Sunday = 0
    date.setDate(
      date.getDate() - day
    );

    return DateUtils.formatISO(date);
  }

  /*
   * Get Saturday of a week.
   */
  function getWeekEnd(startDate) {
    return DateUtils.addDays(
      startDate,
      6
    );
  }

  /*
   * Get learning entries belonging
   * to the currently selected week.
   */
  function getWeekEntries() {
    const weekEnd =
      getWeekEnd(weekStart);

    return entries
      .filter(entry =>
        entry.date >= weekStart &&
        entry.date <= weekEnd
      )
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );
  }

  /*
   * Check whether a specific week
   * contains at least one learning entry.
   */
  function hasEntriesInWeek(startDate) {
    const endDate =
      getWeekEnd(startDate);

    return entries.some(entry =>
      entry.date >= startDate &&
      entry.date <= endDate
    );
  }

  /*
   * Navigate to another week.
   *
   * IMPORTANT:
   * We only allow navigation when
   * that week exists in the manifest.
   */
  function moveWeek(amount) {

    const targetWeek =
      DateUtils.addWeeks(
        weekStart,
        amount
      );

    // Don't navigate to an empty week.
    if (!hasEntriesInWeek(targetWeek)) {
      return;
    }

    weekStart = targetWeek;

    const weekEntries =
      getWeekEntries();

    // Select the first available learning
    // date in the new week.
    selectedDate =
      weekEntries.length
        ? weekEntries[0].date
        : null;

    activeTopic = null;

    renderWeek();
    renderList();

    if (selectedDate) {
      renderSelected();
    }
  }

  /*
   * Select a learning date.
   *
   * This is called from:
   * - Date dropdown
   * - Timeline
   */
  function selectDate(date) {

    const entry =
      ManifestService.findByDate(date);

    // Ignore dates that aren't in manifest.
    if (!entry) {
      return;
    }

    selectedDate = entry.date;

    // Update week according to selected date.
    weekStart =
      getWeekStart(selectedDate);

    activeTopic = null;

    renderWeek();
    renderList();
    renderSelected();
  }

  /*
   * Render:
   *
   * - Week range
   * - Number of learning dates
   * - Previous button state
   * - Next button state
   * - Date dropdown
   */
  function renderWeek() {

    const weekEntries =
      getWeekEntries();

    const previousWeek =
      DateUtils.addWeeks(
        weekStart,
        -1
      );

    const nextWeek =
      DateUtils.addWeeks(
        weekStart,
        1
      );

    /*
     * Check adjacent weeks.
     */
    const previousAvailable =
      hasEntriesInWeek(
        previousWeek
      );

    const nextAvailable =
      hasEntriesInWeek(
        nextWeek
      );

    /*
     * Make sure selectedDate
     * belongs to current week.
     */
    if (
      !weekEntries.some(
        entry =>
          entry.date === selectedDate
      )
    ) {

      selectedDate =
        weekEntries.length
          ? weekEntries[0].date
          : null;
    }

    /*
     * Update week selector.
     */
    WeekSelector.render({
      startDate: weekStart,

      endDate:
        getWeekEnd(weekStart),

      availableCount:
        weekEntries.length,

      previousAvailable,

      nextAvailable
    });

    /*
     * Populate date dropdown.
     */
    DateSelector.render(
      weekEntries,
      selectedDate
    );

    /*
     * Update timeline month.
     */
    const monthDate =
      selectedDate || weekStart;

    document
      .getElementById("current-month")
      .textContent =
        DateUtils.monthYear(monthDate);
  }

  /*
   * Load and render selected Markdown note.
   */
  async function renderSelected() {

    const entry =
      ManifestService.findByDate(
        selectedDate
      );

    if (!entry) {

      elements.content.innerHTML = `
        <div class="empty-state">

          <div class="empty-icon">
            📖
          </div>

          <h2>
            No learning entry for this date
          </h2>

          <p>
            Select a learning date from
            the dropdown.
          </p>

        </div>
      `;

      return;
    }

    DateSelector.set(
      entry.date
    );

    LearningMeta.update(
      entry.date,
      entries.length
    );

    elements.content.innerHTML = `
      <div class="loading-state">
        Loading ${escapeHtml(entry.title)}...
      </div>
    `;

    try {

      const raw =
        await LearningService.load(entry);

      LearningRenderer.render(
        elements.content,
        entry,
        raw
      );

      highlightSelected();

    } catch (error) {

      LearningRenderer.renderError(
        elements.content,
        error.message
      );

    }
  }

  /*
   * Render left-side learning timeline.
   */
  function renderList() {

    const query =
      elements.search.value
        .trim()
        .toLowerCase();

    const filtered =
      entries.filter(entry => {

        const searchable = [
          entry.title,
          entry.date,
          entry.category,
          ...(entry.topics || [])
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchable.includes(query);

        const matchesTopic =
          !activeTopic ||
          (entry.topics || [])
            .includes(activeTopic);

        return (
          matchesSearch &&
          matchesTopic
        );
      });

    elements.list.innerHTML =
      filtered.length

        ? filtered
            .map(entry => `
              <button
                class="entry-item ${
                  entry.date === selectedDate
                    ? "selected"
                    : ""
                }"
                data-date="${entry.date}"
              >

                <span class="entry-date">
                  ${DateUtils.formatShort(
                    entry.date
                  )}
                </span>

                <strong>
                  ${escapeHtml(
                    entry.title
                  )}
                </strong>

                <small>
                  ${escapeHtml(
                    entry.category ||
                    "Engineering"
                  )}
                </small>

              </button>
            `)
            .join("")

        : `
            <p class="muted">
              No matching learning entries.
            </p>
          `;

    elements.list
      .querySelectorAll(".entry-item")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            selectDate(
              button.dataset.date
            )
        );

      });
  }

  /*
   * Render topic filters.
   */
  function renderTopics() {

    const topics =
      ManifestService.getTopics();

    elements.topics.innerHTML =
      topics.length

        ? `
          <button
            class="topic-button ${
              !activeTopic
                ? "active"
                : ""
            }"
            data-topic=""
          >
            All topics
          </button>

          ${topics
            .map(topic => `
              <button
                class="topic-button"
                data-topic="${escapeHtml(
                  topic
                )}"
              >
                ${escapeHtml(topic)}
              </button>
            `)
            .join("")}
        `

        : `
            <p class="muted">
              Topics will appear here.
            </p>
          `;

    elements.topics
      .querySelectorAll(".topic-button")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            activeTopic =
              button.dataset.topic ||
              null;

            renderTopics();
            renderList();

          }
        );

      });
  }

  /*
   * Highlight selected timeline entry.
   */
  function highlightSelected() {

    elements.list
      .querySelectorAll(".entry-item")
      .forEach(button => {

        button.classList.toggle(
          "selected",
          button.dataset.date ===
            selectedDate
        );

      });
  }

  /*
   * Empty repository state.
   */
  function renderEmpty() {

    elements.list.innerHTML = `
      <p class="muted">
        No learning entries yet.
      </p>
    `;

    elements.content.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          🚀
        </div>

        <h2>
          Your journey starts here
        </h2>

        <p>
          Create your first file under
          <code>
            learning/YYYY/MM/DD.md
          </code>.
        </p>

      </div>
    `;
  }

  /*
   * Prevent metadata/content from
   * accidentally becoming HTML.
   */
  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }

})();