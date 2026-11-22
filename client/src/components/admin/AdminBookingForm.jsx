import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../api/client.js';
import useAction from '../../forms/useAction.js';
import { isValidIsoDate, vnWeekdayAndDate } from '../../utils/date.js';
import { vnDate } from '../../utils/moment.js';
import { formatVND } from '../../utils/money.js';
import { computeDraftPricing, detectIntentFromConversation } from '../../utils/pricing.js';
import { addMinutesToTime, buildTimeOptions } from '../../utils/schedule.js';
import { BOOKING_TONE } from '../../utils/status.js';
import { toMinutes } from '../../utils/time.js';
import Button from '../Button.jsx';
import CheckField from '../CheckField.jsx';
import DataState from '../DataState.jsx';
import EmptyState from '../EmptyState.jsx';
import Icon from '../Icon.jsx';
import StatusBadge from '../StatusBadge.jsx';
import TextField from '../TextField.jsx';
import DatePicker from '../ui/DatePicker.jsx';
import PriceSummary from '../ui/PriceSummary.jsx';
import Select from '../ui/Select.jsx';

const TIME_OPTIONS = buildTimeOptions(8, 17, 60);

function BookedSummaryView({ booking, onOpenSchedule }) {
  const schedBtnRef = useRef(null);
  return (
    <div className="inspector-body">
      <div className="inspector-head">
        <div>
          <h2>Booking {booking.id}</h2>
          <p className="inspector-sub">{booking.customer.name}</p>
        </div>
        <StatusBadge tone={BOOKING_TONE[booking.status] || 'pending'}>{booking.status}</StatusBadge>
      </div>

      <p className="avail-banner is-free" role="status">
        <Icon name="check" /> Hội thoại này đã gắn với booking {booking.id}.
      </p>

      <div className="inspector-section">
        <h3 className="inspector-label">Thông tin buổi chụp</h3>
        <dl className="detail-kv">
          <div>
            <dt>Dịch vụ</dt>
            <dd>
              {booking.serviceName} · {booking.packageName}
            </dd>
          </div>
          <div>
            <dt>Loại buổi chụp</dt>
            <dd>{booking.sessionType}</dd>
          </div>
          <div>
            <dt>Ngày chụp</dt>
            <dd>{vnWeekdayAndDate(booking.date)}</dd>
          </div>
          <div>
            <dt>Makeup</dt>
            <dd>
              {booking.makeup
                ? `${booking.makeup.from}–${booking.makeup.to} với ${booking.makeup.staffName}`
                : 'Không makeup'}
            </dd>
          </div>
          <div>
            <dt>Chụp</dt>
            <dd>
              {booking.shoot.from}–{booking.shoot.to} với {booking.shoot.staffName} tại {booking.shoot.roomName}
            </dd>
          </div>
          <div>
            <dt>Số người</dt>
            <dd>{booking.people}</dd>
          </div>
          <div>
            <dt>Dịch vụ thêm</dt>
            <dd>
              {booking.extras?.length
                ? booking.extras.map((x) => (x.modelName ? `${x.name}: ${x.modelName} (${x.size})` : x.name)).join(', ')
                : 'Không'}
            </dd>
          </div>
          <div>
            <dt>Thanh toán</dt>
            <dd>
              {booking.payment?.depositStatus === 'paid' ? 'Đã cọc 30%' : 'Chưa cọc 30%'}
              {booking.payment?.remainderStatus === 'paid' ? ' · Đã thanh toán 70%' : ''}
            </dd>
          </div>
          {booking.fileLink ? (
            <div>
              <dt>Link ảnh</dt>
              <dd>
                <a href={booking.fileLink} target="_blank" rel="noreferrer">
                  {booking.fileLink}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-label">Chi phí</h3>
        <PriceSummary pricing={booking.pricing} />
      </div>

      <div className="inspector-actions">
        <Link className="btn btn-secondary" to={`/quan-ly/booking/${booking.id}`}>
          Quản lý booking {booking.id}
        </Link>
        <Button ref={schedBtnRef} variant="secondary" onClick={() => onOpenSchedule(booking.date, null, schedBtnRef)}>
          <Icon name="calendar" /> Xem lịch thợ và phòng
        </Button>
      </div>
    </div>
  );
}

function DraftBookingForm({
  conv,
  servicesQuery,
  extrasQuery,
  staffQuery,
  roomsQuery,
  onBookingCreated,
  onConversationUpdated,
  onOpenSchedule,
  schedulePick,
}) {
  const services = servicesQuery.data || [];
  const extras = extrasQuery.data || [];
  const staff = staffQuery.data || [];
  const rooms = roomsQuery.data || [];
  const makeupArtists = staff.filter((s) => s.specialty === 'makeup');
  const photographers = staff.filter((s) => s.specialty === 'photographer');

  const messages = conv.messages || [];
  const agreedProposal = [...messages].reverse().find((m) => m.proposal?.status === 'agreed')?.proposal || null;
  const detected = detectIntentFromConversation(conv, services);
  const latestRequest = detected.request;

  const allPairs = services.flatMap((s) => (s.packages || []).map((p) => ({ service: s, pkg: p })));
  const initialPkgId = detected.pkg?.id || allPairs[0]?.pkg?.id || '';
  const initialService = detected.service || allPairs[0]?.service || null;

  const initialPicked = {};
  for (const x of latestRequest?.extras || []) initialPicked[x.extraId] = true;
  if (agreedProposal?.makeup) initialPicked.makeup = true;
  const initialCostume = (latestRequest?.extras || []).find((x) => x.modelId);

  const [packageId, setPackageId] = useState(initialPkgId);
  const [sessionType, setSessionType] = useState(
    initialService?.id === 'tot-nghiep' && (latestRequest?.people || 1) === 1
      ? 'Tốt nghiệp cá nhân'
      : initialService?.name || 'Tốt nghiệp cá nhân',
  );
  const [people, setPeople] = useState(String(latestRequest?.people || 1));

  const [date, setDate] = useState(agreedProposal?.date || latestRequest?.date || '2026-10-24');
  const [shootFrom, setShootFrom] = useState(agreedProposal?.shoot?.from || '14:00');
  const [shootTo, setShootTo] = useState(agreedProposal?.shoot?.to || '16:00');
  const [makeupStaffId, setMakeupStaffId] = useState(agreedProposal?.makeup?.staffId || '');
  const [makeupFrom, setMakeupFrom] = useState(agreedProposal?.makeup?.from || '13:00');
  const [makeupTo, setMakeupTo] = useState(agreedProposal?.makeup?.to || '14:00');
  const [shootStaffId, setShootStaffId] = useState(agreedProposal?.shoot?.staffId || '');
  const [roomId, setRoomId] = useState(agreedProposal?.shoot?.roomId || '');

  const [pickedExtras, setPickedExtras] = useState(initialPicked);
  const [costumeModelId, setCostumeModelId] = useState(initialCostume?.modelId || '');
  const [costumeSize, setCostumeSize] = useState(initialCostume?.size || '');
  const [costumeQty, setCostumeQty] = useState('1');

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [proposeDone, setProposeDone] = useState('');
  const createAction = useAction();
  const proposeAction = useAction();
  const schedBtnRef = useRef(null);

  const [checkState, setCheckState] = useState({ status: 'idle', data: null, error: null });

  const resolvedPair = allPairs.find((x) => x.pkg.id === packageId) || allPairs[0] || null;
  const selectedService = resolvedPair?.service || null;
  const selectedPkg = resolvedPair?.pkg || null;

  const resolvedShootStaffId = shootStaffId || photographers[0]?.id || '';
  const resolvedRoomId = roomId || rooms[0]?.id || '';

  const lastTokenRef = useRef(0);
  useEffect(() => {
    if (!schedulePick || schedulePick.token === lastTokenRef.current) return undefined;
    lastTokenRef.current = schedulePick.token;
    if (schedulePick.date) setDate(schedulePick.date);
    if (schedulePick.shootFrom) {
      setShootFrom(schedulePick.shootFrom);
      setShootTo(schedulePick.shootTo || addMinutesToTime(schedulePick.shootFrom, 120));
    }
    if (schedulePick.makeupFrom && schedulePick.makeupTo) {
      setMakeupFrom(schedulePick.makeupFrom);
      setMakeupTo(schedulePick.makeupTo);
      if (schedulePick.makeupStaffId) setMakeupStaffId(schedulePick.makeupStaffId);
    }
    if (schedulePick.shootStaffId) setShootStaffId(schedulePick.shootStaffId);
    if (schedulePick.roomId) setRoomId(schedulePick.roomId);
    return undefined;
  }, [schedulePick]);

  const costumeExtra = extras.find((e) => e.kind === 'costume');
  const selectedCostumeModel = costumeExtra?.models?.find((m) => m.id === costumeModelId) || null;
  const parsedCostumeQty = Number.parseInt(costumeQty, 10) || 1;

  const extrasPayload = extras
    .filter((ex) => pickedExtras[ex.id])
    .map((ex) => {
      if (ex.kind === 'costume') {
        return {
          extraId: ex.id,
          modelId: costumeModelId,
          size: costumeSize,
          quantity: parsedCostumeQty,
        };
      }
      return { extraId: ex.id, quantity: 1 };
    });

  const checkBody = useMemo(() => {
    if (!isValidIsoDate(date) || !resolvedShootStaffId || !resolvedRoomId) return null;
    if (!shootFrom || !shootTo || shootTo <= shootFrom) return null;
    if (makeupStaffId && (!makeupFrom || !makeupTo || makeupTo <= makeupFrom)) return null;
    return {
      date,
      makeup: makeupStaffId ? { from: makeupFrom, to: makeupTo, staffId: makeupStaffId } : null,
      shoot: { from: shootFrom, to: shootTo, staffId: resolvedShootStaffId, roomId: resolvedRoomId },
    };
  }, [date, makeupStaffId, makeupFrom, makeupTo, shootFrom, shootTo, resolvedShootStaffId, resolvedRoomId]);

  useEffect(() => {
    if (!checkBody) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setCheckState((p) => ({ ...p, status: 'loading', error: null }));
      api('/schedule/check', {
        method: 'POST',
        body: checkBody,
        signal: controller.signal,
      }).then(
        (res) => setCheckState({ status: 'ready', data: res, error: null }),
        (err) => {
          if (controller.signal.aborted) return;
          setCheckState({ status: 'error', data: null, error: err.message });
        },
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [checkBody]);

  function handleShootStartChange(nextFrom) {
    const duration =
      shootFrom && shootTo && toMinutes(shootTo) > toMinutes(shootFrom)
        ? toMinutes(shootTo) - toMinutes(shootFrom)
        : selectedPkg?.durationMinutes || 120;
    setShootFrom(nextFrom);
    setShootTo(addMinutesToTime(nextFrom, duration));
    if (makeupStaffId) {
      const mDur = makeupFrom && makeupTo ? Math.max(60, toMinutes(makeupTo) - toMinutes(makeupFrom)) : 60;
      const candidateFrom = addMinutesToTime(nextFrom, -mDur);
      setMakeupFrom(candidateFrom);
      setMakeupTo(nextFrom);
    }
    setProposeDone('');
  }

  function restoreAgreedSlot() {
    if (!agreedProposal) return;
    setDate(agreedProposal.date);
    setShootFrom(agreedProposal.shoot.from);
    setShootTo(agreedProposal.shoot.to);
    setShootStaffId(agreedProposal.shoot.staffId);
    setRoomId(agreedProposal.shoot.roomId);
    if (agreedProposal.makeup) {
      setMakeupStaffId(agreedProposal.makeup.staffId);
      setMakeupFrom(agreedProposal.makeup.from);
      setMakeupTo(agreedProposal.makeup.to);
    } else {
      setMakeupStaffId('');
    }
    setSubmitError(null);
  }

  function applyFreeTime(freeTime) {
    if (!freeTime) return;
    if (freeTime.makeup) {
      setMakeupFrom(freeTime.makeup.from);
      setMakeupTo(freeTime.makeup.to);
      if (!makeupStaffId && makeupArtists[0]) setMakeupStaffId(makeupArtists[0].id);
    }
    if (freeTime.shoot) {
      setShootFrom(freeTime.shoot.from);
      setShootTo(freeTime.shoot.to);
    }
    setSubmitError(null);
  }

  const slotMatchesAgreed = Boolean(
    agreedProposal &&
    date === agreedProposal.date &&
    shootFrom === agreedProposal.shoot.from &&
    shootTo === agreedProposal.shoot.to &&
    resolvedShootStaffId === agreedProposal.shoot.staffId &&
    resolvedRoomId === agreedProposal.shoot.roomId &&
    Boolean(makeupStaffId) === Boolean(agreedProposal.makeup) &&
    (!makeupStaffId ||
      (makeupStaffId === agreedProposal.makeup.staffId &&
        makeupFrom === agreedProposal.makeup.from &&
        makeupTo === agreedProposal.makeup.to)),
  );

  const hasConflict = checkState.data ? !checkState.data.available : false;

  async function handleProposeNewSlot() {
    setProposeDone('');
    setSubmitError(null);
    await proposeAction.run(async () => {
      const updated = await api(`/conversations/${conv.id}/proposals`, {
        method: 'POST',
        body: {
          date,
          makeup: makeupStaffId ? { from: makeupFrom, to: makeupTo, staffId: makeupStaffId } : null,
          shoot: { from: shootFrom, to: shootTo, staffId: resolvedShootStaffId, roomId: resolvedRoomId },
        },
      });
      onConversationUpdated(updated);
      setProposeDone('Đã gửi đề xuất giờ mới vào hội thoại để khách xác nhận.');
    });
  }

  async function handleCreateBooking(event) {
    event.preventDefault();
    if (!canCreate || createAction.busy) return;
    setSubmitError(null);
    setProposeDone('');
    const errs = {};
    if (!selectedService || !selectedPkg) errs.packageId = 'Chọn gói chụp.';
    const numPeople = Number(people);
    if (!Number.isInteger(numPeople) || numPeople < 1 || numPeople > 200) {
      errs.people = 'Số người từ 1 đến 200.';
    }
    if (!sessionType.trim() || sessionType.trim().length > 100) {
      errs.sessionType = 'Loại buổi chụp từ 1 đến 100 ký tự.';
    }
    if (costumeExtra && pickedExtras[costumeExtra.id] && (!costumeModelId || !costumeSize)) {
      errs.extras = 'Chọn mẫu và size trang phục.';
    }
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    await createAction.run(async () => {
      try {
        const created = await api('/bookings', {
          method: 'POST',
          body: {
            conversationId: conv.id,
            serviceId: selectedService.id,
            packageId: selectedPkg.id,
            sessionType: sessionType.trim(),
            people: numPeople,
            extras: extrasPayload,
          },
        });
        onBookingCreated(created);
      } catch (err) {
        if (Object.keys(err.fields || {}).length) {
          setFieldErrors(err.fields);
        } else {
          setSubmitError(err.message);
        }
        throw err;
      }
    });
  }

  if (!agreedProposal) {
    return (
      <div className="inspector-body">
        <div className="inspector-head">
          <div>
            <h2>Booking mới</h2>
            <p className="inspector-sub">{conv.customer.name}</p>
          </div>
          <StatusBadge tone="confirmed">Đã chốt lịch</StatusBadge>
        </div>
        <EmptyState>Không tìm thấy đề xuất lịch đã đồng ý trong hội thoại này.</EmptyState>
      </div>
    );
  }

  const packageOptions = allPairs.map(({ pkg }) => ({
    value: pkg.id,
    label: pkg.name,
    sub: pkg.priceUnit ? `${formatVND(pkg.price)}/${pkg.priceUnit}` : formatVND(pkg.price),
  }));

  const shootTimeOptions = TIME_OPTIONS.some((o) => o.value === agreedProposal.shoot.from)
    ? TIME_OPTIONS
    : [{ value: agreedProposal.shoot.from, label: agreedProposal.shoot.from }, ...TIME_OPTIONS];

  const pricing = computeDraftPricing(selectedPkg, people);

  const draftForSchedule = {
    date,
    makeup: makeupStaffId
      ? {
          from: makeupFrom,
          to: makeupTo,
          staffId: makeupStaffId,
          staffName: makeupArtists.find((s) => s.id === makeupStaffId)?.name || '',
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

  const canCreate = Boolean(selectedPkg && !hasConflict && slotMatchesAgreed && checkState.status !== 'loading');

  return (
    <div className="inspector-body">
      <div className="inspector-head">
        <div>
          <h2>Booking mới</h2>
          <p className="inspector-sub">{conv.customer.name}</p>
        </div>
        <StatusBadge tone="pending">Chờ cọc 30%</StatusBadge>
      </div>

      {/* Live status & clash banner */}
      <div aria-live="polite">
        {checkState.status === 'loading' ? (
          <p className="avail-banner is-checking">Đang kiểm tra lịch trống…</p>
        ) : hasConflict ? (
          <div className="avail-banner is-conflict" role="status">
            <p>
              <Icon name="alert" /> {checkState.data.message}
            </p>
            <div className="avail-actions">
              <Button variant="secondary" className="btn-compact" onClick={restoreAgreedSlot}>
                Chọn giờ trống ({agreedProposal.shoot.from})
              </Button>
              {checkState.data.freeTime &&
              !slotMatchesAgreed &&
              checkState.data.freeTime.shoot?.from !== agreedProposal.shoot.from ? (
                <Button
                  variant="secondary"
                  className="btn-compact"
                  onClick={() => applyFreeTime(checkState.data.freeTime)}
                >
                  Dùng giờ gợi ý ({checkState.data.freeTime.shoot.from})
                </Button>
              ) : null}
            </div>
          </div>
        ) : !slotMatchesAgreed ? (
          <div className="avail-banner is-notice" role="status">
            <p>
              <Icon name="clock" /> Giờ đang chọn khác với lịch khách đã chốt ({agreedProposal.shoot.from} ngày{' '}
              {vnDate(agreedProposal.date)}). Tạo booking trực tiếp dùng lịch đã chốt; muốn đổi giờ hãy gửi đề xuất mới.
            </p>
            <div className="avail-actions">
              <Button variant="secondary" className="btn-compact" onClick={restoreAgreedSlot}>
                Quay lại giờ đã chốt
              </Button>
              <Button
                variant="secondary"
                className="btn-compact"
                aria-disabled={proposeAction.busy ? 'true' : undefined}
                onClick={handleProposeNewSlot}
              >
                {proposeAction.busy ? 'Đang gửi…' : 'Gửi đề xuất giờ mới'}
              </Button>
            </div>
          </div>
        ) : checkState.data ? (
          <p className="avail-banner is-free" role="status">
            <Icon name="check" /> Đã chốt {agreedProposal.shoot.from} ngày {vnDate(agreedProposal.date)} ·{' '}
            {checkState.data.message} Giữ lịch sau khi cọc 30%.
          </p>
        ) : null}
      </div>

      {proposeAction.error ? (
        <p className="form-error" role="alert">
          {proposeAction.error}
        </p>
      ) : null}
      {proposeDone ? (
        <p className="form-done" role="status">
          {proposeDone}
        </p>
      ) : null}

      <form className="inspector-form" noValidate onSubmit={handleCreateBooking}>
        <fieldset className="inspector-fieldset">
          <legend>Khách và gói</legend>
          <div className="inspector-grid-2">
            <TextField id="bf-customer" name="customer" label="Khách hàng" value={conv.customer.name} readOnly />
            <DatePicker
              id="bf-date"
              label="Ngày chụp"
              value={date}
              suggestedDate={agreedProposal.date}
              onChange={setDate}
            />
          </div>

          <div className="inspector-grid-pkg">
            <Select
              id="bf-package"
              label="Gói chụp"
              value={selectedPkg?.id || ''}
              options={packageOptions}
              error={fieldErrors.packageId}
              onChange={(val) => {
                setPackageId(val);
                const pair = allPairs.find((p) => p.pkg.id === val);
                if (pair) {
                  setSessionType(
                    pair.service.id === 'tot-nghiep' && Number(people) === 1 ? 'Tốt nghiệp cá nhân' : pair.service.name,
                  );
                }
              }}
            />
            <Select
              id="bf-shoot-start"
              label="Giờ chụp"
              value={shootFrom}
              options={shootTimeOptions}
              onChange={handleShootStartChange}
            />
          </div>

          <div className="inspector-grid-2">
            <TextField
              id="bf-session-type"
              name="sessionType"
              label="Loại buổi chụp"
              value={sessionType}
              error={fieldErrors.sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            />
            <TextField
              id="bf-people"
              name="people"
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              label="Số người"
              value={people}
              error={fieldErrors.people}
              onChange={(e) => setPeople(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="inspector-fieldset">
          <legend>Nhân sự và phòng · Admin {conv.adminName || 'Thảo'}</legend>
          <div className="inspector-grid-3">
            <Select
              id="bf-makeup"
              label="Thợ makeup"
              value={makeupStaffId}
              options={[
                { value: '', label: 'Không makeup' },
                ...makeupArtists.map((s) => ({ value: s.id, label: s.name })),
              ]}
              onChange={setMakeupStaffId}
            />
            <Select
              id="bf-photographer"
              label="Thợ chụp"
              value={resolvedShootStaffId}
              options={photographers.map((s) => ({ value: s.id, label: s.name }))}
              onChange={setShootStaffId}
            />
            <Select
              id="bf-room"
              label="Phòng chụp"
              value={resolvedRoomId}
              options={rooms.map((r) => ({ value: r.id, label: r.name }))}
              onChange={setRoomId}
            />
          </div>
          <p className="field-hint">
            {makeupStaffId ? `Makeup ${makeupFrom}–${makeupTo} · ` : ''}Chụp {shootFrom}–{shootTo}
          </p>
        </fieldset>

        {extras.length ? (
          <fieldset className="inspector-fieldset">
            <legend>Dịch vụ thêm (chuẩn bị, không tính tiền)</legend>
            <div className="inspector-checks">
              {extras.map((ex) => (
                <div key={ex.id} className="inspector-extra-block">
                  <CheckField
                    id={`bf-extra-${ex.id}`}
                    label={ex.name}
                    checked={Boolean(pickedExtras[ex.id])}
                    onChange={(e) => setPickedExtras((prev) => ({ ...prev, [ex.id]: e.target.checked }))}
                  />
                  {ex.kind === 'costume' && pickedExtras[ex.id] ? (
                    <div className="inspector-costume-fields">
                      <Select
                        id="bf-costume-model"
                        label="Mẫu trang phục"
                        value={costumeModelId}
                        placeholder="Chọn mẫu"
                        options={(ex.models || []).map((m) => ({ value: m.id, label: m.name }))}
                        onChange={(val) => {
                          setCostumeModelId(val);
                          const m = ex.models.find((x) => x.id === val);
                          if (m && !m.sizes.includes(costumeSize)) setCostumeSize(m.sizes[0] || '');
                        }}
                      />
                      <div className="inspector-grid-2">
                        <Select
                          id="bf-costume-size"
                          label="Size"
                          value={costumeSize}
                          placeholder="Size"
                          disabled={!selectedCostumeModel}
                          options={(selectedCostumeModel?.sizes || []).map((sz) => ({ value: sz, label: sz }))}
                          onChange={setCostumeSize}
                        />
                        <TextField
                          id="bf-costume-qty"
                          name="costumeQty"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="200"
                          label="Số lượng"
                          value={costumeQty}
                          onChange={(e) => setCostumeQty(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {fieldErrors.extras ? <p className="field-error">{fieldErrors.extras}</p> : null}
          </fieldset>
        ) : null}

        <PriceSummary pricing={pricing} />

        <button
          ref={schedBtnRef}
          type="button"
          className="link-btn"
          onClick={() => onOpenSchedule(date, draftForSchedule, schedBtnRef)}
        >
          <Icon name="calendar" /> Mở lịch thợ và phòng
        </button>

        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <Button
          variant="primary"
          type="submit"
          className="btn-stacked"
          aria-disabled={!canCreate || createAction.busy ? 'true' : undefined}
          aria-describedby={!canCreate ? 'bf-create-why' : undefined}
        >
          <span>{createAction.busy ? 'Đang tạo booking…' : 'Tạo booking'}</span>
          <span className="btn-sub">Gửi vào trạng thái Chờ cọc 30%</span>
        </Button>
        {!canCreate ? (
          <p id="bf-create-why" className="field-hint">
            {hasConflict
              ? 'Lịch đang chọn bị trùng với khung giờ đã giữ.'
              : !slotMatchesAgreed
                ? 'Hãy quay lại giờ đã chốt hoặc gửi đề xuất giờ mới trước khi tạo booking.'
                : 'Đang kiểm tra lịch trống trước khi tạo booking.'}
          </p>
        ) : null}
      </form>
    </div>
  );
}

// Handles "Đã chốt lịch": Case A (create booking from agreed proposal) & Case B (view existing booking).
export default function AdminBookingForm({
  conv,
  bookingQuery,
  servicesQuery,
  extrasQuery,
  staffQuery,
  roomsQuery,
  onBookingCreated,
  onConversationUpdated,
  onOpenSchedule,
  schedulePick,
}) {
  if (conv.bookingId) {
    const matchedQuery =
      bookingQuery.data && bookingQuery.data.id !== conv.bookingId ? { ...bookingQuery, data: null } : bookingQuery;
    return (
      <DataState
        query={matchedQuery}
        isEmpty={(b) => !b}
        emptyText="Không tìm thấy thông tin booking."
        loadingLabel="Đang tải thông tin booking…"
      >
        {(booking) => <BookedSummaryView booking={booking} onOpenSchedule={onOpenSchedule} />}
      </DataState>
    );
  }

  return (
    <DataState
      query={servicesQuery}
      isEmpty={(s) => !s || s.length === 0}
      emptyText="Studio chưa có gói chụp nào để tạo booking."
      loadingLabel="Đang tải gói chụp và nhân sự…"
    >
      {() => (
        <DraftBookingForm
          conv={conv}
          servicesQuery={servicesQuery}
          extrasQuery={extrasQuery}
          staffQuery={staffQuery}
          roomsQuery={roomsQuery}
          onBookingCreated={onBookingCreated}
          onConversationUpdated={onConversationUpdated}
          onOpenSchedule={onOpenSchedule}
          schedulePick={schedulePick}
        />
      )}
    </DataState>
  );
}
