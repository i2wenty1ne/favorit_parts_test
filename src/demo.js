const warehouse = (price, stock, code = 'МС2', own = true) => ({
  id: code,
  code,
  own,
  price,
  stock,
});
const part = (brand, number, name, warehouses) => ({
  goodsID: `${brand}-${number}`,
  brand,
  number,
  name,
  count: warehouses.reduce((sum, w) => sum + w.stock, 0),
  warehouses,
});
const brakeParts = [
  part('BOSCH', '0986424794', 'Колодки тормозные дисковые, передние', [
    warehouse(2840, 24),
    warehouse(3120, 12, 'СПБ'),
  ]),
  part('BREMBO', 'P 85 020', 'Колодки тормозные передние, комплект', [
    warehouse(3290, 18),
    warehouse(3450, 8, 'НН', false),
  ]),
  part('TRW', 'GDB1330', 'Колодки тормозные дисковые, передние', [warehouse(3150, 32)]),
  part('ATE', '13.0460-7117.2', 'Колодки тормозные передние, комплект', [
    warehouse(4380, 6, 'СПБ'),
  ]),
  part('FERODO', 'FDB1094', 'Колодки тормозные дисковые, передние', [warehouse(2670, 14)]),
  part('TEXTAR', '2313001', 'Колодки тормозные передние, комплект', [warehouse(3520, 0)]),
];
const filterParts = [
  part('MANN-FILTER', 'W 914/2', 'Фильтр масляный', [
    warehouse(640, 48),
    warehouse(710, 20, 'СПБ'),
  ]),
  part('BOSCH', '0451103274', 'Фильтр масляный навинчиваемый', [warehouse(520, 36)]),
  part('MAHLE', 'OC 384', 'Фильтр масляный', [warehouse(580, 15, 'НН', false)]),
];
export const examples = ['0986424794', 'W 914/2'];
export async function demoRequest(number, brand, signal) {
  await new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 650);
    signal.addEventListener('abort', abort, { once: true });
  });
  const normalized = number.replace(/[\s-]/g, '').toUpperCase();
  const group =
    normalized === '0986424794' ? brakeParts : normalized === 'W914/2' ? filterParts : [];
  if (!brand)
    return { goods: group.slice(0, 3).map((item) => ({ ...item, number: number.trim() })) };
  const selected = group.find((item) => item.brand === brand);
  if (!selected) return { goods: [{}] };
  return {
    goods: [
      { ...selected, number: number.trim(), analogues: group.filter((item) => item !== selected) },
    ],
  };
}
