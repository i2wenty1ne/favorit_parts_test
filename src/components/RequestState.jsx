import { Info, LoaderCircle, RotateCcw } from 'lucide-react';

export function Loading({ text = 'Загружаем предложения…' }) {
  return (
    <div className="state-message" role="status">
      <LoaderCircle size={28} className="spin text-primary" />
      <h3>{text}</h3>
      <p>Проверяем данные и наличие на складах</p>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-message error-state" role="alert">
      <Info size={30} />
      <h3>Не удалось выполнить поиск</h3>
      <p>{message}</p>
      <button className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
        <RotateCcw size={14} /> Повторить запрос
      </button>
    </div>
  );
}
