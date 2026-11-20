import { useEffect } from 'react';

// The browser tab's title and the page's colour theme follow the screen (one HTML file serves every route).
// The cleanup puts back what was there, so the next screen starts from a known state.
export default function usePageMeta(title, theme) {
  useEffect(() => {
    const before = { title: document.title, theme: document.documentElement.dataset.theme };
    document.title = title;
    document.documentElement.dataset.theme = theme;
    return () => {
      document.title = before.title;
      document.documentElement.dataset.theme = before.theme;
    };
  }, [title, theme]);
}
