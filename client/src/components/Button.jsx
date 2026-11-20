import { Link } from 'react-router';

// An action is a <button>. Moving to another screen of the app is a router link: pass `to`.
// A jump within the page (#goi-chup) or to another site stays an <a>: pass `href`.
export default function Button({ variant = 'primary', to, href, type = 'button', children, ...rest }) {
  const className = `btn btn-${variant}`;
  if (to) {
    return (
      <Link className={className} to={to} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  );
}
