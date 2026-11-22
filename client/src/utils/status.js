// One icon per conversation status, so a status reads by shape as well as by its colour and its name.
export const STATUS_ICON = { new: 'circle', advising: 'clock', agreed: 'check', done: 'done' };

// The StatusBadge tone for each conversation status name of the brief (docs/api/03-conversations.md).
export const CONVERSATION_TONE = {
  'Chưa trả lời': 'new',
  'Đang tư vấn': 'pending',
  'Đã chốt lịch': 'confirmed',
  'Hoàn thành': 'done',
};

// The StatusBadge tone for each booking status (docs/api/05-bookings.md).
export const BOOKING_TONE = {
  'Chờ cọc 30%': 'pending',
  'Đã đặt lịch': 'confirmed',
  'Hoàn thành': 'done',
  'Đã hủy': 'neutral',
};
