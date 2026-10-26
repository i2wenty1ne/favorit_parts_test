import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  History,
  Layers3,
  Search,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { API_DOCS_URL } from '../constants.js';

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <path d="M12 9h25l-5 8H18l-3 5h13l-5 8H10l-3 5H0z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Sidebar({ activeView, recentCount, mode, onNavigate, onOpenSettings }) {
  return (
    <aside className="sidebar">
      <a
        href="#"
        className="brand"
        aria-label="Favorit Parts — на главную"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('search');
        }}
      >
        <Mark />
        <span>
          FAVORIT<span className="brand-sub">PARTS WORKSPACE</span>
        </span>
      </a>
      <div className="workspace-label">КАТАЛОГ И ПОДБОР</div>
      <nav aria-label="Основная навигация">
        <button
          aria-label="Поиск запчастей"
          className={`nav-item ${activeView === 'search' ? 'active' : ''}`}
          onClick={() => onNavigate('search')}
        >
          <Search size={19} />
          <span>Поиск запчастей</span>
          <ChevronRight size={15} />
        </button>
        <button
          aria-label="История поиска"
          className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => onNavigate('history')}
        >
          <History size={19} />
          <span>История поиска</span>
          {recentCount > 0 && <span className="nav-count">{recentCount}</span>}
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-symbol">
            <Layers3 size={20} />
          </span>
          <div>
            <strong>Favorit Parts API</strong>
            <p>
              <span className={`status-dot ${mode === 'demo' ? 'amber' : ''}`} />
              {mode === 'demo' ? 'Демонстрационный режим' : 'Режим реального API'}
            </p>
          </div>
        </div>
        <button className="nav-item" aria-label="Настройки API" onClick={onOpenSettings}>
          <Settings2 size={18} />
          <span>Настройки API</span>
        </button>
        <a
          className="nav-item"
          aria-label="Документация"
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
        >
          <CircleHelp size={18} />
          <span>Документация</span>
          <ArrowUpRight size={15} />
        </a>
        <div className="sidebar-footer">
          ПОДОБРАТЬ. СРАВНИТЬ. НАЙТИ.<span>Favorit Parts © 2026</span>
        </div>
      </div>
    </aside>
  );
}

export function Header({ activeView, mode, onOpenSettings }) {
  return (
    <header className="topbar">
      <div className="breadcrumb-line">
        <span>Рабочее пространство</span>
        <ChevronRight size={14} />
        <strong>{activeView === 'search' ? 'Поиск запчастей' : 'История поиска'}</strong>
      </div>
      <div className="topbar-actions">
        <button className="mode-badge" onClick={onOpenSettings}>
          <span className={`status-dot ${mode === 'demo' ? 'amber' : ''}`} />
          {mode === 'demo' ? 'Деморежим' : 'Favorit API'}
          <ChevronDown size={12} />
        </button>
        <span className="header-divider" />
        <span className="profile-avatar" title="Рабочее пространство">
          FP
        </span>
      </div>
    </header>
  );
}

export function Footer({ mode }) {
  return (
    <footer className="page-footer">
      <span>
        Favorit Parts<span className="dot-separator">/</span>Сервис подбора автозапчастей
      </span>
      <span>
        <ShieldCheck size={13} />
        {mode === 'demo' ? 'Демонстрационные данные' : 'Интеграция с Favorit Parts API'}
      </span>
    </footer>
  );
}
