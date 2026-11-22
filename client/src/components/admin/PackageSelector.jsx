import { formatVND } from '../../utils/money.js';
import DataState from '../DataState.jsx';

// 2-column grid of real packages loaded from GET /api/services.
export default function PackageSelector({ servicesQuery, selectedPackageId, onSelect }) {
  return (
    <DataState
      query={servicesQuery}
      isEmpty={(list) => !list || list.length === 0}
      emptyText="Studio chưa có gói chụp nào."
      loadingLabel="Đang tải các gói chụp…"
    >
      {(services) => {
        const items = services.flatMap((service) => (service.packages || []).map((pkg) => ({ service, pkg })));
        if (!items.length) {
          return <p className="empty">Studio chưa có gói chụp nào.</p>;
        }
        return (
          <div className="pkg-grid" role="group" aria-label="Chọn gói chụp">
            {items.map(({ service, pkg }) => {
              const isSelected = pkg.id === selectedPackageId;
              const priceLabel = pkg.priceUnit ? `Từ ${formatVND(pkg.price)}/${pkg.priceUnit}` : formatVND(pkg.price);
              return (
                <button
                  key={pkg.id}
                  type="button"
                  className={`pkg-card${isSelected ? ' is-selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(service, pkg)}
                >
                  <span className="pkg-card-name">{pkg.name}</span>
                  <span className="pkg-card-price">{priceLabel}</span>
                </button>
              );
            })}
          </div>
        );
      }}
    </DataState>
  );
}
