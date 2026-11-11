import { useLayoutEffect } from 'react';

// The landing title's opening, once per page load: "Lưu lại ngày" drops in from above and settles; the moment it
// lands, "ra trường" appears, so the title reads in one go (the motion itself is in home.css, .title-drop).
// The plain first screen and the 3D stage both carry the title; if the 3D stage takes over mid-way, its title
// continues from the same moment (negative delay) instead of dropping again.
const DURATION = 1400;
let startedAt = null;

export default function useTitleDrop(ref) {
  useLayoutEffect(() => {
    const title = ref.current;
    if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    if (startedAt === null) startedAt = now;
    const elapsed = now - startedAt;
    const box = title.getBoundingClientRect();
    if (elapsed >= DURATION || box.bottom < 0 || box.top > window.innerHeight) return;
    const delay = `${-Math.round(elapsed)}ms`;
    title.style.setProperty('--drop-delay', delay);
    title.parentElement.style.setProperty('--drop-delay', delay);
    title.classList.add('title-drop');
  }, [ref]);
}
