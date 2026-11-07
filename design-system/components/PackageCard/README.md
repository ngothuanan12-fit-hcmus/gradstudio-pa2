# PackageCard

Thẻ gói trong phần “Chọn gói của bạn”. Thẻ gồm nhãn nhóm, tên gói, giá, danh sách quyền lợi, các tùy chọn thêm (makeup, thuê áo) và nút chọn.

- Truyền vào `name`, `price` (số; bỏ trống nếu studio chưa báo giá, khi đó hiện `priceNote`), `features[]`, `addons[{id,label,note}]`, `selected`, `onSelect` và `onAddons`.
- **Không tự đặt giá.** Tùy chọn chưa có giá thì để `note: "Báo giá khi chat"`.
- Thẻ đang chọn có viền `accent` 2px và nút `primary` “Đã chọn gói này”. Các thẻ khác dùng nút `secondary`.
- Xếp thẻ bằng `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`, khoảng cách `space-32`. Ở 360px, thẻ xếp thành một cột.
