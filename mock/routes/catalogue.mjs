// docs/api/02-catalogue.md: GET /api/services, /api/extras, /api/photos, /api/reviews. Open to visitors, read only.
import { invalid, ok } from '../lib.mjs';

function photos({ query, db }) {
  const serviceId = query.get('serviceId');
  if (serviceId === null) return ok(db.photos);
  // The filter value is checked against the known services before it is used.
  if (!db.services.some((s) => s.id === serviceId)) return invalid({ serviceId: 'Không có dịch vụ này.' });
  return ok(db.photos.filter((p) => p.serviceId === serviceId));
}

export default [
  { method: 'GET', path: '/api/services', handler: ({ db }) => ok(db.services) },
  { method: 'GET', path: '/api/extras', handler: ({ db }) => ok(db.extras) },
  { method: 'GET', path: '/api/photos', handler: photos },
  { method: 'GET', path: '/api/reviews', handler: ({ db }) => ok(db.reviews) },
];
