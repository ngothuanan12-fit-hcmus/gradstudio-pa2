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

export function formatVND(value) {
  return value.toLocaleString('vi-VN') + 'đ';
}
