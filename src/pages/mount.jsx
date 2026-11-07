import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tokens.css';
import '../styles/base.css';

export default function mount(page) {
  createRoot(document.getElementById('root')).render(<StrictMode>{page}</StrictMode>);
}
