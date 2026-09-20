window.LearningParser = (() => {
  function parse(raw) {
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

    if (!match) {
      return {
        frontMatter: {},
        markdown: raw
      };
    }

    return {
      frontMatter: parseFrontMatter(match[1]),
      markdown: match[2]
    };
  }

  function parseFrontMatter(text) {
    const data = {};

    text.split(/\r?\n/).forEach(line => {
      const separator = line.indexOf(":");
      if (separator === -1) return;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();

      if (value.startsWith("[") && value.endsWith("]")) {
        value = value
          .slice(1, -1)
          .split(",")
          .map(item => item.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
      } else {
        value = value.replace(/^['"]|['"]$/g, "");
      }

      data[key] = value;
    });

    return data;
  }

  return { parse };
})();
