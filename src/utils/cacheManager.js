async function addToCache(cacheName, url, blob) {
    const cache = await caches.open(cacheName);

    console.log('[CacheManager] addToCache', cacheName, url);

    if (blob) {
        const mutationResponse = new Response(blob, { headers: new Headers({ 'Rigami-Time-Cached': new Date().toISOString() }) });

        Object.defineProperty(mutationResponse, 'url', { value: url });

        await cache.put(url, mutationResponse);
    } else {
        await cache.add(url);
    }
}

async function cacheWithPrefetch(cacheName, url) {
    console.log('cacheWithPrefetch:', cacheName, url);
    const response = await fetch(url);
    const cache = await caches.open(cacheName);

    const mutationResponse = new Response(response.body, {
        ...response,
        headers: new Headers({
            ...Object.fromEntries(response.headers.entries()),
            'Rigami-Time-Cached': new Date().toISOString(),
        }),
    });

    Object.defineProperty(mutationResponse, 'url', { value: response.url });
    Object.defineProperty(mutationResponse, 'type', { value: response.type });

    await cache.put(url, mutationResponse);
}

async function getFromCache(cacheName, url) {
    const cache = await caches.open(cacheName);

    return cache.match(url);
}

async function cleanCache(cacheName, timestamp) {
    const cache = await caches.open(cacheName);

    const values = await cache.keys();

    for await (const request of values) {
        const response = await cache.match(request);

        const cachedTime = new Date(response.headers.get('rigami-time-cached')).valueOf();

        if (cachedTime < timestamp) {
            console.log('[CacheManager] Delete cache:', cacheName, response);
            await cache.delete(request);
        }
    }
}

async function deleteFromCache(cacheName, url) {
    const cache = await caches.open(cacheName);
}

const manager = {
    cache: addToCache,
    get: getFromCache,
    clean: cleanCache,
    delete: deleteFromCache,
    cacheWithPrefetch,
};

export default manager;
