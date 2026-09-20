window.DateUtils = (() => {
  function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDays(value, amount) {
    const date = typeof value === "string" ? parseDate(value) : new Date(value);
    date.setDate(date.getDate() + amount);
    return formatISO(date);
  }

  function addWeeks(value, amount) {
    return addDays(value, amount * 7);
  }

  function today() {
    return formatISO(new Date());
  }

  function formatLong(value) {
    return parseDate(value).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function formatShort(value) {
    return parseDate(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function monthYear(value) {
    return parseDate(value).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });
  }

  return { parseDate, formatISO, addDays, addWeeks, today, formatLong, formatShort, monthYear };
})();
