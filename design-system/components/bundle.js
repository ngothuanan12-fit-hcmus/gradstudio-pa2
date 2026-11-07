/* @ds-bundle: {"format":4,"namespace":"GradStudio","components":[{"name":"Button"},{"name":"PackageChip"},{"name":"StepCaption"},{"name":"AngleMap"},{"name":"SetDrawing"},{"name":"PackageCard"},{"name":"BookingSummary"},{"name":"ChatPanel"},{"name":"StatusBadge"},{"name":"ConversationList"},{"name":"BookingForm"},{"name":"ConflictAlert"},{"name":"ResourceSchedule"},{"name":"WeekCalendar"},{"name":"DepositCard"}]} */
(function () {
  var React = window.React, h = React.createElement, useState = React.useState;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function vnd(n) { return typeof n === "number" ? n.toLocaleString("vi-VN").replace(/,/g, ".") + "đ" : n; }

  /* ---------- sample data from the brief (not official studio pricing) ---------- */
  var journeySteps = [
    { id: "set", top: "Chuẩn bị", bottom: "set chụp", desc: "Sơ đồ lớp học với vị trí máy ảnh và đèn cho cả buổi chụp.", focus: { x: 600, y: 380, s: 1 }, angle: 1 },
    { id: "board", top: "Góc bảng lớp", bottom: "cùng cả nhóm", desc: "Cả nhóm đứng trước bảng, viết lời chào cuối cùng bằng phấn.", focus: { x: 360, y: 190, s: 2.1 }, angle: 2 },
    { id: "desk", top: "Góc bàn học", bottom: "ánh sáng cửa sổ", desc: "Ánh nắng sớm qua ô cửa sổ, ngồi lại bàn học cũ lần cuối.", focus: { x: 190, y: 320, s: 2.2 }, angle: 3 },
    { id: "hall", top: "Góc hành lang", bottom: "đi cùng bạn thân", desc: "Bước chậm dọc hành lang, nắng cắt qua từng hàng cột.", focus: { x: 740, y: 360, s: 1.7 }, angle: 4 },
    { id: "yard", top: "Sân trường", bottom: "cả nhóm áo cử nhân", desc: "Tung mũ dưới cột cờ, cả lớp trong áo cử nhân.", focus: { x: 1000, y: 400, s: 1.5 }, angle: 5 },
    { id: "end", top: "Đặt buổi chụp", bottom: "của bạn", desc: "Chat với studio để chọn ngày, giờ và gói phù hợp.", focus: null, angle: null }
  ];
  var sampleBooking = {
    code: "GS-1024", customer: "Linh", pkg: "Gói Tốt nghiệp Premium", price: 1800000, deposit: 540000, rest: 1260000,
    date: "24/10/2026", dow: "Thứ Bảy", requested: "09:00",
    makeup: { who: "Mai", from: "13:00", to: "14:00" }, shoot: { who: "Tuấn", from: "14:00", to: "16:00", room: "Phòng B" }
  };

  /* ---------- Button ---------- */
  function Button(p) {
    var variant = p.variant || "primary", rest = Object.assign({}, p);
    delete rest.variant; delete rest.size; delete rest.block; delete rest.icon; delete rest.href;
    var cls = cx("gs-btn", "gs-btn-" + variant, p.size === "sm" && "gs-btn-sm", p.block && "gs-btn-block", p.className);
    rest.className = cls;
    var kids = [p.icon || null, p.children];
    if (p.href) return h.apply(null, ["a", Object.assign(rest, { href: p.href })].concat(kids));
    return h.apply(null, ["button", Object.assign({ type: "button" }, rest)].concat(kids));
  }
  var ChatIcon = h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    h("path", { d: "M4 5h16v11H9l-5 4z" }));
  var SendIcon = h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    h("path", { d: "M4 12l16-8-6 16-2-6z" }));
  var WarnIcon = h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    h("path", { d: "M12 3l10 18H2z" }), h("path", { d: "M12 10v5M12 18v.5" }));

  /* ---------- PackageChip ---------- */
  function PackageChip(p) {
    return h("div", { className: cx("gs gs-chip", p.className) },
      h("span", { className: "gs-chip-text" },
        h("span", { className: "gs-chip-name" }, p.name || "Gói Tốt nghiệp Premium"),
        h("span", { className: "gs-chip-price gs-tnum" }, vnd(p.price != null ? p.price : 1800000))),
      h(Button, { variant: "primary", size: "sm", icon: ChatIcon, onClick: p.onChat }, p.cta || "Chat với studio"));
  }

  /* ---------- StepCaption (+ progress ring) ---------- */
  function ProgressRing(p) {
    var r = 19, c = 2 * Math.PI * r, frac = p.total ? p.value / p.total : 0;
    return h("svg", { className: "gs-ring", viewBox: "0 0 44 44", "aria-hidden": true },
      h("circle", { className: "gs-ring-track", cx: 22, cy: 22, r: r }),
      h("circle", { className: "gs-ring-value", cx: 22, cy: 22, r: r, strokeDasharray: c, strokeDashoffset: c * (1 - frac) }));
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function StepCaption(p) {
    return h("div", { className: cx("gs gs-cap", p.className), "aria-live": p.live ? "polite" : undefined },
      h("span", { className: "gs-cap-step gs-tnum" }, pad(p.step) + " / " + pad(p.steps || 6)),
      h(p.as || "h2", { className: "gs-cap-title" },
        h("span", { className: "gs-cap-top" }, p.top),
        h("span", { className: "gs-cap-bottom" }, p.bottom)),
      p.desc ? h("p", { className: "gs-cap-desc" }, p.desc) : null,
      p.angle ? h("div", { className: "gs-cap-foot" },
        h(ProgressRing, { value: p.angle, total: p.angles || 5 }),
        h("span", { className: "gs-ring-label gs-tnum" }, "Góc " + p.angle + "/" + (p.angles || 5))) : null);
  }

  /* ---------- AngleMap ---------- */
  function AngleMap(p) {
    var items = p.items || journeySteps.filter(function (s) { return s.angle; });
    return h("nav", { className: cx("gs gs-map", p.className), "aria-label": p.label || "Các góc chụp" },
      items.map(function (s, i) {
        var n = s.angle || i + 1, cur = n === p.current;
        return h("button", {
          key: s.id || n, type: "button", className: cx("gs-map-btn", n < p.current && "is-done"),
          "aria-current": cur ? "step" : undefined, onClick: function () { p.onSelect && p.onSelect(n, s); }
        }, h("span", { className: "gs-map-label" }, s.top), h("span", { className: "gs-map-dot", "aria-hidden": true }),
          h("span", { className: "gs-sr" }, "Góc " + n + ": " + s.top + " " + s.bottom));
      }));
  }

  /* ---------- SetDrawing: classroom + corridor + schoolyard plan, 1200×760 ---------- */
  var cam = function (x, y, rot) { return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ')"><rect class="gs-gear" x="-13" y="-9" width="26" height="18" rx="3"/><rect class="gs-gear-fill" x="-5" y="-15" width="10" height="6" rx="1"/><circle class="gs-gear" r="5"/></g>'; };
  var light = function (x, y, rot) { return '<g transform="translate(' + x + " " + y + ") rotate(" + rot + ')"><rect class="gs-gear" x="-18" y="-5" width="36" height="10" rx="2"/><path class="gs-gear" d="M-12 9l-6 12M0 9v14M12 9l6 12"/><circle class="gs-gear-fill" cy="-12" r="4"/></g>'; };
  var walls = "M40 40H680V440M680 500V560H40V480M40 400V340M40 260V200M40 120V40";
  var desks = "";
  [110, 290, 470].forEach(function (x) { [190, 270, 350, 430].forEach(function (y) {
    desks += '<rect class="gs-ln" x="' + x + '" y="' + y + '" width="120" height="34" rx="3"/><path class="gs-ln-dim" d="M' + (x + 22) + " " + (y + 44) + "h24M" + (x + 74) + " " + (y + 44) + 'h24"/>';
  }); });
  var cols = ""; for (var cy = 80; cy <= 680; cy += 100) cols += '<rect class="gs-ln" x="786" y="' + cy + '" width="12" height="12"/>';
  var crowd = ""; [[960, 290], [985, 280], [1010, 284], [1035, 292], [972, 316], [998, 310], [1024, 318]].forEach(function (q) { crowd += '<circle class="gs-ln" cx="' + q[0] + '" cy="' + q[1] + '" r="9"/>'; });
  var PLAN =
    '<g>' +
    '<path class="gs-ln-glow" d="' + walls + '"/>' +
    '<path class="gs-ln-dim" d="M40 590H680M40 582v16M680 582v16"/><text class="gs-svg-label" x="360" y="616" text-anchor="middle">LỚP 12A1 · 9,6 M</text>' +
    '<path class="gs-ln-dim" d="M36 120v80M44 120v80M36 260v80M44 260v80M36 400v80M44 400v80"/>' +
    '<path class="gs-ln" d="' + walls + '"/>' +
    '<path class="gs-ln" d="M680 440H624"/><path class="gs-ln-dim gs-ln-dash" d="M624 440A56 56 0 0 0 680 496"/>' +
    '<rect class="gs-ln" x="200" y="50" width="320" height="10" rx="2"/><text class="gs-svg-label" x="360" y="84" text-anchor="middle">BẢNG</text>' +
    '<rect class="gs-ln" x="310" y="104" width="100" height="40" rx="3"/>' + desks +
    '<path class="gs-ln" d="M800 40V720"/>' + cols +
    '<text class="gs-svg-label" x="740" y="660" text-anchor="middle" transform="rotate(-90 740 660)">HÀNH LANG</text>' +
    '<rect class="gs-ln-dim gs-ln-dash" x="840" y="40" width="320" height="680" rx="8"/>' +
    '<circle class="gs-ln" cx="1000" cy="150" r="6"/><circle class="gs-ln-dim" cx="1000" cy="150" r="34"/><text class="gs-svg-label" x="1000" y="212" text-anchor="middle">CỘT CỜ</text>' +
    '<circle class="gs-ln" cx="884" cy="250" r="26"/><circle class="gs-ln" cx="1116" cy="250" r="26"/><circle class="gs-ln" cx="884" cy="540" r="26"/><circle class="gs-ln" cx="1116" cy="540" r="26"/>' +
    crowd + '<text class="gs-svg-label" x="1000" y="700" text-anchor="middle">SÂN TRƯỜNG</text>' +
    /* gear: fields of view, cameras, lights */
    '<path class="gs-fov" d="M360 360L246 120H474Z"/>' + cam(360, 372, 0) + light(222, 160, 30) + light(498, 160, -30) +
    '<path class="gs-fov" d="M300 330L112 260V400Z"/>' + cam(312, 330, -90) +
    '<path class="gs-gear gs-ln-dash" d="M6 290l52 18M6 316l52 4M6 342l52-10"/>' +
    '<path class="gs-fov" d="M740 560L704 250H776Z"/>' + cam(740, 574, 0) +
    '<path class="gs-fov" d="M1000 640L900 300H1100Z"/>' + cam(1000, 654, 0) + light(1110, 600, -40) +
    '</g>';

  function SetDrawing(p) {
    var steps = p.steps || journeySteps, s = steps[(p.step || 1) - 1] || steps[0];
    var f = s.focus || { x: 600, y: 380, s: 1 };
    var still = !!p.still;
    var style = still ? {} : { "--fx": f.x, "--fy": f.y, "--s": f.s };
    var photo = p.photos && p.photos[s.id];
    return h("div", { className: cx("gs gs-stage", p.className), role: "img", "aria-label": p.label || ("Sơ đồ " + s.top.toLowerCase() + ", " + s.bottom) },
      h("div", { className: "gs-cam", style: style },
        h("svg", { viewBox: "0 0 1200 760", preserveAspectRatio: "xMidYMid meet", "aria-hidden": true, dangerouslySetInnerHTML: { __html: PLAN } })),
      (p.reveal && f.s > 1) ? h("figure", { className: cx("gs-photo", p.revealed && "is-on") },
        photo ? h("img", { src: photo.src, srcSet: photo.srcSet, sizes: "100vw", alt: photo.alt || "", loading: "lazy", decoding: "async" })
          : h("div", { className: "gs-photo-ph" }, h("span", null, "Ảnh thật · " + s.top))) : null);
  }

  /* ---------- PackageCard ---------- */
  function PackageCard(p) {
    var st = useState(p.addonsChecked || {}), checked = st[0], set = st[1];
    return h("article", { className: cx("gs gs-pkg", p.selected && "is-selected", p.className) },
      p.kicker ? h("span", { className: "gs-pkg-kicker" }, p.kicker) : null,
      h("h3", { className: "gs-pkg-name" }, p.name),
      p.price != null ? h("span", { className: "gs-pkg-price gs-tnum" }, vnd(p.price)) : h("span", { className: "gs-pkg-price is-tbd" }, p.priceNote || "Giá: studio báo khi chat"),
      p.features ? h("ul", null, p.features.map(function (t) { return h("li", { key: t }, t); })) : null,
      p.addons ? h("fieldset", { className: "gs-addons", style: { border: 0, margin: 0, padding: "16px 0 0" } },
        h("legend", { className: "gs-sr" }, "Tùy chọn thêm"),
        p.addons.map(function (a) {
          return h("label", { key: a.id, className: "gs-check" },
            h("input", { type: "checkbox", checked: !!checked[a.id], onChange: function (e) { var n = Object.assign({}, checked); n[a.id] = e.target.checked; set(n); p.onAddons && p.onAddons(n); } }),
            h("span", null, a.label), h("small", null, a.note || ""));
        })) : null,
      h(Button, { variant: p.selected ? "primary" : "secondary", block: true, onClick: p.onSelect, "aria-pressed": !!p.selected }, p.selected ? "Đã chọn gói này" : "Chọn gói"));
  }

  /* ---------- BookingSummary ---------- */
  function BookingSummary(p) {
    var b = Object.assign({}, sampleBooking, p.booking || {});
    return h("aside", { className: cx("gs gs-sum", p.className), "aria-label": "Tổng kết buổi chụp" },
      h("div", { className: "gs-sum-head" }, h("strong", { className: "gs-display", style: { fontSize: 24, lineHeight: "32px" } }, p.title || "Buổi chụp của bạn"), p.badge || null),
      h("dl", null,
        h("dt", null, "Gói"), h("dd", null, b.pkg),
        h("dt", null, "Ngày"), h("dd", { className: "gs-tnum" }, b.dow + ", " + b.date),
        h("dt", null, "Giờ"), h("dd", { className: "gs-tnum" }, p.time || (b.makeup.from + "–" + b.shoot.to)),
        p.extra ? p.extra : null),
      h("div", { className: "gs-sum-total" }, h("span", null, "Tổng"), h("span", { className: "gs-pkg-price gs-tnum" }, vnd(b.price))));
  }

  /* ---------- ChatPanel ---------- */
  function ChatPanel(p) {
    var st = useState(""), text = st[0], setText = st[1];
    function send(e) { e.preventDefault(); if (!text.trim()) return; p.onSend && p.onSend(text.trim()); setText(""); }
    return h("section", { className: cx("gs gs-chat", p.className), style: p.height ? { height: p.height } : null, "aria-label": p.label || "Chat với studio" },
      h("div", { className: "gs-chat-log", role: "log", "aria-live": "polite" },
        (p.messages || []).map(function (m, i) {
          return h("div", { key: i, className: cx("gs-msg", m.me && "is-me") },
            !m.me && m.who ? h("span", { className: "gs-msg-who" }, m.who) : null, m.text,
            m.time ? h("span", { className: "gs-msg-meta gs-tnum" }, m.time) : null);
        })),
      h("form", { className: "gs-compose", onSubmit: send },
        h("label", { className: "gs-sr", htmlFor: (p.id || "gs-chat") + "-in" }, "Tin nhắn"),
        h("input", { id: (p.id || "gs-chat") + "-in", className: "gs-input", placeholder: p.placeholder || "Nhập tin nhắn cho studio…", value: text, onChange: function (e) { setText(e.target.value); } }),
        h(Button, { type: "submit", icon: SendIcon }, p.sendLabel || "Gửi")));
  }

  /* ---------- StatusBadge ---------- */
  var BADGE = { pending: "Chờ cọc", confirmed: "✓ Đã xác nhận", conflict: "⚠ Trùng lịch", neutral: "Mới" };
  function StatusBadge(p) { var t = p.tone || "neutral"; return h("span", { className: cx("gs-badge", "gs-badge-" + t, p.className) }, p.children || BADGE[t]); }

  /* ---------- ConversationList ---------- */
  function ConversationList(p) {
    return h("ul", { className: cx("gs gs-convs", p.className), "aria-label": "Hội thoại" },
      (p.items || []).map(function (c) {
        return h("li", { key: c.id },
          h("button", { type: "button", className: "gs-conv", "aria-current": c.id === p.activeId ? "true" : undefined, onClick: function () { p.onSelect && p.onSelect(c.id); } },
            h("span", { className: "gs-avatar", "aria-hidden": true }, c.name.charAt(0)),
            h("span", null, h("span", { className: "gs-conv-name" }, c.name), " ", c.status ? h(StatusBadge, { tone: c.status }) : null),
            h("span", { style: { display: "grid", justifyItems: "end", gap: 4 } }, h("span", { className: "gs-conv-time gs-tnum" }, c.time), c.unread ? h("span", { className: "gs-conv-unread" }, c.unread, h("span", { className: "gs-sr" }, " tin chưa đọc")) : null),
            h("span", { className: "gs-conv-last" }, c.last)));
      }));
  }

  /* ---------- BookingForm ---------- */
  function Field(p) {
    var id = "gs-f-" + p.name;
    return h("label", { className: cx("gs-field", p.error && "is-error"), htmlFor: id },
      h("span", null, p.label),
      p.options ? h("select", { id: id, className: "gs-select", defaultValue: p.value, "aria-invalid": !!p.error }, p.options.map(function (o) { return h("option", { key: o }, o); }))
        : h("input", { id: id, className: "gs-input gs-tnum", defaultValue: p.value, type: p.type || "text", "aria-invalid": !!p.error }),
      p.error ? h("span", { className: "gs-field-error" }, "⚠ " + p.error) : p.hint ? h("span", { className: "gs-field-hint" }, p.hint) : null);
  }
  function BookingForm(p) {
    var b = Object.assign({}, sampleBooking, p.booking || {});
    return h("form", { className: cx("gs gs-form", p.className), onSubmit: function (e) { e.preventDefault(); p.onSubmit && p.onSubmit(); } },
      h("h3", { className: "gs-form-title" }, "Booking mới", h(StatusBadge, { tone: p.conflict ? "conflict" : "pending" })),
      h("div", { className: "gs-form-row" },
        h(Field, { name: "kh", label: "Khách hàng", value: b.customer }),
        h(Field, { name: "goi", label: "Gói chụp", value: b.pkg, options: [b.pkg, "Gói Kỷ yếu nhóm", "Gói Chân dung"] })),
      h("div", { className: "gs-form-row" },
        h(Field, { name: "ngay", label: "Ngày chụp", value: b.date, hint: b.dow }),
        h(Field, { name: "gio", label: "Giờ bắt đầu", value: p.conflict ? b.requested : b.makeup.from, error: p.conflict ? "Mai (makeup) bận 08:00–12:00" : null })),
      h("div", { className: "gs-form-row" },
        h(Field, { name: "mk", label: "Thợ makeup", value: b.makeup.who, options: ["Mai"] }),
        h(Field, { name: "tc", label: "Thợ chụp", value: b.shoot.who, options: ["Tuấn"] })),
      h(Field, { name: "phong", label: "Phòng chụp", value: b.shoot.room, options: ["Phòng A", "Phòng B"] }),
      p.children || null,
      h("div", { className: "gs-form-actions" }, h(Button, { variant: "ghost" }, "Lưu nháp"), h(Button, { type: "submit", disabled: !!p.conflict }, "Tạo booking " + b.code)));
  }

  /* ---------- ConflictAlert ---------- */
  function ConflictAlert(p) {
    var st = useState(p.picked != null ? p.picked : 0), picked = st[0], setPicked = st[1];
    return h("div", { className: cx("gs gs-alert", p.className), role: "alert" },
      h("div", { className: "gs-alert-head" }, WarnIcon,
        h("div", null, h("p", { className: "gs-alert-title" }, p.title || "Trùng lịch"), h("p", null, p.children))),
      p.slots ? h("div", null, h("p", { className: "gs-field-hint", style: { marginBottom: 8 } }, "Gợi ý giờ trống"),
        h("div", { className: "gs-slots" }, p.slots.map(function (s, i) {
          return h("button", { key: i, type: "button", className: "gs-slot", "aria-pressed": picked === i, onClick: function () { setPicked(i); p.onPick && p.onPick(s, i); } },
            h("span", { className: "gs-tnum" }, h("b", null, "✓ "), s.time), h("small", null, s.note));
        }))) : null,
      p.actions || null);
  }

  /* ---------- ResourceSchedule ---------- */
  function ResourceSchedule(p) {
    var start = p.start || 8, end = p.end || 18, span = end - start;
    function t2n(t) { var a = t.split(":"); return +a[0] + (+a[1]) / 60; }
    function pos(b) { var a = t2n(b.from), z = t2n(b.to); return { left: ((a - start) / span * 100) + "%", width: ((z - a) / span * 100) + "%" }; }
    var ticks = []; for (var i = start; i < end; i++) ticks.push(i);
    return h("section", { className: cx("gs gs-sched", p.className), "aria-label": "Lịch thợ và phòng" },
      h("div", { className: "gs-sched-head" },
        h("strong", { style: { fontSize: 18, lineHeight: "28px" } }, p.title || "Lịch ngày"),
        h("div", { className: "gs-legend" },
          h("span", null, h("i", { style: { background: "var(--busy)" } }), "Bận"),
          h("span", null, h("i", { style: { background: "var(--danger-soft)", outline: "2px solid var(--danger)" } }), "⚠ Trùng"),
          h("span", null, h("i", { style: { background: "var(--free-soft)", outline: "2px dashed var(--free)" } }), "Trống"),
          h("span", null, h("i", { style: { background: "var(--accent-soft)", outline: "2px solid var(--accent)" } }), "Đề xuất"))),
      h("div", { className: "gs-sched-scroll", tabIndex: 0 },
        h("div", { className: "gs-sched-grid", style: { "--cols": span } },
          h("div", { className: "gs-sched-row gs-sched-axis" }, h("div", { className: "gs-sched-who" }),
            h("div", { className: "gs-sched-track", style: { backgroundSize: "calc(100% / " + span + ") 100%" } }, ticks.map(function (t) {
              return h("span", { key: t, className: "gs-sched-tick gs-tnum", style: { left: ((t - start) / span * 100) + "%" } }, pad(t) + ":00");
            }))),
          (p.rows || []).map(function (r) {
            return h("div", { key: r.id, className: "gs-sched-row" },
              h("div", { className: "gs-sched-who" }, h("b", null, r.name), h("small", null, r.role)),
              h("div", { className: cx("gs-sched-track", r.lanes === 2 && "gs-sched-track-2"), style: { backgroundSize: "calc(100% / " + span + ") 100%" } }, (r.blocks || []).map(function (b, j) {
                return h("div", { key: j, className: cx("gs-blk", "gs-blk-" + (b.kind || "busy"), b.lane === 2 && "gs-blk-l2"), style: pos(b), title: b.label + " " + b.from + "–" + b.to },
                  h("b", null, (b.kind === "conflict" ? "⚠ " : b.kind === "free" ? "✓ " : "") + b.label), h("span", { className: "gs-tnum" }, b.from + "–" + b.to));
              })));
          }))));
  }

  /* ---------- WeekCalendar ---------- */
  function WeekCalendar(p) {
    var days = p.days || [], st = useState(p.selected != null ? p.selected : 0), sel = st[0], setSel = st[1];
    var d = days[sel] || {};
    return h("section", { className: cx("gs gs-week", p.className), "aria-label": "Lịch tuần" },
      h("div", { className: "gs-week-head" }, h(Button, { variant: "ghost", size: "sm", "aria-label": "Tuần trước", onClick: p.onPrev }, "‹"),
        h("strong", { className: "gs-tnum" }, p.title || ""), h(Button, { variant: "ghost", size: "sm", "aria-label": "Tuần sau", onClick: p.onNext }, "›")),
      h("div", { className: "gs-week-days", role: "tablist" }, days.map(function (x, i) {
        return h("button", { key: i, type: "button", role: "tab", className: cx("gs-day", x.events && x.events.length && "has-event"), "aria-selected": i === sel, onClick: function () { setSel(i); } },
          h("span", { className: "gs-day-dow" }, x.dow), h("span", { className: "gs-day-num" }, x.num),
          x.events && x.events.length ? h("span", { className: "gs-sr" }, x.events.length + " lịch hẹn") : null);
      })),
      h("div", { className: "gs-week-agenda", role: "tabpanel" },
        d.events && d.events.length ? d.events.map(function (e, i) {
          return h("div", { key: i, className: "gs-ev" }, h("time", null, e.from + "–" + e.to), h("div", null, h("strong", null, e.title), h("small", null, e.where)));
        }) : h("p", { style: { margin: 0, color: "var(--ink-muted)" } }, "Không có lịch chụp ngày này.")));
  }

  /* ---------- DepositCard ---------- */
  function DepositCard(p) {
    var b = Object.assign({}, sampleBooking, p.booking || {}), pct = p.percent || 30;
    return h("section", { className: cx("gs gs-dep", p.className), "aria-label": "Thanh toán cọc" },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 } },
        h("strong", { style: { fontSize: 18, lineHeight: "28px" } }, "Thanh toán cọc " + pct + "%"), h(StatusBadge, { tone: p.paid ? "confirmed" : "pending" }, p.paid ? "✓ Đã cọc" : "Chờ cọc")),
      h("div", { className: "gs-dep-bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": p.paid ? pct : 0, "aria-label": "Đã thanh toán" }, h("span", { style: { width: (p.paid ? pct : 0) + "%" } })),
      h("dl", { className: "gs-dep-rows" },
        h("div", null, h("dt", null, "Mã booking"), h("dd", null, b.code)),
        h("div", null, h("dt", null, b.pkg), h("dd", null, vnd(b.price))),
        h("div", null, h("dt", null, "Còn lại sau buổi chụp"), h("dd", null, vnd(b.rest)))),
      h("div", { className: "gs-dep-due" }, h("span", null, p.paid ? "Đã cọc" : "Cần cọc"), h("strong", { className: "gs-tnum" }, vnd(b.deposit))),
      p.paid ? null : h(Button, { block: true, onClick: p.onPay }, "Thanh toán " + vnd(b.deposit)));
  }

  window.GradStudio = Object.assign(window.GradStudio || {}, {
    Button: Button, PackageChip: PackageChip, StepCaption: StepCaption, ProgressRing: ProgressRing, AngleMap: AngleMap, SetDrawing: SetDrawing,
    PackageCard: PackageCard, BookingSummary: BookingSummary, ChatPanel: ChatPanel, StatusBadge: StatusBadge, ConversationList: ConversationList,
    BookingForm: BookingForm, ConflictAlert: ConflictAlert, ResourceSchedule: ResourceSchedule, WeekCalendar: WeekCalendar, DepositCard: DepositCard,
    journeySteps: journeySteps, sampleBooking: sampleBooking, formatVND: vnd
  });
})();
