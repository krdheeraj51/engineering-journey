window.DateSelector = (() => {

  function init(onChange) {

    const picker =
      document.getElementById("date-picker");

    picker.addEventListener("change", event => {

      if (event.target.value) {
        onChange(event.target.value);
      }

    });
  }


  function render(entries, selectedDate) {

    const picker =
      document.getElementById("date-picker");


    /*
     * No learning entries in this week.
     */
    if (!entries.length) {

      picker.innerHTML = `
        <option value="">
          No learning dates available
        </option>
      `;

      picker.disabled = true;

      return;
    }


    picker.disabled = false;


    /*
     * Create one option for every
     * learning entry in the current week.
     */
    picker.innerHTML = entries
      .map(entry => {

        const date =
          DateUtils.parseDate(entry.date);

        const formattedDate =
          date.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });

        return `
          <option
            value="${entry.date}"
            ${entry.date === selectedDate
              ? "selected"
              : ""}
          >
            ${formattedDate} — ${escapeHtml(
              entry.title
            )}
          </option>
        `;

      })
      .join("");


    /*
     * Explicitly select the current date.
     */
    if (selectedDate) {
      picker.value = selectedDate;
    }
  }


  function set(value) {

    const picker =
      document.getElementById("date-picker");

    if (value) {
      picker.value = value;
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


  return {
    init,
    render,
    set
  };

})();