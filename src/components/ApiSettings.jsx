import { Check, ExternalLink, FileText, Info, Settings2, X } from 'lucide-react';
import { API_DOCS_URL } from '../constants.js';

const modes = [
  ['demo', 'Демонстрационные данные', 'Два примера для проверки всего сценария поиска.'],
  ['live', 'Favorit Parts API', 'Реальные предложения по вашему ключу покупателя.'],
];

export default function ApiSettings({ dialogRef, mode, configured, onModeChange }) {
  let statusMessage = 'Проверяем подключение…';

  if (configured !== null) {
    statusMessage = configured
      ? 'Ключ API настроен на сервере'
      : 'Для реального поиска нужен ключ API';
  }

  return (
    <dialog ref={dialogRef} className="api-dialog" aria-labelledby="api-settings-title">
      <div className="dialog-heading">
        <div className="heading-icon">
          <Settings2 size={20} />
        </div>
        <h2 id="api-settings-title">Подключение к API</h2>
        <button
          className="icon-button"
          aria-label="Закрыть настройки"
          onClick={() => dialogRef.current.close()}
        >
          <X size={20} />
        </button>
      </div>
      <p className="dialog-description">Выберите источник данных для поиска запчастей.</p>
      <div className="mode-options">
        {modes.map(([value, title, text]) => (
          <button
            key={value}
            className={mode === value ? 'selected' : ''}
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
          >
            <span className="brand-radio">{mode === value && <Check size={12} />}</span>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="api-status">
        <Info size={18} />
        <div>
          <strong>{statusMessage}</strong>
          <p>
            Добавьте <code>FAVORIT_API_KEY</code> в файл <code>.env</code> и перезапустите сервер.
            Ключ не передаётся в браузер.
          </p>
        </div>
      </div>
      <a className="documentation-link" href={API_DOCS_URL} target="_blank" rel="noreferrer">
        <FileText size={16} /> Документация Favorit Parts
        <ExternalLink size={14} />
      </a>
      <button className="btn btn-primary w-100 mt-4" onClick={() => dialogRef.current.close()}>
        Готово
        <Check size={16} />
      </button>
    </dialog>
  );
}
