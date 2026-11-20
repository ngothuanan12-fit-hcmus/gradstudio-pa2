import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';
import LoadingState from './LoadingState.jsx';

// One place for the three states every data screen needs. `query` is what useApi returns; `isEmpty` says when the
// data counts as empty (an empty list by default); `children` renders the data.
// Data already on screen stays while a retry is out, so the page does not jump.
export default function DataState({
  query,
  emptyText,
  isEmpty = (d) => Array.isArray(d) && d.length === 0,
  loadingLabel,
  children,
}) {
  if (query.status === 'error') return <ErrorState error={query.error} onRetry={query.retry} />;
  if (query.data === null || query.data === undefined) return <LoadingState label={loadingLabel} />;
  if (isEmpty(query.data)) return <EmptyState>{emptyText}</EmptyState>;
  return children(query.data);
}
