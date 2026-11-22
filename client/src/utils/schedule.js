import { fmtTime, toMinutes } from './time.js';

// Assigns non-overlapping visual lanes for blocks within a single resource row.
export function assignLanes(blocks) {
  const sorted = [...blocks].sort((a, b) => {
    const diff = toMinutes(a.from) - toMinutes(b.from);
    return diff !== 0 ? diff : toMinutes(a.to) - toMinutes(b.to);
  });
  const ends = [];
  const placed = sorted.map((block) => {
    const from = toMinutes(block.from);
    let lane = ends.findIndex((end) => end <= from);
    if (lane < 0) lane = ends.length;
    ends[lane] = toMinutes(block.to);
    return { ...block, lane };
  });
  return {
    blocks: placed,
    laneCount: Math.max(1, ends.length),
  };
}

export function addMinutesToTime(hhmm, deltaMinutes) {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  const total = Math.max(0, Math.min(23 * 60 + 59, toMinutes(hhmm) + deltaMinutes));
  return fmtTime(total);
}

export function buildTimeOptions(startHour = 8, endHour = 18, stepMinutes = 60) {
  const options = [];
  for (let m = startHour * 60; m <= endHour * 60; m += stepMinutes) {
    const t = fmtTime(m);
    options.push({ value: t, label: t });
  }
  return options;
}

export function buildEndTimeOptions(fromTime, closeHour = 19, stepMinutes = 30) {
  const start = fromTime && /^\d{2}:\d{2}$/.test(fromTime) ? toMinutes(fromTime) + stepMinutes : 9 * 60;
  const end = closeHour * 60;
  const options = [];
  for (let m = start; m <= end; m += stepMinutes) {
    const t = fmtTime(m);
    options.push({ value: t, label: t });
  }
  return options;
}

export const SCHEDULE_KINDS = {
  busy: { label: 'Bận', icon: 'square' },
  conflict: { label: 'Trùng lịch', icon: 'alert' },
  free: { label: 'Trống', icon: 'check' },
  proposed: { label: 'Đề xuất (chưa lưu)', icon: 'diamond' },
  confirmed: { label: 'Đã xác nhận', icon: 'done' },
};
