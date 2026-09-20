window.DateSelector = (() => {
  function init(onChange) {
    const picker = document.getElementById("date-picker");

    picker.addEventListener("change", event => {
      if (event.target.value) onChange(event.target.value);
    });
  }

  function set(value) {
    document.getElementById("date-picker").value = value;
  }

  return { init, set };
})();
