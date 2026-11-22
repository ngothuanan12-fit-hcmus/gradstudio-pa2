import { Link } from 'react-router';

// An action is a <button>. Moving to another screen of the app is a router link: pass `to`.
// A jump within the page (#goi-chup) or to another site stays an <a>: pass `href`.
export default function Button({ variant = 'primary', to, href, type = 'button', className = '', children, ...rest }) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  if (to) {
    return (
      <Link className={classes} to={to} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  );
}
