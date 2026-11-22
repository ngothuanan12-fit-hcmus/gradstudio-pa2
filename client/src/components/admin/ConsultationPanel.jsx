import { useState } from 'react';
import { api } from '../../api/client.js';
import useAction from '../../forms/useAction.js';
import { vnDate } from '../../utils/moment.js';
import { formatVND } from '../../utils/money.js';
import { detectIntentFromConversation, formatPackageInfoMessage, formatQuoteMessage } from '../../utils/pricing.js';
import Button from '../Button.jsx';
import Icon from '../Icon.jsx';
import StatusBadge from '../StatusBadge.jsx';
import PriceSummary from '../ui/PriceSummary.jsx';
import PackageSelector from './PackageSelector.jsx';
import ProposalForm from './ProposalForm.jsx';

// Handles both "Chưa trả lời" (Tư vấn nhanh) and "Đang tư vấn" (Màn 1 Tư vấn & Báo giá <-> Màn 2 ProposalForm).
export default function ConsultationPanel({
  conv,
  servicesQuery,
  extrasQuery,
  staffQuery,
  roomsQuery,
  onConversationUpdated,
  onOpenSchedule,
  schedulePick,
}) {
  const services = servicesQuery.data || [];
  const extras = extrasQuery.data || [];
  const detected = detectIntentFromConversation(conv, services);

  const [chosenPkgId, setChosenPkgId] = useState(null);
  const [step, setStep] = useState('consult'); // 'consult' | 'propose'
  const [dir, setDir] = useState('forward');
  const sendAction = useAction();
  const [sentNote, setSentNote] = useState('');

  const allPairs = services.flatMap((s) => (s.packages || []).map((p) => ({ service: s, pkg: p })));
  const selectedPair =
    allPairs.find((x) => x.pkg.id === chosenPkgId) ||
    allPairs.find((x) => x.pkg.id === detected.pkg?.id) ||
    allPairs[0] ||
    null;

  const selectedService = selectedPair?.service || null;
  const selectedPkg = selectedPair?.pkg || null;

  const includedNames = (selectedPkg?.includes || [])
    .map((id) => extras.find((e) => e.id === id)?.name)
    .filter(Boolean);

  function handleSendPackageInfo() {
    if (!selectedService || !selectedPkg) return;
    setSentNote('');
    sendAction.run(async () => {
      const text = formatPackageInfoMessage(selectedService, selectedPkg, extras);
      const updated = await api(`/conversations/${conv.id}/messages`, {
        method: 'POST',
        body: { text },
      });
      onConversationUpdated(updated);
      setSentNote(`Đã gửi thông tin ${selectedPkg.name}.`);
    });
  }

  function handleSendQuote() {
    if (!selectedPkg) return;
    setSentNote('');
    sendAction.run(async () => {
      const text = formatQuoteMessage(selectedPkg, detected.request?.people || 1);
      const updated = await api(`/conversations/${conv.id}/messages`, {
        method: 'POST',
        body: { text },
      });
      onConversationUpdated(updated);
      setSentNote(`Đã gửi báo giá ${selectedPkg.name} vào hội thoại.`);
    });
  }

  if (conv.status === 'Chưa trả lời') {
    return (
      <div className="inspector-body">
        <div className="inspector-head">
          <div>
            <h2>Tư vấn nhanh</h2>
            <p className="inspector-sub">{conv.customer.name}</p>
          </div>
          <StatusBadge tone="new">Chưa trả lời</StatusBadge>
        </div>

        <div className="inspector-section">
          <h3 className="inspector-label">Tư vấn gói chụp</h3>
          <PackageSelector
            servicesQuery={servicesQuery}
            selectedPackageId={selectedPkg?.id}
            onSelect={(_, pkg) => {
              setChosenPkgId(pkg.id);
              setSentNote('');
            }}
          />
        </div>

        {selectedPkg ? (
          <div className="pkg-preview">
            <div className="pkg-preview-head">
              <strong>{selectedPkg.name}</strong>
              <span className="pkg-preview-price">
                {selectedPkg.priceUnit
                  ? `Từ ${formatVND(selectedPkg.price)}/${selectedPkg.priceUnit}`
                  : formatVND(selectedPkg.price)}
              </span>
            </div>
            {selectedService?.summary ? <p className="pkg-preview-summary">{selectedService.summary}</p> : null}
            <ul className="pkg-preview-bullets">
              {selectedPkg.durationMinutes ? (
                <li>
                  <Icon name="check" /> Thời lượng: {selectedPkg.durationMinutes} phút
                </li>
              ) : null}
              {selectedPkg.editedPhotos ? (
                <li>
                  <Icon name="check" /> Số ảnh chỉnh sửa: {selectedPkg.editedPhotos} ảnh
                </li>
              ) : null}
              {includedNames.length ? (
                <li>
                  <Icon name="check" /> Đã gồm: {includedNames.join(', ')}
                </li>
              ) : null}
              {!selectedPkg.durationMinutes && !selectedPkg.editedPhotos && !includedNames.length ? (
                <li>
                  <Icon name="check" /> Thời lượng và số ảnh sẽ được tư vấn theo nhu cầu
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {sendAction.error ? (
          <p className="form-error" role="alert">
            {sendAction.error}
          </p>
        ) : null}
        {sentNote ? (
          <p className="form-done" role="status">
            {sentNote}
          </p>
        ) : null}

        <Button
          variant="primary"
          aria-disabled={sendAction.busy || !selectedPkg ? 'true' : undefined}
          onClick={handleSendPackageInfo}
        >
          {sendAction.busy ? 'Đang gửi…' : 'Gửi thông tin gói'}
        </Button>
      </div>
    );
  }

  // "Đang tư vấn": slide stage between Màn 1 (Tư vấn & Báo giá) and Màn 2 (Đề xuất lịch / Chốt lịch).
  return (
    <div className="panel-stage" data-dir={dir}>
      {step === 'propose' ? (
        <div key="propose" className="panel-slide">
          <ProposalForm
            conv={conv}
            extras={extras}
            staffQuery={staffQuery}
            roomsQuery={roomsQuery}
            selectedService={selectedService}
            selectedPkg={selectedPkg}
            latestRequest={detected.request}
            onBack={() => {
              setDir('back');
              setStep('consult');
            }}
            onConversationUpdated={onConversationUpdated}
            onOpenSchedule={onOpenSchedule}
            schedulePick={schedulePick}
          />
        </div>
      ) : (
        <div key="consult" className="panel-slide">
          <div className="inspector-body">
            <div className="inspector-head">
              <div>
                <h2>Tư vấn &amp; Báo giá</h2>
                <p className="inspector-sub">{conv.customer.name}</p>
              </div>
              <StatusBadge tone="pending">Đang tư vấn</StatusBadge>
            </div>

            {detected.service ? (
              <div className="interest-banner">
                <span className="interest-label">Gói đang quan tâm</span>
                <strong className="interest-value">{detected.service.name}</strong>
                {detected.request ? (
                  <span className="interest-meta">
                    {vnDate(detected.request.date)} · {detected.request.time} · {detected.request.people} người
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="inspector-section">
              <h3 className="inspector-label">Báo giá nhanh</h3>
              <PackageSelector
                servicesQuery={servicesQuery}
                selectedPackageId={selectedPkg?.id}
                onSelect={(_, pkg) => {
                  setChosenPkgId(pkg.id);
                  setSentNote('');
                }}
              />
            </div>

            {selectedPkg ? (
              <div className="inspector-section">
                <h3 className="inspector-label">Chi tiết giá dự kiến</h3>
                {selectedPkg.priceUnit ? (
                  <PriceSummary
                    referenceOnly
                    unitPrice={selectedPkg.price}
                    priceUnit={selectedPkg.priceUnit}
                    people={detected.request?.people || 1}
                  />
                ) : (
                  <PriceSummary
                    pricing={{
                      items: [{ label: selectedPkg.name, amount: selectedPkg.price, included: false }],
                      total: selectedPkg.price,
                      deposit: Math.round(selectedPkg.price * 0.3),
                      remainder: selectedPkg.price - Math.round(selectedPkg.price * 0.3),
                      hasWaitingExtra: false,
                    }}
                  />
                )}
              </div>
            ) : null}

            {sendAction.error ? (
              <p className="form-error" role="alert">
                {sendAction.error}
              </p>
            ) : null}
            {sentNote ? (
              <p className="form-done" role="status">
                {sentNote}
              </p>
            ) : null}

            <div className="inspector-actions">
              <Button
                variant="secondary"
                aria-disabled={sendAction.busy || !selectedPkg ? 'true' : undefined}
                onClick={handleSendQuote}
              >
                <Icon name="chat-bubble" />
                {sendAction.busy ? 'Đang gửi báo giá…' : 'Gửi báo giá'}
              </Button>
              <Button
                variant="primary"
                className="btn-stacked"
                onClick={() => {
                  setDir('forward');
                  setStep('propose');
                }}
              >
                <span>Đề xuất lịch / Chốt lịch</span>
                <span className="btn-sub">Chọn ngày, giờ, nhân sự &amp; phòng</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
