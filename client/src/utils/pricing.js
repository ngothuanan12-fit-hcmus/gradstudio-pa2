import { formatVND } from './money.js';
import { vnDate } from './moment.js';

// Mirrors docs/api/05-bookings.md pricing rules without inventing any numbers.
export function computeDraftPricing(pkg, people, selectedExtras = [], allExtras = []) {
  if (!pkg) return null;
  const count = Math.max(1, Number.parseInt(people, 10) || 1);
  const baseLabel = pkg.priceUnit === 'người' ? `${pkg.name} (${count} người)` : pkg.name;
  const baseAmount = pkg.priceUnit === 'người' ? pkg.price * count : pkg.price;
  const items = [{ label: baseLabel, amount: baseAmount, included: false }];
  for (const extraItem of selectedExtras) {
    const def = allExtras.find((e) => e.id === extraItem.extraId);
    if (!def) continue;
    const included = (pkg.includes || []).includes(extraItem.extraId);
    const model = def.models?.find((m) => m.id === extraItem.modelId);
    const label = model ? `${def.name}: ${model.name} (${extraItem.size})` : def.name;
    const qty = extraItem.quantity || 1;
    const amount = included ? 0 : def.price === null ? null : def.price * qty;
    items.push({ label, amount, included });
  }
  const hasWaitingExtra = items.some((it) => it.amount === null);
  const total = items.reduce((sum, it) => sum + (typeof it.amount === 'number' ? it.amount : 0), 0);
  const deposit = Math.round(total * 0.3);
  const remainder = total - deposit;
  return { items, total, deposit, remainder, hasWaitingExtra };
}

export function formatPackageInfoMessage(service, pkg, allExtras = []) {
  const unit = pkg.priceUnit ? `/${pkg.priceUnit}` : '';
  const parts = [`Thông tin ${pkg.name}: ${formatVND(pkg.price)}${unit}`];
  if (pkg.durationMinutes) parts.push(`thời lượng ${pkg.durationMinutes} phút`);
  if (pkg.editedPhotos) parts.push(`${pkg.editedPhotos} ảnh chỉnh`);
  const included = (pkg.includes || []).map((id) => allExtras.find((e) => e.id === id)?.name).filter(Boolean);
  if (included.length) parts.push(`đã gồm ${included.join(', ')}`);
  const summary = service?.summary ? ` ${service.summary}` : '';
  return `${parts.join(', ')}.${summary}`;
}

export function formatQuoteMessage(pkg, people = 1) {
  if (pkg.priceUnit === 'người') {
    const count = Math.max(1, Number.parseInt(people, 10) || 1);
    const estimate = count > 1 ? ` (ước lượng ${count} người: ${formatVND(pkg.price * count)})` : '';
    return `Báo giá tham khảo ${pkg.name}: ${formatVND(pkg.price)}/${pkg.priceUnit}${estimate}. Cọc 30% và 70% còn lại tính theo số người chốt khi thống nhất lịch chụp.`;
  }
  const deposit = Math.round(pkg.price * 0.3);
  const remainder = pkg.price - deposit;
  return `Báo giá ${pkg.name}: ${formatVND(pkg.price)}. Cọc 30%: ${formatVND(deposit)}, còn lại: ${formatVND(remainder)}.`;
}

// Parses structured studio quote messages into card rows when present.
const QUOTE_RE = /^Báo giá ([^:]+): ([\d.]+đ)\. Cọc(?: 30%)?: ([\d.]+đ), còn lại:? ([\d.]+đ)\.?$/;

export function parseQuoteMessage(text) {
  if (typeof text !== 'string') return null;
  const match = text.trim().match(QUOTE_RE);
  if (!match) return null;
  return [
    ['Gói', match[1].replace(/^Gói\s+/i, '').trim()],
    ['Giá', match[2]],
    ['Cọc 30%', match[3]],
    ['Còn lại', match[4]],
  ];
}

export function formatPriceListMessage(services = []) {
  const list = services
    .map((s) => `${s.name} từ ${formatVND(s.priceFrom)}${s.priceUnit ? `/${s.priceUnit}` : ''}`)
    .join('; ');
  return `Bảng giá tham khảo tại GradStudio: ${list}. Giá chốt được ghi trên booking sau khi tư vấn.`;
}

export function formatDepositPolicyMessage() {
  return 'Chính sách đặt cọc: Lịch chụp chỉ được giữ sau khi bạn cọc 30% thành công và studio kiểm tra lại lịch. 70% còn lại thanh toán sau khi chọn ảnh để nhận file hoàn chỉnh.';
}

export function formatInvoiceMessage(booking, paidTotal) {
  const totalText = formatVND(booking.pricing.total);
  const depositText = formatVND(booking.pricing.deposit);
  const paidText = formatVND(paidTotal);
  const remaining = Math.max(0, booking.pricing.total - paidTotal);
  const remainText = formatVND(remaining);
  const linkText = booking.fileLink ? ` Link ảnh: ${booking.fileLink}` : '';
  return `Hóa đơn booking ${booking.id} (${booking.packageName}, ngày ${vnDate(booking.date)}): Tổng ${totalText}, đã cọc ${depositText}, tổng đã thanh toán ${paidText}, còn lại ${remainText}.${linkText}`;
}

// Auto-detects matching service/package from request or customer messages.
export function detectIntentFromConversation(conv, services = []) {
  if (!conv || !services.length)
    return { service: services[0] || null, pkg: services[0]?.packages[0] || null, request: null };
  const msgs = conv.messages || [];
  const reqMsg = [...msgs].reverse().find((m) => m.kind === 'request' && m.request);
  if (reqMsg?.request) {
    const service = services.find((s) => s.id === reqMsg.request.serviceId) || services[0];
    const pkg =
      (reqMsg.request.packageId && service.packages.find((p) => p.id === reqMsg.request.packageId)) ||
      service.packages[0];
    return { service, pkg, request: reqMsg.request };
  }
  const combined = msgs
    .filter((m) => m.from === 'customer')
    .map((m) => m.text.toLowerCase())
    .join(' ');
  const keywords = [
    { id: 'ky-yeu', keys: ['kỷ yếu', 'cả lớp', 'lớp'] },
    { id: 'chan-dung', keys: ['chân dung', 'cv', 'hồ sơ'] },
    { id: 'tot-nghiep', keys: ['tốt nghiệp', 'premium', 'cử nhân'] },
  ];
  for (const item of keywords) {
    if (item.keys.some((kw) => combined.includes(kw))) {
      const service = services.find((s) => s.id === item.id);
      if (service) return { service, pkg: service.packages[0] || null, request: null };
    }
  }
  const fallback = services.find((s) => s.id === 'tot-nghiep') || services[0];
  return { service: fallback, pkg: fallback?.packages[0] || null, request: null };
}
