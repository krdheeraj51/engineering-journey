window.WeekSelector = (() => {
  function init({ onPrevious, onNext, onToday }) {
    document.getElementById("prev-week").addEventListener("click", onPrevious);
    document.getElementById("next-week").addEventListener("click", onNext);
    document.getElementById("today").addEventListener("click", onToday);
  }

  return { init };
})();
