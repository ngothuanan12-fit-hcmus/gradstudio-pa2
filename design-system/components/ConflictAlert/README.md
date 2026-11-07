# ConflictAlert

Cảnh báo trùng lịch, kèm các chip gợi ý giờ trống.

- Truyền vào `children` (một câu mô tả xung đột, ghi đủ tên, vai trò và khung giờ), `slots[{time, note}]`, `picked` và `onPick(slot, i)`.
- Cảnh báo có nền `danger-soft`, viền `danger`, icon ⚠ và tiêu đề “Trùng lịch”.
- Mỗi chip gợi ý có nền `free-soft`, viền `free`, ký hiệu ✓ và `aria-pressed`. `note` ghi đủ ai làm gì, giờ nào, ở phòng nào.
- Ví dụ mẫu: Linh yêu cầu 09:00 ngày 24/10/2026, nhưng thợ makeup Mai bận 08:00–12:00. Gợi ý: makeup 13:00–14:00, chụp với Tuấn 14:00–16:00 tại Phòng B.
