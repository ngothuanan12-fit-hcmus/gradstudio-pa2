// The home page's view of the catalogue: one card per service with its sample photo, built from the API's answers
// to /api/services and /api/photos (docs/api/02-catalogue.md). Nothing here is written in by hand.
export function showcase(services, photos) {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    summary: service.summary,
    price: service.priceFrom,
    unit: service.priceUnit ? `/${service.priceUnit}` : '',
    packages: service.packages,
    photo: photos.find((p) => p.serviceId === service.id) || null,
  }));
}

// What a package includes, by name, once the extras are known; the ids alone until then.
export function includedNames(pack, extras) {
  return pack.includes.map((id) => extras?.find((e) => e.id === id)?.name || id);
}
