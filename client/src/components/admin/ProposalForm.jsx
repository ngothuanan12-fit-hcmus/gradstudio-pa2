import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import { isValidIsoDate } from '../../utils/date.js';
import { addMinutesToTime, buildEndTimeOptions, buildTimeOptions } from '../../utils/schedule.js';
import { toMinutes } from '../../utils/time.js';
import Button from '../Button.jsx';
import ErrorState from '../ErrorState.jsx';
import Icon from '../Icon.jsx';
import LoadingState from '../LoadingState.jsx';
import StatusBadge from '../StatusBadge.jsx';
import DatePicker from '../ui/DatePicker.jsx';
import Select from '../ui/Select.jsx';

const TIME_START_OPTIONS = buildTimeOptions(7, 18, 60);

// Màn 2 of "Đang tư vấn" (G5/G6): clash check (staff, room, opening hours), slot selection, and sending proposal.
export default function ProposalForm({
  conv,
  staffQuery,
  roomsQuery,
  selectedService,
  selectedPkg,
  latestRequest,
  onBack,
  onConversationUpdated,
  onOpenSchedule,
  schedulePick,
}) {
  const staff = useMemo(() => staffQuery.data || [], [staffQuery.data]);
  const rooms = useMemo(() => roomsQuery.data || [], [roomsQuery.data]);
  const makeupArtists = useMemo(() => staff.filter((s) => s.specialty === 'makeup'), [staff]);
  const photographers = useMemo(() => staff.filter((s) => s.specialty === 'photographer'), [staff]);

  const latestProposal = [...(conv.messages || [])].reverse().find((m) => m.proposal)?.proposal || null;
  const openProposal = latestProposal?.status === 'open' ? latestProposal : null;

  const defaultDuration = selectedPkg?.durationMinutes || (selectedService?.id === 'ky-yeu' ? 120 : 60);
  const initialShootFrom = latestProposal?.shoot?.from || latestRequest?.time || '09:00';
  const initialShootTo = latestProposal?.shoot?.to || addMinutesToTime(initialShootFrom, defaultDuration);
  const wantsMakeup = Boolean(
    latestProposal?.makeup ||
    latestRequest?.extras?.some((x) => x.extraId === 'makeup') ||
    selectedPkg?.includes?.includes('makeup'),
  );
  const initialMakeupFrom =
    latestProposal?.makeup?.from ||
    (toMinutes(initialShootFrom) >= 9 * 60 ? addMinutesToTime(initialShootFrom, -60) : '08:00');
  const initialMakeupTo =
    latestProposal?.makeup?.to ||
    (initialMakeupFrom < initialShootFrom ? initialShootFrom : addMinutesToTime(initialMakeupFrom, 60));

  const [date, setDate] = useState(latestRequest?.date || latestProposal?.date || '2026-10-24');
  const [makeupStaffId, setMakeupStaffId] = useState(latestProposal?.makeup?.staffId || (wantsMakeup ? 'AUTO' : ''));
  const [makeupFrom, setMakeupFrom] = useState(initialMakeupFrom);
  const [makeupTo, setMakeupTo] = useState(initialMakeupTo);
  const [shootFrom, setShootFrom] = useState(initialShootFrom);
  const [shootTo, setShootTo] = useState(initialShootTo);
  const [shootStaffId, setShootStaffId] = useState(latestProposal?.shoot?.staffId || 'AUTO');
  const [roomId, setRoomId] = useState(latestProposal?.shoot?.roomId || 'AUTO');

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitFreeTime, setSubmitFreeTime] = useState(null);
  const [submitBookingId, setSubmitBookingId] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const sendingRef = useRef(false);
  const schedLinkRef = useRef(null);

  const [checkState, setCheckState] = useState({ status: 'idle', data: null, error: null });

  const resolvedMakeupId = makeupStaffId === 'AUTO' ? makeupArtists[0]?.id || '' : makeupStaffId;
  const resolvedShootStaffId = shootStaffId === 'AUTO' ? photographers[0]?.id || '' : shootStaffId;
  const resolvedRoomId = roomId === 'AUTO' ? rooms[rooms.length - 1]?.id || rooms[0]?.id || '' : roomId;

  const lastTokenRef = useRef(0);
  useEffect(() => {
    if (!schedulePick || schedulePick.token === lastTokenRef.current) return undefined;
    lastTokenRef.current = schedulePick.token;
    if (schedulePick.date) setDate(schedulePick.date);
    if (schedulePick.shootFrom) {
      setShootFrom(schedulePick.shootFrom);
      setShootTo(schedulePick.shootTo || addMinutesToTime(schedulePick.shootFrom, defaultDuration));
    }
    if (schedulePick.makeupFrom && schedulePick.makeupTo) {
      setMakeupFrom(schedulePick.makeupFrom);
      setMakeupTo(schedulePick.makeupTo);
      if (schedulePick.makeupStaffId) setMakeupStaffId(schedulePick.makeupStaffId);
      else if (!resolvedMakeupId && makeupArtists[0]) setMakeupStaffId(makeupArtists[0].id);
    }
    if (schedulePick.shootStaffId) setShootStaffId(schedulePick.shootStaffId);
    if (schedulePick.roomId) setRoomId(schedulePick.roomId);
    return undefined;
  }, [schedulePick, defaultDuration, resolvedMakeupId, makeupArtists]);

  const checkBody = useMemo(() => {
    if (!isValidIsoDate(date) || !resolvedShootStaffId || !resolvedRoomId) return null;
    if (!shootFrom || !shootTo || shootTo <= shootFrom) return null;
    if (resolvedMakeupId && (!makeupFrom || !makeupTo || makeupTo <= makeupFrom)) return null;
    return {
      date,
      makeup: resolvedMakeupId ? { from: makeupFrom, to: makeupTo, staffId: resolvedMakeupId } : null,
      shoot: { from: shootFrom, to: shootTo, staffId: resolvedShootStaffId, roomId: resolvedRoomId },
    };
  }, [date, resolvedMakeupId, makeupFrom, makeupTo, shootFrom, shootTo, resolvedShootStaffId, resolvedRoomId]);

  // Live clash check via POST /api/schedule/check whenever parameters change.
  useEffect(() => {
    if (!checkBody) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setCheckState((prev) => ({ ...prev, status: 'loading', error: null }));
      api('/schedule/check', { method: 'POST', body: checkBody, signal: controller.signal }).then(
        (res) => setCheckState({ status: 'ready', data: res, error: null }),
        (err) => {
          if (controller.signal.aborted) return;
          setCheckState({ status: 'error', data: null, error: err.message });
        },
      );
    }, 120);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [checkBody]);

  function handleShootFromChange(nextFrom) {
    const duration =
      shootFrom && shootTo && toMinutes(shootTo) > toMinutes(shootFrom)
        ? toMinutes(shootTo) - toMinutes(shootFrom)
        : defaultDuration;
    setShootFrom(nextFrom);
    setShootTo(addMinutesToTime(nextFrom, duration));
    if (resolvedMakeupId && makeupTo === shootFrom) {
      const mDuration = Math.max(60, toMinutes(makeupTo) - toMinutes(makeupFrom));
      const candidateFrom = addMinutesToTime(nextFrom, -mDuration);
      setMakeupFrom(candidateFrom);
      setMakeupTo(nextFrom);
    }
    setFieldErrors((prev) => ({ ...prev, 'shoot.from': undefined, 'shoot.to': undefined }));
  }

  function applyFreeTime(freeTime) {
    if (!freeTime) return;
    if (freeTime.makeup) {
      setMakeupFrom(freeTime.makeup.from);
      setMakeupTo(freeTime.makeup.to);
      if (!resolvedMakeupId && makeupArtists[0]) setMakeupStaffId(makeupArtists[0].id);
    }
    if (freeTime.shoot) {
      setShootFrom(freeTime.shoot.from);
      setShootTo(freeTime.shoot.to);
    }
    setSubmitError(null);
    setSubmitFreeTime(null);
  }

  function validateLocal() {
    const errs = {};
    if (!isValidIsoDate(date)) errs.date = 'Ngày theo dạng YYYY-MM-DD.';
    if (resolvedMakeupId) {
      if (!makeupFrom) errs['makeup.from'] = 'Chọn giờ bắt đầu makeup.';
      if (!makeupTo || makeupTo <= makeupFrom) errs['makeup.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
    }
    if (!shootFrom) errs['shoot.from'] = 'Chọn giờ bắt đầu chụp.';
    if (!shootTo || shootTo <= shootFrom) errs['shoot.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
    if (!resolvedShootStaffId) errs['shoot.staffId'] = 'Chọn thợ chụp.';
    if (!resolvedRoomId) errs['shoot.roomId'] = 'Chọn phòng chụp.';
    return errs;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sendingRef.current) return;
    setSubmitError(null);
    setSubmitFreeTime(null);
    setSubmitBookingId(null);
    setSubmitSuccess('');

    const errs = validateLocal();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    sendingRef.current = true;
    setSubmitting(true);
    try {
      const body = {
        date,
        makeup: resolvedMakeupId ? { from: makeupFrom, to: makeupTo, staffId: resolvedMakeupId } : null,
        shoot: { from: shootFrom, to: shootTo, staffId: resolvedShootStaffId, roomId: resolvedRoomId },
      };
      const updated = await api(`/conversations/${conv.id}/proposals`, { method: 'POST', body });
      onConversationUpdated(updated);
      setSubmitSuccess('Đã gửi đề xuất giờ vào hội thoại cho khách.');
    } catch (err) {
      if (Object.keys(err.fields || {}).length) {
        setFieldErrors(err.fields);
      } else {
        setSubmitError(err.message);
        if (err.details?.freeTime) setSubmitFreeTime(err.details.freeTime);
        if (err.details?.bookingId) setSubmitBookingId(err.details.bookingId);
      }
    } finally {
      sendingRef.current = false;
      setSubmitting(false);
    }
  }

  if (staffQuery.status === 'error') {
    return <ErrorState error={staffQuery.error} onRetry={staffQuery.retry} />;
  }
  if (roomsQuery.status === 'error') {
    return <ErrorState error={roomsQuery.error} onRetry={roomsQuery.retry} />;
  }
  if (!staffQuery.data || !roomsQuery.data) {
    return <LoadingState label="Đang tải danh sách nhân sự và phòng…" />;
  }

  const makeupOptions = [
    { value: '', label: 'Không makeup' },
    ...makeupArtists.map((s) => ({ value: s.id, label: s.name })),
  ];
  const photographerOptions = photographers.map((s) => ({ value: s.id, label: s.name }));
  const roomOptions = rooms.map((r) => ({ value: r.id, label: r.name }));

  const draftSlotForModal = {
    date,
    makeup: resolvedMakeupId
      ? {
          from: makeupFrom,
          to: makeupTo,
          staffId: resolvedMakeupId,
          staffName: makeupArtists.find((s) => s.id === resolvedMakeupId)?.name || '',
        }
      : null,
    shoot: {
      from: shootFrom,
      to: shootTo,
      staffId: resolvedShootStaffId,
      staffName: photographers.find((s) => s.id === resolvedShootStaffId)?.name || '',
      roomId: resolvedRoomId,
      roomName: rooms.find((r) => r.id === resolvedRoomId)?.name || '',
    },
  };

  const existingBookingId = conv.bookingId || submitBookingId;
  if (existingBookingId) {
    return (
      <div className="inspector-body">
        <div className="inspector-head-with-back">
          <button type="button" className="panel-back-btn" aria-label="Quay lại Tư vấn & Báo giá" onClick={onBack}>
            <Icon name="arrow-left" />
          </button>
          <div className="inspector-head-text">
            <h2>Đã có booking {existingBookingId}</h2>
            <p className="inspector-sub">{conv.customer.name}</p>
          </div>
          <StatusBadge tone="confirmed">Đã chốt lịch</StatusBadge>
        </div>
        <div className="avail-banner is-free" role="status">
          <p>
            <Icon name="check" />{' '}
            {submitError || `Hội thoại này đã có booking ${existingBookingId}, không thể gửi đề xuất mới.`}
          </p>
        </div>
        <Link className="btn btn-primary" to={`/quan-ly/booking/${existingBookingId}`}>
          Mở booking {existingBookingId}
        </Link>
      </div>
    );
  }

  return (
    <div className="inspector-body">
      <div className="inspector-head-with-back">
        <button type="button" className="panel-back-btn" aria-label="Quay lại Tư vấn & Báo giá" onClick={onBack}>
          <Icon name="arrow-left" />
        </button>
        <div className="inspector-head-text">
          <h2>Đề xuất lịch / Chốt lịch</h2>
          <p className="inspector-sub">{conv.customer.name}</p>
        </div>
        <StatusBadge tone="pending">Đang tư vấn</StatusBadge>
      </div>

      {openProposal ? (
        <p className="inspector-info-note" role="status">
          Đề xuất đang chờ khách xác nhận: ngày {openProposal.date.split('-').reverse().join('/')}, chụp{' '}
          {openProposal.shoot.from}–{openProposal.shoot.to}. Gửi đề xuất mới sẽ thay thế đề xuất này.
        </p>
      ) : null}

      <form className="inspector-form" noValidate onSubmit={handleSubmit}>
        <DatePicker
          id="prop-date"
          label="Ngày chụp"
          value={date}
          suggestedDate={latestRequest?.date || '2026-10-24'}
          error={fieldErrors.date}
          onChange={(next) => {
            setDate(next);
            setFieldErrors((p) => ({ ...p, date: undefined }));
          }}
        />

        <div className="inspector-grid-2">
          <Select
            id="prop-shoot-from"
            label="Giờ chụp từ"
            value={shootFrom}
            options={TIME_START_OPTIONS}
            error={fieldErrors['shoot.from']}
            onChange={handleShootFromChange}
          />
          <Select
            id="prop-shoot-to"
            label="Đến giờ"
            value={shootTo}
            options={buildEndTimeOptions(shootFrom, 19, 30)}
            error={fieldErrors['shoot.to']}
            onChange={(val) => {
              setShootTo(val);
              setFieldErrors((p) => ({ ...p, 'shoot.to': undefined }));
            }}
          />
        </div>

        <Select
          id="prop-makeup-staff"
          label="Thợ makeup"
          value={resolvedMakeupId}
          options={makeupOptions}
          error={fieldErrors['makeup.staffId']}
          onChange={(val) => {
            setMakeupStaffId(val);
            if (val && (!makeupFrom || !makeupTo || makeupTo <= makeupFrom)) {
              const mFrom = toMinutes(shootFrom) >= 9 * 60 ? addMinutesToTime(shootFrom, -60) : '08:00';
              const mTo = mFrom < shootFrom ? shootFrom : addMinutesToTime(mFrom, 60);
              setMakeupFrom(mFrom);
              setMakeupTo(mTo);
            }
          }}
        />

        {resolvedMakeupId ? (
          <div className="inspector-grid-2">
            <Select
              id="prop-makeup-from"
              label="Makeup từ"
              value={makeupFrom}
              options={TIME_START_OPTIONS}
              error={fieldErrors['makeup.from']}
              onChange={(val) => {
                setMakeupFrom(val);
                if (makeupTo <= val) setMakeupTo(addMinutesToTime(val, 60));
                setFieldErrors((p) => ({ ...p, 'makeup.from': undefined, 'makeup.to': undefined }));
              }}
            />
            <Select
              id="prop-makeup-to"
              label="Makeup đến"
              value={makeupTo}
              options={buildEndTimeOptions(makeupFrom, 19, 30)}
              error={fieldErrors['makeup.to']}
              onChange={(val) => {
                setMakeupTo(val);
                setFieldErrors((p) => ({ ...p, 'makeup.to': undefined }));
              }}
            />
          </div>
        ) : null}

        <div className="inspector-grid-2">
          <Select
            id="prop-photographer"
            label="Thợ chụp"
            value={resolvedShootStaffId}
            options={photographerOptions}
            error={fieldErrors['shoot.staffId']}
            onChange={(val) => setShootStaffId(val)}
          />
          <Select
            id="prop-room"
            label="Phòng chụp"
            value={resolvedRoomId}
            options={roomOptions}
            error={fieldErrors['shoot.roomId']}
            onChange={(val) => setRoomId(val)}
          />
        </div>

        {/* Live schedule check result */}
        <div className="schedule-check-box" aria-live="polite">
          {checkState.status === 'loading' ? (
            <p className="avail-banner is-checking">Đang kiểm tra lịch trống…</p>
          ) : checkState.status === 'error' ? (
            <p className="avail-banner is-conflict" role="alert">
              <Icon name="alert" /> {checkState.error}
            </p>
          ) : checkState.data ? (
            <div className={`avail-banner ${checkState.data.available ? 'is-free' : 'is-conflict'}`}>
              <p>
                <Icon name={checkState.data.available ? 'check' : 'alert'} /> {checkState.data.message}
              </p>
              {!checkState.data.available && checkState.data.freeTime ? (
                <Button
                  variant="secondary"
                  className="btn-compact"
                  onClick={() => applyFreeTime(checkState.data.freeTime)}
                >
                  Chọn giờ trống ({checkState.data.freeTime.shoot.from}–{checkState.data.freeTime.shoot.to})
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          ref={schedLinkRef}
          type="button"
          className="link-btn"
          onClick={() => onOpenSchedule(date, draftSlotForModal, schedLinkRef)}
        >
          <Icon name="calendar" /> Mở lịch thợ và phòng
        </button>

        {submitError ? (
          <div className="form-error" role="alert">
            <p>{submitError}</p>
            {submitFreeTime ? (
              <Button variant="secondary" className="btn-compact" onClick={() => applyFreeTime(submitFreeTime)}>
                Áp dụng giờ trống ({submitFreeTime.shoot.from}–{submitFreeTime.shoot.to})
              </Button>
            ) : null}
            {submitBookingId ? <p className="field-hint">Booking hiện có: {submitBookingId}</p> : null}
          </div>
        ) : null}

        {submitSuccess ? (
          <p className="form-done" role="status">
            {submitSuccess}
          </p>
        ) : null}

        <div className="inspector-actions">
          <Button variant="primary" type="submit" aria-disabled={submitting ? 'true' : undefined}>
            {submitting ? 'Đang gửi đề xuất…' : 'Gửi đề xuất giờ cho khách'}
          </Button>
          <Button variant="secondary" aria-disabled="true" aria-describedby="proposal-disabled-why">
            Tạo booking
          </Button>
          <p id="proposal-disabled-why" className="field-hint">
            Khách chưa đồng ý lịch đề xuất — hãy gửi đề xuất giờ và chờ khách xác nhận trong chat trước.
          </p>
        </div>
      </form>
    </div>
  );
}
