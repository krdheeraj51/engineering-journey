window.LearningService = (() => {
  async function load(entry) {
    if (!entry?.path) throw new Error("Learning entry path is missing.");

    const response = await fetch(entry.path, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load learning note: ${response.status}`);
    }

    return response.text();
  }

  return { load };
})();
