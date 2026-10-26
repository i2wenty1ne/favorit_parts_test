import { useState } from 'react';
import {
  ArrowDownToLine,
  Box,
  Info,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { exportOffers, formatPrice, getVisibleOffers } from '../utils/offers.js';
import { ErrorState, Loading } from './RequestState.jsx';
import OffersTable from './OffersTable.jsx';

const filters = [
  ['all', 'Все предложения'],
  ['original', 'Искомая деталь'],
  ['analogues', 'Аналоги'],
];

function SearchPlaceholder({ hasBrands }) {
  return (
    <div className="results-empty">
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-orbit orbit-one" />
        <div className="empty-orbit orbit-two" />
        <div className="empty-box">
          <Package size={39} strokeWidth={1.25} />
        </div>
        <span className="empty-search">
          <Search size={17} />
        </span>
        <span className="empty-spark spark-one" />
        <span className="empty-spark spark-two" />
      </div>
      <h3>{hasBrands ? 'Остался один шаг' : 'Всё начинается с номера детали'}</h3>
      <p>
        {hasBrands
          ? 'Выберите производителя выше — мы найдём деталь,'
          : 'Введите артикул, выберите производителя —'}
        <br />
        {hasBrands
          ? 'её аналоги и предложения по складам.'
          : 'а мы покажем цены, аналоги и наличие на складах.'}
      </p>
      <span className="empty-caption">
        <ShieldCheck size={14} /> Данные напрямую из Favorit Parts
      </span>
    </div>
  );
}

export default function Offers({
  brands,
  selectedBrand,
  offers,
  status,
  error,
  number,
  mode,
  onRetry,
}) {
  const [filter, setFilter] = useState('all');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('recommended');
  const visibleOffers = getVisibleOffers(offers, { filter, inStock, sort });
  const prices = offers
    .filter((offer) => offer.price !== null && offer.stock > 0)
    .map((offer) => offer.price);
  const analogCount = new Set(
    offers.filter((offer) => !offer.original).map((offer) => `${offer.brand}:${offer.number}`),
  ).size;
  const ready = selectedBrand && status === 'success';

  function resetFilters() {
    setFilter('all');
    setInStock(false);
  }

  return (
    <section className="surface results-panel" aria-labelledby="offers-title">
      <div className="results-heading">
        <div>
          <h2 id="offers-title">
            Предложения и аналоги
            {ready && <span className="count-badge">{offers.length}</span>}
          </h2>
          <p>
            {selectedBrand ? (
              <>
                <strong>{selectedBrand}</strong>
                <span className="dot-separator">·</span>
                {number}
              </>
            ) : (
              'Подходящие запчасти от проверенных производителей'
            )}
          </p>
        </div>
        <button
          className="btn export-button"
          onClick={() => exportOffers(visibleOffers, number)}
          disabled={!ready || !visibleOffers.length}
        >
          <ArrowDownToLine size={16} />
          <span>Экспорт</span>
        </button>
      </div>

      {!selectedBrand && <SearchPlaceholder hasBrands={brands.length > 0} />}
      {selectedBrand && status === 'loading' && <Loading />}
      {selectedBrand && status === 'error' && <ErrorState message={error} onRetry={onRetry} />}

      {ready && (
        <>
          <div className="results-toolbar">
            <div className="result-tabs" role="group" aria-label="Тип предложения">
              {filters.map(([value, title]) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  className={filter === value ? 'active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {title}
                </button>
              ))}
            </div>
            <label className="stock-switch">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
              />
              <span />
              Только в наличии
            </label>
          </div>

          {offers.length > 0 && (
            <div className="results-summary">
              <span>
                <span className="status-dot" /> {offers.length} предложений
              </span>
              <span>{analogCount} аналогов</span>
              <span>
                В наличии от{' '}
                <strong>{prices.length ? formatPrice(Math.min(...prices)) : '—'}</strong>
              </span>
              <label className="sort-control">
                <SlidersHorizontal size={14} />
                <select
                  aria-label="Сортировка предложений"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="recommended">Сначала искомая деталь</option>
                  <option value="price-up">Сначала дешевле</option>
                  <option value="price-down">Сначала дороже</option>
                  <option value="stock">По наличию</option>
                </select>
              </label>
            </div>
          )}

          {visibleOffers.length ? (
            <OffersTable offers={visibleOffers} />
          ) : (
            <div className="state-message">
              <Box size={28} />
              <h3>
                {offers.length ? 'Нет предложений с такими фильтрами' : 'Предложения не найдены'}
              </h3>
              <p>
                {offers.length
                  ? 'Измените тип предложения или отключите фильтр наличия.'
                  : 'Выберите другого производителя или попробуйте другой артикул.'}
              </p>
              {offers.length > 0 && (
                <button className="btn btn-light btn-sm" onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}

          <div className="table-footer">
            <Info size={13} />
            {mode === 'demo'
              ? 'Пример данных. Цены и остатки вымышлены.'
              : 'Цены и остатки актуальны на момент запроса.'}
            <span>
              Показано: {visibleOffers.length} из {offers.length}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
