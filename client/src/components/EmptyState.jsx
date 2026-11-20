// Shown when a list came back empty: a sentence saying so, never a blank area or an error.
export default function EmptyState({ children }) {
  return <p className="state state-empty">{children}</p>;
}
