import { useEffect, useState } from 'react';
import { apiBlob } from '../api/client.js';

// One preview photo. GET /api/previews/:id needs the token (docs/api/08-jobs.md), which a plain <img src> does not
// send, so the file is loaded through the API helper and shown from an object URL, released when the photo leaves.
export default function PreviewImage({ url, alt }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = null;
    apiBlob(url.replace(/^\/api/, ''), { signal: controller.signal }).then(
      (blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      },
      () => {
        if (!controller.signal.aborted) setFailed(true);
      },
    );
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (failed) return <span className="preview-frame preview-missing">Không tải được ảnh</span>;
  if (!src) return <span className="preview-frame preview-loading" aria-hidden="true" />;
  return <img className="preview-frame" src={src} alt={alt} />;
}
