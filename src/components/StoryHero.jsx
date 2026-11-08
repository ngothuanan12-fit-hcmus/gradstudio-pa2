import Button from './Button.jsx';

// The first screen without 3D: phones, reduced motion, no WebGL, or while the scene is still loading.
export default function StoryHero() {
  return (
    <section className="hero">
      <img
        className="hero-photo"
        src="./photos/lop-hoc-800.webp"
        srcSet="./photos/lop-hoc-800.webp 800w, ./photos/lop-hoc-1600.webp 1600w"
        sizes="100vw"
        width="1600"
        height="1067"
        alt="Phòng học trống với bàn gỗ, tường vàng và cửa sổ xanh"
      />
      <div className="hero-text">
        <h1 className="story-title">Lưu lại ngày <em>ra trường</em></h1>
        <p>Studio chụp kỷ yếu lớp, ảnh tốt nghiệp và chân dung CV. Hỏi giá và lịch trống ngay trên web.</p>
        <div className="story-actions">
          <Button href="#goi-chup">Xem gói chụp</Button>
          <Button variant="secondary" href="#chat">Chat với studio</Button>
        </div>
      </div>
    </section>
  );
}
