import Button from './Button.jsx';

// Shown when the API could not answer: the API's own message and a Retry that loads again without a page reload.
export default function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p>{error?.message || 'Có lỗi xảy ra.'}</p>
      <Button variant="secondary" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}
