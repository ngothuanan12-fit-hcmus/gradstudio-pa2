// Sample data from the GradStudio story. Do not add prices, times or policies that it does not give.
export const booking = {
  id: 'GS-1024',
  customer: 'Linh',
  pkg: 'Gói Tốt nghiệp Premium',
  price: 1800000,
  deposit: 540000,
  rest: 1260000,
  date: '24/10/2026',
  dayOfWeek: 'Thứ Bảy',
  requested: '09:00',
  makeup: { who: 'Mai', from: '13:00', to: '14:00' },
  shoot: { who: 'Tuấn', from: '14:00', to: '16:00', room: 'Phòng B' },
};

export const messages = [
  { id: 'm1', who: 'Linh', text: 'Em muốn chụp tốt nghiệp ngày 24/10, có makeup, lúc 09:00 được không ạ?', time: '09:40' },
  { id: 'm2', who: 'Studio', me: true, text: 'Thợ makeup Mai bận 08:00–12:00. Studio đề xuất makeup 13:00–14:00 và chụp 14:00–16:00.', time: '09:42' },
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

export const processSteps = [
  { id: 'chat', title: 'Chat tư vấn', text: 'Nhắn studio ngay trên web để hỏi gói, concept và giá.' },
  { id: 'lich', title: 'Chốt lịch', text: 'Studio kiểm tra thợ chụp, makeup, phòng và giữ lịch cho bạn.' },
  { id: 'chup', title: 'Buổi chụp', text: 'Ekip chuẩn bị theo checklist của từng loại buổi chụp.' },
  { id: 'anh', title: 'Chọn ảnh và nhận file', text: 'Chọn ảnh cần chỉnh trong tài khoản, nhận file khi hoàn tất.' },
];

export function formatVND(value) {
  return value.toLocaleString('vi-VN') + 'đ';
}
