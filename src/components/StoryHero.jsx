import { useRef } from 'react';
import Button from './Button.jsx';
import useZoomOut from './useZoomOut.js';

// The first screen without 3D: phones, reduced motion, no WebGL, or while the scene is still loading.
// While the 3D scene is on its way (bare), the screen stays empty behind the words and is laid out like the scene's
// first frame, so the classroom first appears as the scene's line drawing and nothing jumps when the scene takes over.
export default function StoryHero({ bare = false }) {
  const titleRef = useRef(null);
  useZoomOut(titleRef);
  const actions = (
    <div className={bare ? 'story-actions stage-links' : 'story-actions'}>
      <Button href="#goi-chup">Xem gói chụp</Button>
      <Button variant="secondary" href="#chat">Chat với studio</Button>
    </div>
  );
  return (
    <section className={bare ? 'hero hero-bare' : 'hero'}>
      {!bare && <img
        className="hero-photo"
        src="./photos/lop-hoc-800.webp"
        srcSet="./photos/lop-hoc-800.webp 800w, ./photos/lop-hoc-1600.webp 1600w"
        sizes="100vw"
        width="1600"
        height="1067"
        alt="Phòng học trống với bàn gỗ, tường vàng và cửa sổ xanh"
      />}
      <div className="hero-text">
        <h1 className="story-title" ref={titleRef}>Lưu lại ngày <em>ra trường</em></h1>
        {bare
          ? <p>Cuộn xuống để bước vào lớp.</p>
          : <p>Studio chụp kỷ yếu lớp, ảnh tốt nghiệp và chân dung CV. Hỏi giá và lịch trống ngay trên web.</p>}
        {!bare && actions}
      </div>
      {bare && actions}
    </section>
  );
}
