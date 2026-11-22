// Date helpers in studio time (Asia/Ho_Chi_Minh), matching YYYY-MM-DD and dd/MM/yyyy conventions.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function isValidIsoDate(iso) {
  if (typeof iso !== 'string' || !ISO_DATE.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function parseIsoDate(iso) {
  if (!isValidIsoDate(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m, day: d };
}

export function formatIsoDate(year, month, day) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function addDays(iso, delta) {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + delta));
  return formatIsoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function addMonths(iso, delta) {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const target = new Date(Date.UTC(parts.year, parts.month - 1 + delta, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(parts.day, lastDay);
  return formatIsoDate(target.getUTCFullYear(), target.getUTCMonth() + 1, day);
}

// Returns Monday (YYYY-MM-DD) of the week containing `iso`.
export function startOfWeekMonday(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const dow = dt.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(iso, diff);
}

export function weekDates(iso) {
  const start = startOfWeekMonday(iso);
  return WEEKDAY_SHORT.map((dow, index) => {
    const date = addDays(start, index);
    return { date, dow, dayNum: Number(date.slice(8, 10)) };
  });
}

// 42 cells (6 rows x 7 cols, Monday first) covering the month of `iso`.
export function monthGridDates(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return [];
  const firstOfMonth = formatIsoDate(parts.year, parts.month, 1);
  const start = startOfWeekMonday(firstOfMonth);
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(start, i);
    const month = Number(date.slice(5, 7));
    cells.push({
      date,
      dayNum: Number(date.slice(8, 10)),
      inMonth: month === parts.month,
    });
  }
  return cells;
}

export function vnWeekday(iso) {
  const parts = parseIsoDate(iso);
  if (!parts) return '';
  const dt = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return WEEKDAYS[dt.getUTCDay()];
}

export function vnShortDate(iso) {
  if (!isValidIsoDate(iso)) return iso || '';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function vnDateLong(iso) {
  if (!isValidIsoDate(iso)) return iso || '';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

export function vnWeekdayAndDate(iso) {
  if (!isValidIsoDate(iso)) return iso || '';
  return `${vnWeekday(iso)} ${vnDateLong(iso)}`;
}

export function vnPeriodTitle(iso, view) {
  if (!isValidIsoDate(iso)) return '';
  if (view === 'week') {
    const days = weekDates(iso);
    const first = days[0].date;
    const last = days[6].date;
    if (first.slice(0, 7) === last.slice(0, 7)) {
      return `Tuần ${first.slice(8, 10)}–${vnDateLong(last)}`;
    }
    return `Tuần ${vnShortDate(first)}–${vnDateLong(last)}`;
  }
  if (view === 'month') {
    const m = Number(iso.slice(5, 7));
    const y = iso.slice(0, 4);
    return `Tháng ${m}, ${y}`;
  }
  return `${vnWeekday(iso)}, ${vnDateLong(iso)}`;
}

export function todayStudioIso() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const d = parts.find((p) => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

export function formatConvListTime(iso, refDate) {
  if (!iso) return '';
  const datePart = iso.slice(0, 10);
  const timePart = iso.slice(11, 16);
  if (refDate && datePart === refDate) return timePart;
  if (refDate && addDays(refDate, -1) === datePart) return 'Hôm qua';
  return vnShortDate(datePart);
}

export function formatChatSeparator(iso, includeDate) {
  if (!iso) return '';
  const timePart = iso.slice(11, 16);
  return includeDate ? `${timePart} · ${vnDateLong(iso.slice(0, 10))}` : timePart;
}
