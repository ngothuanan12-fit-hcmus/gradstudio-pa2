import { useLayoutEffect } from 'react';

// The landing title's opening, once per page load. "Lưu lại ngày" starts so close that only the dot under "ạ" fills
// the screen, then pulls back into place; "ra trường" is then written on (CSS, from the moment the zoom starts).
// The huge words are painted on a decorative canvas the size of the screen, so no element ever reaches past the
// screen edge (the rubric's overflow line stays empty). The real heading stays in the page; it is only hidden while
// its painted copy is moving, and shown again at the exact same place.
const ZOOM_MS = 1200;
const FONT_WAIT_MS = 800;
let run = null;

const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - ((-2 * k + 2) ** 3) / 2);

function show(title, delay) {
  title.style.setProperty('--zoom-delay', `${delay}ms`);
  title.parentElement.style.setProperty('--zoom-delay', `${delay}ms`);
  title.classList.add('zoom-out');
}

function finish() {
  run.canvas?.remove();
  run.titles.forEach((t) => { t.style.opacity = ''; });
  run.done = true;
}

function play(title) {
  const node = [...title.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  const text = node ? node.textContent.replace(/\s+$/, '') : '';
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  const range = document.createRange();
  if (text) { range.setStart(node, 0); range.setEnd(node, text.length); }
  const box = text ? range.getBoundingClientRect() : null;
  if (!box || !box.width || box.bottom < 0 || box.top > vh) return finish();

  const cs = getComputedStyle(title);
  const canvas = document.createElement('canvas');
  canvas.className = 'title-zoom';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  document.body.append(canvas);
  run.canvas = canvas;
  const ctx = canvas.getContext('2d');
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = cs.color;
  const baseline = box.top + ctx.measureText(text).fontBoundingBoxAscent;

  // The point the zoom starts from: the dot under "ạ", or the middle of the words if the text changes.
  let fx = box.left + box.width / 2, fy = box.top + box.height / 2, dot = box.height / 4;
  const at = text.indexOf('ạ');
  if (at >= 0) {
    range.setStart(node, at); range.setEnd(node, at + 1);
    const r = range.getBoundingClientRect(), descent = ctx.measureText('ạ').actualBoundingBoxDescent;
    fx = r.left + r.width / 2; fy = baseline + descent * 0.55; dot = Math.max(2, descent);
  }
  const from = Math.min(90, Math.max(4, (vh * 0.4) / dot));

  run.start = performance.now();
  run.titles.forEach((t) => show(t, 0));
  const frame = (now) => {
    if (run.done) return;
    const e = easeInOut(Math.min(1, (now - run.start) / ZOOM_MS));
    // Scale changes by ratio, so the pull-back looks even instead of rushing at the end.
    const s = Math.exp(Math.log(from) * (1 - e));
    const sx = vw / 2 + (fx - vw / 2) * e, sy = vh / 2 + (fy - vh / 2) * e;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (sx - s * fx), dpr * (sy - s * fy));
    ctx.fillText(text, box.left, baseline);
    if (e < 1) requestAnimationFrame(frame); else finish();
  };
  requestAnimationFrame(frame);
  return undefined;
}

export default function useZoomOut(ref) {
  useLayoutEffect(() => {
    const title = ref.current;
    if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (run?.done) return;
    // The 3D stage can take over mid-way: its heading joins the same run and continues from the same moment.
    if (run) {
      run.titles.add(title);
      title.style.opacity = '0';
      if (run.start) show(title, -Math.round(performance.now() - run.start));
      return;
    }
    run = { titles: new Set([title]), start: 0, done: false, canvas: null };
    title.style.opacity = '0';
    const font = `${getComputedStyle(title).fontWeight} 64px ${getComputedStyle(title).fontFamily}`;
    const ready = document.fonts ? document.fonts.load(font, 'Lưu lại ngày') : Promise.resolve();
    const late = new Promise((resolve) => { setTimeout(() => resolve('late'), FONT_WAIT_MS); });
    Promise.race([ready, late]).then((result) => {
      const current = [...run.titles].find((t) => t.isConnected);
      if (result === 'late' || !current) finish();
      else play(current);
    }, finish);
  }, [ref]);
}
