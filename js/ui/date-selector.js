window.DateSelector = (() => {
  function init(onChange) {
    const picker = document.getElementById("date-picker");

    if (!picker) {
      throw new Error('Date selector element "#date-picker" was not found.');
    }

    picker.addEventListener("change", event => {
      if (event.target.value) {
        onChange(event.target.value);
      }
    });
  }

  function render(entries, selectedDate) {
    const picker = document.getElementById("date-picker");

    if (!picker) {
      throw new Error('Date selector element "#date-picker" was not found.');
    }

    if (!entries.length) {
      picker.innerHTML = `
        <option value="">No learning dates available</option>
      `;
      picker.disabled = true;
      return;
    }

    picker.disabled = false;

    picker.innerHTML = entries.map(entry => {
      const date = DateUtils.parseDate(entry.date);

      const formattedDate = date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      return `
        <option value="${entry.date}">
          ${formattedDate} — ${escapeHtml(entry.title)}
        </option>
      `;
    }).join("");

    // Set after innerHTML so the selected option is deterministic.
    picker.value = selectedDate || entries[0].date;
  }

  function set(value) {
    const picker = document.getElementById("date-picker");

    if (picker && value) {
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

  return { init, render, set };
})();
