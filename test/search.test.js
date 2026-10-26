import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractGoods, getBrands, getOffers } from '../src/api.js';
import {
  fetchBrands,
  fetchOffers,
  searchReducer,
  setQuery,
  selectBrand,
} from '../src/searchSlice.js';
import { demoRequest } from '../src/demo.js';

test('documented empty response is an empty result; malformed payload is an error', () => {
  assert.deepEqual(extractGoods({ goods: [{}] }), []);
  assert.deepEqual(extractGoods([]), []);
  assert.throws(() => extractGoods({ unexpected: [] }), /неизвестном формате/);
  assert.throws(() => extractGoods({ error: 'Invalid key client!' }), /Invalid key/);
});

test('manufacturers are deduplicated without case sensitivity', () => {
  assert.equal(
    getBrands([
      { brand: 'BOSCH', number: '123' },
      { brand: 'bosch', number: '123' },
    ]).length,
    1,
  );
});

test('offers use warehouse prices, preserve zero stock and traverse nested analogues', () => {
  const goods = [
    {
      goodsID: '1',
      brand: 'BOSCH',
      number: '123',
      price: 99999,
      count: 200,
      warehouses: [
        { id: 'a', price: 100, stock: 4 },
        { id: 'b', price: 120, stock: 0 },
      ],
      analogues: [
        { goodsID: '2', brand: 'TRW', number: 'abc', count: 0, price: 80, warehouses: [] },
      ],
    },
  ];
  const rows = getOffers(goods, 'BOSCH', '123');
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.price),
    [100, 120, null],
  );
  assert.deepEqual(
    rows.map((r) => r.stock),
    [4, 0, 0],
  );
  assert.deepEqual(
    rows.map((r) => r.original),
    [true, true, false],
  );
  assert.equal(getOffers([{ ...goods[0], number: '124' }], 'BOSCH', '123')[0].original, false);
});

test('different deliveries from the same warehouse remain separate offers', () => {
  const rows = getOffers(
    [
      {
        brand: 'A',
        number: '1',
        warehouses: [
          { id: 'same', price: 10, stock: 2 },
          { id: 'same', price: 11, stock: 3 },
        ],
      },
    ],
    'A',
    '1',
  );
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].id, rows[1].id);
});

test('an old manufacturer response cannot overwrite a new search', () => {
  let state = searchReducer(undefined, fetchBrands.pending('old', { number: '123' }));
  state = searchReducer(state, setQuery('456'));
  state = searchReducer(state, fetchBrands.pending('new', { number: '456' }));
  state = searchReducer(state, fetchBrands.fulfilled([{ brand: 'OLD' }], 'old', { number: '123' }));
  assert.deepEqual(state.brands, []);
  state = searchReducer(state, fetchBrands.fulfilled([{ brand: 'NEW' }], 'new', { number: '456' }));
  assert.equal(state.brands[0].brand, 'NEW');
});

test('changing manufacturer discards results and errors from its previous request', () => {
  let state = searchReducer(undefined, selectBrand('BOSCH'));
  state = searchReducer(state, fetchOffers.pending('old', { brand: 'BOSCH' }));
  state = searchReducer(state, selectBrand('TRW'));
  state = searchReducer(
    state,
    fetchOffers.fulfilled([{ brand: 'BOSCH' }], 'old', { brand: 'BOSCH' }),
  );
  assert.deepEqual(state.offers, []);
  assert.equal(state.selectedBrand, 'TRW');
});

test('demo supports both stages, empty searches and aborting an in-flight request', async () => {
  const controller = new AbortController();
  const brands = getBrands(extractGoods(await demoRequest('0986424794', null, controller.signal)));
  assert.equal(brands.length, 3);
  const offers = getOffers(
    extractGoods(await demoRequest('0986424794', brands[0].brand, controller.signal)),
    brands[0].brand,
    '0986424794',
  );
  assert.equal(offers.length, 8);
  assert.equal(offers.filter((r) => r.original).length, 2);
  assert.deepEqual(extractGoods(await demoRequest('unknown', null, controller.signal)), []);
  const pending = demoRequest('W 914/2', null, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
