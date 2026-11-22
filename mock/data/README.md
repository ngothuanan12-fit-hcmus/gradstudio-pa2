# The mock's starting data: the seed story

What exists when `node mock/server.mjs` starts. The mock keeps every change in memory and starts over from these files on restart. contract-check sends every example of `docs/api/` to one freshly started mock, in file order, so **each file's examples use the items below, or items an earlier file creates**, never something a later file creates.

Values come from the GradStudio brief and its example. A value the brief does not give is marked *sample* (a name, a count, a date that only fills the story) or *waiting* (a policy or price the product owners decide).

## People

| Id | Name | Role | Account | Notes |
|---|---|---|---|---|
| `u-linh` | Nguyễn Thùy Linh | customer | `linh` | The brief's customer. **No conversation and no booking at the start**: step G3 creates her conversation |
| `u-customer2` | Trần Minh Anh | customer | `customer2` | Has bookings GS-1020 and GS-1022 and conversation `c-customer2` of their own |
| `u-uyen` | Nguyễn Thị Hoàng Phương Uyên | customer | none (*sample*) | Asks about a class yearbook (`c-uyen`); no time agreed yet |
| `u-khoa` | Võ Đăng Khoa | customer | none (*sample*) | Class representative of GS-1023; the class shares one gallery link, classmates have no accounts in this version (*assumption*) |
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
| costumes | product owners | Costume rental is an extra with a model and a size, recorded so the studio can prepare it; it has no price and its stock is not checked ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)) |

## Services and packages

From the brief: Kỷ yếu lớp từ 350.000đ/người, Tốt nghiệp từ 1.800.000đ, Chân dung/CV từ 690.000đ; Gói Tốt nghiệp Premium, 2 hours, 30 edited photos, 1.800.000đ. The product owners decided ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)): extras have no price of their own and a booking costs its package's price; GS-1024 is 1.800.000đ with make-up included. A package's `includes` is part of its description on the price list.

## Catalogue (`02-catalogue.md`)

| Item | Values | Source |
|---|---|---|
| Services | Kỷ yếu lớp (from 350.000đ per person), Tốt nghiệp (from 1.800.000đ), Chân dung/CV (from 690.000đ) | brief |
| Packages | Gói Kỷ yếu lớp 350.000đ/người; Gói Tốt nghiệp Premium 1.800.000đ, 120 minutes, 30 edited photos, includes make-up; Gói Chân dung/CV 690.000đ | brief; Premium including make-up confirmed by the product owners; the other packages' length and photo counts are `null` (*waiting*) |
| One-line summaries | "Đặt lịch cho cả lớp ngay để lưu lại những khoảnh khắc đáng nhớ cùng nhau." (An's wording); "Chụp ảnh tốt nghiệp cho riêng bạn hoặc nhóm bạn thân, để nhớ mãi ngày ra trường."; "Đặt lịch chụp chân dung chỉn chu cho CV và hồ sơ xin việc của bạn." | our wording; "khoảnh khắc" once on the home page (PA#2 writing rule 7) |
| Extras | Makeup, Thuê trang phục (by model and size), no price of their own | brief names them; no price, product owners' decision |
| Costume models | Áo cử nhân (S–XL), Áo dài trắng (S–L) | *sample* |
| Photos | One per service, the licensed photos of PA#2 with their authors and licences (`docs/IMAGE_SOURCES.md`) | PA#2 |
| Reviews | Three, the newest by Lê Gia Bảo (GS-1021) | *sample* text |

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
| GS-1022 | `u-customer2` | Gói Tốt nghiệp Premium | 18/10/2026 (*sample*) | Đã đặt lịch | Deposit paid, shoot done, **no photos chosen yet, remainder not paid, no file link**; editing job with `u-staff3` | `05-bookings.md` adds the file link (G10); `06-payments.md` refuses remainder before selection; `09-gallery.md` chooses photos, pays the remainder, and presses *Nhận ảnh* → Hoàn thành (R6) |
| GS-1023 | `u-khoa` | Kỷ yếu lớp, estimated 20 people (*sample*), confirmed by the Admin at 7.000.000đ (350.000đ × 20; *assumption*: the representative estimates, the Admin confirms and adjusts) | 24/10/2026, make-up 08:00–12:00 with Mai, Phòng A | Đã đặt lịch | Deposit paid | Makes Mai busy 08:00–12:00, so 09:00 clashes (R1, G5) |
| GS-1024 | `u-linh` | Gói Tốt nghiệp Premium, Tốt nghiệp cá nhân, 1.800.000đ | 24/10/2026, make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B | *created by* `05-bookings.md` → Chờ cọc 30% | — | `06` deposit (success → Đã đặt lịch, failure → stays); `07` its reminder; `08` Mai's and Tuấn's jobs and a preview upload |

Ids: the mock gives a new booking the next number, so the booking created from `c-linh` is **GS-1024**, the brief's code.

## Which file uses what

| File | Starts from | Leaves behind |
|---|---|---|
| `01-auth.md` | the accounts | nothing |
| `02-catalogue.md` | services, packages, photos, reviews | nothing |
| `03-conversations.md` | `c-anh`, `c-uyen`, `c-customer2`, `c-bao` | `c-linh` agreed (proposal `pr-1`: make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B); `c-anh` back to *Đang tư vấn* after declining `pr-2` |
| `04-schedule.md` | GS-1023 (Mai busy 08:00–12:00) | nothing |
| `05-bookings.md` | `c-uyen` (not agreed), `c-linh` (agreed), GS-1022 | GS-1024 in Chờ cọc 30%; GS-1022 with its file link |
| `06-payments.md` | GS-1024, GS-1022 | GS-1024 Đã đặt lịch (after one failed and one successful deposit); GS-1022 remainder stays unpaid until photo selection in `09-gallery.md` |
| `07-reminders.md` | GS-1024 booked | nothing |
| `08-jobs.md` | GS-1024's jobs (Mai, Tuấn), GS-1022's job (`u-staff3`) | a preview on GS-1024 |
| `09-gallery.md` | GS-1020, GS-1022 | 30 photos chosen on GS-1020; GS-1022 Hoàn thành |
| `10-admin.md` | the accounts, the settings | a new Admin account |

## Files

| File | Holds | Read by |
|---|---|---|
| `users.json` | People and the demo accounts | `auth`, every module |
| `services.json`, `extras.json`, `photos.json`, `reviews.json` | The catalogue | `catalogue`, `conversations` |
| `conversations.json` | Conversations and their messages; a message points at its proposal by id | `conversations` |
| `proposals.json` | Proposed times, with their status | `conversations` |
| `rooms.json` | Rooms | `conversations`, `schedule` |
| `staff.json` | Staff specialties (`makeup`, `photographer`, *sample*) | `schedule` |
| `costumes.json` | Costume stock counts per model and size (*sample*, `5` each) | `schedule` |
| `bookings.json` | Seed bookings (`GS-1020`–`GS-1023`) and newly created bookings | `schedule`, `bookings`, `payments` |
| `payments.json` | Payment records for deposits and remainders | `payments` |
| `reminders.json` | Scheduled reminders for booked sessions (`Đã đặt lịch`) | `reminders`, `payments`, `bookings` |
| `jobs.json`, `previews.json` | Assigned staff jobs and preview metadata (seed samples use `client/public/photos/*.webp`) | `jobs`, `payments`, `bookings` |
| `previews.json` (seed rows) | 40 previews on GS-1020 and 5 on GS-1022 (*sample*: the licensed photos of the home page reused), so G9 has photos to choose from | `gallery` |
| `selections.json` | The customers' photo choices, one row per booking (`bookingId`, `previewIds`, `savedAt`); empty at start | `gallery`; `payments` (the remaining 70% needs a choice) |
| `busy.json` | Times when a person or a room is held by a booking in *Đã đặt lịch* (R1: a booking in *Chờ cọc 30%* holds nothing) | the clash check in `conversations`; `04-schedule.md` and `06-payments.md` (a successful deposit adds the booking's blocks) |
| `freeTimes.json` | The free time the API offers for a date with a clash (the mock may answer fixed values, PA#3 rubric) | the clash check (`conversations`, `schedule`) |
| `settings.json` | Opening hours (*sample*, 08:00–18:00) and `reminderHoursBefore` (24, from the brief) | `admin`; the reminders of `07-reminders.md` |

## Changes

- 2026-11-20 — First version. No client code calls the API yet. The JSON files for each resource follow the field names of its contract file, written when that file is.
- 2026-11-20 — The team's assumptions for extras, costumes and the class yearbook (`FRONTEND.md`, section 5) written into the seed story, until the product owners answer.
- 2026-11-20 — The catalogue's values, for `02-catalogue.md`.
- 2026-11-20 — GS-1023's representative is now Võ Đăng Khoa (`u-khoa`): Uyên had both a booked GS-1023 and a conversation with no agreed time, which did not fit together.
- 2026-11-20 — Files for `03-conversations.md`: conversations, proposals, rooms, busy times, free times.
- 2026-11-20 — `settings.json` for `10-admin.md`.
- 2026-11-22 — Update `06-payments.md` outcome: `GS-1022` remainder payment waits for `db.selections` from `09-gallery.md` before succeeding.
