import { formatMoment } from '../../utils/moment.js';
import ProposalCard from './ProposalCard.jsx';
import RequestCard from './RequestCard.jsx';

// The messages of one conversation, oldest first, in the page's own flow (no inner scrolling box, so nothing is cut
// off at any width). `viewer` is 'customer' or 'studio': that side's messages sit on the right. `proposalActions`
// renders the answer buttons under an open proposal (the customer's screen only).
export default function MessageList({ messages, viewer, proposalActions }) {
  const mine = (m) => (viewer === 'customer' ? m.from === 'customer' : m.from === 'studio');
  return (
    <ol className="msg-list">
      {messages.map((m) => (
        <li key={m.id} className={mine(m) ? 'msg msg-mine' : 'msg'}>
          <p className="msg-who">{mine(m) ? 'Bạn' : m.authorName}</p>
          <p className="msg-text">{m.text}</p>
          {m.request ? <RequestCard request={m.request} /> : null}
          {m.proposal && m.kind === 'proposal' ? (
            <ProposalCard
              proposal={m.proposal}
              viewer={viewer}
              actions={proposalActions ? proposalActions(m.proposal) : null}
            />
          ) : null}
          <p className="msg-time">
            <time dateTime={m.at}>{formatMoment(m.at)}</time>
          </p>
        </li>
      ))}
    </ol>
  );
}
