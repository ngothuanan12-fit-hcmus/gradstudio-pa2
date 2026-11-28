import { useState } from 'react';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import TextField from '../components/TextField.jsx';
import useForm from '../forms/useForm.js';
import useApi from '../hooks/useApi.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import '../styles/superadmin.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// The checks of POST /api/admins (docs/api/10-admin.md), made before sending.
function validateAdmin({ name, email, password }) {
  const errors = {};
  if (name.trim() === '') errors.name = 'Nhập họ tên.';
  else if (name.length > 100) errors.name = 'Họ tên tối đa 100 ký tự.';
  if (email.trim() === '') errors.email = 'Nhập e-mail.';
  else if (email.length > 254 || !EMAIL.test(email.trim())) errors.email = 'E-mail chưa đúng định dạng.';
  if (password.length < 8 || password.length > 128) errors.password = 'Mật khẩu từ 8 đến 128 ký tự.';
  return errors;
}

// Weekday and weekend opening hours (10-admin.md; product owners, part II answer 4).
const HOUR_PARTS = [
  { id: 'weekday', legend: 'ngày thường (thứ Hai – thứ Sáu)', short: 'ngày thường' },
  { id: 'weekend', legend: 'cuối tuần (thứ Bảy, Chủ nhật)', short: 'cuối tuần' },
];

// The checks of PUT /api/settings. Field names are the API's, so a 400 lands on the same fields.
function validateSettings(v) {
  const errors = {};
  for (const part of HOUR_PARTS) {
    const key = `openingHours.${part.id}`;
    const open = v[`${key}.open`];
    const close = v[`${key}.close`];
    if (!TIME.test(open)) errors[`${key}.open`] = 'Giờ theo dạng HH:MM.';
    if (!TIME.test(close)) errors[`${key}.close`] = 'Giờ theo dạng HH:MM.';
    else if (TIME.test(open) && close <= open) errors[`${key}.close`] = 'Giờ đóng cửa phải sau giờ mở cửa.';
  }
  const hours = Number(v.reminderHoursBefore);
  if (v.reminderHoursBefore === '' || !Number.isInteger(hours) || hours < 1 || hours > 168) {
    errors.reminderHoursBefore = 'Số giờ từ 1 đến 168.';
  }
  return errors;
}

// The Admin accounts and the form that adds one. A new account joins the list from the API's answer, with no reload.
function AdminAccounts() {
  const admins = useApi('/admins');
  const [done, setDone] = useState('');

  const form = useForm({
    initial: { name: '', email: '', password: '' },
    validate: validateAdmin,
    onSubmit: async ({ name, email, password }) => {
      setDone('');
      try {
        const admin = await api('/admins', {
          method: 'POST',
          body: { name: name.trim(), email: email.trim(), password },
        });
        admins.setData((list) => [...(list || []), admin]);
        form.reset();
        setDone(`Đã tạo tài khoản Admin cho ${admin.name}. Người này đăng nhập bằng ${admin.email}.`);
      } catch (error) {
        // The e-mail already has an account: the message belongs next to the e-mail field, not at the form's top.
        if (error.status === 409) error.fields = { email: error.message };
        throw error;
      }
    },
  });

  return (
    <section className="panel superadmin-part" id="tai-khoan" aria-labelledby="admins-title">
      <h2 id="admins-title">Tài khoản Admin</h2>
      <DataState query={admins} emptyText="Chưa có tài khoản Admin nào." loadingLabel="Đang tải tài khoản Admin…">
        {(list) => (
          <ul className="admin-list">
            {list.map((a) => (
              <li key={a.id}>
                <span className="admin-name">{a.name}</span>
                <span className="admin-email">{a.email}</span>
              </li>
            ))}
          </ul>
        )}
      </DataState>

      <h3 className="superadmin-sub">Thêm tài khoản Admin</h3>
      {/* Always in the page, so a screen reader announces the text when it appears. */}
      <p className="form-done" role="status">
        {done}
      </p>
      <form className="superadmin-form" noValidate onSubmit={form.handleSubmit}>
        {form.formError ? (
          <p className="form-error" role="alert">
            {form.formError}
          </p>
        ) : null}
        <TextField id="admin-name" label="Họ tên" autoComplete="off" {...form.field('name')} />
        <TextField id="admin-email" label="E-mail đăng nhập" type="email" autoComplete="off" {...form.field('email')} />
        <TextField
          id="admin-password"
          label="Mật khẩu ban đầu"
          type="password"
          autoComplete="new-password"
          hint="Từ 8 đến 128 ký tự. Gửi riêng cho người được tạo tài khoản."
          {...form.field('password')}
        />
        <Button {...form.submitProps}>{form.busy ? 'Đang tạo…' : 'Tạo tài khoản'}</Button>
      </form>
    </section>
  );
}

// Opening hours and the reminder time. The form starts from the settings the API gave, and every field goes every time.
function SettingsForm({ settings, onSaved }) {
  const [done, setDone] = useState('');
  const form = useForm({
    initial: {
      'openingHours.weekday.open': settings.openingHours.weekday.open,
      'openingHours.weekday.close': settings.openingHours.weekday.close,
      'openingHours.weekend.open': settings.openingHours.weekend.open,
      'openingHours.weekend.close': settings.openingHours.weekend.close,
      reminderHoursBefore: String(settings.reminderHoursBefore),
    },
    validate: validateSettings,
    onSubmit: async (v) => {
      setDone('');
      const saved = await api('/settings', {
        method: 'PUT',
        body: {
          openingHours: Object.fromEntries(
            HOUR_PARTS.map((part) => [
              part.id,
              { open: v[`openingHours.${part.id}.open`], close: v[`openingHours.${part.id}.close`] },
            ]),
          ),
          reminderHoursBefore: Number(v.reminderHoursBefore),
        },
      });
      onSaved(saved);
      setDone(
        `Đã lưu. Mở cửa ${HOUR_PARTS.map((part) => `${part.short} ${saved.openingHours[part.id].open}–${saved.openingHours[part.id].close}`).join(', ')}; nhắc lịch trước ${saved.reminderHoursBefore} giờ.`,
      );
    },
  });

  return (
    <>
      <p className="form-done" role="status">
        {done}
      </p>
      <form className="superadmin-form" noValidate onSubmit={form.handleSubmit}>
        {form.formError ? (
          <p className="form-error" role="alert">
            {form.formError}
          </p>
        ) : null}
        {HOUR_PARTS.map((part) => (
          <fieldset className="superadmin-fieldset" key={part.id}>
            <legend>Giờ mở cửa {part.legend}</legend>
            <div className="field-row">
              <TextField
                id={`settings-${part.id}-open`}
                type="time"
                label="Mở cửa"
                {...form.field(`openingHours.${part.id}.open`)}
              />
              <TextField
                id={`settings-${part.id}-close`}
                type="time"
                label="Đóng cửa"
                {...form.field(`openingHours.${part.id}.close`)}
              />
            </div>
          </fieldset>
        ))}
        <TextField
          id="settings-reminder"
          type="number"
          inputMode="numeric"
          min="1"
          max="168"
          label="Gửi nhắc lịch trước buổi chụp (giờ)"
          hint="Từ 1 đến 168 giờ. Áp dụng cho các nhắc lịch đặt sau khi lưu."
          {...form.field('reminderHoursBefore')}
        />
        <Button {...form.submitProps}>{form.busy ? 'Đang lưu…' : 'Lưu cài đặt'}</Button>
      </form>
    </>
  );
}

function Settings() {
  const settings = useApi('/settings');
  return (
    <section className="panel superadmin-part" id="cai-dat" aria-labelledby="settings-title">
      <h2 id="settings-title">Cài đặt hệ thống</h2>
      <DataState query={settings} isEmpty={() => false} loadingLabel="Đang tải cài đặt…">
        {(s) => <SettingsForm settings={s} onSaved={settings.setData} />}
      </DataState>
    </section>
  );
}

// Step G11, the Superadmin's screen: Admin accounts and the system-wide settings. Each part loads on its own, so a
// failure in one leaves the other usable, and each has its own Retry.
export default function QuanTri() {
  return (
    <AdminLayout
      title="Quản trị hệ thống: GradStudio"
      sections={[
        { href: '#tai-khoan', label: 'Tài khoản Admin' },
        { href: '#cai-dat', label: 'Cài đặt' },
      ]}
    >
      <h1 className="page-title">Quản trị hệ thống</h1>
      <div className="superadmin-grid">
        <AdminAccounts />
        <Settings />
      </div>
    </AdminLayout>
  );
}
