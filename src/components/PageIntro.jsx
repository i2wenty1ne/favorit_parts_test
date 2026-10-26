import { ArrowUpRight, CheckCheck, Layers3, Warehouse } from 'lucide-react';
import { API_DOCS_URL } from '../constants.js';

export default function PageIntro() {
  return (
    <section className="page-intro">
      <div>
        <div className="page-eyebrow">
          <span /> ВАША ДЕТАЛЬ НАЙДЁТСЯ
        </div>
        <h1>
          Точный поиск.
          <br />
          Больше возможностей<span>.</span>
        </h1>
        <p className="page-subtitle">
          Найдите запчасть по артикулу и сравните предложения
          <br className="desktop-break" /> производителей — всё в одном месте.
        </p>
        <div className="intro-features">
          <span>
            <CheckCheck size={15} /> Прямой поиск по артикулу
          </span>
          <span>
            <Warehouse size={15} /> Наличие по складам
          </span>
        </div>
      </div>
      <div className="rotor-art" aria-hidden="true">
        <div className="rotor-grid" />
        <img src="/brake-disc.svg" alt="" />
        <span className="art-tag">
          <span /> ТОЧНЫЙ ПОДБОР
        </span>
      </div>
    </section>
  );
}

export function SearchHint() {
  return (
    <div className="info-strip">
      <div className="info-strip-icon">
        <Layers3 size={20} />
      </div>
      <div>
        <strong>Один артикул — больше вариантов</strong>
        <p>Сравнивайте искомую деталь и её аналоги, чтобы найти подходящее предложение.</p>
      </div>
      <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
        Как работает поиск
        <ArrowUpRight size={15} />
      </a>
    </div>
  );
}
