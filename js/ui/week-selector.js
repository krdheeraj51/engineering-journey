window.WeekSelector = (() => {

  function init({
    onPrevious,
    onNext
  }) {

    document
      .getElementById("prev-week")
      .addEventListener(
        "click",
        onPrevious
      );

    document
      .getElementById("next-week")
      .addEventListener(
        "click",
        onNext
      );
  }


  function render({
    startDate,
    endDate,
    availableCount,
    previousAvailable,
    nextAvailable
  }) {

    const range =
      document.getElementById(
        "week-range"
      );

    const count =
      document.getElementById(
        "week-entry-count"
      );

    const previousButton =
      document.getElementById(
        "prev-week"
      );

    const nextButton =
      document.getElementById(
        "next-week"
      );


    /*
     * Week range
     */
    range.textContent =
      `${formatDate(startDate)} to ${formatDate(endDate)}`;


    /*
     * Number of learning dates
     */
    count.textContent =
      `${availableCount} learning date${
        availableCount === 1
          ? ""
          : "s"
      } available`;


    /*
     * Previous week
     */
    previousButton.disabled =
      !previousAvailable;


    /*
     * Next week
     */
    nextButton.disabled =
      !nextAvailable;

  }


  function formatDate(value) {

    return DateUtils
      .parseDate(value)
      .toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );

  }


  return {
    init,
    render
  };

})();