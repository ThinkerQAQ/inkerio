// Pure route expansion; used by Astro's catch-all renderer and regression tests.
export function expandLegacyRoutes(redirects, notes, pageSize, noteHref) {
  const routes = new Map();
  const add = (from, to) => {
    if (from === to) throw new Error(`Legacy redirect loops to itself: ${from}`);
    if (routes.has(from)) throw new Error(`Duplicate generated legacy URL: ${from}`);
    routes.set(from, to);
  };
  for (const entry of redirects.exact) add(entry.from, entry.to);
  for (const entry of redirects.notePrefixes) {
    for (const note of notes.filter(n => n.id.startsWith(entry.noteIdPrefix))) {
      const suffix = note.id.slice(entry.noteIdPrefix.length);
      if (suffix) add(`${entry.from}${suffix}/`, noteHref(note));
    }
  }
  for (const entry of redirects.categoryArchives) {
    add(entry.from, entry.to);
    const members = notes.filter(n => n.id.startsWith(entry.noteIdPrefix));
    if (entry.includeTopics) {
      const topics = new Set(members.map(n => n.id.slice(entry.noteIdPrefix.length).split('/')[0]).filter(Boolean));
      for (const topic of topics) add(`${entry.from}topic/${topic}/`, entry.to);
    }
    if (entry.includePages) {
      for (let page = 2; page <= Math.ceil(members.length / pageSize); page++) {
        add(`${entry.from}page/${page}/`, entry.to);
      }
    }
  }
  return [...routes].map(([from, to]) => ({ from, to }));
}

export function isLegacyRoute(pathname, redirects) {
  return redirects.exact.some(entry => entry.from === pathname)
    || redirects.notePrefixes.some(entry => pathname.startsWith(entry.from))
    || redirects.categoryArchives.some(entry => pathname.startsWith(entry.from));
}
