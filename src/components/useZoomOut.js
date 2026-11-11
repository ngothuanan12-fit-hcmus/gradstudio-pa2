import { useLayoutEffect } from 'react';

const DURATION = 1600;
let startedAt = null;

// The landing title starts large and shrinks into place, once per page load. The plain first screen and the 3D stage
// both carry the title; if the 3D stage takes over mid-way, its title continues from the same moment (negative delay).
export default function useZoomOut(ref) {
  useLayoutEffect(() => {
    const title = ref.current;
    if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    if (startedAt === null) startedAt = now;
    const elapsed = now - startedAt;
    const box = title.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (elapsed >= DURATION || !box.width || box.bottom < 0 || box.top > vh) return;
    // As wide as the screen minus a 16 px margin on each side, and no taller than 80% of it.
    const scale = Math.max(1, Math.min((vw - 32) / box.width, (vh * 0.8) / box.height, 4));
    const centre = box.left + box.width / 2;
    title.style.setProperty('--zoom-s', scale.toFixed(3));
    title.style.setProperty('--zoom-x', `${(vw / 2 - centre).toFixed(1)}px`);
    title.parentElement.style.setProperty('--zoom-delay', `${-Math.round(elapsed)}ms`);
    title.style.setProperty('--zoom-delay', `${-Math.round(elapsed)}ms`);
    title.classList.add('zoom-out');
  }, [ref]);
}
