import { useRef, useState } from 'react';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PreviewImage from '../components/PreviewImage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useAction from '../forms/useAction.js';
import useApi from '../hooks/useApi.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { vnWeekdayAndDate } from '../utils/date.js';
import { formatMoment } from '../utils/moment.js';
import { JOB_TONE } from '../utils/status.js';
import '../styles/admin-pages.css';

const JOB_STATUSES = ['Chưa bắt đầu', 'Đang làm', 'Hoàn thành'];
const STATUS_FILTERS = [{ id: 'all', label: 'Tất cả' }, ...JOB_STATUSES.map((s) => ({ id: s, label: s }))];
const ALLOWED_PREVIEW_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;

function formatExtras(extras) {
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

function JobCard({ job, onJobUpdated }) {
  const statusAction = useAction();
  const [statusFeedback, setStatusFeedback] = useState('');
  const isCancelledBooking = job.bookingStatus === 'Đã hủy';
  const canUpdate = job.canUpdate !== false && !isCancelledBooking;
  const lockMessage =
    job.lockReason || (isCancelledBooking ? 'Booking đã hủy, không thể cập nhật trạng thái công việc.' : '');

  function handleStatusUpdate(nextStatus) {
    if (!canUpdate || nextStatus === job.status || statusAction.busy) return;
    setStatusFeedback('');
    statusAction.run(async () => {
      const updated = await api(`/jobs/${job.id}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      onJobUpdated(updated);
      setStatusFeedback(
        `Đã cập nhật trạng thái công việc thành "${updated.status}". Trạng thái booking không thay đổi.`,
      );
    });
  }

  return (
    <article className="panel job-card" aria-labelledby={`job-title-${job.id}`}>
      <div className="panel-head">
        <div>
          <h3 id={`job-title-${job.id}`} className="job-title">
            {job.title}
          </h3>
          <p className="meta-line">
            {job.bookingId} · {job.customerName}
          </p>
        </div>
        <div className="badge-pair">
          {isCancelledBooking ? <StatusBadge tone="conflict">Booking đã hủy</StatusBadge> : null}
          <StatusBadge tone={JOB_TONE[job.status] || 'neutral'}>{job.status}</StatusBadge>
        </div>
      </div>

      <dl className="detail-grid">
        <div className="detail-row">
          <dt>Thời gian</dt>
          <dd>
            {vnWeekdayAndDate(job.date)} ·{' '}
            <span className="gs-tnum">
              {job.from}–{job.to}
            </span>
          </dd>
        </div>
        <div className="detail-row">
          <dt>Địa điểm</dt>
          <dd>{job.roomName || 'Tại studio (không dùng phòng chụp)'}</dd>
        </div>
        <div className="detail-row">
          <dt>Khách &amp; số người</dt>
          <dd>
            {job.customerName} · {job.people} người
          </dd>
        </div>
        <div className="detail-row">
          <dt>Dịch vụ thêm</dt>
          <dd>{formatExtras(job.extras)}</dd>
        </div>
      </dl>

      <div className="job-status-actions">
        <p className="field-label" id={`job-status-label-${job.id}`}>
          Cập nhật trạng thái công việc
        </p>
        <div className="filter-group" role="group" aria-labelledby={`job-status-label-${job.id}`}>
          {JOB_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className="filter-pill"
              aria-pressed={job.status === s}
              aria-disabled={!canUpdate || statusAction.busy ? 'true' : undefined}
              aria-describedby={!canUpdate && lockMessage ? `job-lock-${job.id}` : undefined}
              onClick={() => handleStatusUpdate(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {!canUpdate && lockMessage ? (
          <p id={`job-lock-${job.id}`} className="field-hint">
            {lockMessage}
          </p>
        ) : null}
        <p className="meta-line">Cập nhật trạng thái công việc không làm thay đổi trạng thái booking.</p>
        {statusAction.error ? (
          <p className="form-error" role="alert">
            {statusAction.error}
          </p>
        ) : null}
        <p className="form-done" role="status">
          {statusFeedback}
        </p>
      </div>
    </article>
  );
}

// Loads and uploads preview photos for one assigned booking using ONLY /bookings/:id/previews (never /bookings/:id).
function BookingPreviewsCard({ bookingId, bookingStatus, customerName, packageName }) {
  const previewsQuery = useApi(`/bookings/${bookingId}/previews`);
  const uploadAction = useAction();
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [uploadDone, setUploadDone] = useState('');
  const isCancelled = bookingStatus === 'Đã hủy';

  const fileInputId = `preview-upload-${bookingId}`;
  const fileErrorId = `preview-upload-error-${bookingId}`;

  function handleFileChange() {
    setFileError(null);
    setUploadDone('');
  }

  function handleUpload(event) {
    event.preventDefault();
    if (isCancelled || uploadAction.busy) return;
    setFileError(null);
    setUploadDone('');

    const file = fileInputRef.current?.files?.[0] || null;
    if (!file || file.size === 0) {
      setFileError('Chọn ảnh xem trước.');
      fileInputRef.current?.focus();
      return;
    }
    if (!ALLOWED_PREVIEW_MIME.has(file.type)) {
      setFileError('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.');
      fileInputRef.current?.focus();
      return;
    }
    if (file.size > MAX_PREVIEW_BYTES) {
      setFileError('Ảnh xem trước tối đa 5 MB.');
      fileInputRef.current?.focus();
      return;
    }

    const body = new FormData();
    body.append('file', file);

    uploadAction.run(async () => {
      try {
        const created = await api(`/bookings/${bookingId}/previews`, {
          method: 'POST',
          body,
        });
        previewsQuery.setData((prev) =>
          prev
            ? { ...prev, previews: [...(prev.previews || []), created] }
            : { bookingId, limit: null, locked: false, selected: [], savedAt: null, previews: [created] },
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadDone(`Đã tải ảnh ${created.filename} lên booking ${bookingId}.`);
      } catch (err) {
        if (err.fields?.file) {
          setFileError(err.fields.file);
          return;
        }
        throw err;
      }
    });
  }

  return (
    <article className="panel preview-booking-card" aria-labelledby={`preview-booking-${bookingId}`}>
      <div className="panel-head">
        <div>
          <h3 id={`preview-booking-${bookingId}`} className="job-title">
            Booking {bookingId}
          </h3>
          <p className="meta-line">
            {customerName} · {packageName}
          </p>
        </div>
        {isCancelled ? <StatusBadge tone="conflict">Booking đã hủy</StatusBadge> : null}
      </div>

      <DataState
        query={previewsQuery}
        isEmpty={(g) => !g}
        emptyText={`Chưa có dữ liệu ảnh xem trước cho ${bookingId}.`}
        loadingLabel={`Đang tải ảnh xem trước ${bookingId}…`}
      >
        {(gallery) => {
          const previews = gallery.previews || [];
          return previews.length ? (
            <div className="staff-previews-wrap">
              <p className="meta-line">Hiện có {previews.length} ảnh xem trước.</p>
              <ul className="staff-preview-grid">
                {previews.map((p, idx) => (
                  <li key={p.id} className="staff-preview-item">
                    <PreviewImage url={p.url} alt={`Ảnh xem trước ${idx + 1} của ${bookingId}: ${p.filename}`} />
                    <p className="staff-preview-name">{p.filename}</p>
                    <p className="staff-preview-meta">
                      {p.uploadedBy?.name || 'Studio'} · {formatMoment(p.uploadedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState>Chưa có ảnh xem trước nào cho booking {bookingId}.</EmptyState>
          );
        }}
      </DataState>

      <form className="upload-form" noValidate onSubmit={handleUpload}>
        <p className="field">
          <label className="field-label" htmlFor={fileInputId}>
            Tải ảnh xem trước lên {bookingId}
          </label>
          <input
            ref={fileInputRef}
            id={fileInputId}
            className="input staff-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isCancelled}
            aria-invalid={fileError ? 'true' : undefined}
            aria-describedby={`${fileInputId}-hint${fileError ? ` ${fileErrorId}` : ''}`}
            onChange={handleFileChange}
          />
          <span className="field-hint" id={`${fileInputId}-hint`}>
            Chấp nhận JPEG, PNG hoặc WebP, tối đa 5 MB.
          </span>
          {fileError ? (
            <span className="field-error" id={fileErrorId} role="alert">
              {fileError}
            </span>
          ) : null}
        </p>

        {uploadAction.error ? (
          <p className="form-error" role="alert">
            {uploadAction.error}
          </p>
        ) : null}

        <p className="form-done" role="status">
          {uploadDone}
        </p>

        <Button
          variant="primary"
          type="submit"
          aria-disabled={isCancelled || uploadAction.busy ? 'true' : undefined}
          aria-describedby={isCancelled ? `preview-lock-${bookingId}` : undefined}
        >
          {uploadAction.busy ? 'Đang tải ảnh lên…' : 'Tải ảnh xem trước'}
        </Button>
        {isCancelled ? (
          <p id={`preview-lock-${bookingId}`} className="field-hint">
            Booking đã hủy, không thể tải ảnh xem trước.
          </p>
        ) : null}
      </form>
    </article>
  );
}

// Step G8 (docs/api/08-jobs.md): staff jobs, per-card status update, and preview uploads. Never calls /api/bookings or /api/bookings/:id.
export default function CongViec() {
  const jobsQuery = useApi('/jobs');
  const [statusFilter, setStatusFilter] = useState('all');

  function handleJobUpdated(updated) {
    if (!updated) return;
    jobsQuery.setData((prev) => (prev ? prev.map((j) => (j.id === updated.id ? updated : j)) : prev));
  }

  return (
    <AdminLayout title="Việc của tôi: GradStudio">
      <h1 className="page-title">Việc của tôi</h1>

      <DataState query={jobsQuery} emptyText="Bạn chưa được giao công việc nào." loadingLabel="Đang tải công việc…">
        {(jobs) => {
          const filteredJobs = statusFilter === 'all' ? jobs : jobs.filter((j) => j.status === statusFilter);
          const bookingEntries = [];
          const seenBookings = new Set();
          for (const j of jobs) {
            if (!seenBookings.has(j.bookingId)) {
              seenBookings.add(j.bookingId);
              bookingEntries.push({
                bookingId: j.bookingId,
                bookingStatus: j.bookingStatus,
                customerName: j.customerName,
                packageName: j.packageName,
              });
            }
          }

          return (
            <div className="staff-sections">
              <section className="staff-section" aria-labelledby="jobs-list-heading">
                <div className="section-bar">
                  <h2 id="jobs-list-heading" className="heading">
                    Công việc được giao
                  </h2>
                  <div className="filter-group" role="group" aria-label="Lọc công việc theo trạng thái">
                    {STATUS_FILTERS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="filter-pill"
                        aria-pressed={statusFilter === opt.id}
                        onClick={() => setStatusFilter(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredJobs.length ? (
                  <div className="cards-grid">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} onJobUpdated={handleJobUpdated} />
                    ))}
                  </div>
                ) : (
                  <EmptyState>Không có công việc nào ở trạng thái "{statusFilter}".</EmptyState>
                )}
              </section>

              <section className="staff-section" aria-labelledby="previews-upload-heading">
                <h2 id="previews-upload-heading" className="heading">
                  Ảnh xem trước theo booking
                </h2>
                <div className="cards-stack">
                  {bookingEntries.map((entry) => (
                    <BookingPreviewsCard
                      key={entry.bookingId}
                      bookingId={entry.bookingId}
                      bookingStatus={entry.bookingStatus}
                      customerName={entry.customerName}
                      packageName={entry.packageName}
                    />
                  ))}
                </div>
              </section>
            </div>
          );
        }}
      </DataState>
    </AdminLayout>
  );
}
