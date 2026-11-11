// Scheduling & conflict engine ported from developer/quan-ly
export const studioResources = [
  { id: 'mai', kind: 'makeup', name: 'Mai', label: 'Makeup · Mai' },
  { id: 'tuan', kind: 'photographer', name: 'Tuấn', label: 'Thợ chụp · Tuấn' },
  { id: 'ha', kind: 'photographer', name: 'Hà', label: 'Thợ chụp · Hà' },
  { id: 'roomA', kind: 'room', name: 'Phòng A', label: 'Phòng A' },
  { id: 'roomB', kind: 'room', name: 'Phòng B', label: 'Phòng B' },
];

export const photographerIds = ['tuan', 'ha'];
export const roomIds = ['roomB', 'roomA'];

export const WORK_DAY_END = 1080; // 18:00
export const LUNCH_BREAK = [720, 780]; // 12:00 - 13:00
export const TOTAL_MINUTES = 1080 - 480; // 600 mins (08:00 - 18:00)

export const parseTimeString = (tStr) => {
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
};

export const formatTimeMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const DAYS_OF_WEEK = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const getDayOfWeek = (day) => DAYS_OF_WEEK[new Date(2026, 9, day).getDay()];

export const formatDateDisplay = (day) => `${day}/10/2026`;

export const getResourceName = (resourceId) => {
  if (!resourceId) return '—';
  return studioResources.find((r) => r.id === resourceId)?.name ?? '—';
};

export const timelineMinuteToPercent = (minutes) => ((minutes - 480) / TOTAL_MINUTES) * 100;

export const scheduledEventsByDay = {
  24: [
    { resource: 'mai', start: parseTimeString('08:00'), end: parseTimeString('10:00'), title: 'Kỷ yếu 12A3' },
    { resource: 'mai', start: parseTimeString('10:00'), end: parseTimeString('12:00'), title: 'Tốt nghiệp · nhóm 3 bạn' },
    { resource: 'tuan', start: parseTimeString('17:00'), end: parseTimeString('18:00'), title: 'Chân dung CV · Minh Khoa' },
    { resource: 'ha', start: parseTimeString('09:00'), end: parseTimeString('11:30'), title: 'Gia đình · Ngọc Hân' },
    { resource: 'ha', start: parseTimeString('14:00'), end: parseTimeString('16:00'), title: 'Cặp đôi' },
    { resource: 'roomA', start: parseTimeString('09:00'), end: parseTimeString('11:30'), title: 'Gia đình · Ngọc Hân' },
    { resource: 'roomA', start: parseTimeString('14:00'), end: parseTimeString('16:00'), title: 'Cặp đôi' },
  ],
};

export const candidateHours = Array.from({ length: 10 }, (_, i) => (8 + i) * 60);

export const getOverlap = (a, b) => {
  const start = Math.max(a[0], b[0]);
  const end = Math.min(a[1], b[1]);
  return start < end ? [start, end] : null;
};

export const getResourceConflicts = (resourceId, range, day) => {
  const conflicts = [];
  if (range[0] < 480) conflicts.push([range[0], Math.min(range[1], 480)]);
  if (range[1] > WORK_DAY_END) conflicts.push([Math.max(range[0], WORK_DAY_END), range[1]]);

  const lunch = getOverlap(range, LUNCH_BREAK);
  if (lunch) conflicts.push(lunch);

  const dayEvents = scheduledEventsByDay[day] ?? [];
  for (const ev of dayEvents) {
    if (ev.resource !== resourceId) continue;
    const ov = getOverlap(range, [ev.start, ev.end]);
    if (ov) conflicts.push(ov);
  }
  return conflicts;
};

export const findOverlappingEvent = (resourceId, range, day) => {
  const events = (scheduledEventsByDay[day] ?? [])
    .filter((e) => e.resource === resourceId)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const ev of events) {
    const last = merged[merged.length - 1];
    if (last && ev.start <= last[1]) {
      last[1] = Math.max(last[1], ev.end);
    } else {
      merged.push([ev.start, ev.end]);
    }
  }
  return merged.find((m) => getOverlap(m, range)) ?? null;
};

export function checkScheduleConflict(startTime, day, hasMakeup) {
  const shootRange = [startTime, startTime + 120];
  const problems = [];
  const segments = [];
  let makeupArtist = null;

  if (hasMakeup) {
    const makeupRange = [startTime - 60, startTime];
    const conflicts = getResourceConflicts('mai', makeupRange, day);
    segments.push({
      resource: 'mai',
      start: makeupRange[0],
      end: makeupRange[1],
      kind: 'makeup',
      conflicts,
    });
    if (conflicts.length === 0) {
      makeupArtist = 'mai';
    } else {
      const ev = findOverlappingEvent('mai', makeupRange, day);
      if (ev) {
        problems.push(`Thợ makeup Mai đã có lịch ${formatTimeMinutes(ev[0])}–${formatTimeMinutes(ev[1])}.`);
      } else if (getOverlap(makeupRange, LUNCH_BREAK)) {
        problems.push(`Giờ makeup ${formatTimeMinutes(makeupRange[0])}–${formatTimeMinutes(makeupRange[1])} trùng nghỉ trưa 12:00–13:00.`);
      } else {
        problems.push(`Giờ makeup ${formatTimeMinutes(makeupRange[0])}–${formatTimeMinutes(makeupRange[1])} nằm ngoài giờ làm việc.`);
      }
    }
  }

  const findAvailable = (ids) => ids.find((id) => getResourceConflicts(id, shootRange, day).length === 0) ?? null;
  const photographer = findAvailable(photographerIds);
  const room = findAvailable(roomIds);
  const assignedPhotographer = photographer ?? photographerIds[0];
  const assignedRoom = room ?? roomIds[0];

  segments.push({
    resource: assignedPhotographer,
    start: shootRange[0],
    end: shootRange[1],
    kind: 'shoot',
    conflicts: getResourceConflicts(assignedPhotographer, shootRange, day),
  });

  segments.push({
    resource: assignedRoom,
    start: shootRange[0],
    end: shootRange[1],
    kind: 'room',
    conflicts: getResourceConflicts(assignedRoom, shootRange, day),
  });

  const exceedsWork = shootRange[1] > WORK_DAY_END;
  const overlapsLunch = Boolean(getOverlap(shootRange, LUNCH_BREAK));
  if (exceedsWork) {
    problems.push(`Buổi chụp ${formatTimeMinutes(shootRange[0])}–${formatTimeMinutes(shootRange[1])} vượt quá giờ làm việc (18:00).`);
  } else if (overlapsLunch) {
    problems.push(`Buổi chụp ${formatTimeMinutes(shootRange[0])}–${formatTimeMinutes(shootRange[1])} trùng nghỉ trưa 12:00–13:00.`);
  } else {
    if (!photographer) problems.push('Không còn thợ chụp trống.');
    if (!room) problems.push('Không còn phòng trống.');
  }

  const ok = problems.length === 0;
  if (!ok) {
    problems.push(`Không đủ nhân sự cho khung ${formatTimeMinutes(startTime)}.`);
  }

  return {
    ok,
    makeupArtist,
    photographer,
    room,
    segments,
    problems,
  };
}

export function generateSlotSuggestions(currentTime, day, hasMakeup, rejectedSet = new Set()) {
  const sameDayAvailable = candidateHours
    .filter((t) => t !== currentTime && !rejectedSet.has(`${day}-${t}`))
    .map((t) => ({
      day,
      time: t,
      result: checkScheduleConflict(t, day, hasMakeup),
    }))
    .filter((item) => item.result.ok)
    .sort((a, b) => Math.abs(a.time - currentTime) - Math.abs(b.time - currentTime) || a.time - b.time)
    .slice(0, 2);

  const nextDay = day + 1;
  const nextDaySlot = candidateHours.find(
    (t) => !rejectedSet.has(`${nextDay}-${t}`) && checkScheduleConflict(t, nextDay, hasMakeup).ok
  );

  const suggestions = sameDayAvailable.map((item, idx) => ({
    ...item,
    nearest: idx === 0,
  }));

  if (nextDaySlot !== undefined) {
    suggestions.push({
      day: nextDay,
      time: nextDaySlot,
      result: checkScheduleConflict(nextDaySlot, nextDay, hasMakeup),
    });
  }

  return suggestions;
}
