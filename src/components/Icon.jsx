// Small icons drawn for this project, used beside a word (never alone), so a status keeps its shape in greyscale.
// They take the text's size and colour, and screen readers skip them because the word is right next to them.
// Drawn as inline SVG instead of symbol characters, which change with the system font and can turn into emoji.
const PATHS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 3.5L2.5 20h19L12 3.5z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.25v.25" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="7.5" />,
  done: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.5l2.75 2.75L16 10" />
    </>
  ),
  diamond: <path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12 12 3.5z" />,
  square: <rect x="5" y="5" width="14" height="14" rx="2" />,
};

export default function Icon({ name }) {
  return (
    <svg className={`icon icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name] || PATHS.circle}
    </svg>
  );
}
