import { useRef } from 'react';
import { ArrowRight, LoaderCircle, Search, X } from 'lucide-react';
import { examples } from '../demo.js';

export default function SearchForm({ query, loading, onChange, onSearch }) {
  const inputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  function handleExample(number) {
    onChange(number);
    inputRef.current.focus();
  }

  function handleClear() {
    onChange('');
    inputRef.current.focus();
  }

  return (
    <section className="surface search-panel" aria-labelledby="search-title">
      <div className="section-heading">
        <div className="heading-icon">
          <Search size={19} />
        </div>
        <h2 id="search-title">Начнём с артикула</h2>
        <span className="muted-label">ШАГ 1 ИЗ 2</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="part-number">Артикул запчасти</label>
        <div className="search-input-row">
          <div className="search-input-wrap">
            <Search size={20} />
            <input
              ref={inputRef}
              id="part-number"
              value={query}
              maxLength={100}
              placeholder="Например, 0986424794"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onChange(event.target.value)}
            />
            {query && (
              <button
                type="button"
                className="clear-input"
                aria-label="Очистить артикул"
                onClick={handleClear}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="btn btn-primary search-button" disabled={!query.trim() || loading}>
            {loading ? <LoaderCircle size={17} className="spin" /> : <Search size={17} />}
            Найти запчасть
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      <div className="search-hint">
        <span>Попробуйте, например:</span>
        {examples.map((number) => (
          <button key={number} onClick={() => handleExample(number)}>
            {number}
          </button>
        ))}
        <span className="search-auto">
          <span className="status-dot" /> Автопоиск при вводе
        </span>
      </div>
    </section>
  );
}
