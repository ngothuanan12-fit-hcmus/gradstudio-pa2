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
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M14.5 4.5v15" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  'calendar-check': (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4M8.5 15l2.5 2.5L16 12.5" />
    </>
  ),
  'chat-bubble': (
    <>
      <path d="M4.5 6.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4.5 3v-3a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" />
      <path d="M8.5 11.5h5" />
    </>
  ),
  'alert-bubble': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5M12 16v.5" />
    </>
  ),
  'double-check': (
    <>
      <path d="M3.5 12.5l4 4L15 8" />
      <path d="M9.5 14l2.5 2.5L20.5 8" />
    </>
  ),
  'chevron-left': <path d="M15 5.5L8.5 12 15 18.5" />,
  'chevron-right': <path d="M9 5.5L15.5 12 9 18.5" />,
  'chevron-down': <path d="M6.5 9.5L12 15l5.5-5.5" />,
  'arrow-left': <path d="M19 12H5.5M11 6.5L5.5 12 11 17.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  send: <path d="M4.5 12h14.5M13.5 6.5L19 12l-5.5 5.5" />,
};

export default function Icon({ name }) {
  return (
    <svg className={`icon icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name] || PATHS.circle}
    </svg>
  );
}
