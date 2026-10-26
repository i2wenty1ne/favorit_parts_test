import { Check, Search } from 'lucide-react';
import { ErrorState, Loading } from './RequestState.jsx';

export default function BrandList({
  brands,
  selectedBrand,
  number,
  mode,
  status,
  error,
  onSelect,
  onRetry,
}) {
  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <section className="surface">
        <Loading text="Ищем производителей…" />
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="surface">
        <ErrorState message={error} onRetry={onRetry} />
      </section>
    );
  }

  if (!brands.length) {
    return (
      <section className="surface">
        <div className="state-message">
          <Search size={32} />
          <h3>По артикулу «{number}» ничего не найдено</h3>
          <p>
            {mode === 'demo'
              ? 'В деморежиме доступны артикулы 0986424794 и W 914/2.'
              : 'Проверьте номер детали или попробуйте другой артикул.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="brands-section" aria-labelledby="brands-title">
      <div className="section-title-row">
        <h2 id="brands-title">
          Выберите производителя <span className="count-badge">{brands.length}</span>
        </h2>
        <span>
          Для артикула <strong className="article-number">{number}</strong>
        </span>
      </div>
      <div className="brand-grid">
        {brands.map((item, index) => {
          const selected = selectedBrand === item.brand;

          return (
            <button
              key={item.brand}
              className={`brand-card ${selected ? 'selected' : ''}`}
              onClick={() => onSelect(item.brand)}
              aria-pressed={selected}
            >
              <div className={`brand-monogram brand-color-${index % 3}`}>
                {item.brand === 'BOSCH' ? <span className="bosch-symbol">H</span> : item.brand[0]}
              </div>
              <div className="brand-card-copy">
                <strong>{item.brand}</strong>
                <span>{item.name}</span>
              </div>
              <span className="brand-radio">{selected && <Check size={12} />}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
