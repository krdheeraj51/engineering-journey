// window.WeekSelector = (() => {
//   function init({ onPrevious, onNext, onToday }) {
//     document.getElementById("prev-week").addEventListener("click", onPrevious);
//     document.getElementById("next-week").addEventListener("click", onNext);
//     document.getElementById("today").addEventListener("click", onToday);
//   }

//   return { init };
// })();

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
    availableCount
  }) {

    const range =
      document.getElementById("week-range");

    const count =
      document.getElementById("week-entry-count");


    range.textContent =
      `${formatDate(startDate)} to ${formatDate(endDate)}`;


    count.textContent =
      `${availableCount} learning date${
        availableCount === 1 ? "" : "s"
      } available`;
  }


  function formatDate(value) {

    return DateUtils
      .parseDate(value)
      .toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

  }


  return {
    init,
    render
  };

})();