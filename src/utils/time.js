// Times on both calendars are kept as minutes from midnight and turned into percentages only when drawn.
export const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fmtTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// Where a time falls between the start and the end of a day view, from 0 to 100.
export const toPct = (t, from, to) => ((toMinutes(t) - from) / (to - from)) * 100;
// Minutes of overlap between two blocks given as { from, to } strings.
export const overlap = (a, b) => Math.max(0, Math.min(toMinutes(a.to), toMinutes(b.to)) - Math.max(toMinutes(a.from), toMinutes(b.from)));
