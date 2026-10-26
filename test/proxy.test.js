import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApiMiddleware } from '../server/api.js';

async function withProxy(env, fetcher, run) {
  const server = http.createServer(createApiMiddleware(env, fetcher));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('config exposes only key availability and missing key is handled', async () => {
  await withProxy(
    {},
    () => {
      throw new Error('must not call upstream');
    },
    async (base) => {
      assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), { configured: false });
      const response = await fetch(`${base}/api/parts?number=123`);
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /FAVORIT_API_KEY/);
    },
  );
});

test('proxy encodes number/brand, attaches private key and analogues only for stage two', async () => {
  const requests = [];
  await withProxy(
    { FAVORIT_API_KEY: 'test-secret' },
    async (url) => {
      requests.push(new URL(url));
      return Response.json({ goods: [{}] });
    },
    async (base) => {
      await fetch(`${base}/api/parts?${new URLSearchParams({ number: 'A#12/&' })}`);
      await fetch(
        `${base}/api/parts?${new URLSearchParams({ number: 'A#12/&', brand: 'Brand & Co' })}`,
      );
      assert.equal(requests[0].searchParams.get('number'), 'A#12/&');
      assert.equal(requests[0].searchParams.has('analogues'), false);
      assert.equal(requests[1].searchParams.get('analogues'), 'on');
      assert.equal(requests[1].searchParams.get('brand'), 'Brand & Co');
      assert.equal(requests[1].searchParams.get('key'), 'test-secret');
      assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), { configured: true });
    },
  );
});

test('documented API errors and network errors return safe Russian messages', async () => {
  for (const [response, expected] of [
    [() => Response.json({ error: 'Invalid key client!' }), /отклонил ключ/],
    [
      () => {
        throw new Error('url contains secret');
      },
      /Не удалось связаться/,
    ],
    [() => new Response('not json'), /Не удалось связаться/],
  ]) {
    await withProxy({ FAVORIT_API_KEY: 'secret' }, response, async (base) => {
      const result = await fetch(`${base}/api/parts?number=123`);
      assert.equal(result.status, 502);
      const { error } = await result.json();
      assert.match(error, expected);
      assert.ok(!error.includes('secret'));
    });
  }
});
