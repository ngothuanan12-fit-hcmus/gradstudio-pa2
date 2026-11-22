import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api/client.js';
import useApi from '../../hooks/useApi.js';
import {
  WEEKDAY_SHORT,
  addDays,
  addMonths,
  isValidIsoDate,
  monthGridDates,
  vnDateLong,
  vnPeriodTitle,
  weekDates,
} from '../../utils/date.js';
import { SCHEDULE_KINDS, addMinutesToTime, assignLanes } from '../../utils/schedule.js';
import { fmtTime, overlap, toMinutes, toPct } from '../../utils/time.js';
import DataState from '../DataState.jsx';
import Icon from '../Icon.jsx';
import DatePicker from '../ui/DatePicker.jsx';
import EventPopover from './EventPopover.jsx';

// Resource schedule inside ScheduleSheet: Ngày / Tuần / Tháng views, live clash indicator, and suggested slots.
export default function AdminResourceSchedule({
  initialDate,
  draftSlot,
  staffQuery,
  roomsQuery,
  onSelectSlot,
  popoverOpenRef,
}) {
  const targetDate = isValidIsoDate(initialDate) ? initialDate : '2026-10-24';
  const [viewDate, setViewDate] = useState(targetDate);
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week' | 'month'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(() => draftSlot || null);
  const [checkState, setCheckState] = useState({ status: 'idle', data: null, error: null });

  const popoverRef = useRef(null);
  const lastEventTriggerRef = useRef(null);

  function openEventPopover(blk, e) {
    lastEventTriggerRef.current = e?.currentTarget || null;
    setSelectedEvent(blk);
  }

  function closeEventPopover() {
    setSelectedEvent(null);
    const target = lastEventTriggerRef.current;
    if (target && typeof target.focus === 'function' && target.isConnected) {
      target.focus();
    }
  }

  useEffect(() => {
    if (popoverOpenRef) popoverOpenRef.current = Boolean(selectedEvent);
    return () => {
      if (popoverOpenRef) popoverOpenRef.current = false;
    };
  }, [selectedEvent, popoverOpenRef]);

  const scheduleQuery = useApi(`/schedule?date=${viewDate}`);
  const bookingsQuery = useApi('/bookings');

  const staff = useMemo(() => staffQuery.data || [], [staffQuery.data]);
  const rooms = useMemo(() => roomsQuery.data || [], [roomsQuery.data]);
  const bookings = useMemo(() => bookingsQuery.data || [], [bookingsQuery.data]);
  const schedule = scheduleQuery.data;

  // Run live POST /api/schedule/check whenever activeCandidate changes and has valid staff/room.
  const candidatePayload = useMemo(() => {
    if (!activeCandidate || !activeCandidate.shoot?.staffId || !activeCandidate.shoot?.roomId) return null;
    if (!isValidIsoDate(activeCandidate.date)) return null;
    return {
      date: activeCandidate.date,
      makeup: activeCandidate.makeup?.staffId
        ? {
            from: activeCandidate.makeup.from,
            to: activeCandidate.makeup.to,
            staffId: activeCandidate.makeup.staffId,
          }
        : null,
      shoot: {
        from: activeCandidate.shoot.from,
        to: activeCandidate.shoot.to,
        staffId: activeCandidate.shoot.staffId,
        roomId: activeCandidate.shoot.roomId,
      },
    };
  }, [activeCandidate]);

  useEffect(() => {
    if (!candidatePayload) return undefined;
    const controller = new AbortController();
    setCheckState((p) => ({ ...p, status: 'loading', error: null }));
    api('/schedule/check', { method: 'POST', body: candidatePayload, signal: controller.signal }).then(
      (res) => setCheckState({ status: 'ready', data: res, error: null }),
      (err) => {
        if (controller.signal.aborted) return;
        setCheckState({ status: 'error', data: null, error: err.message });
      },
    );
    return () => controller.abort();
  }, [candidatePayload]);

  function stepPeriod(delta) {
    setSelectedEvent(null);
    if (viewMode === 'day') setViewDate((d) => addDays(d, delta));
    else if (viewMode === 'week') setViewDate((d) => addDays(d, delta * 7));
    else setViewDate((d) => addMonths(d, delta));
  }

  function triggerCandidateSlot({
    date,
    makeupFrom,
    makeupTo,
    shootFrom,
    shootTo,
    makeupStaffId: overrideMakeupId,
    shootStaffId: overrideShootId,
    roomId: overrideRoomId,
  }) {
    const blocks = schedule?.blocks || [];
    const makeupArtists = staff.filter((s) => s.specialty === 'makeup');
    const photographers = staff.filter((s) => s.specialty === 'photographer');
    const freeRoom = rooms.find((r) => !blocks.some((b) => b.roomId === r.id)) || rooms[rooms.length - 1] || rooms[0];

    const makeupArtistId =
      overrideMakeupId !== undefined
        ? overrideMakeupId
        : activeCandidate?.makeup?.staffId || makeupArtists[0]?.id || '';
    const makeupArtistName = staff.find((s) => s.id === makeupArtistId)?.name || '';
    const photoId =
      overrideShootId !== undefined ? overrideShootId : activeCandidate?.shoot?.staffId || photographers[0]?.id || '';
    const photoName = staff.find((s) => s.id === photoId)?.name || '';
    const rId = overrideRoomId !== undefined ? overrideRoomId : activeCandidate?.shoot?.roomId || freeRoom?.id || '';
    const rName = rooms.find((r) => r.id === rId)?.name || '';

    const nextCandidate = {
      date,
      makeup:
        makeupFrom && makeupTo && makeupArtistId
          ? { from: makeupFrom, to: makeupTo, staffId: makeupArtistId, staffName: makeupArtistName }
          : null,
      shoot: {
        from: shootFrom,
        to: shootTo,
        staffId: photoId,
        staffName: photoName,
        roomId: rId,
        roomName: rName,
      },
    };
    setActiveCandidate(nextCandidate);
    if (onSelectSlot) {
      onSelectSlot({
        date,
        makeupFrom,
        makeupTo,
        shootFrom,
        shootTo,
        makeupStaffId: makeupArtistId || undefined,
        shootStaffId: photoId || undefined,
        roomId: rId || undefined,
      });
    }
  }

  const bookingDatesSet = useMemo(() => {
    const set = new Set();
    for (const b of bookings) {
      if (b.status !== 'Đã hủy') set.add(b.date);
    }
    return set;
  }, [bookings]);

  const openTime = schedule?.openingHours?.open || '08:00';
  const closeTime = schedule?.openingHours?.close || '18:00';
  const dayStartMin = toMinutes(openTime);
  const dayEndMin = Math.max(dayStartMin + 60, toMinutes(closeTime));

  const hoursAxis = useMemo(() => {
    const startH = Math.floor(dayStartMin / 60);
    const endH = Math.ceil(dayEndMin / 60);
    const arr = [];
    for (let h = startH; h <= endH; h += 2) arr.push(h);
    if (arr[arr.length - 1] !== endH) arr.push(endH);
    return arr;
  }, [dayStartMin, dayEndMin]);

  const hourCellSlots = useMemo(() => {
    const startH = Math.floor(dayStartMin / 60);
    const endH = Math.floor(dayEndMin / 60);
    const arr = [];
    for (let h = startH; h < endH; h += 1) {
      arr.push(fmtTime(h * 60));
    }
    return arr;
  }, [dayStartMin, dayEndMin]);

  // Build resource rows for Ngày view from GET /api/staff + GET /api/rooms + GET /api/schedule + candidate + freeTime.
  const resources = useMemo(
    () => [
      ...staff.map((s) => ({
        id: s.id,
        type: 'staff',
        name: s.name,
        role: s.specialty === 'makeup' ? 'Thợ makeup' : 'Thợ chụp',
      })),
      ...rooms.map((r) => ({
        id: r.id,
        type: 'room',
        name: r.name,
        role: 'Phòng chụp',
      })),
    ],
    [staff, rooms],
  );

  const dayRows = useMemo(() => {
    const blocks = schedule?.blocks || [];
    const conflicts = checkState.data?.conflicts || [];
    const freeTime = schedule?.freeTime || null;
    const candidateOnDay = activeCandidate && activeCandidate.date === viewDate ? activeCandidate : null;

    const defaultPhotographer = staff.find((s) => s.specialty === 'photographer') || null;
    const freeRoomCandidate =
      rooms.find((r) => !blocks.some((b) => b.roomId === r.id)) || rooms[rooms.length - 1] || rooms[0] || null;
    const targetShootStaffId = candidateOnDay?.shoot?.staffId || defaultPhotographer?.id || '';
    const targetRoomId = candidateOnDay?.shoot?.roomId || freeRoomCandidate?.id || '';
    const targetShootStaffName =
      candidateOnDay?.shoot?.staffName || staff.find((s) => s.id === targetShootStaffId)?.name || '';
    const targetRoomName = candidateOnDay?.shoot?.roomName || rooms.find((r) => r.id === targetRoomId)?.name || '';

    return resources.map((res) => {
      const rowBlocks = [];

      // 1. Held blocks from API
      for (const blk of blocks) {
        const matches = res.type === 'staff' ? blk.staffId === res.id : blk.roomId === res.id;
        if (!matches) continue;
        const bk = bookings.find((b) => b.id === blk.bookingId) || null;
        rowBlocks.push({
          id: `${blk.bookingId}-${res.id}-${blk.from}`,
          kind: 'busy',
          date: blk.date,
          from: blk.from,
          to: blk.to,
          shortLabel: `${blk.bookingId} · ${blk.from}–${blk.to}`,
          title: bk ? `${blk.bookingId} · ${bk.customer.name}` : blk.bookingId,
          service: bk ? `${bk.serviceName} (${bk.packageName})` : 'Lịch đã giữ',
          staff: blk.staffName,
          room: blk.roomName,
          statusLabel: bk ? `${bk.status} · Đã giữ lịch` : 'Bận (Đã giữ lịch)',
          note: bk ? `${bk.people} người` : null,
        });
      }

      // 2. Agreed / pending-deposit bookings on this date (not in db.busy yet -> 'confirmed' when Chờ cọc / Đã chốt)
      for (const bk of bookings) {
        if (bk.date !== viewDate || bk.status !== 'Chờ cọc 30%') continue;
        if (bk.makeup && res.type === 'staff' && bk.makeup.staffId === res.id) {
          rowBlocks.push({
            id: `pending-mu-${bk.id}`,
            kind: 'confirmed',
            date: bk.date,
            from: bk.makeup.from,
            to: bk.makeup.to,
            shortLabel: `${bk.id} · Đã chốt`,
            title: `${bk.id} · ${bk.customer.name}`,
            service: `${bk.serviceName} (Makeup)`,
            staff: bk.makeup.staffName,
            room: null,
            statusLabel: 'Đã xác nhận · Chờ cọc 30%',
            note: 'Chưa giữ lịch cho đến khi khách cọc 30%.',
          });
        }
        const matchesShoot = res.type === 'staff' ? bk.shoot.staffId === res.id : bk.shoot.roomId === res.id;
        if (matchesShoot) {
          rowBlocks.push({
            id: `pending-sh-${bk.id}-${res.id}`,
            kind: 'confirmed',
            date: bk.date,
            from: bk.shoot.from,
            to: bk.shoot.to,
            shortLabel: `${bk.id} · Đã chốt`,
            title: `${bk.id} · ${bk.customer.name}`,
            service: `${bk.serviceName} (${bk.packageName})`,
            staff: bk.shoot.staffName,
            room: bk.shoot.roomName,
            statusLabel: 'Đã xác nhận · Chờ cọc 30%',
            note: 'Chưa giữ lịch cho đến khi khách cọc 30%.',
          });
        }
      }

      // 3. Suggested freeTime window if returned by API
      if (freeTime) {
        if (
          freeTime.makeup &&
          res.type === 'staff' &&
          res.role === 'Thợ makeup' &&
          !(candidateOnDay?.makeup?.staffId === res.id && candidateOnDay.makeup.from === freeTime.makeup.from)
        ) {
          rowBlocks.push({
            id: `free-mu-${res.id}`,
            kind: 'free',
            date: viewDate,
            from: freeTime.makeup.from,
            to: freeTime.makeup.to,
            shortLabel: `Trống ${freeTime.makeup.from}–${freeTime.makeup.to}`,
            title: 'Khung giờ gợi ý (Makeup)',
            service: 'Giờ trống gợi ý từ hệ thống',
            staff: res.name,
            room: null,
            statusLabel: 'Trống · Có thể xếp lịch',
            note: 'Nhấn vào giờ gợi ý bên trên để chọn.',
          });
        }
        const isFreeShootTarget =
          (res.type === 'staff' && res.id === targetShootStaffId) || (res.type === 'room' && res.id === targetRoomId);
        if (freeTime.shoot && isFreeShootTarget && !(candidateOnDay?.shoot?.from === freeTime.shoot.from)) {
          rowBlocks.push({
            id: `free-sh-${res.id}`,
            kind: 'free',
            date: viewDate,
            from: freeTime.shoot.from,
            to: freeTime.shoot.to,
            shortLabel: `Trống ${freeTime.shoot.from}–${freeTime.shoot.to}`,
            title: 'Khung giờ gợi ý (Chụp)',
            service: 'Giờ trống gợi ý từ hệ thống',
            staff: res.type === 'staff' ? res.name : targetShootStaffName,
            room: res.type === 'room' ? res.name : targetRoomName,
            statusLabel: 'Trống · Có thể xếp lịch',
            note: 'Nhấn vào giờ gợi ý bên trên để chọn.',
          });
        }
      }

      // 4. Candidate draft slot (proposed or conflict) — avoid duplicating an identical confirmed block.
      if (candidateOnDay) {
        if (candidateOnDay.makeup && res.type === 'staff' && candidateOnDay.makeup.staffId === res.id) {
          const sameConfirmed = rowBlocks.some(
            (b) => b.kind === 'confirmed' && b.from === candidateOnDay.makeup.from && b.to === candidateOnDay.makeup.to,
          );
          if (!sameConfirmed) {
            const isClash =
              conflicts.some((c) => c.kind === 'staff' && c.who === res.name) ||
              conflicts.some((c) => c.kind === 'hours') ||
              rowBlocks.some((b) => b.kind === 'busy' && overlap(b, candidateOnDay.makeup) > 0);
            rowBlocks.push({
              id: `cand-mu-${res.id}`,
              kind: isClash ? 'conflict' : 'proposed',
              date: viewDate,
              from: candidateOnDay.makeup.from,
              to: candidateOnDay.makeup.to,
              shortLabel: isClash ? `Trùng ${candidateOnDay.makeup.from}` : `Đề xuất ${candidateOnDay.makeup.from}`,
              title: isClash ? 'Trùng lịch Makeup' : 'Đề xuất Makeup (chưa lưu)',
              service: 'Lịch đang kiểm tra',
              staff: res.name,
              room: null,
              statusLabel: isClash ? 'Trùng lịch' : 'Đề xuất (chưa lưu)',
              note: isClash ? checkState.data?.message : 'Khung giờ khả dụng để đề xuất.',
            });
          }
        }
        const candShootMatch =
          (res.type === 'staff' && candidateOnDay.shoot?.staffId === res.id) ||
          (res.type === 'room' && candidateOnDay.shoot?.roomId === res.id);
        if (candidateOnDay.shoot && candShootMatch) {
          const sameConfirmed = rowBlocks.some(
            (b) => b.kind === 'confirmed' && b.from === candidateOnDay.shoot.from && b.to === candidateOnDay.shoot.to,
          );
          if (!sameConfirmed) {
            const isClash =
              conflicts.some((c) => (c.kind === 'staff' || c.kind === 'room') && c.who === res.name) ||
              conflicts.some((c) => c.kind === 'hours') ||
              rowBlocks.some((b) => b.kind === 'busy' && overlap(b, candidateOnDay.shoot) > 0);
            rowBlocks.push({
              id: `cand-sh-${res.id}`,
              kind: isClash ? 'conflict' : 'proposed',
              date: viewDate,
              from: candidateOnDay.shoot.from,
              to: candidateOnDay.shoot.to,
              shortLabel: isClash ? `Trùng ${candidateOnDay.shoot.from}` : `Đề xuất ${candidateOnDay.shoot.from}`,
              title: isClash ? 'Trùng lịch Chụp' : 'Đề xuất Chụp (chưa lưu)',
              service: 'Lịch đang kiểm tra',
              staff: candidateOnDay.shoot.staffName,
              room: candidateOnDay.shoot.roomName,
              statusLabel: isClash ? 'Trùng lịch' : 'Đề xuất (chưa lưu)',
              note: isClash ? checkState.data?.message : 'Khung giờ khả dụng để đề xuất.',
            });
          }
        }
      }

      const placed = assignLanes(rowBlocks);
      return { ...res, blocks: placed.blocks, laneCount: placed.laneCount };
    });
  }, [schedule, checkState.data, activeCandidate, viewDate, resources, bookings, staff, rooms]);

  // Suggested slots list for the viewed day
  const suggestedSlots = useMemo(() => {
    const list = [];
    if (schedule?.freeTime?.shoot) {
      list.push({
        id: 'api-free',
        label: `Giờ trống gợi ý: ${schedule.freeTime.shoot.from}–${schedule.freeTime.shoot.to}`,
        sub: schedule.freeTime.makeup
          ? `Makeup ${schedule.freeTime.makeup.from}–${schedule.freeTime.makeup.to} · Chụp ${schedule.freeTime.shoot.from}–${schedule.freeTime.shoot.to}`
          : null,
        date: viewDate,
        makeupFrom: schedule.freeTime.makeup?.from || null,
        makeupTo: schedule.freeTime.makeup?.to || null,
        shootFrom: schedule.freeTime.shoot.from,
        shootTo: schedule.freeTime.shoot.to,
      });
    }
    if (draftSlot && draftSlot.date === viewDate) {
      const already = list.some((s) => s.shootFrom === draftSlot.shoot.from);
      if (!already) {
        list.push({
          id: 'draft-slot',
          label: `Giờ đang chọn: ${draftSlot.shoot.from}–${draftSlot.shoot.to}`,
          sub: draftSlot.makeup ? `Makeup ${draftSlot.makeup.from}–${draftSlot.makeup.to}` : 'Không makeup',
          date: draftSlot.date,
          makeupFrom: draftSlot.makeup?.from || null,
          makeupTo: draftSlot.makeup?.to || null,
          shootFrom: draftSlot.shoot.from,
          shootTo: draftSlot.shoot.to,
        });
      }
    }
    return list;
  }, [schedule, draftSlot, viewDate]);

  const checkedLineAt =
    activeCandidate && activeCandidate.date === viewDate && activeCandidate.shoot?.from
      ? toPct(activeCandidate.shoot.from, dayStartMin, dayEndMin)
      : null;

  const weekCols = useMemo(() => weekDates(viewDate), [viewDate]);
  const monthCells = useMemo(() => monthGridDates(viewDate), [viewDate]);

  return (
    <div className="sched-modal-body">
      {/* Period Header */}
      <div className="sched-toolbar">
        <div className="sched-period-nav">
          <span className="sched-period-pill">{vnPeriodTitle(viewDate, viewMode)}</span>
          <div className="sched-nav-btns" role="group" aria-label="Chuyển khoảng thời gian">
            <button type="button" className="sched-icon-btn" aria-label="Khoảng trước" onClick={() => stepPeriod(-1)}>
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              className="sched-today-btn"
              onClick={() => {
                setViewDate(targetDate);
                setSelectedEvent(null);
              }}
            >
              Ngày hẹn
            </button>
            <button type="button" className="sched-icon-btn" aria-label="Khoảng sau" onClick={() => stepPeriod(1)}>
              <Icon name="chevron-right" />
            </button>
          </div>
          <DatePicker
            id="sched-date-picker"
            label="Ngày"
            compact
            value={viewDate}
            suggestedDate={targetDate}
            highlightDates={bookingDatesSet}
            onChange={(d) => {
              setViewDate(d);
              setSelectedEvent(null);
            }}
          />
        </div>

        <div className="sched-view-switcher" role="group" aria-label="Chế độ xem lịch">
          {[
            { id: 'day', label: 'Ngày' },
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              className="sched-view-btn"
              aria-pressed={viewMode === v.id}
              onClick={() => {
                setViewMode(v.id);
                setSelectedEvent(null);
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict Indicator */}
      <div className="sched-conflict-wrap" aria-live="polite">
        {checkState.status === 'loading' ? (
          <p className="avail-banner is-checking">Đang kiểm tra lịch trống…</p>
        ) : checkState.status === 'error' ? (
          <p className="avail-banner is-conflict" role="alert">
            <Icon name="alert" /> {checkState.error}
          </p>
        ) : checkState.data ? (
          <p className={`avail-banner ${checkState.data.available ? 'is-free' : 'is-conflict'}`}>
            <Icon name={checkState.data.available ? 'check' : 'alert'} /> {checkState.data.message}
          </p>
        ) : (
          <p className="avail-banner is-notice">
            <Icon name="clock" /> Chọn một khung giờ trên lịch hoặc giờ gợi ý để kiểm tra trùng lịch.
          </p>
        )}
      </div>

      {/* Suggested Slots */}
      {suggestedSlots.length ? (
        <div className="sched-suggest-bar" role="group" aria-label="Khung giờ gợi ý">
          <span className="sched-suggest-title">Khung giờ gợi ý:</span>
          <div className="sched-suggest-chips">
            {suggestedSlots.map((slot) => {
              const isPicked = activeCandidate?.date === slot.date && activeCandidate?.shoot?.from === slot.shootFrom;
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`quick-chip${isPicked ? ' is-used' : ''}`}
                  aria-pressed={isPicked}
                  onClick={() => triggerCandidateSlot(slot)}
                >
                  <span>{slot.label}</span>
                  {slot.sub ? <span className="chip-sub"> · {slot.sub}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 5-Kind Legend */}
      <ul className="sched-legend" aria-label="Chú thích trạng thái lịch">
        {Object.entries(SCHEDULE_KINDS).map(([kind, meta]) => (
          <li key={kind}>
            <span className={`sched-swatch kind-${kind}`} aria-hidden="true" />
            <Icon name={meta.icon} />
            <span>{meta.label}</span>
          </li>
        ))}
      </ul>

      {/* View Content + Bottom-Right Anchored Popover */}
      <div className="sched-stage">
        {viewMode === 'day' ? (
          <DataState
            query={scheduleQuery}
            isEmpty={() => resources.length === 0}
            emptyText="Chưa có dữ liệu thợ hoặc phòng trong hệ thống."
            loadingLabel="Đang tải lịch ngày…"
          >
            {() => (
              <>
                <div className="sched-tl">
                  <div className="tl-axis">
                    {hoursAxis.map((h) => (
                      <span key={h} style={{ '--at': toPct(fmtTime(h * 60), dayStartMin, dayEndMin) }}>
                        {String(h).padStart(2, '0')}:00
                      </span>
                    ))}
                  </div>
                  <div className="tl-grid-body">
                    {checkedLineAt !== null && checkedLineAt >= 0 && checkedLineAt <= 100 ? (
                      <div className="tl-check-line" style={{ '--at': checkedLineAt }} aria-hidden="true">
                        <span className="tl-check-pill">{activeCandidate.shoot.from}</span>
                      </div>
                    ) : null}
                    {dayRows.map((row) => (
                      <div className="tl-row" key={row.id}>
                        <div className="tl-resource">
                          <span className="tl-name">{row.name}</span>
                          <span className="tl-role">{row.role}</span>
                        </div>
                        <div className="tl-track" style={{ '--lanes': row.laneCount }}>
                          <div className="tl-hour-slots">
                            {hourCellSlots.map((slotTime) => (
                              <button
                                key={slotTime}
                                type="button"
                                className="tl-hour-btn"
                                aria-label={`Kiểm tra ${row.name} lúc ${slotTime} ngày ${vnDateLong(viewDate)}`}
                                onClick={() => {
                                  const dur =
                                    activeCandidate?.shoot?.from && activeCandidate?.shoot?.to
                                      ? Math.max(
                                          60,
                                          toMinutes(activeCandidate.shoot.to) - toMinutes(activeCandidate.shoot.from),
                                        )
                                      : 120;
                                  if (row.type === 'staff' && row.role === 'Thợ makeup') {
                                    const nextShootFrom = addMinutesToTime(slotTime, 60);
                                    triggerCandidateSlot({
                                      date: viewDate,
                                      makeupFrom: slotTime,
                                      makeupTo: nextShootFrom,
                                      shootFrom: nextShootFrom,
                                      shootTo: addMinutesToTime(nextShootFrom, dur),
                                      makeupStaffId: row.id,
                                    });
                                  } else {
                                    const hasMu = Boolean(activeCandidate?.makeup);
                                    triggerCandidateSlot({
                                      date: viewDate,
                                      makeupFrom: hasMu ? addMinutesToTime(slotTime, -60) : null,
                                      makeupTo: hasMu ? slotTime : null,
                                      shootFrom: slotTime,
                                      shootTo: addMinutesToTime(slotTime, dur),
                                      ...(row.type === 'staff' ? { shootStaffId: row.id } : { roomId: row.id }),
                                    });
                                  }
                                }}
                              />
                            ))}
                          </div>

                          {row.blocks.map((blk) => {
                            const meta = SCHEDULE_KINDS[blk.kind] || SCHEDULE_KINDS.busy;
                            const startPct = Math.max(0, toPct(blk.from, dayStartMin, dayEndMin));
                            const endPct = Math.min(100, toPct(blk.to, dayStartMin, dayEndMin));
                            const widthPct = Math.max(2, endPct - startPct);
                            const short = toMinutes(blk.to) - toMinutes(blk.from) <= 60;
                            return (
                              <button
                                key={blk.id}
                                type="button"
                                data-schedule-event="true"
                                className={`tl-block kind-${blk.kind}${short ? ' is-short' : ''}`}
                                style={{
                                  '--at': startPct,
                                  '--len': widthPct,
                                  '--lane': blk.lane,
                                }}
                                aria-label={`${meta.label}: ${blk.title}, ${blk.from}–${blk.to}`}
                                onClick={(e) => openEventPopover(blk, e)}
                              >
                                <Icon name={meta.icon} />
                                <span className="tl-word">{short ? blk.from : blk.shortLabel}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Responsive readable block list (always accessible at 360px and below) */}
                <div className="sched-narrow-list">
                  {dayRows.map((row) => (
                    <section key={row.id} className="sched-narrow-row" aria-labelledby={`mob-res-${row.id}`}>
                      <h3 id={`mob-res-${row.id}`}>
                        {row.name} <span>{row.role}</span>
                      </h3>
                      {row.blocks.length ? (
                        <ul className="sched-narrow-blocks">
                          {row.blocks.map((blk) => {
                            const meta = SCHEDULE_KINDS[blk.kind] || SCHEDULE_KINDS.busy;
                            return (
                              <li key={blk.id}>
                                <button
                                  type="button"
                                  data-schedule-event="true"
                                  className={`sched-block-btn kind-${blk.kind}`}
                                  onClick={(e) => openEventPopover(blk, e)}
                                >
                                  <span className="sched-block-kind">
                                    <Icon name={meta.icon} /> {meta.label}
                                  </span>
                                  <strong>{blk.title}</strong>
                                  <span className="sched-block-time">
                                    {blk.from}–{blk.to}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="field-hint">Chưa có lịch bận trong ngày.</p>
                      )}
                    </section>
                  ))}
                </div>
              </>
            )}
          </DataState>
        ) : viewMode === 'week' ? (
          <DataState
            query={bookingsQuery}
            isEmpty={() => resources.length === 0}
            emptyText="Chưa có dữ liệu tài nguyên."
            loadingLabel="Đang tải lịch tuần…"
          >
            {() => (
              <div className="sched-week-wrap">
                <table className="sched-week-table">
                  <thead>
                    <tr>
                      <th scope="col">Tài nguyên</th>
                      {weekCols.map((d) => (
                        <th key={d.date} scope="col">
                          <button
                            type="button"
                            className={`week-day-btn${d.date === viewDate ? ' is-current' : ''}`}
                            onClick={() => {
                              setViewDate(d.date);
                              setViewMode('day');
                              setSelectedEvent(null);
                            }}
                          >
                            <span>{d.dow}</span>
                            <span>{d.dayNum}</span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((res) => (
                      <tr key={res.id}>
                        <th scope="row">
                          <div className="tl-resource">
                            <span className="tl-name">{res.name}</span>
                            <span className="tl-role">{res.role}</span>
                          </div>
                        </th>
                        {weekCols.map((d) => {
                          const cellEvents = [];
                          for (const bk of bookings) {
                            if (bk.date !== d.date || bk.status === 'Đã hủy') continue;
                            const kind =
                              bk.status === 'Đã đặt lịch' ? 'busy' : bk.status === 'Hoàn thành' ? 'busy' : 'confirmed';
                            if (bk.makeup && res.type === 'staff' && bk.makeup.staffId === res.id) {
                              cellEvents.push({
                                id: `wk-mu-${bk.id}`,
                                kind,
                                date: bk.date,
                                from: bk.makeup.from,
                                to: bk.makeup.to,
                                title: `${bk.id} · Makeup`,
                                service: bk.serviceName,
                                staff: bk.makeup.staffName,
                                room: null,
                                statusLabel: bk.status,
                              });
                            }
                            if (
                              (res.type === 'staff' && bk.shoot.staffId === res.id) ||
                              (res.type === 'room' && bk.shoot.roomId === res.id)
                            ) {
                              cellEvents.push({
                                id: `wk-sh-${bk.id}-${res.id}`,
                                kind,
                                date: bk.date,
                                from: bk.shoot.from,
                                to: bk.shoot.to,
                                title: `${bk.id} · ${bk.customer.name}`,
                                service: `${bk.serviceName} (${bk.packageName})`,
                                staff: bk.shoot.staffName,
                                room: bk.shoot.roomName,
                                statusLabel: bk.status,
                              });
                            }
                          }
                          return (
                            <td key={d.date}>
                              <div className="week-cell-events">
                                {cellEvents.map((ev) => (
                                  <button
                                    key={ev.id}
                                    type="button"
                                    data-schedule-event="true"
                                    className={`week-ev kind-${ev.kind}`}
                                    onClick={(e) => openEventPopover(ev, e)}
                                  >
                                    <span>
                                      {ev.from}–{ev.to}
                                    </span>
                                    <span>{ev.title}</span>
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataState>
        ) : (
          <DataState
            query={bookingsQuery}
            isEmpty={() => false}
            emptyText="Chưa có dữ liệu lịch tháng."
            loadingLabel="Đang tải lịch tháng…"
          >
            {() => (
              <div className="sched-month">
                <div className="sched-month-head" aria-hidden="true">
                  {WEEKDAY_SHORT.map((dow) => (
                    <span key={dow}>{dow}</span>
                  ))}
                </div>
                <div className="sched-month-grid">
                  {monthCells.map((cell) => {
                    const dayBookings = bookings.filter((b) => b.date === cell.date && b.status !== 'Đã hủy');
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        className={`month-cell${cell.inMonth ? '' : ' is-outside'}${cell.date === viewDate ? ' is-selected' : ''}`}
                        aria-label={`${vnDateLong(cell.date)}, ${dayBookings.length} lịch chụp`}
                        onClick={() => {
                          setViewDate(cell.date);
                          setViewMode('day');
                          setSelectedEvent(null);
                        }}
                      >
                        <div className="month-cell-top">
                          <span className="month-day-num">{cell.dayNum}</span>
                          {dayBookings.length ? <span className="month-count">{dayBookings.length}</span> : null}
                        </div>
                        <div className="month-chips">
                          {dayBookings.slice(0, 2).map((b) => (
                            <span key={b.id} className="month-chip">
                              {b.shoot.from} · {b.id}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </DataState>
        )}

        <EventPopover event={selectedEvent} popoverRef={popoverRef} onClose={closeEventPopover} />
      </div>
    </div>
  );
}
