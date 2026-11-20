# The mock's starting data: the seed story

What exists when `node mock/server.mjs` starts. The mock keeps every change in memory and starts over from these files on restart. contract-check sends every example of `docs/api/` to one freshly started mock, in file order, so **each file's examples use the items below, or items an earlier file creates**, never something a later file creates.

Values come from the GradStudio brief and its example. A value the brief does not give is marked *sample* (a name, a count, a date that only fills the story) or *waiting* (a policy or price the product owners decide).

## People

| Id | Name | Role | Account | Notes |
|---|---|---|---|---|
| `u-linh` | Nguyễn Thùy Linh | customer | `linh` | The brief's customer. **No conversation and no booking at the start**: step G3 creates her conversation |
| `u-customer2` | Trần Minh Anh | customer | `customer2` | Has bookings GS-1020 and GS-1022 and conversation `c-customer2` of their own |
| `u-uyen` | Nguyễn Thị Hoàng Phương Uyên | customer | none (*sample*) | Class representative of GS-1023 |
| `u-bao` | Lê Gia Bảo | customer | none (*sample*) | GS-1021, completed |
| `u-thao` | Thảo | admin | `thao` | The brief's Admin |
| `u-mai` | Mai | staff, make-up | `mai` | Busy 08:00–12:00 on 24/10/2026 (GS-1023) |
| `u-tuan` | Tuấn | staff, photographer | `tuan` | The photographer of GS-1024 |
| `u-staff3` | Hoàng Gia Huy (*sample*) | staff, photographer | `staff3` | Not on GS-1024; has the editing job of GS-1022 |
| `u-superadmin` | Quản trị hệ thống (*sample*) | superadmin | `superadmin` | — |

Accounts sign in with `<name>@gradstudio.test` and `<name>-demo` (`users.json`; the mock compares plain text, PA#4 stores hashes).

## Rooms and costumes

| Id | Name | Notes |
|---|---|---|
| `r-b` | Phòng B | The brief's room: GS-1024 shoots here, 14:00–16:00 on 24/10 |
| `r-a` | Phòng A (*sample*) | GS-1023 |
| costumes | *waiting* | Costume rental is an extra; how costumes are chosen and whether stock is checked waits for the product owners |

## Services and packages

From the brief: Kỷ yếu lớp từ 350.000đ/người, Tốt nghiệp từ 1.800.000đ, Chân dung/CV từ 690.000đ; Gói Tốt nghiệp Premium, 2 hours, 30 edited photos, 1.800.000đ. Other packages' contents and the prices of extras (make-up, costume rental) are *waiting*.

## Conversations

One in each status the brief names, so step G4 shows all four.

| Id | Customer | Status at start | Content | Used by |
|---|---|---|---|---|
| `c-anh` | `u-customer2` | Chưa trả lời | A question about the Chân dung/CV package, no reply yet | G4; S4 (Linh may not read it) |
| `c-uyen` | `u-uyen` | Đang tư vấn | The class yearbook, being advised; no agreed time | `05-bookings.md`: creating a booking from it is refused with `409` (R2) |
| `c-customer2` | `u-customer2` | Đã chốt lịch | Agreed time, became GS-1022 | — |
| `c-bao` | `u-bao` | Hoàn thành | GS-1021, photos delivered | G4 |
| `c-linh` | `u-linh` | *created by G3* | Linh's question "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?"; Thảo proposes 13:00–14:00 make-up and 14:00–16:00 shoot; Linh agrees | `03-conversations.md` creates it and leaves it agreed; `05-bookings.md` then creates GS-1024 from it |

## Bookings

| Id | Customer | Package | When | Status at start | What is done | Used by |
|---|---|---|---|---|---|---|
| GS-1020 | `u-customer2` | Gói Tốt nghiệp Premium | 17/10/2026 (*sample*) | Đã đặt lịch | Deposit paid, shoot done, 40 previews (*sample* count), **no photos chosen** | `09-gallery.md`: choosing 30 is accepted, 31 refused (R5) |
| GS-1021 | `u-bao` | Gói Tốt nghiệp Premium | 10/10/2026 (*sample*) | Hoàn thành | Everything paid, photos chosen, file link, *Nhận ảnh* pressed | History; *Hoàn thành* in lists |
| GS-1022 | `u-customer2` | Gói Tốt nghiệp Premium | 18/10/2026 (*sample*) | Đã đặt lịch | Deposit paid, shoot done, 30 photos chosen, **remainder not paid, no file link**; editing job with `u-staff3` | `05-bookings.md` adds the file link (G10); `06-payments.md` pays the remainder; `09-gallery.md` presses *Nhận ảnh* → Hoàn thành (R6) |
| GS-1023 | `u-uyen` | Kỷ yếu lớp, 20 people (*sample*), 7.000.000đ (350.000đ × 20) | 24/10/2026, make-up 08:00–12:00 with Mai, Phòng A | Đã đặt lịch | Deposit paid | Makes Mai busy 08:00–12:00, so 09:00 clashes (R1, G5) |
| GS-1024 | `u-linh` | Gói Tốt nghiệp Premium, Tốt nghiệp cá nhân, 1.800.000đ | 24/10/2026, make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B | *created by* `05-bookings.md` → Chờ cọc 30% | — | `06` deposit (success → Đã đặt lịch, failure → stays); `07` its reminder; `08` Mai's and Tuấn's jobs and a preview upload |

Ids: the mock gives a new booking the next number, so the booking created from `c-linh` is **GS-1024**, the brief's code.

## Which file uses what

| File | Starts from | Leaves behind |
|---|---|---|
| `01-auth.md` | the accounts | nothing |
| `02-catalogue.md` | services, packages, photos, reviews | nothing |
| `03-conversations.md` | `c-anh`, `c-uyen`, `c-customer2`, `c-bao` | `c-linh`, agreed |
| `04-schedule.md` | GS-1023 (Mai busy 08:00–12:00) | nothing |
| `05-bookings.md` | `c-uyen` (not agreed), `c-linh` (agreed), GS-1022 | GS-1024 in Chờ cọc 30%; GS-1022 with its file link |
| `06-payments.md` | GS-1024, GS-1022 | GS-1024 Đã đặt lịch (after one failed and one successful deposit); GS-1022 fully paid |
| `07-reminders.md` | GS-1024 booked | nothing |
| `08-jobs.md` | GS-1024's jobs (Mai, Tuấn), GS-1022's job (`u-staff3`) | a preview on GS-1024 |
| `09-gallery.md` | GS-1020, GS-1022 | 30 photos chosen on GS-1020; GS-1022 Hoàn thành |
| `10-admin.md` | the accounts, the settings | a new Admin account |

## Changes

- 2026-11-20 — First version. No client code calls the API yet. The JSON files for each resource follow the field names of its contract file, written when that file is.
