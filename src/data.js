// Sample data from the GradStudio story. Do not add prices, times or policies that it does not give.
export const booking = {
  id: 'GS-1024',
  customer: 'Nguyễn Thùy Linh',
  admin: 'Thảo',
  sessionType: 'Tốt nghiệp cá nhân',
  pkg: 'Gói Tốt nghiệp Premium',
  pkgDetail: '2 giờ · 30 ảnh chỉnh',
  arrivalNote: 'Có mặt sớm 10 phút',
  price: 1800000,
  deposit: 540000,
  rest: 1260000,
  date: '24/10/2026',
  dayOfWeek: 'Thứ Bảy',
  requested: '09:00',
  agreed: '14:00',
  makeup: { who: 'Mai', from: '13:00', to: '14:00' },
  shoot: { who: 'Tuấn', from: '14:00', to: '16:00', room: 'Phòng B' },
};

// Service names and prices follow the original GradStudio website.
export const services = [
  { id: 'premium', name: 'Gói Tốt nghiệp Premium', priceNote: '1.800.000đ · 2 giờ · 30 ảnh chỉnh' },
  { id: 'ky-yeu', name: 'Kỷ yếu lớp', priceNote: 'từ 350.000đ/người' },
  { id: 'tot-nghiep', name: 'Tốt nghiệp', priceNote: 'từ 1.800.000đ' },
  { id: 'chan-dung', name: 'Chân dung/CV', priceNote: 'từ 690.000đ' },
];

export const messages = [
  { id: 'm1', who: 'Linh', text: 'Em muốn chụp tốt nghiệp ngày 24/10, có makeup, lúc 09:00 được không ạ?', time: '09:40' },
  { id: 'm2', who: 'Studio', me: true, text: 'Thợ makeup Mai bận 08:00–12:00. Studio đề xuất makeup 13:00–14:00 và chụp 14:00–16:00. Gói Tốt nghiệp Premium 1.800.000đ, cọc 540.000đ, còn lại 1.260.000đ.', time: '09:42' },
];

export const conversations = [
  {
    id: 'linh',
    name: 'Nguyễn Thùy Linh',
    time: '09:42',
    last: 'Dạ em chốt lịch 14:00 ạ.',
    status: 'pending',
    statusLabel: 'Chờ cọc',
    unread: 2,
  },
  {
    id: 'uyen',
    name: 'Nguyễn Thị Hoàng Phương Uyên',
    time: '08:15',
    last: 'Em muốn hỏi gói kỷ yếu lớp cho cả nhóm.',
    status: 'neutral',
    unread: 1,
  },
  {
    id: 'anh',
    name: 'Trần Minh Anh',
    time: '07:50',
    last: 'Em gửi ảnh chọn rồi ạ.',
    status: 'pending',
    statusLabel: 'Chờ khách chọn ảnh',
  },
  {
    id: 'bao',
    name: 'Lê Gia Bảo',
    time: 'Hôm qua',
    last: 'Cảm ơn studio, hẹn gặp ngày 24/10.',
    status: 'confirmed',
  },
];

export const freeSlots = [
  {
    id: 'slot-1400',
    time: '14:00',
    note: 'Makeup 13:00–14:00 với Mai; chụp 14:00–16:00 với Tuấn tại Phòng B.',
  },
];

export const scheduleRows = [
  {
    id: 'mai',
    name: 'Mai',
    role: 'Thợ makeup',
    blocks: [
      { id: 'mai-busy', from: '08:00', to: '12:00', label: 'Đã kín', kind: 'busy' },
      { id: 'mai-conflict', from: '09:00', to: '10:00', label: 'Linh yêu cầu', kind: 'conflict' },
      { id: 'mai-proposed', from: '13:00', to: '14:00', label: 'Linh · makeup', kind: 'proposed' },
    ],
  },
  {
    id: 'tuan',
    name: 'Tuấn',
    role: 'Thợ chụp',
    blocks: [
      { id: 'tuan-free', from: '11:00', to: '14:00', label: 'Trống', kind: 'free' },
      { id: 'tuan-proposed', from: '14:00', to: '16:00', label: 'Linh · GS-1024', kind: 'proposed' },
    ],
  },
  {
    id: 'phong-b',
    name: 'Phòng B',
    role: 'Phòng chụp',
    blocks: [
      { id: 'phong-proposed', from: '14:00', to: '16:00', label: 'Linh · GS-1024', kind: 'proposed' },
    ],
  },
];

export const weekDays = [
  { id: '2026-10-19', dow: 'T2', num: 19 },
  { id: '2026-10-20', dow: 'T3', num: 20 },
  { id: '2026-10-21', dow: 'T4', num: 21 },
  { id: '2026-10-22', dow: 'T5', num: 22 },
  { id: '2026-10-23', dow: 'T6', num: 23 },
  {
    id: '2026-10-24',
    dow: 'T7',
    num: 24,
    events: [
      {
        id: 'ev-old',
        from: '09:00',
        title: 'Giờ khách yêu cầu ban đầu',
        where: 'Trùng với Mai (makeup) 08:00–12:00',
        struck: true,
      },
      {
        id: 'ev-makeup',
        from: '13:00',
        to: '14:00',
        title: 'Makeup với Mai',
        where: 'GS-1024',
      },
      {
        id: 'ev-shoot',
        from: '14:00',
        to: '16:00',
        title: 'Chụp với Tuấn',
        where: 'GS-1024 · Phòng B',
      },
    ],
  },
  { id: '2026-10-25', dow: 'CN', num: 25 },
];

export function formatVND(value) {
  return Number(value).toLocaleString('vi-VN') + 'đ';
}