import { useEffect, useRef } from 'react';
import Button from './Button.jsx';
import { formatVND, packages } from '../data.js';

const PLACES = ['at-right', 'at-left', 'at-lefttop'];

// The 3D story: a tall section whose stage stays on screen while the scene follows the scroll.
// `start` comes from src/story/scene.js. It moves the words and the canvas, and returns a stop function.
export default function StoryStage({ start }) {
  const storyRef = useRef(null);
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const veilRef = useRef(null);

  useEffect(() => {
    const story = storyRef.current;
    return start({
      canvas: canvasRef.current,
      story,
      caps: [...story.querySelectorAll('.cap')],
      bar: barRef.current,
      veil: veilRef.current,
      packages,
    });
  }, [start]);

  return (
    <section className="story" ref={storyRef} aria-label="Câu chuyện trong lớp học">
      <div className="stage">
        <canvas className="stage-view" ref={canvasRef} aria-hidden="true" />
        <div className="stage-veil" ref={veilRef} />
        <div className="cap at-center">
          <h1 className="story-title">Lưu lại ngày <em>ra trường</em></h1>
          <p>Cuộn xuống để bước vào lớp.</p>
        </div>
        <div className="cap at-top">
          <h2 className="story-title">Trở lại lớp học <em>nơi câu chuyện bắt đầu</em></h2>
        </div>
        <div className="cap at-bottom">
          <h2 className="story-title">Chọn buổi chụp của bạn</h2>
          <p>Mỗi buổi chụp bắt đầu bằng một cuộc trò chuyện.</p>
        </div>
        {packages.map((item, i) => (
          <div className={`cap ${PLACES[i]}`} key={item.id}>
            <h2 className="story-title">{item.name} <em>{item.line}</em></h2>
            <p>{item.text}</p>
            <p className="cap-price">Từ {formatVND(item.price)}{item.unit}</p>
          </div>
        ))}
        <div className="cap at-center">
          <h2 className="story-title">Ngày ra trường <em>chỉ có một lần</em></h2>
          <p>Nhắn GradStudio để hỏi lịch trống cho mùa tốt nghiệp này.</p>
          <p className="cap-note">Giá tham khảo. Giá chốt được ghi trên booking sau khi tư vấn.</p>
        </div>
        <div className="story-actions stage-links">
          <Button href="#goi-chup">Xem gói chụp</Button>
          <Button variant="secondary" href="#chat">Chat với studio</Button>
        </div>
        <div className="stage-bar"><i ref={barRef} /></div>
      </div>
    </section>
  );
}
