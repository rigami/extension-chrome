async function addToCache(cacheName, url, blob) {
    const cache = await caches.open(cacheName);

    if (blob) {
        const response = new Response(blob);

        await cache.put(url, response);
    } else {
        await cache.add(url);
    }
}

async function getFromCache(cacheName, url) {
    const cache = await caches.open(cacheName);

    return cache.match(url);
}

const manager = {
    cache: addToCache,
    get: getFromCache,
};

export default manager;
