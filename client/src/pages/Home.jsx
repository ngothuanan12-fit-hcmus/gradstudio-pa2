import useAuth from '../auth/useAuth.js';
import { includedNames, showcase } from '../catalogue/showcase.js';
import Button from '../components/Button.jsx';
import DataState from '../components/DataState.jsx';
import PackageCarousel from '../components/PackageCarousel.jsx';
import Story from '../components/Story.jsx';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { formatVND } from '../utils/money.js';
import '../styles/home.css';

// How a booking goes, in the brief's order (section 3). Page copy, not data: the slot is held only after the deposit.
const PROCESS = [
  { id: 'chat', title: 'Chat tư vấn', text: 'Nhắn studio ngay trên web để hỏi gói, concept và giá.' },
  {
    id: 'lich',
    title: 'Thống nhất giờ',
    text: 'Studio kiểm tra thợ chụp, makeup, phòng và đề xuất giờ trống. Bạn đồng ý ngay trong chat.',
  },
  {
    id: 'coc',
    title: 'Cọc để giữ lịch',
    text: 'Lịch chỉ được giữ khi bạn cọc 30% thành công và studio kiểm tra lại lịch.',
  },
  { id: 'chup', title: 'Buổi chụp', text: 'Ekip chuẩn bị theo checklist của từng loại buổi chụp.' },
  {
    id: 'anh',
    title: 'Chọn ảnh và nhận file',
    text: 'Chọn ảnh cần chỉnh, thanh toán 70% còn lại, nhận file khi hoàn tất.',
  },
];

// The services and their photos come from two requests; the packages section needs both.
function both(a, b) {
  if (a.status === 'error' || b.status === 'error') {
    return {
      status: 'error',
      data: null,
      error: a.error || b.error,
      retry: () => {
        if (a.status === 'error') a.retry();
        if (b.status === 'error') b.retry();
      },
    };
  }
  return { status: 'ready', data: a.data && b.data ? [a.data, b.data] : null };
}

const vnDate = (iso) => iso.split('-').reverse().join('/');

// Step G1: the studio's home and catalogue, for visitors. Every package, price, extra, photo and review comes from
// the API (docs/api/02-catalogue.md): one request each, each part with its loading, error and empty states.
export default function Home() {
  const auth = useAuth();
  const services = useApi('/services');
  const extras = useApi('/extras');
  const photos = useApi('/photos');
  const reviews = useApi('/reviews');
  const catalogue = both(services, photos);
  const cards = catalogue.data ? showcase(...catalogue.data) : null;

  return (
    <CustomerLayout wide>
      <Story packages={cards} failed={catalogue.status === 'error'} />

      <section className="home-section" id="goi-chup" aria-labelledby="goi-chup-title">
        <h2 className="section-heading" id="goi-chup-title">
          Chọn buổi chụp của bạn
        </h2>
        <p>Cần makeup, thuê áo, hay muốn chụp kiểu không có trong các gói này, bạn hỏi studio trong chat.</p>
        <DataState
          query={catalogue}
          isEmpty={([list]) => list.length === 0}
          emptyText="Studio chưa có gói chụp nào để hiển thị."
          loadingLabel="Đang tải các gói chụp…"
        >
          {() => (
            <>
              {cards.every((c) => c.photo) ? <PackageCarousel items={cards} /> : null}
              <ul className="price-list">
                {cards.map((card) => (
                  <li key={card.id}>
                    <h3 className="price-service">{card.name}</h3>
                    <ul className="price-packages">
                      {card.packages.map((pack) => (
                        <li key={pack.id}>
                          <p className="price-name">
                            {pack.name}: {formatVND(pack.price)}
                            {pack.priceUnit ? `/${pack.priceUnit}` : ''}
                          </p>
                          <p className="price-detail">
                            {[
                              pack.durationMinutes ? `${pack.durationMinutes} phút` : null,
                              pack.editedPhotos ? `${pack.editedPhotos} ảnh chỉnh` : null,
                              pack.includes.length ? `Đã gồm: ${includedNames(pack, extras.data).join(', ')}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Chi tiết gói báo khi tư vấn.'}
                          </p>
                        </li>
                      ))}
                    </ul>
                    {card.photo ? (
                      <p className="photo-credit">
                        Ảnh: {card.photo.credit.author},{' '}
                        <a href={card.photo.credit.url}>
                          {card.photo.credit.source} ({card.photo.credit.licence})
                        </a>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </DataState>
        <p className="home-note">Giá tham khảo. Giá chốt được ghi trên booking sau khi tư vấn.</p>
      </section>

      <section className="home-section" id="dich-vu-them" aria-labelledby="dich-vu-them-title">
        <h2 className="section-heading" id="dich-vu-them-title">
          Dịch vụ thêm
        </h2>
        <p>Thêm khi gửi yêu cầu đặt lịch. Món đã gồm trong gói thì không tính thêm tiền.</p>
        <DataState query={extras} emptyText="Hiện chưa có dịch vụ thêm." loadingLabel="Đang tải dịch vụ thêm…">
          {(list) => (
            <ul className="extra-list">
              {list.map((extra) => (
                <li key={extra.id}>
                  <h3 className="price-service">{extra.name}</h3>
                  <p>{extra.note}</p>
                  <p className="price-detail">
                    {extra.price === null ? 'Giá báo khi tư vấn.' : `${formatVND(extra.price)}/${extra.priceUnit}`}
                  </p>
                  {extra.models.length ? (
                    <ul className="model-list">
                      {extra.models.map((model) => (
                        <li key={model.id}>
                          {model.name}: size {model.sizes.join(', ')}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </section>

      <section className="home-section" aria-labelledby="quy-trinh-title">
        <h2 className="section-heading" id="quy-trinh-title">
          Từ một tin nhắn đến bộ ảnh hoàn chỉnh
        </h2>
        <ol className="process">
          {PROCESS.map((step) => (
            <li key={step.id}>
              <h3 className="process-title">{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" id="danh-gia" aria-labelledby="danh-gia-title">
        <h2 className="section-heading" id="danh-gia-title">
          Khách đã chụp nói gì
        </h2>
        <DataState query={reviews} emptyText="Chưa có đánh giá nào." loadingLabel="Đang tải đánh giá…">
          {(list) => (
            <ul className="review-list">
              {list.map((review) => (
                <li key={review.id}>
                  <p className="review-rating">
                    <span aria-hidden="true">{'★'.repeat(review.rating)}</span>
                    <span className="sr-only">{review.rating} trên 5 sao</span>
                  </p>
                  <p>{review.text}</p>
                  <p className="review-who">
                    {review.customerName} · {services.data?.find((s) => s.id === review.serviceId)?.name || ''} ·{' '}
                    {vnDate(review.date)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </section>

      <section className="home-section chat-section" id="chat" aria-labelledby="hoi-studio-title">
        <h2 className="section-heading" id="hoi-studio-title">
          Nhắn cho studio
        </h2>
        <p>
          Kể studio bạn muốn chụp gì, ngày nào, đi mấy người. Studio xem lịch thợ chụp, makeup và phòng rồi trả lời
          trong chat.
        </p>
        <ul className="tell-list">
          <li>Buổi chụp gì: kỷ yếu lớp, tốt nghiệp hay chân dung CV</li>
          <li>Ngày bạn muốn chụp</li>
          <li>Đi mấy người</li>
          <li>Có cần makeup hay thuê áo không</li>
        </ul>
        {auth.status === 'signed-in' && auth.user.role === 'customer' ? (
          <p className="state state-empty">Màn chat với studio đang được làm (bước G3).</p>
        ) : auth.status === 'signed-in' ? null : (
          <p>
            <Button to="/dang-nhap">Đăng nhập để chat với studio</Button>
          </p>
        )}
      </section>
    </CustomerLayout>
  );
}
