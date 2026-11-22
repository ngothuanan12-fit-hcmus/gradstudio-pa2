import { formatVND } from '../../utils/money.js';

// Reusable breakdown of package price, deposit (30%), and remainder (70%). Extras add no fee per PO decision.
export default function PriceSummary({
  pricing,
  referenceOnly = false,
  priceUnit = null,
  unitPrice = null,
  people = 1,
}) {
  if (referenceOnly && typeof unitPrice === 'number') {
    const count = Math.max(1, Number.parseInt(people, 10) || 1);
    return (
      <div className="price-summary-box">
        <dl className="price-summary-list">
          <div className="price-summary-row">
            <dt>Giá gói</dt>
            <dd className="price-accent">
              {formatVND(unitPrice)}
              {priceUnit ? `/${priceUnit}` : ''}
            </dd>
          </div>
          {count > 1 && priceUnit === 'người' ? (
            <div className="price-summary-row">
              <dt>Ước tính ({count} người)</dt>
              <dd>{formatVND(unitPrice * count)}</dd>
            </div>
          ) : null}
        </dl>
        <p className="price-summary-note">
          Cọc 30% và 70% còn lại được tính theo giá gói và số người xác nhận. Dịch vụ thêm không tính tiền.
        </p>
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="price-summary-box">
      <dl className="price-summary-list">
        {pricing.items?.map((item) => (
          <div className="price-summary-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{typeof item.amount === 'number' ? formatVND(item.amount) : '—'}</dd>
          </div>
        ))}
        <div className="price-summary-row is-sep">
          <dt>Tổng cộng</dt>
          <dd>{formatVND(pricing.total)}</dd>
        </div>
        <div className="price-summary-row">
          <dt>Cọc 30%</dt>
          <dd>{formatVND(pricing.deposit)}</dd>
        </div>
        <div className="price-summary-row is-remainder">
          <dt>Còn lại</dt>
          <dd className="price-accent">{formatVND(pricing.remainder)}</dd>
        </div>
      </dl>
    </div>
  );
}
