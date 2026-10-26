import { demoRequest } from './demo.js';

export function extractGoods(data) {
  if (data?.error) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Ошибка сервиса поставщика.');
  }

  const goods = Array.isArray(data) ? data : data?.goods;

  if (!Array.isArray(goods)) {
    throw new Error('Сервис вернул ответ в неизвестном формате. Повторите запрос.');
  }

  if (goods.some((item) => item?.error)) {
    throw new Error('Ошибка сервиса поставщика. Повторите запрос.');
  }

  // Для отсутствующей детали API может вернуть goods: [{}].
  return goods.filter((item) => item?.brand && item?.number);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalize(value) {
  return String(value || '')
    .replace(/[\s-]/g, '')
    .toUpperCase();
}

function flattenGoods(goods, depth = 0) {
  if (depth > 10) return [];

  return goods.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const analogues = Array.isArray(item.analogues) ? item.analogues : [];
    return [item, ...flattenGoods(analogues, depth + 1)];
  });
}

export function getBrands(goods) {
  const brands = new Map();

  for (const item of goods) {
    const brand = String(item.brand).trim();
    const key = brand.toUpperCase();

    if (!brands.has(key)) {
      brands.set(key, { brand, name: item.name || 'Автозапчасть', number: item.number });
    }
  }

  return [...brands.values()];
}

export function getOffers(goods, selectedBrand, searchedNumber) {
  const offers = new Map();

  for (const item of flattenGoods(goods)) {
    if (!item.brand || !item.number) continue;

    const original =
      normalize(item.brand) === normalize(selectedBrand) &&
      normalize(item.number) === normalize(searchedNumber);
    const warehouses =
      Array.isArray(item.warehouses) && item.warehouses.length ? item.warehouses : [null];

    for (const [index, warehouse] of warehouses.entries()) {
      const id = [
        item.goodsID || `${item.brand}:${item.number}`,
        warehouse?.id || warehouse?.code || index,
        warehouse?.warehouseShipping,
        warehouse?.shipmentDate,
        warehouse?.price,
        warehouse?.stock,
      ].join(':');

      if (offers.has(id)) continue;

      offers.set(id, {
        id,
        brand: item.brand,
        number: item.number,
        name: item.name || 'Автозапчасть',
        // По документации товарный price устарел: цену берём только со склада.
        price: toNumber(warehouse?.price),
        stock: toNumber(warehouse ? warehouse.stock : item.count) ?? 0,
        warehouse: warehouse?.code || (warehouse?.id ? `Склад ${warehouse.id}` : 'Не указан'),
        own: Boolean(warehouse?.own),
        original,
      });
    }
  }

  return [...offers.values()];
}

export async function requestParts({ number, brand, mode, signal }) {
  if (mode === 'demo') {
    return extractGoods(await demoRequest(number, brand, signal));
  }

  const params = new URLSearchParams({ number });

  if (brand) {
    params.set('brand', brand);
  }

  let response;

  try {
    response = await fetch(`/api/parts?${params}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(20000)]),
    });
  } catch (error) {
    if (signal.aborted) throw error;

    const message =
      error.name === 'TimeoutError'
        ? 'Время ожидания истекло. Повторите поиск.'
        : 'Нет соединения с сервером. Проверьте интернет и повторите поиск.';

    throw new Error(message);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ. Повторите поиск позже.');
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Не удалось загрузить данные. Повторите поиск.');
  }

  return extractGoods(data);
}
