import { vnDate } from '../../utils/moment.js';

// A proposed time inside a message: the day, the make-up and the shoot with who and where, and its status in words.
// `viewer` decides how an open proposal is named; `actions` (the customer's answer buttons) appear only while it is open.
const STATUS = {
  customer: {
    open: 'Đang chờ bạn trả lời',
    agreed: 'Bạn đã đồng ý',
    declined: 'Bạn chưa đồng ý',
    replaced: 'Đã có đề xuất mới',
  },
  studio: {
    open: 'Đang chờ khách trả lời',
    agreed: 'Khách đã đồng ý',
    declined: 'Khách chưa đồng ý',
    replaced: 'Đã có đề xuất mới',
  },
};

export default function ProposalCard({ proposal, viewer, actions = null }) {
  const { makeup, shoot } = proposal;
  return (
    <div className="msg-card">
      <dl>
        <div>
          <dt>Ngày</dt>
          <dd>{vnDate(proposal.date)}</dd>
        </div>
        {makeup ? (
          <div>
            <dt>Makeup</dt>
            <dd>
              {makeup.from}–{makeup.to} với {makeup.staffName}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Chụp</dt>
          <dd>
            {shoot.from}–{shoot.to} với {shoot.staffName} tại {shoot.roomName}
          </dd>
        </div>
      </dl>
      <p className={`proposal-status proposal-${proposal.status}`}>{STATUS[viewer][proposal.status]}</p>
      {proposal.status === 'open' ? actions : null}
    </div>
  );
}
