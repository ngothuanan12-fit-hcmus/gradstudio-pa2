import { vnDate } from '../../utils/moment.js';

// A booking request inside a message (docs/api/03-conversations.md): what the customer asked for, as a short list.
export default function RequestCard({ request }) {
  const extras = request.extras.map((x) => (x.modelName ? `${x.name}: ${x.modelName}, size ${x.size}` : x.name));
  return (
    <dl className="msg-card">
      <div>
        <dt>Dịch vụ</dt>
        <dd>
          {request.serviceName}
          {request.packageName ? ` · ${request.packageName}` : ''}
        </dd>
      </div>
      <div>
        <dt>Ngày giờ mong muốn</dt>
        <dd>
          {vnDate(request.date)} lúc {request.time}
        </dd>
      </div>
      <div>
        <dt>Số người</dt>
        <dd>{request.people}</dd>
      </div>
      <div>
        <dt>Dịch vụ thêm</dt>
        <dd>{extras.length ? extras.join(', ') : 'Không'}</dd>
      </div>
    </dl>
  );
}
