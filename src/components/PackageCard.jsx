import Button from './Button.jsx';
import { formatVND } from '../data.js';

// One service. Asking about it changes what the chat is about; it does not create a booking.
export default function PackageCard({ item, asking, onAsk }) {
  const { name, small, large, width, height } = item.photo;
  return (
    <article className="package">
      <img
        className="package-photo"
        src={`./photos/${name}-${small}.webp`}
        srcSet={`./photos/${name}-${small}.webp ${small}w, ./photos/${name}-${large}.webp ${large}w`}
        sizes="(min-width: 768px) 33vw, 100vw"
        width={width}
        height={height}
        alt={item.alt}
        loading="lazy"
      />
      <h3 className="package-name">{item.name}</h3>
      <p className="package-line">{item.line}</p>
      <p>{item.text}</p>
      <p className="package-price"><span>Từ</span> {formatVND(item.price)}<wbr />{item.unit}</p>
      <Button variant={asking ? 'primary' : 'secondary'} aria-pressed={asking} onClick={() => onAsk(item.id)}>
        Tư vấn gói này
      </Button>
    </article>
  );
}
