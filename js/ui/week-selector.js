window.WeekSelector = (() => {
  function init({ onPrevious, onNext }) {
    const previousButton = document.getElementById("prev-week");
    const nextButton = document.getElementById("next-week");

    if (!previousButton) {
      throw new Error('Week selector element "#prev-week" was not found.');
    }

    if (!nextButton) {
      throw new Error('Week selector element "#next-week" was not found.');
    }

    previousButton.addEventListener("click", onPrevious);
    nextButton.addEventListener("click", onNext);
  }

  function render({
    startDate,
    endDate,
    availableCount,
    previousAvailable,
    nextAvailable
  }) {
    const range = document.getElementById("week-range");
    const count = document.getElementById("week-entry-count");
    const previousButton = document.getElementById("prev-week");
    const nextButton = document.getElementById("next-week");

    range.textContent =
      `${formatDate(startDate)} to ${formatDate(endDate)}`;

    count.textContent =
      `${availableCount} learning date${availableCount === 1 ? "" : "s"} available`;

    previousButton.disabled = !previousAvailable;
    nextButton.disabled = !nextAvailable;

    // Accessibility
    previousButton.setAttribute("aria-disabled", String(!previousAvailable));
    nextButton.setAttribute("aria-disabled", String(!nextAvailable));
  }

  function formatDate(value) {
    return DateUtils.parseDate(value).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  return { init, render };
})();
