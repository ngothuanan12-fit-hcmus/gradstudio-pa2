import { Link, useLocation, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import Button from '../components/Button.jsx';
import CheckField from '../components/CheckField.jsx';
import DataState from '../components/DataState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TextField from '../components/TextField.jsx';
import useForm from '../forms/useForm.js';
import useApi from '../hooks/useApi.js';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import { formatMoment } from '../utils/moment.js';
import { CONVERSATION_TONE } from '../utils/status.js';
import '../styles/chat.css';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// The checks of POST /api/conversations (docs/api/03-conversations.md), made before sending. Field names are the
// API's, so a 400 from the API lands on the same fields.
function validate(v) {
  const errors = {};
  if (!v.text.trim() && !v.withRequest) errors.text = 'Nhập tin nhắn hoặc gửi yêu cầu đặt lịch.';
  else if (v.text.length > 1000) errors.text = 'Tin nhắn tối đa 1000 ký tự.';
  if (v.withRequest) {
    if (!v['request.serviceId']) errors['request.serviceId'] = 'Chọn dịch vụ.';
    if (!DATE.test(v['request.date'])) errors['request.date'] = 'Chọn ngày muốn chụp.';
    if (!TIME.test(v['request.time'])) errors['request.time'] = 'Chọn giờ muốn chụp.';
    const people = Number(v['request.people']);
    if (!Number.isInteger(people) || people < 1 || people > 200) errors['request.people'] = 'Số người từ 1 đến 200.';
    if (v.costumeId && v.picked[v.costumeId] && (!v['request.extras'] || !v.costumeSize)) {
      errors['request.extras'] = 'Chọn mẫu và size trang phục.';
    }
  }
  return errors;
}

// The extras picked, from the list the API gave: a costume also sends its model and size.
function bodyOf(v) {
  const body = {};
  if (v.text.trim()) body.text = v.text.trim();
  if (v.withRequest) {
    const extras = Object.keys(v.picked)
      .filter((id) => v.picked[id])
      .map((id) =>
        id === v.costumeId ? { extraId: id, modelId: v['request.extras'], size: v.costumeSize } : { extraId: id },
      );
    body.request = {
      serviceId: v['request.serviceId'],
      ...(v['request.packageId'] ? { packageId: v['request.packageId'] } : {}),
      date: v['request.date'],
      time: v['request.time'],
      people: Number(v['request.people']),
      extras,
    };
  }
  return body;
}

// Step G3, the customer's side: their conversations with the studio, and a new one, with a message, a booking request
// (service, package, preferred date and time, how many people, make-up, a costume by model and size), or both.
// A package chosen on the home page arrives in the router's state, never in the URL.
export default function Conversations() {
  const location = useLocation();
  const navigate = useNavigate();
  const chosen = location.state || {};
  const list = useApi('/conversations');
  const services = useApi('/services');
  const extras = useApi('/extras');

  const form = useForm({
    initial: {
      text: '',
      withRequest: Boolean(chosen.serviceId),
      'request.serviceId': chosen.serviceId || '',
      'request.packageId': '',
      'request.date': '',
      'request.time': '',
      'request.people': '1',
      picked: {},
      costumeId: '',
      'request.extras': '',
      costumeSize: '',
    },
    validate,
    onSubmit: async (values) => {
      const conversation = await api('/conversations', { method: 'POST', body: bodyOf(values) });
      navigate(`/tu-van/${conversation.id}`);
    },
  });

  const v = form.values;
  const service = services.data?.find((s) => s.id === v['request.serviceId']);

  return (
    <CustomerLayout title="Hội thoại với studio: GradStudio">
      <h1 className="page-title">Hội thoại với studio</h1>

      <section className="chat-block" aria-labelledby="my-conversations">
        <h2 className="section-heading" id="my-conversations">
          Hội thoại của bạn
        </h2>
        <DataState
          query={list}
          emptyText="Bạn chưa có hội thoại nào. Bắt đầu ở phần bên dưới."
          loadingLabel="Đang tải hội thoại…"
        >
          {(items) => (
            <ul className="conv-links">
              {items.map((c) => (
                <li key={c.id}>
                  <Link to={`/tu-van/${c.id}`}>
                    <span className="conv-link-text">{c.lastMessage.text}</span>
                    <span className="conv-link-meta">
                      <StatusBadge tone={CONVERSATION_TONE[c.status]}>{c.status}</StatusBadge>
                      <time dateTime={c.updatedAt}>{formatMoment(c.updatedAt)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </section>

      <section className="chat-block" aria-labelledby="new-conversation">
        <h2 className="section-heading" id="new-conversation">
          Bắt đầu hội thoại mới
        </h2>
        <form className="chat-form" noValidate onSubmit={form.handleSubmit}>
          {form.formError ? (
            <p className="form-error" role="alert">
              {form.formError}
            </p>
          ) : null}
          <TextField
            id="new-text"
            as="textarea"
            rows={4}
            label="Tin nhắn cho studio"
            hint="Kể buổi chụp bạn muốn, ngày nào, đi mấy người."
            {...form.field('text')}
          />
          <CheckField
            id="new-with-request"
            label="Gửi kèm yêu cầu đặt lịch"
            name="withRequest"
            checked={v.withRequest}
            onChange={(e) => form.setValue('withRequest', e.target.checked)}
          />
          {v.withRequest ? (
            <fieldset className="request-fields">
              <legend>Yêu cầu đặt lịch</legend>
              {services.status === 'error' ? (
                <ErrorState error={services.error} onRetry={services.retry} />
              ) : (
                <>
                  <TextField
                    id="new-service"
                    as="select"
                    label="Dịch vụ"
                    {...form.field('request.serviceId')}
                    onChange={(e) => {
                      form.setValue('request.serviceId', e.target.value);
                      form.setValue('request.packageId', '');
                    }}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {(services.data || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    id="new-package"
                    as="select"
                    label="Gói (không bắt buộc)"
                    {...form.field('request.packageId')}
                  >
                    <option value="">Chưa chọn gói</option>
                    {(service?.packages || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </TextField>
                </>
              )}
              <div className="field-row">
                <TextField id="new-date" type="date" label="Ngày muốn chụp" {...form.field('request.date')} />
                <TextField id="new-time" type="time" label="Giờ muốn chụp" {...form.field('request.time')} />
              </div>
              <TextField
                id="new-people"
                type="number"
                inputMode="numeric"
                min="1"
                max="200"
                label="Số người"
                hint={
                  service?.priceUnit
                    ? `Giá tính theo ${service.priceUnit}: nhập số ước lượng, studio xác nhận lại.`
                    : undefined
                }
                {...form.field('request.people')}
              />
              <fieldset className="request-extras">
                <legend>Dịch vụ thêm</legend>
                {extras.status === 'error' ? <ErrorState error={extras.error} onRetry={extras.retry} /> : null}
                {(extras.data || []).map((extra) => (
                  <div key={extra.id}>
                    <CheckField
                      id={`new-extra-${extra.id}`}
                      label={extra.name}
                      name={`extra-${extra.id}`}
                      checked={Boolean(v.picked[extra.id])}
                      onChange={(e) => {
                        form.setValue('picked', { ...v.picked, [extra.id]: e.target.checked });
                        if (extra.kind === 'costume') form.setValue('costumeId', extra.id);
                      }}
                    />
                    {extra.kind === 'costume' && v.picked[extra.id] ? (
                      <div className="field-row">
                        <TextField id="new-model" as="select" label="Mẫu trang phục" {...form.field('request.extras')}>
                          <option value="">Chọn mẫu</option>
                          {extra.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </TextField>
                        <TextField id="new-size" as="select" label="Size" {...form.field('costumeSize')}>
                          <option value="">Chọn size</option>
                          {(extra.models.find((m) => m.id === v['request.extras'])?.sizes || []).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </TextField>
                      </div>
                    ) : null}
                  </div>
                ))}
              </fieldset>
            </fieldset>
          ) : null}
          <Button {...form.submitProps}>{form.busy ? 'Đang gửi…' : 'Gửi cho studio'}</Button>
        </form>
      </section>
    </CustomerLayout>
  );
}
