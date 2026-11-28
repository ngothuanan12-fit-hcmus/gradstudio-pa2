import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import CheckField from '../components/CheckField.jsx';
import DataState from '../components/DataState.jsx';
import Icon from '../components/Icon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TextField from '../components/TextField.jsx';
import DatePicker from '../components/ui/DatePicker.jsx';
import PriceSummary from '../components/ui/PriceSummary.jsx';
import Select from '../components/ui/Select.jsx';
import useAction from '../forms/useAction.js';
import useApi from '../hooks/useApi.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { isValidIsoDate, vnWeekdayAndDate } from '../utils/date.js';
import { formatMoment } from '../utils/moment.js';
import { formatVND } from '../utils/money.js';
import { BOOKING_TONE } from '../utils/status.js';
import '../styles/admin.css';
import '../styles/admin-pages.css';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PAY_STATUS_VI = {
  succeeded: 'Thành công',
  failed: 'Thất bại',
  pending: 'Đang chờ',
};

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500 || !/^https?:\/\//i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatExtrasText(extras) {
  if (!extras?.length) return 'Không';
  return extras
    .map((x) => {
      const parts = [x.name];
      if (x.modelName) parts.push(x.modelName);
      if (x.size) parts.push(`size ${x.size}`);
      const base = parts.join(' · ');
      return x.quantity > 1 ? `${base} × ${x.quantity}` : base;
    })
    .join(', ');
}

function normalizeExtrasForCompare(extras) {
  return JSON.stringify(
    (extras || [])
      .map((x) => ({
        extraId: x.extraId,
        modelId: x.modelId || null,
        size: x.size || null,
        quantity: x.quantity || 1,
      }))
      .sort((a, b) => a.extraId.localeCompare(b.extraId)),
  );
}

function initExtrasState(booking) {
  const picked = {};
  let costumeModelId = '';
  let costumeSize = '';
  let costumeQty = '1';
  for (const x of booking.extras || []) {
    picked[x.extraId] = true;
    if (x.modelId) {
      costumeModelId = x.modelId;
      costumeSize = x.size || '';
      costumeQty = String(x.quantity || 1);
    }
  }
  return { picked, costumeModelId, costumeSize, costumeQty };
}

function BookingDetailBody({
  booking,
  staffQuery,
  roomsQuery,
  extrasQuery,
  paymentsQuery,
  jobsQuery,
  onBookingUpdated,
}) {
  const staffList = staffQuery.data || [];
  const roomsList = roomsQuery.data || [];
  const extrasCatalog = extrasQuery.data || [];

  const initialExtras = initExtrasState(booking);
  const [date, setDate] = useState(booking.date);
  const [hasMakeup, setHasMakeup] = useState(Boolean(booking.makeup));
  const [makeupStaffId, setMakeupStaffId] = useState(booking.makeup?.staffId || '');
  const [makeupFrom, setMakeupFrom] = useState(booking.makeup?.from || '13:00');
  const [makeupTo, setMakeupTo] = useState(booking.makeup?.to || '14:00');
  const [shootStaffId, setShootStaffId] = useState(booking.shoot.staffId);
  const [shootFrom, setShootFrom] = useState(booking.shoot.from);
  const [shootTo, setShootTo] = useState(booking.shoot.to);
  const [roomId, setRoomId] = useState(booking.shoot.roomId);
  const [people, setPeople] = useState(String(booking.people));
  const [sessionType, setSessionType] = useState(booking.sessionType);
  const [pickedExtras, setPickedExtras] = useState(initialExtras.picked);
  const [costumeModelId, setCostumeModelId] = useState(initialExtras.costumeModelId);
  const [costumeSize, setCostumeSize] = useState(initialExtras.costumeSize);
  const [costumeQty, setCostumeQty] = useState(initialExtras.costumeQty);

  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveDone, setSaveDone] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const checkAction = useAction();
  const saveAction = useAction();

  const [fileLink, setFileLink] = useState(booking.fileLink || '');
  const [fileError, setFileError] = useState(null);
  const [fileDone, setFileDone] = useState('');
  const fileAction = useAction();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState(null);
  const [cancelDone, setCancelDone] = useState('');
  const cancelAction = useAction();

  const cancelStartButtonRef = useRef(null);
  const cancelConfirmHeadingRef = useRef(null);
  const cancelReasonInputRef = useRef(null);
  const cancelDoneRef = useRef(null);
  // Tracks which cancel-panel transition initiated a DOM swap so focus moves only on user steps, never on initial load.
  const cancelFocusTargetRef = useRef(null);

  function syncFromBooking(next) {
    const ex = initExtrasState(next);
    setDate(next.date);
    setHasMakeup(Boolean(next.makeup));
    setMakeupStaffId(next.makeup?.staffId || '');
    setMakeupFrom(next.makeup?.from || '13:00');
    setMakeupTo(next.makeup?.to || '14:00');
    setShootStaffId(next.shoot.staffId);
    setShootFrom(next.shoot.from);
    setShootTo(next.shoot.to);
    setRoomId(next.shoot.roomId);
    setPeople(String(next.people));
    setSessionType(next.sessionType);
    setPickedExtras(ex.picked);
    setCostumeModelId(ex.costumeModelId);
    setCostumeSize(ex.costumeSize);
    setCostumeQty(ex.costumeQty);
    setFieldErrors({});
    setSaveError(null);
  }

  // Build dropdown options safely even in MOCK_MODE=empty by always including the booking's current assignees.
  const sortedForMakeup = [
    ...staffList.filter((s) => s.specialty === 'makeup'),
    ...staffList.filter((s) => s.specialty !== 'makeup'),
  ];
  const makeupOptions = sortedForMakeup.map((s) => ({
    value: s.id,
    label: s.name,
    sub: s.specialty === 'makeup' ? 'Thợ makeup' : 'Thợ chụp',
  }));
  if (booking.makeup?.staffId && !makeupOptions.some((o) => o.value === booking.makeup.staffId)) {
    makeupOptions.unshift({ value: booking.makeup.staffId, label: booking.makeup.staffName });
  }

  const sortedForShoot = [
    ...staffList.filter((s) => s.specialty === 'photographer'),
    ...staffList.filter((s) => s.specialty !== 'photographer'),
  ];
  const shootStaffOptions = sortedForShoot.map((s) => ({
    value: s.id,
    label: s.name,
    sub: s.specialty === 'photographer' ? 'Thợ chụp' : 'Thợ makeup',
  }));
  if (booking.shoot?.staffId && !shootStaffOptions.some((o) => o.value === booking.shoot.staffId)) {
    shootStaffOptions.unshift({ value: booking.shoot.staffId, label: booking.shoot.staffName });
  }

  const roomOptions = roomsList.map((r) => ({ value: r.id, label: r.name }));
  if (booking.shoot?.roomId && !roomOptions.some((o) => o.value === booking.shoot.roomId)) {
    roomOptions.unshift({ value: booking.shoot.roomId, label: booking.shoot.roomName });
  }

  const costumeExtra = extrasCatalog.find((e) => e.kind === 'costume');
  const selectedCostumeModel = costumeExtra?.models?.find((m) => m.id === costumeModelId) || null;

  const isClosed = booking.status === 'Hoàn thành' || booking.status === 'Đã hủy';
  const shootJob = (jobsQuery.data || []).find((j) => j.role === 'shoot') || null;
  const shootStartedOrDone = Boolean(shootJob && (shootJob.status === 'Đang làm' || shootJob.status === 'Hoàn thành'));
  const slotLocked = isClosed || shootStartedOrDone;
  const peopleLocked = isClosed || booking.status !== 'Chờ cọc 30%' || booking.payment?.depositStatus === 'paid';
  const isRaceClash = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
  const canSetFileLink = booking.status === 'Đã đặt lịch';
  const canCancel = booking.status === 'Chờ cọc 30%' || booking.status === 'Đã đặt lịch';

  useEffect(() => {
    const target = cancelFocusTargetRef.current;
    if (!target) return;
    const node =
      target === 'confirm' && confirmCancel && canCancel
        ? cancelConfirmHeadingRef.current
        : target === 'start' && !confirmCancel && canCancel
          ? cancelStartButtonRef.current
          : target === 'done' && !confirmCancel && !canCancel && cancelDone
            ? cancelDoneRef.current
            : target === 'reason' && confirmCancel && canCancel && cancelReasonError
              ? cancelReasonInputRef.current
              : null;
    if (node) {
      cancelFocusTargetRef.current = null;
      node.focus();
    }
  }, [confirmCancel, canCancel, cancelDone, cancelReasonError]);

  function buildScheduleCheckBody() {
    const errs = {};
    if (!isValidIsoDate(date)) errs.date = 'Ngày theo dạng YYYY-MM-DD.';
    if (hasMakeup) {
      if (!TIME_RE.test(makeupFrom)) errs['makeup.from'] = 'Giờ theo dạng HH:MM.';
      if (!TIME_RE.test(makeupTo)) errs['makeup.to'] = 'Giờ theo dạng HH:MM.';
      else if (TIME_RE.test(makeupFrom) && makeupTo <= makeupFrom) {
        errs['makeup.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
      }
      if (!makeupStaffId) errs['makeup.staffId'] = 'Không có nhân viên này.';
    }
    if (!TIME_RE.test(shootFrom)) errs['shoot.from'] = 'Giờ theo dạng HH:MM.';
    if (!TIME_RE.test(shootTo)) errs['shoot.to'] = 'Giờ theo dạng HH:MM.';
    else if (TIME_RE.test(shootFrom) && shootTo <= shootFrom) {
      errs['shoot.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
    }
    if (!shootStaffId) errs['shoot.staffId'] = 'Không có nhân viên này.';
    if (!roomId) errs['shoot.roomId'] = 'Không có phòng này.';
    return { errs };
  }

  function handleCheckSchedule() {
    if (slotLocked || checkAction.busy) return;
    setSaveDone('');
    const { errs } = buildScheduleCheckBody();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    checkAction.run(async () => {
      const res = await api('/schedule/check', {
        method: 'POST',
        body: {
          date,
          makeup: hasMakeup ? { from: makeupFrom, to: makeupTo, staffId: makeupStaffId } : null,
          shoot: { from: shootFrom, to: shootTo, staffId: shootStaffId, roomId },
          excludeBookingId: booking.id,
        },
      });
      setCheckResult(res);
    });
  }

  function applyFreeTime(freeTime) {
    if (!freeTime) return;
    if (hasMakeup && freeTime.makeup) {
      setMakeupFrom(freeTime.makeup.from);
      setMakeupTo(freeTime.makeup.to);
    }
    if (freeTime.shoot) {
      setShootFrom(freeTime.shoot.from);
      setShootTo(freeTime.shoot.to);
    }
    setCheckResult(null);
    setSaveError(null);
  }

  function buildExtrasPayload() {
    if (!extrasCatalog.length) {
      return booking.extras.map((x) => ({
        extraId: x.extraId,
        modelId: x.modelId || null,
        size: x.size || null,
        quantity: x.quantity || 1,
      }));
    }
    const parsedQty = Number.parseInt(costumeQty, 10);
    return extrasCatalog
      .filter((ex) => pickedExtras[ex.id])
      .map((ex) => {
        if (ex.kind === 'costume') {
          return {
            extraId: ex.id,
            modelId: costumeModelId,
            size: costumeSize,
            quantity: Number.isInteger(parsedQty) ? parsedQty : 0,
          };
        }
        return { extraId: ex.id, modelId: null, size: null, quantity: 1 };
      });
  }

  function handleSaveChanges(event) {
    event.preventDefault();
    if (isClosed || saveAction.busy) return;
    setSaveDone('');
    setSaveError(null);

    const nextMakeup = hasMakeup ? { from: makeupFrom, to: makeupTo, staffId: makeupStaffId } : null;
    const nextShoot = { from: shootFrom, to: shootTo, staffId: shootStaffId, roomId };
    const parsedPeople = Number(people);
    const trimmedSession = sessionType.trim();
    const nextExtrasPayload = buildExtrasPayload();

    const patchBody = {};
    if (!slotLocked) {
      if (date !== booking.date) patchBody.date = date;

      const makeupChanged =
        Boolean(booking.makeup) !== Boolean(nextMakeup) ||
        (nextMakeup &&
          booking.makeup &&
          (nextMakeup.from !== booking.makeup.from ||
            nextMakeup.to !== booking.makeup.to ||
            nextMakeup.staffId !== booking.makeup.staffId));
      if (makeupChanged) patchBody.makeup = nextMakeup;

      const shootChanged =
        nextShoot.from !== booking.shoot.from ||
        nextShoot.to !== booking.shoot.to ||
        nextShoot.staffId !== booking.shoot.staffId ||
        nextShoot.roomId !== booking.shoot.roomId;
      if (shootChanged) patchBody.shoot = nextShoot;
    }

    if (!peopleLocked && (parsedPeople !== booking.people || people.trim() === '')) patchBody.people = parsedPeople;
    if (trimmedSession !== booking.sessionType) patchBody.sessionType = trimmedSession;
    if (
      extrasCatalog.length &&
      normalizeExtrasForCompare(nextExtrasPayload) !== normalizeExtrasForCompare(booking.extras)
    ) {
      patchBody.extras = nextExtrasPayload.map((x) =>
        x.modelId !== null
          ? { extraId: x.extraId, modelId: x.modelId, size: x.size, quantity: x.quantity }
          : { extraId: x.extraId, quantity: x.quantity },
      );
    }

    if (Object.keys(patchBody).length === 0) {
      setFieldErrors({});
      setSaveError('Chọn thông tin cần thay đổi.');
      return;
    }

    const errs = {};
    if (patchBody.date !== undefined && !isValidIsoDate(patchBody.date)) {
      errs.date = 'Ngày theo dạng YYYY-MM-DD.';
    }
    if (patchBody.makeup !== undefined && patchBody.makeup !== null) {
      if (!TIME_RE.test(patchBody.makeup.from)) errs['makeup.from'] = 'Giờ theo dạng HH:MM.';
      if (!TIME_RE.test(patchBody.makeup.to)) errs['makeup.to'] = 'Giờ theo dạng HH:MM.';
      else if (TIME_RE.test(patchBody.makeup.from) && patchBody.makeup.to <= patchBody.makeup.from) {
        errs['makeup.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
      }
      if (!patchBody.makeup.staffId) errs['makeup.staffId'] = 'Không có nhân viên này.';
    }
    if (patchBody.shoot !== undefined) {
      if (!TIME_RE.test(patchBody.shoot.from)) errs['shoot.from'] = 'Giờ theo dạng HH:MM.';
      if (!TIME_RE.test(patchBody.shoot.to)) errs['shoot.to'] = 'Giờ theo dạng HH:MM.';
      else if (TIME_RE.test(patchBody.shoot.from) && patchBody.shoot.to <= patchBody.shoot.from) {
        errs['shoot.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
      }
      if (!patchBody.shoot.staffId) errs['shoot.staffId'] = 'Không có nhân viên này.';
      if (!patchBody.shoot.roomId) errs['shoot.roomId'] = 'Không có phòng này.';
    }
    if (patchBody.people !== undefined && (!Number.isInteger(parsedPeople) || parsedPeople < 1 || parsedPeople > 200)) {
      errs.people = 'Số người từ 1 đến 200.';
    }
    if (patchBody.sessionType !== undefined && (!trimmedSession || trimmedSession.length > 100)) {
      errs.sessionType = 'Loại buổi chụp từ 1 đến 100 ký tự.';
    }
    if (
      patchBody.extras !== undefined &&
      costumeExtra &&
      pickedExtras[costumeExtra.id] &&
      (!costumeModelId ||
        !costumeSize ||
        !Number.isInteger(Number(costumeQty)) ||
        Number(costumeQty) < 1 ||
        Number(costumeQty) > 200)
    ) {
      errs.extras = 'Dịch vụ thêm không hợp lệ.';
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    saveAction.run(async () => {
      try {
        const wasRaceClash = booking.status === 'Chờ cọc 30%' && booking.payment?.depositStatus === 'paid';
        const updated = await api(`/bookings/${booking.id}`, {
          method: 'PATCH',
          body: patchBody,
        });
        onBookingUpdated(updated);
        syncFromBooking(updated);
        setCheckResult(null);
        setSaveDone(
          wasRaceClash && updated.status === 'Đã đặt lịch'
            ? 'Đã đổi sang giờ trống và chuyển booking sang trạng thái Đã đặt lịch.'
            : 'Đã lưu thay đổi booking.',
        );
      } catch (err) {
        if (Object.keys(err.fields || {}).length) {
          setFieldErrors(err.fields);
        } else {
          setSaveError(err.message);
          if (err.details?.freeTime) {
            setCheckResult({
              available: false,
              message: err.message,
              conflicts: err.details.conflicts || [],
              freeTime: err.details.freeTime,
            });
          }
        }
      }
    });
  }

  function handleSaveFileLink(event) {
    event.preventDefault();
    if (!canSetFileLink || fileAction.busy) return;
    setFileError(null);
    setFileDone('');
    if (!isHttpUrl(fileLink)) {
      setFileError('Nhập đường dẫn file hợp lệ (http:// hoặc https://).');
      return;
    }
    fileAction.run(async () => {
      try {
        const updated = await api(`/bookings/${booking.id}/file-link`, {
          method: 'PUT',
          body: { fileLink: fileLink.trim() },
        });
        onBookingUpdated(updated);
        setFileLink(updated.fileLink || '');
        setFileDone('Đã cập nhật link file ảnh hoàn chỉnh.');
      } catch (err) {
        if (err.fields?.fileLink) {
          setFileError(err.fields.fileLink);
          return;
        }
        throw err;
      }
    });
  }

  function handleConfirmCancel(event) {
    event.preventDefault();
    if (!canCancel || cancelAction.busy) return;
    setCancelReasonError(null);
    setCancelDone('');
    if (cancelReason.length > 500) {
      cancelFocusTargetRef.current = 'reason';
      setCancelReasonError('Lý do hủy tối đa 500 ký tự.');
      return;
    }
    cancelAction.run(async () => {
      try {
        const body = cancelReason.trim() ? { reason: cancelReason.trim() } : {};
        const updated = await api(`/bookings/${booking.id}/cancel`, {
          method: 'POST',
          body,
        });
        cancelFocusTargetRef.current = 'done';
        onBookingUpdated(updated);
        syncFromBooking(updated);
        setConfirmCancel(false);
        setCancelReason('');
        setCancelDone('Đã hủy booking và giải phóng nhân sự, phòng chụp.');
      } catch (err) {
        if (err.fields?.reason) {
          cancelFocusTargetRef.current = 'reason';
          setCancelReasonError(err.fields.reason);
          return;
        }
        throw err;
      }
    });
  }

  return (
    <div className="booking-detail-stack">
      <div className="panel booking-detail-top">
        <div className="panel-head">
          <div>
            <p className="title">
              {booking.customer.name} · Admin {booking.admin.name}
            </p>
            <p className="meta-line">
              {booking.serviceName} · {booking.packageName}
            </p>
          </div>
          <div className="badge-pair">
            <StatusBadge tone={BOOKING_TONE[booking.status] || 'neutral'}>{booking.status}</StatusBadge>
            {isRaceClash ? <StatusBadge tone="conflict">Cọc trùng lịch chờ xử lý</StatusBadge> : null}
            {booking.conversationId ? (
              <Link className="btn btn-secondary btn-compact" to={`/quan-ly/hoi-thoai/${booking.conversationId}`}>
                Mở hội thoại
              </Link>
            ) : null}
          </div>
        </div>

        {isRaceClash ? (
          <div className="avail-banner is-conflict" role="status">
            <p>
              <Icon name="alert" /> <strong>Booking đã nhận cọc 30% nhưng chưa giữ được lịch</strong>
            </p>
            <p>
              Khách đã thanh toán {formatVND(booking.pricing.deposit)}, nhưng khung giờ trùng với booking đã giữ trước.
              Hãy chọn ngày/giờ còn trống ở biểu mẫu bên dưới và bấm <strong>Lưu thay đổi</strong> để chuyển booking
              sang trạng thái <strong>Đã đặt lịch</strong>, hoặc hủy booking và hoàn tiền ngoài hệ thống.
            </p>
          </div>
        ) : null}
      </div>

      <div className="booking-detail-columns">
        <section className="panel" aria-labelledby="bd-overview-heading">
          <h2 id="bd-overview-heading">Thông tin tổng quan</h2>
          <dl className="detail-kv">
            <div>
              <dt>Mã booking</dt>
              <dd>{booking.id}</dd>
            </div>
            <div>
              <dt>Khách hàng</dt>
              <dd>{booking.customer.name}</dd>
            </div>
            <div>
              <dt>Gói chụp</dt>
              <dd>{booking.packageName}</dd>
            </div>
            <div>
              <dt>Loại buổi chụp</dt>
              <dd>{booking.sessionType}</dd>
            </div>
            <div>
              <dt>Số người</dt>
              <dd>{booking.people}</dd>
            </div>
            <div>
              <dt>Ngày chụp</dt>
              <dd>{vnWeekdayAndDate(booking.date)}</dd>
            </div>
            <div>
              <dt>Makeup</dt>
              <dd>
                {booking.makeup ? `${booking.makeup.from}–${booking.makeup.to} · ${booking.makeup.staffName}` : 'Không'}
              </dd>
            </div>
            <div>
              <dt>Chụp</dt>
              <dd>
                {booking.shoot.from}–{booking.shoot.to} · {booking.shoot.staffName} · {booking.shoot.roomName}
              </dd>
            </div>
            <div>
              <dt>Dịch vụ thêm</dt>
              <dd>{formatExtrasText(booking.extras)}</dd>
            </div>
            <div>
              <dt>Thanh toán cọc</dt>
              <dd>
                {booking.payment?.depositStatus === 'paid'
                  ? `Đã thanh toán${booking.payment.depositPaidAt ? ` (${formatMoment(booking.payment.depositPaidAt)})` : ''}`
                  : 'Chưa thanh toán'}
              </dd>
            </div>
            <div>
              <dt>Thanh toán 70%</dt>
              <dd>
                {booking.payment?.remainderStatus === 'paid'
                  ? `Đã thanh toán${booking.payment.remainderPaidAt ? ` (${formatMoment(booking.payment.remainderPaidAt)})` : ''}`
                  : 'Chưa thanh toán'}
              </dd>
            </div>
            <div>
              <dt>Link file ảnh</dt>
              <dd>
                {booking.fileLink ? (
                  <a href={booking.fileLink} target="_blank" rel="noreferrer">
                    {booking.fileLink}
                  </a>
                ) : (
                  'Chưa có'
                )}
              </dd>
            </div>
          </dl>

          <h3>Chi phí</h3>
          <PriceSummary pricing={booking.pricing} />
        </section>

        <section className="panel" aria-labelledby="bd-payments-heading">
          <h2 id="bd-payments-heading">Lịch sử thanh toán</h2>
          <DataState
            query={paymentsQuery}
            emptyText="Chưa ghi nhận giao dịch thanh toán nào."
            loadingLabel="Đang tải lịch sử thanh toán…"
          >
            {(items) => (
              <ul className="payment-history">
                {items.map((p) => (
                  <li key={p.id} className="payment-row">
                    <div className="payment-row-top">
                      <strong>{p.kind === 'deposit' ? 'Cọc 30%' : 'Phần còn lại 70%'}</strong>
                      <span className="payment-amount">{formatVND(p.amount)}</span>
                    </div>
                    <div className="payment-row-meta">
                      <span>{PAY_STATUS_VI[p.status] || p.status}</span>
                      <time dateTime={p.completedAt || p.createdAt}>{formatMoment(p.completedAt || p.createdAt)}</time>
                    </div>
                    {p.message ? <p className="payment-row-note">{p.message}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </DataState>
        </section>
      </div>

      <section className="panel" aria-labelledby="bd-edit-heading">
        <div className="panel-head">
          <h2 id="bd-edit-heading">Đổi lịch &amp; cập nhật thông tin</h2>
          {isClosed ? <span className="meta-line">Đã khóa chỉnh sửa</span> : null}
        </div>
        <p className="meta-line">Gói chụp và đơn giá đã khóa từ lúc tạo booking, không thể chỉnh sửa.</p>

        <form className="booking-edit-form" noValidate onSubmit={handleSaveChanges}>
          <div className="detail-form-grid">
            <DatePicker
              id="bd-date"
              label="Ngày chụp"
              value={date}
              suggestedDate={booking.date}
              disabled={slotLocked}
              error={fieldErrors.date}
              onChange={(val) => {
                setDate(val);
                setCheckResult(null);
                setSaveError(null);
              }}
            />
            <TextField
              id="bd-session-type"
              name="sessionType"
              label="Loại buổi chụp"
              value={sessionType}
              disabled={isClosed}
              error={fieldErrors.sessionType}
              onChange={(e) => {
                setSessionType(e.target.value);
                setSaveError(null);
              }}
            />
            <TextField
              id="bd-people"
              name="people"
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              label="Số người"
              hint={
                peopleLocked && !isClosed ? 'Chỉ sửa được số người khi booking còn Chờ cọc 30% và chưa cọc.' : undefined
              }
              value={people}
              disabled={peopleLocked}
              error={fieldErrors.people}
              onChange={(e) => {
                setPeople(e.target.value);
                setSaveError(null);
              }}
            />
          </div>

          <fieldset className="inspector-fieldset">
            <legend>Lịch makeup</legend>
            <CheckField
              id="bd-has-makeup"
              label="Có makeup"
              checked={hasMakeup}
              disabled={slotLocked}
              onChange={(e) => {
                const checked = e.target.checked;
                setHasMakeup(checked);
                if (checked && !makeupStaffId && makeupOptions[0]) {
                  setMakeupStaffId(makeupOptions[0].value);
                }
                setCheckResult(null);
                setSaveError(null);
              }}
            />
            {hasMakeup ? (
              <div className="detail-form-grid">
                <Select
                  id="bd-makeup-staff"
                  label="Thợ makeup"
                  value={makeupStaffId}
                  options={makeupOptions}
                  disabled={slotLocked}
                  error={fieldErrors['makeup.staffId']}
                  onChange={(val) => {
                    setMakeupStaffId(val);
                    setCheckResult(null);
                    setSaveError(null);
                  }}
                />
                <TextField
                  id="bd-makeup-from"
                  name="makeup.from"
                  type="time"
                  label="Makeup từ"
                  value={makeupFrom}
                  disabled={slotLocked}
                  error={fieldErrors['makeup.from']}
                  onChange={(e) => {
                    setMakeupFrom(e.target.value);
                    setCheckResult(null);
                    setSaveError(null);
                  }}
                />
                <TextField
                  id="bd-makeup-to"
                  name="makeup.to"
                  type="time"
                  label="Makeup đến"
                  value={makeupTo}
                  disabled={slotLocked}
                  error={fieldErrors['makeup.to']}
                  onChange={(e) => {
                    setMakeupTo(e.target.value);
                    setCheckResult(null);
                    setSaveError(null);
                  }}
                />
              </div>
            ) : null}
          </fieldset>

          <fieldset className="inspector-fieldset">
            <legend>Lịch chụp &amp; phòng</legend>
            <div className="detail-form-grid-4">
              <TextField
                id="bd-shoot-from"
                name="shoot.from"
                type="time"
                label="Chụp từ"
                value={shootFrom}
                disabled={slotLocked}
                error={fieldErrors['shoot.from']}
                onChange={(e) => {
                  setShootFrom(e.target.value);
                  setCheckResult(null);
                  setSaveError(null);
                }}
              />
              <TextField
                id="bd-shoot-to"
                name="shoot.to"
                type="time"
                label="Chụp đến"
                value={shootTo}
                disabled={slotLocked}
                error={fieldErrors['shoot.to']}
                onChange={(e) => {
                  setShootTo(e.target.value);
                  setCheckResult(null);
                  setSaveError(null);
                }}
              />
              <Select
                id="bd-shoot-staff"
                label="Thợ chụp"
                value={shootStaffId}
                options={shootStaffOptions}
                disabled={slotLocked}
                error={fieldErrors['shoot.staffId']}
                onChange={(val) => {
                  setShootStaffId(val);
                  setCheckResult(null);
                  setSaveError(null);
                }}
              />
              <Select
                id="bd-room"
                label="Phòng chụp"
                value={roomId}
                options={roomOptions}
                disabled={slotLocked}
                error={fieldErrors['shoot.roomId']}
                onChange={(val) => {
                  setRoomId(val);
                  setCheckResult(null);
                  setSaveError(null);
                }}
              />
            </div>
          </fieldset>
          {shootStartedOrDone && !isClosed ? (
            <p id="bd-slot-locked-why" className="field-hint">
              Buổi chụp đã bắt đầu hoặc hoàn thành, không thể đổi giờ.
            </p>
          ) : null}

          {extrasCatalog.length ? (
            <fieldset className="inspector-fieldset">
              <legend>Dịch vụ thêm (chuẩn bị, không tính tiền)</legend>
              <div className="inspector-checks">
                {extrasCatalog.map((ex) => (
                  <div key={ex.id} className="inspector-extra-block">
                    <CheckField
                      id={`bd-extra-${ex.id}`}
                      label={ex.name}
                      checked={Boolean(pickedExtras[ex.id])}
                      disabled={isClosed}
                      onChange={(e) => {
                        setPickedExtras((prev) => ({ ...prev, [ex.id]: e.target.checked }));
                        setSaveError(null);
                      }}
                    />
                    {ex.kind === 'costume' && pickedExtras[ex.id] ? (
                      <div className="inspector-costume-fields">
                        <div className="detail-form-grid">
                          <Select
                            id="bd-costume-model"
                            label="Mẫu trang phục"
                            value={costumeModelId}
                            placeholder="Chọn mẫu"
                            disabled={isClosed}
                            options={(ex.models || []).map((m) => ({ value: m.id, label: m.name }))}
                            onChange={(val) => {
                              setCostumeModelId(val);
                              const m = ex.models.find((item) => item.id === val);
                              if (m && !m.sizes.includes(costumeSize)) setCostumeSize(m.sizes[0] || '');
                              setSaveError(null);
                            }}
                          />
                          <Select
                            id="bd-costume-size"
                            label="Size"
                            value={costumeSize}
                            placeholder="Chọn size"
                            disabled={isClosed || !selectedCostumeModel}
                            options={(selectedCostumeModel?.sizes || []).map((sz) => ({ value: sz, label: sz }))}
                            onChange={(val) => {
                              setCostumeSize(val);
                              setSaveError(null);
                            }}
                          />
                          <TextField
                            id="bd-costume-qty"
                            name="costumeQty"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="200"
                            label="Số lượng"
                            value={costumeQty}
                            disabled={isClosed}
                            onChange={(e) => {
                              setCostumeQty(e.target.value);
                              setSaveError(null);
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {fieldErrors.extras ? (
                <p className="field-error" role="alert">
                  {fieldErrors.extras}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {checkAction.error ? (
            <p className="form-error" role="alert">
              {checkAction.error}
            </p>
          ) : null}

          {checkResult ? (
            <div className={`avail-banner ${checkResult.available ? 'is-free' : 'is-conflict'}`} role="status">
              <p>
                <Icon name={checkResult.available ? 'check' : 'alert'} /> {checkResult.message}
              </p>
              {!checkResult.available && checkResult.freeTime ? (
                <div className="avail-actions">
                  <Button
                    variant="secondary"
                    className="btn-compact"
                    type="button"
                    onClick={() => applyFreeTime(checkResult.freeTime)}
                  >
                    Dùng giờ gợi ý ({checkResult.freeTime.shoot.from}–{checkResult.freeTime.shoot.to})
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {saveError ? (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          ) : null}
          <p className="form-done" role="status">
            {saveDone}
          </p>

          <div className="detail-form-actions">
            <Button
              variant="secondary"
              type="button"
              aria-disabled={slotLocked || checkAction.busy ? 'true' : undefined}
              aria-describedby={shootStartedOrDone && !isClosed ? 'bd-slot-locked-why' : undefined}
              onClick={handleCheckSchedule}
            >
              {checkAction.busy ? 'Đang kiểm tra…' : 'Kiểm tra lịch trống'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              aria-disabled={isClosed || saveAction.busy ? 'true' : undefined}
              aria-describedby={isClosed ? 'bd-edit-locked-why' : undefined}
            >
              {saveAction.busy ? 'Đang lưu…' : 'Lưu thay đổi'}
            </Button>
          </div>
          {isClosed ? (
            <p id="bd-edit-locked-why" className="field-hint">
              Booking đã {booking.status.toLowerCase()}, không thể thay đổi thông tin.
            </p>
          ) : null}
        </form>
      </section>

      <div className="booking-detail-columns">
        <section className="panel" aria-labelledby="bd-file-heading">
          <h2 id="bd-file-heading">Link file ảnh hoàn chỉnh</h2>
          <form className="booking-edit-form" noValidate onSubmit={handleSaveFileLink}>
            <TextField
              id="bd-file-link"
              name="fileLink"
              type="url"
              label="Đường dẫn file ảnh"
              hint="Đường dẫn http:// hoặc https:// gửi cho khách khi nhận ảnh."
              placeholder="https://drive.gradstudio.test/..."
              value={fileLink}
              disabled={!canSetFileLink}
              error={fileError}
              onChange={(e) => {
                setFileLink(e.target.value);
                setFileError(null);
                setFileDone('');
              }}
            />
            {fileAction.error ? (
              <p className="form-error" role="alert">
                {fileAction.error}
              </p>
            ) : null}
            <p className="form-done" role="status">
              {fileDone}
            </p>
            <div>
              <Button
                variant="primary"
                type="submit"
                aria-disabled={!canSetFileLink || fileAction.busy ? 'true' : undefined}
                aria-describedby={!canSetFileLink ? 'bd-file-why' : undefined}
              >
                {fileAction.busy ? 'Đang lưu…' : 'Lưu link file ảnh'}
              </Button>
            </div>
            {!canSetFileLink ? (
              <p id="bd-file-why" className="field-hint">
                Chỉ gắn link file ảnh cho booking đã đặt lịch.
              </p>
            ) : null}
          </form>
        </section>

        <section className="panel" aria-labelledby="bd-cancel-heading">
          <h2 id="bd-cancel-heading">Hủy booking</h2>
          <p className="form-done" role="status" ref={cancelDoneRef} tabIndex={-1}>
            {cancelDone}
          </p>
          {!canCancel ? (
            <>
              <div>
                <Button variant="secondary" type="button" aria-disabled="true" aria-describedby="bd-cancel-why">
                  Hủy booking
                </Button>
              </div>
              <p id="bd-cancel-why" className="field-hint">
                Booking đang ở trạng thái {booking.status}, không thể hủy nữa.
              </p>
            </>
          ) : !confirmCancel ? (
            <div className="cancel-start">
              <p className="meta-line">
                Hủy booking sẽ chuyển sang trạng thái Đã hủy, giải phóng thợ và phòng chụp, đồng thời xóa nhắc lịch.
              </p>
              <div>
                <Button
                  ref={cancelStartButtonRef}
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    cancelFocusTargetRef.current = 'confirm';
                    setConfirmCancel(true);
                  }}
                >
                  Hủy booking
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="cancel-confirm-box"
              aria-labelledby="bd-cancel-confirm-heading"
              noValidate
              onSubmit={handleConfirmCancel}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && !e.nativeEvent?.isComposing && !e.isComposing && !cancelAction.busy) {
                  cancelFocusTargetRef.current = 'start';
                  setConfirmCancel(false);
                  setCancelReasonError(null);
                }
              }}
            >
              <h3
                id="bd-cancel-confirm-heading"
                ref={cancelConfirmHeadingRef}
                tabIndex={-1}
                className="cancel-confirm-title"
              >
                Xác nhận hủy booking {booking.id}?
              </h3>
              <p>Nhân sự, phòng chụp và nhắc lịch gắn với booking này sẽ được gỡ bỏ.</p>
              {booking.payment?.depositStatus === 'paid' ? (
                <div className="avail-banner is-conflict" role="note">
                  <p>
                    <Icon name="alert" /> Khách đã thanh toán cọc {formatVND(booking.pricing.deposit)}
                    {booking.payment.remainderStatus === 'paid'
                      ? ` và phần còn lại ${formatVND(booking.pricing.remainder)}`
                      : ''}
                    . Hệ thống không tự động hoàn tiền — studio hoàn trả ngoài hệ thống.
                  </p>
                </div>
              ) : null}
              <TextField
                ref={cancelReasonInputRef}
                id="bd-cancel-reason"
                name="reason"
                as="textarea"
                rows={2}
                label="Lý do hủy (không bắt buộc)"
                hint="Tối đa 500 ký tự."
                value={cancelReason}
                error={cancelReasonError}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setCancelReasonError(null);
                }}
              />
              {cancelAction.error ? (
                <p className="form-error" role="alert">
                  {cancelAction.error}
                </p>
              ) : null}
              <div className="detail-form-actions">
                <Button variant="primary" type="submit" aria-disabled={cancelAction.busy ? 'true' : undefined}>
                  {cancelAction.busy ? 'Đang hủy…' : 'Xác nhận hủy booking'}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  aria-disabled={cancelAction.busy ? 'true' : undefined}
                  onClick={() => {
                    if (cancelAction.busy) return;
                    cancelFocusTargetRef.current = 'start';
                    setConfirmCancel(false);
                    setCancelReasonError(null);
                  }}
                >
                  Giữ lại booking
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

// Step G10 (docs/api/05-bookings.md): Admin booking detail, reschedule/edit with clash check, file link, and cancel.
export default function QuanLyBookingDetail() {
  const { id } = useParams();
  const bookingQuery = useApi(`/bookings/${id}`);
  const staffQuery = useApi('/staff');
  const roomsQuery = useApi('/rooms');
  const extrasQuery = useApi('/extras');
  const paymentsQuery = useApi(`/payments?bookingId=${id}`);
  const jobsQuery = useApi(`/jobs?bookingId=${id}`);

  return (
    <AdminLayout title={`Chi tiết booking ${id}: GradStudio`}>
      <p className="back-link">
        <Link to="/quan-ly/booking">‹ Tất cả booking</Link>
      </p>
      <h1 className="page-title">Chi tiết booking {id}</h1>

      <DataState
        query={bookingQuery}
        isEmpty={(b) => !b}
        emptyText="Không tìm thấy booking."
        loadingLabel="Đang tải booking…"
      >
        {(booking) => (
          <BookingDetailBody
            key={booking.id}
            booking={booking}
            staffQuery={staffQuery}
            roomsQuery={roomsQuery}
            extrasQuery={extrasQuery}
            paymentsQuery={paymentsQuery}
            jobsQuery={jobsQuery}
            onBookingUpdated={bookingQuery.setData}
          />
        )}
      </DataState>
    </AdminLayout>
  );
}
