// An action is a <button>. Going to another page is an <a>: pass href.
export default function Button({ variant = 'primary', href, type = 'button', children, ...rest }) {
  const className = `btn btn-${variant}`;
  if (href) {
    return <a className={className} href={href} {...rest}>{children}</a>;
  }
  return <button className={className} type={type} {...rest}>{children}</button>;
}
