import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';
import { formatVND } from '../data.js';

// The three packages on a turntable: the front photo is the package being shown, the other two wait behind it.
// Drag or swipe sideways, use the arrow keys on the turntable, the "Gói trước" / "Gói sau" buttons, or click a
// photo behind to bring it forward. The front package's words, price and "Tư vấn gói này" sit beside or below.
// Sizes come from the turntable's own width, so every card stays inside it at any screen width.
// Idea from a card-turntable study; the layout, sizes and motion are our own.
const STEP = 120;
const TILT = [-2.4, 1.8, -1.4]; // each photo lies a little askew, like the photos pinned on the board in the story
const REAR = 0.72; // size of a photo behind, against the front one
const norm = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

export default function PackageCarousel({ items, askingId, onAsk }) {
  const [front, setFront] = useState(0);
  const stageRef = useRef(null);
  const slotRefs = useRef([]);
  const cardRefs = useRef([]);
  const sheenRefs = useRef([]);
  const live = useRef({ rot: 0, vel: 0, target: 0, held: false, moved: 0, lastX: 0, lastT: 0, dragVel: 0, width: 0, raf: 0, sink: null });
  const n = items.length;

  useEffect(() => {
    const s = live.current;
    const stage = stageRef.current;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    function layout() {
      const w = s.width;
      const cw = Math.min(w * 0.62, 460), ch = cw * 0.75;
      // Spread so that a photo behind, at its largest tilt, ends 8 px inside the turntable's edge.
      const spread = Math.max(0, (w / 2 - 8 - REAR * cw * 0.53) / Math.sin(Math.PI / 3));
      stage.style.height = `${Math.round(ch * 1.12 + 24)}px`;
      items.forEach((item, i) => {
        const th = norm(i * STEP + s.rot) * Math.PI / 180, cos = Math.cos(th);
        const depth = (1 - cos) / 1.5;
        const scale = 1 - depth * (1 - REAR);
        const slot = slotRefs.current[i];
        slot.style.width = `${cw}px`;
        slot.style.height = `${ch}px`;
        slot.style.transform = `translate(-50%, 0) translate(${(spread * Math.sin(th)).toFixed(1)}px, ${(-depth * ch * 0.12 + 12).toFixed(1)}px) rotate(${TILT[i % TILT.length]}deg) scale(${scale.toFixed(4)})`;
        slot.style.zIndex = String(Math.round(50 + 50 * cos));
        slot.dataset.front = cos > 0.95 ? 'true' : 'false';
      });
    }

    function frontOf(target) { return ((Math.round(-target / STEP) % n) + n) % n; }

    function tick() {
      s.raf = 0;
      if (!s.held) {
        if (calm.matches) { s.rot = s.target; s.vel = 0; } else {
          s.vel = (s.vel + (s.target - s.rot) * 0.09) * 0.72;
          s.rot += s.vel;
          if (Math.abs(s.target - s.rot) < 0.02 && Math.abs(s.vel) < 0.02) { s.rot = s.target; s.vel = 0; }
        }
      }
      layout();
      sinkStep();
      if (s.held || s.rot !== s.target || s.sinkMoving) s.raf = requestAnimationFrame(tick);
    }
    s.kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
    s.goTo = (target) => { s.target = target; setFront(frontOf(target)); s.kick(); };

    // Pressing in under the pointer: the front photo leans away where it is touched, darker there, lighter opposite.
    function sinkStep() {
      s.sinkMoving = false;
      items.forEach((item, i) => {
        const card = cardRefs.current[i], sheen = sheenRefs.current[i];
        const aim = s.sink && s.sink.i === i && !calm.matches ? s.sink : { x: 0, y: 0, on: 0 };
        const c = card.$ || (card.$ = { x: 0, y: 0, on: 0 });
        c.x += (aim.x - c.x) * 0.16; c.y += (aim.y - c.y) * 0.16; c.on += ((aim.on || 0) - c.on) * 0.16;
        if (Math.abs(aim.x - c.x) + Math.abs(aim.y - c.y) + Math.abs((aim.on || 0) - c.on) > 0.002) s.sinkMoving = true;
        card.style.transform = `translateZ(${(-6 * c.on).toFixed(2)}px) rotateX(${(-c.y * 5).toFixed(2)}deg) rotateY(${(c.x * 5).toFixed(2)}deg)`;
        const px = (c.x + 1) * 50, py = (c.y + 1) * 50;
        sheen.style.backgroundImage = `radial-gradient(44% 36% at ${px}% ${py}%, rgba(9, 14, 28, ${(0.28 * c.on).toFixed(3)}), transparent), radial-gradient(54% 44% at ${100 - px}% ${100 - py}%, rgba(255, 255, 255, ${(0.1 * c.on).toFixed(3)}), transparent)`;
      });
    }

    const resize = new ResizeObserver(([entry]) => { s.width = entry.contentRect.width; layout(); });
    resize.observe(stage);
    s.width = stage.clientWidth;
    layout();
    return () => { resize.disconnect(); cancelAnimationFrame(s.raf); s.raf = 0; };
  }, [items, n]);

  const s = live.current;
  const degPerPx = () => STEP / Math.max(200, s.width * 0.45);

  function onPointerDown(event) {
    s.held = true; s.moved = 0; s.dragVel = 0; s.vel = 0; s.sink = null;
    s.lastX = event.clientX; s.lastT = performance.now();
    stageRef.current.dataset.held = 'true';
    stageRef.current.setPointerCapture(event.pointerId);
    s.kick();
  }
  function onPointerMove(event) {
    if (s.held) {
      const now = performance.now(), dx = event.clientX - s.lastX, dt = Math.max(1, now - s.lastT);
      s.rot += dx * degPerPx(); s.moved += Math.abs(dx);
      s.dragVel = 0.8 * ((dx * degPerPx()) / dt) + 0.2 * s.dragVel;
      s.lastX = event.clientX; s.lastT = now;
      return;
    }
    if (event.pointerType !== 'mouse') return;
    const i = front, card = cardRefs.current[i], r = card.getBoundingClientRect();
    const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    s.sink = inside ? { i, x: ((event.clientX - r.left) / r.width) * 2 - 1, y: ((event.clientY - r.top) / r.height) * 2 - 1, on: 1 } : null;
    s.kick();
  }
  function onPointerUp(event) {
    if (!s.held) return;
    s.held = false;
    stageRef.current.dataset.held = 'false';
    if (s.moved < 6) {
      // A click, not a drag: a photo behind comes to the front.
      const hit = slotRefs.current.findIndex((slot) => slot.contains(document.elementFromPoint(event.clientX, event.clientY)));
      const step = hit < 0 ? 0 : norm((hit - front) * STEP) / STEP;
      s.goTo(Math.round(s.target / STEP - step) * STEP);
      return;
    }
    s.goTo(Math.round((s.rot + s.dragVel * 180) / STEP) * STEP);
  }
  function turn(by) { s.goTo(Math.round(s.target / STEP - by) * STEP); }
  function onKeyDown(event) {
    if (event.key === 'ArrowRight') { turn(1); event.preventDefault(); }
    if (event.key === 'ArrowLeft') { turn(-1); event.preventDefault(); }
  }

  const item = items[front];
  return (
    <div className="pkg-show">
      <div className="pkg-visual">
      <div
        className="pkg-stage"
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Ba gói chụp. Dùng phím mũi tên trái, phải để đổi gói."
        tabIndex={0}
        data-held="false"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => { s.sink = null; s.kick(); }}
        onKeyDown={onKeyDown}
      >
        {items.map((pkg, i) => {
          const { name, small, large, width, height } = pkg.photo;
          return (
            <div className="pkg-slot" key={pkg.id} ref={(el) => { slotRefs.current[i] = el; }}>
              <div className="pkg-card" ref={(el) => { cardRefs.current[i] = el; }}>
                <img
                  src={`./photos/${name}-${small}.webp`}
                  srcSet={`./photos/${name}-${small}.webp ${small}w, ./photos/${name}-${large}.webp ${large}w`}
                  sizes="(min-width: 1280px) 460px, 62vw"
                  width={width}
                  height={height}
                  alt={pkg.alt}
                  loading="lazy"
                  draggable="false"
                />
                <span className="pkg-sheen" ref={(el) => { sheenRefs.current[i] = el; }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="pkg-nav">
        <Button variant="secondary" onClick={() => turn(-1)}>‹ Gói trước</Button>
        <p className="pkg-count" aria-live="polite">{front + 1}/{items.length}<span className="sr-only">: {item.name}</span></p>
        <Button variant="secondary" onClick={() => turn(1)}>Gói sau ›</Button>
      </div>
      </div>
      <div className="pkg-detail">
        <h3 className="package-name">{item.name}</h3>
        <p className="package-line">{item.line}</p>
        <p>{item.text}</p>
        <p className="package-price"><span>Từ</span> {formatVND(item.price)}<wbr />{item.unit}</p>
        <Button variant={askingId === item.id ? 'primary' : 'secondary'} aria-pressed={askingId === item.id} onClick={() => onAsk(item.id)}>
          Tư vấn gói này
        </Button>
      </div>
    </div>
  );
}
