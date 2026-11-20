import { Navigate, useLocation, useNavigate } from 'react-router';
import { HOME } from '../auth/roles.js';
import useAuth from '../auth/useAuth.js';
import Button from '../components/Button.jsx';
import LoadingState from '../components/LoadingState.jsx';
import TextField from '../components/TextField.jsx';
import useForm from '../forms/useForm.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import '../styles/sign-in.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The checks of docs/api/01-auth.md, made before sending.
function validate({ email, password }) {
  const errors = {};
  if (email.trim() === '') errors.email = 'Nhập e-mail.';
  else if (email.length > 254 || !EMAIL.test(email)) errors.email = 'E-mail chưa đúng định dạng.';
  if (password === '') errors.password = 'Nhập mật khẩu.';
  else if (password.length > 128) errors.password = 'Mật khẩu tối đa 128 ký tự.';
  return errors;
}

// Step G2. After sign-in: back to the protected screen that sent the user here, or to their role's home.
// Moving on happens in the form's submit, not in a click handler (CLAUDE.md, NEVER 5).
export default function SignIn() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  const form = useForm({
    initial: { email: '', password: '' },
    validate,
    onSubmit: async ({ email, password }) => {
      const user = await auth.signIn(email.trim(), password);
      navigate(from || HOME[user.role], { replace: true });
    },
  });

  // Already signed in (for example the page was opened again): straight to the user's home.
  if (auth.status === 'signed-in' && !form.busy) return <Navigate to={HOME[auth.user.role]} replace />;

  return (
    <CustomerLayout title="Đăng nhập: GradStudio">
      <section className="sign-in" aria-labelledby="sign-in-title">
        <h1 className="page-title" id="sign-in-title">
          Đăng nhập
        </h1>
        {auth.status === 'checking' ? (
          <LoadingState label="Đang kiểm tra đăng nhập…" />
        ) : (
          <form className="sign-in-form" noValidate onSubmit={form.handleSubmit}>
            {from ? <p className="sign-in-note">Đăng nhập để mở trang bạn vừa chọn.</p> : null}
            {form.formError ? (
              <p className="form-error" role="alert">
                {form.formError}
              </p>
            ) : null}
            <TextField id="sign-in-email" label="E-mail" type="email" autoComplete="email" {...form.field('email')} />
            <TextField
              id="sign-in-password"
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              {...form.field('password')}
            />
            <Button type="submit" disabled={form.busy}>
              {form.busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </Button>
          </form>
        )}
      </section>
    </CustomerLayout>
  );
}
