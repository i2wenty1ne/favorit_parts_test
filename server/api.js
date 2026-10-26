const messages = {
  'Empty key!': 'Не указан ключ API. Добавьте FAVORIT_API_KEY в .env и перезапустите сервер.',
  'Invalid key client!': 'Сервис отклонил ключ API. Проверьте ключ покупателя.',
  'Empty number goods!': 'Введите артикул детали.',
  'Request quota exceeded!': 'Превышен лимит запросов. Повторите поиск позже.',
};

export function apiErrorMessage(error) {
  const value = typeof error === 'string' ? error : JSON.stringify(error);

  return (
    Object.entries(messages)
      .filter(([key]) => value?.includes(key))
      .map(([, message]) => message)
      .join(' ') || 'Сервис Favorit Parts вернул ошибку. Повторите запрос позже.'
  );
}

export function createApiMiddleware(env, fetcher = fetch) {
  return async (req, res, next = () => {}) => {
    const url = new URL(req.url, 'http://localhost');

    if (!url.pathname.startsWith('/api/')) return next();

    const send = (status, body) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify(body));
    };

    if (req.method !== 'GET') return send(405, { error: 'Метод не поддерживается.' });

    if (url.pathname === '/api/config') {
      return send(200, { configured: Boolean(env.FAVORIT_API_KEY?.trim()) });
    }

    if (url.pathname !== '/api/parts') return send(404, { error: 'Адрес не найден.' });

    const number = url.searchParams.get('number')?.trim();
    const brand = url.searchParams.get('brand')?.trim();

    if (!number || number.length > 100 || (brand && brand.length > 100)) {
      return send(400, { error: 'Укажите артикул и бренд длиной до 100 символов.' });
    }

    if (!env.FAVORIT_API_KEY?.trim()) return send(503, { error: messages['Empty key!'] });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const cancel = () => {
      if (!res.writableEnded) controller.abort();
    };

    res.on('close', cancel);

    try {
      const upstream = new URL(env.FAVORIT_API_URL || 'http://api.favorit-parts.ru/hs/hsprice/');
      upstream.search = new URLSearchParams({
        key: env.FAVORIT_API_KEY.trim(),
        number,
        ...(brand ? { brand, analogues: 'on' } : {}),
      }).toString();

      const response = await fetcher(upstream, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return send(response.status === 429 ? 429 : 502, {
          error:
            response.status === 429
              ? messages['Request quota exceeded!']
              : 'Сервис поставщика временно недоступен. Повторите поиск.',
        });
      }

      const data = await response.json();
      const error =
        data?.error || (Array.isArray(data) ? data.find((item) => item?.error)?.error : null);

      if (error) return send(502, { error: apiErrorMessage(error) });

      return send(200, data);
    } catch (error) {
      if (res.destroyed) return;

      return send(502, {
        error:
          error.name === 'AbortError'
            ? 'Сервис не ответил за 15 секунд. Повторите поиск.'
            : 'Не удалось связаться с Favorit Parts. Повторите поиск позже.',
      });
    } finally {
      clearTimeout(timer);
      res.off('close', cancel);
    }
  };
}
