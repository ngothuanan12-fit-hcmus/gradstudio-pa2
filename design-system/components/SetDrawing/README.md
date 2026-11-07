# SetDrawing

Sơ đồ nét phấn của lớp học, hành lang và sân trường (khung 1200×760). Sơ đồ có vị trí máy ảnh, đèn và tam giác góc nhìn. Góc nhìn di chuyển theo `step`, rồi ảnh thật hiện dần lên.

Props:
- `step` (1–6) chọn bước hiện tại. Mỗi bước trong `GradStudio.journeySteps` có `focus: {x, y, s}`. Component đặt các giá trị này vào `--fx`, `--fy`, `--s`, và CSS dùng chúng cho `transform` của lớp `.gs-cam`. Không dùng JS animation hay thư viện 3D.
- `reveal` + `revealed` bật ảnh. Truyền `photos = { desk: { src, srcSet, alt } }`, với key là `id` của bước. Thiếu ảnh thì hiện ô giữ chỗ.
- `still`: khóa ở toàn cảnh. Dùng trên điện thoại và khi bật reduced-motion.

Cách dùng:
- Bước 1 luôn có `s = 1`, nên toàn bộ bản vẽ nằm trong khung, nhờ `preserveAspectRatio="xMidYMid meet"`.
- Đặt sân khấu chứa component ở `position: sticky`. Không chặn sự kiện cuộn.
- Nét vẽ dùng `vector-effect: non-scaling-stroke`, nên khi phóng to nét không bị dày lên.
- Muốn sửa bản vẽ thì chỉnh chuỗi `PLAN` trong bundle. Tọa độ gốc:
  - Lớp học: 40–680 × 40–560.
  - Hành lang: 680–800.
  - Sân trường: 840–1160.
- Thứ tự góc nhìn trong dữ liệu mẫu chỉ để minh họa, chưa phải quy trình chính thức của studio.
