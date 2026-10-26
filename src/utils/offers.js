const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

export function formatPrice(price) {
  return price === null ? 'По запросу' : priceFormatter.format(price);
}

export function getVisibleOffers(offers, { filter, inStock, sort }) {
  return offers
    .filter((offer) => {
      if (inStock && offer.stock === 0) return false;
      if (filter === 'original') return offer.original;
      if (filter === 'analogues') return !offer.original;
      return true;
    })
    .sort((first, second) => {
      switch (sort) {
        case 'price-up':
          return (first.price ?? Infinity) - (second.price ?? Infinity);
        case 'price-down':
          return (second.price ?? -Infinity) - (first.price ?? -Infinity);
        case 'stock':
          return second.stock - first.stock;
        default:
          return (
            Number(second.original) - Number(first.original) ||
            (first.price ?? Infinity) - (second.price ?? Infinity)
          );
      }
    });
}

function escapeCsvCell(value) {
  const text = String(value ?? '')
    .replace(/^[=+@\-\t\r]/, "'$&")
    .replaceAll('"', '""');

  return `"${text}"`;
}

export function exportOffers(offers, number) {
  const rows = [
    ['Производитель', 'Артикул', 'Наименование', 'Цена, RUB', 'Остаток', 'Склад'],
    ...offers.map((offer) => [
      offer.brand,
      offer.number,
      offer.name,
      offer.price,
      offer.stock,
      offer.warehouse,
    ]),
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `favorit-${number.replace(/[^\p{L}\p{N}-]/gu, '_')}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
