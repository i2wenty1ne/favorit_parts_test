import { Warehouse } from 'lucide-react';
import { formatPrice } from '../utils/offers.js';

export default function OffersTable({ offers }) {
  return (
    <div className="table-responsive">
      <table className="table offers-table">
        <thead>
          <tr>
            <th scope="col">ПРОИЗВОДИТЕЛЬ / АРТИКУЛ</th>
            <th scope="col">НАИМЕНОВАНИЕ</th>
            <th scope="col">СКЛАД</th>
            <th scope="col">НАЛИЧИЕ</th>
            <th scope="col" className="text-end">
              ЦЕНА, ₽
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td>
                <strong className="table-brand">{offer.brand}</strong>
                <span className="table-article">{offer.number}</span>
              </td>
              <td>
                <div className="part-name">{offer.name}</div>
                <span className={`part-type ${offer.original ? 'original' : ''}`}>
                  {offer.original ? 'Искомая деталь' : 'Аналог'}
                </span>
              </td>
              <td>
                <span className="warehouse-name">
                  <Warehouse size={13} />
                  {offer.warehouse}
                </span>
                <span className="warehouse-type">{offer.own ? 'Свой склад' : 'Поставщик'}</span>
              </td>
              <td>
                <span className={`stock-quantity ${offer.stock ? '' : 'unavailable'}`}>
                  <span className="status-dot" />
                  {offer.stock ? `${offer.stock} шт.` : 'Нет в наличии'}
                </span>
              </td>
              <td className="text-end">
                <strong className="offer-price">{formatPrice(offer.price)}</strong>
                <span className="price-note">за 1 шт.</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
