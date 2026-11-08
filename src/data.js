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
  statusLabel: 'Chờ cọc 30%',
  makeup: { who: 'Mai', from: '13:00', to: '14:00' },
  shoot: { who: 'Tuấn', from: '14:00', to: '16:00', room: 'Phòng B' },
};

export const messages = [
  { id: 'm1', who: 'Linh', text: 'Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?', time: '09:40' },
  { id: 'm2', who: 'Studio', me: true, text: 'Dạ để studio kiểm tra lịch thợ makeup, thợ chụp và phòng rồi báo lại ạ.', time: '09:41' },
  { id: 'm3', who: 'Studio', me: true, text: 'Thợ makeup Mai bận 08:00–12:00. Studio đề xuất makeup 13:00–14:00 và chụp 14:00–16:00.', time: '09:42' },
  { id: 'm4', who: 'Studio', me: true, text: 'Báo giá Gói Tốt nghiệp Premium: 1.800.000đ. Cọc 540.000đ, còn lại 1.260.000đ.', time: '09:46' },
  { id: 'm5', who: 'Linh', text: 'Dạ em chốt lịch 14:00 ạ.', time: '09:47' },
];

// Service names and prices follow the GradStudio brief.
export const services = [
  { id: 'premium', name: 'Gói Tốt nghiệp Premium', priceNote: '1.800.000đ · 2 giờ · 30 ảnh chỉnh' },
  { id: 'ky-yeu', name: 'Kỷ yếu lớp', priceNote: 'từ 350.000đ/người' },
  { id: 'tot-nghiep', name: 'Tốt nghiệp', priceNote: 'từ 1.800.000đ' },
  { id: 'chan-dung', name: 'Chân dung/CV', priceNote: 'từ 690.000đ' },
];

// The management page opens after Linh has agreed, so the list shows that state.
export const conversations = [
  {
    id: 'linh',
    name: 'Nguyễn Thùy Linh',
    time: '09:47',
    last: 'Dạ em chốt lịch 14:00 ạ.',
    status: 'agreed',
    statusLabel: 'Đã chốt lịch',
    tone: 'confirmed',
  },
  {
    id: 'uyen',
    name: 'Nguyễn Thị Hoàng Phương Uyên',
    time: '08:15',
    last: 'Em muốn hỏi gói kỷ yếu lớp cho cả nhóm.',
    status: 'advising',
    statusLabel: 'Đang tư vấn',
    tone: 'pending',
    unread: 1,
  },
  {
    id: 'anh',
    name: 'Trần Minh Anh',
    time: '07:50',
    last: 'Em gửi ảnh chọn rồi ạ.',
    status: 'new',
    statusLabel: 'Chưa trả lời',
    tone: 'neutral',
    unread: 2,
  },
  {
    id: 'bao',
    name: 'Lê Gia Bảo',
    time: 'Hôm qua',
    last: 'Cảm ơn studio, hẹn gặp ngày 24/10.',
    status: 'done',
    statusLabel: 'Hoàn thành',
    tone: 'confirmed',
  },
];

// The only free time in the story: Mai's make-up block and Tuấn's shoot block do not overlap.
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
      { id: 'mai-conflict', from: '09:00', to: '10:00', label: 'Linh yêu cầu 09:00', kind: 'conflict' },
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

// Names, descriptions and "from" prices come from the PA#1 team's prototype. `line` is our own short line.
export const packages = [
  {
    id: 'ky-yeu',
    name: 'Kỷ yếu lớp',
    line: 'cả lớp, một khung hình',
    text: 'Một người đại diện đặt lịch cho cả lớp. Studio lo trang phục, makeup và lịch chụp cho cả nhóm.',
    price: 350000,
    unit: '/người',
    photo: { name: 'ky-yeu', small: 640, large: 1350, width: 1350, height: 900 },
    alt: 'Cả lớp áo trắng giơ máy bay giấy trước bàn trong phòng học treo bóng bay',
  },
  {
    id: 'tot-nghiep',
    name: 'Tốt nghiệp',
    line: 'cho ngày ra trường',
    text: 'Chụp cá nhân hoặc nhóm nhỏ, tùy chọn makeup và thuê áo. Gói Premium: 2 giờ, 30 ảnh chỉnh.',
    price: 1800000,
    unit: '',
    photo: { name: 'tot-nghiep', small: 480, large: 900, width: 900, height: 1350 },
    alt: 'Nữ sinh mặc áo cử nhân ôm bó hoa trước bậc thềm sân trường',
  },
  {
    id: 'chan-dung',
    name: 'Chân dung / CV',
    line: 'cho hồ sơ của bạn',
    text: 'Buổi chụp ngắn, chọn ảnh cần chỉnh và nhận file.',
    price: 690000,
    unit: '',
    photo: { name: 'chan-dung', small: 480, large: 900, width: 900, height: 1125 },
    alt: 'Chân dung nam thanh niên tóc xoăn, áo sơ mi xám, trên nền xanh lá',
  },
];

// The steps of section 3 of the GradStudio brief. The slot is held only after the deposit succeeds.
export const processSteps = [
  { id: 'chat', title: 'Chat tư vấn', text: 'Nhắn studio ngay trên web để hỏi gói, concept và giá.' },
  { id: 'lich', title: 'Thống nhất giờ', text: 'Studio kiểm tra thợ chụp, makeup, phòng và đề xuất giờ trống. Bạn đồng ý ngay trong chat.' },
  { id: 'coc', title: 'Cọc để giữ lịch', text: 'Lịch chỉ được giữ khi bạn cọc 30% thành công và studio kiểm tra lại lịch.' },
  { id: 'chup', title: 'Buổi chụp', text: 'Ekip chuẩn bị theo checklist của từng loại buổi chụp.' },
  { id: 'anh', title: 'Chọn ảnh và nhận file', text: 'Chọn ảnh cần chỉnh, thanh toán 70% còn lại, nhận file khi hoàn tất.' },
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
  return value.toLocaleString('vi-VN') + 'đ';
}
