window.ManifestService = (() => {
  let manifest = null;

  async function load() {
    const response = await fetch(window.ENGINEERING_JOURNEY_CONFIG.manifestPath, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Unable to load manifest: ${response.status}`);
    }

    manifest = await response.json();
    return manifest;
  }

  function get() {
    return manifest;
  }

  function findByDate(date) {
    return manifest?.entries?.find(entry => entry.date === date) || null;
  }

  function getEntries() {
    return manifest?.entries || [];
  }

  function getTopics() {
    const topics = new Set();
    getEntries().forEach(entry => {
      (entry.topics || []).forEach(topic => topics.add(topic));
    });
    return [...topics].sort((a, b) => a.localeCompare(b));
  }

  return { load, get, findByDate, getEntries, getTopics };
})();
