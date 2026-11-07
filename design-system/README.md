> Ghi chú của nhóm: tài liệu này nhắc đến Gambetta, nhưng nhóm đã đổi sang **Newsreader** vì file Gambetta chỉ có 38/134 chữ có dấu tiếng Việt. Xem `CLAUDE.md`.

GradStudio là một hệ thống thiết kế dùng cho hai phía. **Trang khách** mang chất điện ảnh: tối, toàn màn hình, ảnh là trung tâm. **Trang quản lý** và **“Lịch chụp của tôi”** thì sáng, gọn và dễ đọc khi có nhiều dữ liệu. Cả hai phía dùng chung một bộ token, một bộ font và một namespace component (`window.GradStudio`). Mọi chữ trên giao diện đều là tiếng Việt.

## Hai theme, một bộ token

- `cinema` (theme đầu) dùng cho phần cuộn “Đi qua một buổi chụp”, ô giá góc trên phải và phần “Chọn gói của bạn”. Đặt `data-theme="cinema"` trên `<html>` của trang khách.
- `studio` dùng cho trang quản lý, “Lịch chụp của tôi” và **màn hình kết nền sáng** của landing page. Đặt `data-theme="studio"` trên `<html>` của các trang này, hoặc trên `<section>` màn hình kết.
- Component chỉ đọc tên token, không đọc mã màu. Vì vậy cùng một `BookingSummary` tự đổi màu theo theme bao quanh nó.

## Nội dung và giọng văn

- Xưng **“bạn”** với khách. Studio tự gọi mình là **“studio”**, không dùng “chúng tôi”. Ví dụ: “Chat với studio”, “Đặt buổi chụp của bạn”.
- Câu ngắn, giàu hình ảnh, chỉ nói về một khoảnh khắc: “Ánh nắng sớm qua ô cửa sổ, ngồi lại bàn học cũ lần cuối.” Không dùng từ ngữ quảng cáo, không dùng dấu chấm than liên tiếp, không dùng emoji.
- Tiêu đề bước có hai dòng. **Dòng trên** là địa điểm, IN HOA, tối đa 3 từ (“GÓC HÀNH LANG”). **Dòng dưới** là cảm xúc hoặc hoạt động, viết thường, in nghiêng (“đi cùng bạn thân”).
- Trang quản lý viết theo kiểu dữ kiện, dễ quét: “Mai (makeup) bận 08:00–12:00”. Gọi người bằng tên riêng và ghi vai trò trong ngoặc.
- Định dạng số và ngày:
  - Tiền viết `1.800.000đ` (dấu chấm ngăn nghìn, chữ “đ” viết liền, không có khoảng trắng). Dùng `GradStudio.formatVND()`.
  - Ngày viết `24/10/2026`, thứ viết đầy đủ (“Thứ Bảy”), trên lịch tuần viết tắt `T2…T7, CN`.
  - Giờ viết 24h `09:00`. Khoảng giờ dùng dấu gạch nối dài, không có khoảng trắng: `13:00–14:00`.
  - Mã booking có dạng `GS-1024`.
- **Giá:** chỉ hiển thị giá mà studio cung cấp. Theo web gốc của GradStudio: **Kỷ yếu lớp từ 350.000đ/người, Tốt nghiệp từ 1.800.000đ, Chân dung/CV từ 690.000đ**, kèm câu "Giá tham khảo — giá chốt được ghi trên booking sau khi tư vấn." Booking mẫu là **Gói Tốt nghiệp Premium 1.800.000đ**, cọc 30% là 540.000đ. Tùy chọn makeup hoặc thuê áo chưa có giá thì ghi “Báo giá khi chat”. Không được tự đặt con số mới.

## Chữ

- `--font-display` (Gambetta) dùng cho tiêu đề lớn: `display-hero`, `step-title`, `section-title`, `price-display`, kèm các biến thể `*-italic` có màu `accent`. Không dùng Gambetta cho câu văn dưới 24px.
- `--font-sans` (Be Vietnam Pro) dùng cho nội dung, nút, form, bảng và toàn bộ trang quản lý. Dùng các style `heading`, `title`, `body`, `body-strong`, `label`.
- Chữ nội dung tối thiểu 16px (`body`). Hai style 14px là `eyebrow` và `meta`, chỉ dùng cho chỉ số bước, giờ gửi tin và chú thích ngắn, không bao giờ dùng cho câu văn.
- **Dấu tiếng Việt:**
  - Tiêu đề IN HOA giữ line-height tối thiểu 1.18 để dấu chồng (Ẩ, Ỗ, Ộ, Ằ) không chạm dòng trên.
  - Không đặt `overflow: hidden` sát khung chữ display.
  - Không dùng `text-transform: uppercase` trên chuỗi đã viết hoa sẵn.
  - Luôn để `lang="vi"` trên `<html>`.
- **Nạp font:**
  - Be Vietnam Pro lấy từ Google Fonts (đã `@import` trong `bundle.css`) với `display=swap`.
  - Gambetta lấy từ Fontshare, nhưng nên tự host bản `woff2` các weight 400, 500 và 400 italic, rồi `preload` hai file dùng ở màn hình đầu.
  - Khi Gambetta chưa tải xong, trình duyệt tạm dùng Newsreader (cũng có đủ dấu tiếng Việt) để bố cục không bị nhảy.
- Số tiền, giờ và ngày dùng `font-variant-numeric: tabular-nums` (class `.gs-tnum`) để các cột thẳng hàng.

| Style | 1280px | 768px | 360px |
|---|---|---|---|
| `display-hero` | 64/72 | 48/56 | 36/44 |
| `step-title` (+ italic) | 44/52 | 44/52 | 30/40 |
| `section-title` | 40/48 | 40/48 | 30/38 |

## Màu

- `accent` là ánh đèn tungsten. Chỉ dùng cho: dòng in nghiêng của tiêu đề, giá tiền, máy ảnh và đèn trong bản vẽ, nút chính và mục đang chọn. Mỗi màn hình có tối đa **một** nút `primary`.
- `chalk` và `chalk-dim` là nét phấn của bản vẽ. Tường, bảng và bàn vẽ bằng `chalk`. Lưới, kích thước và bàn ghế phụ vẽ bằng `chalk-dim`.
- Chữ đặt trên ảnh luôn là `on-photo`, và luôn có một khối `scrim` nằm dưới. Không bao giờ đặt chữ trực tiếp lên ảnh.
- Trạng thái lịch dùng 4 kiểu, mỗi kiểu khác nhau cả về **độ sáng, kiểu viền và chữ hoặc icon**, nên người mù màu vẫn phân biệt được:

| Trạng thái | Nền | Viền | Ký hiệu |
|---|---|---|---|
| Bận | `busy` | không có | không có |
| Trùng lịch | `danger-soft` | 2px liền, `danger` | ⚠ + chữ “Trùng” |
| Trống | `free-soft` | 2px nét đứt, `free` | ✓ |
| Đề xuất | `accent-soft` | 2px liền, `accent` | không có |

- **Tương phản:**
  - `ink`, `ink-muted`, `accent`, `free` và `danger` đều đạt từ 4.5:1 trở lên trên `ground`, `surface` và `surface-raised` ở cả hai theme.
  - `line-strong` (viền control) đạt từ 3:1 trở lên.
  - `line` chỉ dùng để trang trí.
  - `chalk-dim` ở theme studio chỉ là nét phụ, không mang nghĩa.
- **Vòng focus:** dùng `focus` (bằng `accent`), viền liền 2px, cách control 2px. Áp dụng cho mọi control, không bao giờ tắt.

## Khoảng cách, bo góc, kích thước

- Chỉ dùng thang `space-4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`.
- Lề trang lần lượt là `space-16` (360px), `space-24` (768px) và `space-48` (1280px). Các khối ở góc màn hình phần cuộn cách mép `space-32` từ 768px trở lên.
- `radius-md` dùng cho nút, thẻ, panel và scrim. `radius-sm` dùng cho input, chip giờ và khối lịch. `radius-pill` chỉ dùng cho ô giá góc trên phải và chấm bản đồ góc.
- Mọi vùng bấm cao tối thiểu `control-height-sm` (44px). Nút và input mặc định cao `control-height` (48px).
- Trang quản lý tách các khối bằng viền `line`. Theme cinema dùng `shadow-panel` cho thẻ nổi trên ảnh.

## Landing page: “Đi qua một buổi chụp”

**Cấu trúc ở 768px trở lên**

- Một `<section>` chứa 6 bước, mỗi bước là một `<article>` cao `100svh`.
- Một sân khấu `position: sticky; top: 0; height: 100svh` chứa `SetDrawing`, nằm phía sau các bước.
- Trang **cuộn tự nhiên**: không `preventDefault` trên wheel hay touch, không dùng scroll-snap bắt buộc, không khóa body.
- Thứ tự lớp từ dưới lên:
  1. Bản vẽ
  2. Ảnh thật
  3. Các khối điều khiển:
     - `PackageChip` ở góc trên phải
     - Logo chữ “GradStudio” ở góc trên trái, đặt bằng `step-title` cỡ 24px
     - `AngleMap` ở bên phải, căn giữa theo chiều dọc
     - `StepCaption` ở góc dưới trái

**Chọn bước đang hiển thị**

- Dùng `IntersectionObserver` với `rootMargin: "-50% 0px -50% 0px"` trên các `<article>`. Bước cắt đường giữa màn hình là bước đang hiển thị.
- Khi đổi bước, chỉ đổi prop `step` của `SetDrawing`. Góc nhìn di chuyển bằng `transform` (chạy trên compositor) trong 1.1s.
- Ảnh thật hiện dần sau 0.9s, khi góc nhìn đã gần tới chỗ.
- `AngleMap.onSelect` gọi `article.scrollIntoView({ behavior: "smooth" })`. Khi bật reduced-motion thì dùng `"auto"`.

**Góc nhìn đầu tiên**

- Bước 1 (`focus.s = 1`) hiển thị toàn bộ bản vẽ: `preserveAspectRatio="xMidYMid meet"` trong khung 1200×760.
- Sân khấu có kích thước `width: min(100vw, 100svh × 1200/760)`, căn giữa, nền `ground`. Như vậy bản vẽ không bao giờ bị cắt.

**Bước 6 (màn hình kết)**

- Đặt `data-theme="studio"`.
- Bên trái: tiêu đề `display-hero` kèm dòng in nghiêng, rồi `ChatPanel`.
- Bên phải: `BookingSummary`.
- Từ 768px trở xuống, hai cột này xếp thành một cột.

**Dưới 768px, hoặc khi bật `prefers-reduced-motion: reduce`**

- Không có sân khấu sticky và không di chuyển góc nhìn.
- Mỗi bước là một khối dọc: ảnh tỉ lệ 4:5 rồi đến `StepCaption` ngay bên dưới, không phải nằm đè lên ảnh.
- Bước 1 hiển thị `SetDrawing` với prop `still`, vẽ toàn bộ sơ đồ ở dạng tĩnh.
- `AngleMap` đổi thành danh sách mục lục ngang và có thể cuộn ngang riêng trong khối của nó. Trang không được cuộn ngang.

**Mạng Slow 4G**

- Màn hình đầu chỉ cần SVG nội tuyến (khoảng 6KB), CSS và font. **Không có ảnh nào**, nên trang vẽ xong ngay.
- Ảnh từng góc dùng `<img loading="lazy" decoding="async">` với `srcset` 640, 1280 và 1920px, định dạng AVIF kèm WebP dự phòng, mỗi ảnh 1280px không quá khoảng 180KB.
- Khi bước *n* hiển thị, tải trước ảnh của bước *n+1* bằng `new Image()`.
- Nếu ảnh chưa về kịp, nét vẽ vẫn được giữ nguyên. Không hiện spinner.
- Không dùng thư viện 3D, canvas hay video nền.

## Ảnh

- Ảnh thật, ánh sáng tự nhiên, tông ấm.
- Khung ngang 3:2 cho màn hình rộng, khung dọc 4:5 cho điện thoại.
- Để trống khoảng một phần ba góc dưới trái cho `StepCaption`.
- Không đặt chữ, logo hay watermark bên trong ảnh. Mọi chữ phải là văn bản HTML.
- Ảnh trong bộ này chỉ là ô giữ chỗ (“Ảnh thật · …”). Hãy thay bằng ảnh do studio chụp.

## Icon

- Icon dạng nét 2px, đầu và góc nét bo tròn, khung 24×24, dùng `currentColor`. Bộ component đã có sẵn các icon chat, gửi và cảnh báo.
- Ký hiệu trạng thái dùng glyph ✓ và ⚠ đặt ngay trước chữ, không dùng emoji màu.
- Trong bản vẽ:
  - Máy ảnh là hình chữ nhật bo góc có ống kính tròn, kèm tam giác góc nhìn tô `accent` mờ.
  - Đèn là softbox kèm 3 tia sáng.
  - Ánh sáng cửa sổ là các nét đứt `accent`.

## Chuyển động

- Góc nhìn di chuyển trong 1.1s với `cubic-bezier(.65,0,.35,1)`.
- Ảnh hiện dần trong 0.8s, mở rộng vùng clip trong 1s, cả hai trễ 0.9s.
- Hover và trạng thái chuyển trong 0.2s.
- Khi bật `prefers-reduced-motion`, mọi transition đổi thành `none`.

## Logo

- Hiện chưa có logo. Đặt chữ “GradStudio” bằng `--font-display`, weight 500, màu `ink`.
- Khi studio có file logo thật, thêm vào nhóm asset `Logos`.
