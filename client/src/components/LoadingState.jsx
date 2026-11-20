// Shown while a screen's data is on its way (the mock's slow mode takes 2 s). Read out once by screen readers.
export default function LoadingState({ label = 'Đang tải…' }) {
  return (
    <p className="state state-loading" role="status">
      {label}
    </p>
  );
}
