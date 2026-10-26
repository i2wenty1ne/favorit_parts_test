import { ArrowRight, Clock3, History } from 'lucide-react';
import { HISTORY_LIMIT } from '../constants.js';

export default function SearchHistory({ history, onClear, onSelect, onBack }) {
  return (
    <>
      <div className="page-eyebrow">ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <div className="page-title-row">
        <h1>История поиска</h1>
        <button className="btn btn-light" onClick={onClear}>
          Очистить историю
        </button>
      </div>
      <p className="page-subtitle">
        Последние {HISTORY_LIMIT} артикулов, которые вы искали на этом устройстве.
      </p>
      <section className="surface history-panel">
        {history.length ? (
          history.map((number) => (
            <button key={number} onClick={() => onSelect(number)}>
              <span className="history-icon">
                <Clock3 size={18} />
              </span>
              <span>
                <strong>{number}</strong>
                <small>Повторить поиск производителей</small>
              </span>
              <ArrowRight size={18} />
            </button>
          ))
        ) : (
          <div className="state-message">
            <History size={32} />
            <h3>Здесь появятся ваши поиски</h3>
            <p>Найдите первую деталь по артикулу.</p>
            <button className="btn btn-primary" onClick={onBack}>
              Перейти к поиску
            </button>
          </div>
        )}
      </section>
    </>
  );
}
