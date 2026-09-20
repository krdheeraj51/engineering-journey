window.LearningMeta = (() => {
  function update(date, count) {
    document.getElementById("learning-count").textContent = count;
    document.getElementById("current-month").textContent = DateUtils.monthYear(date);
  }

  return { update };
})();
