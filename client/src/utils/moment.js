// Dates and moments from the API, shown the Vietnamese way.
export const vnDate = (iso) => iso.slice(0, 10).split('-').reverse().join('/');

// "2026-10-20T09:40:00+07:00" → "09:40, 20/10/2026", in the studio's own time as the API wrote it.
export function formatMoment(iso) {
  return `${iso.slice(11, 16)}, ${vnDate(iso)}`;
}
