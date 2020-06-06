export const queuingDecorator = (func) => {
    const queue = [];
    let pendingPromise = false;

    const runQueue = () => {
        if (pendingPromise) {
            return;
        }

        if (queue.length === 0) {
            return;
        }

        pendingPromise = true;
        queue.shift()().finally(() => {
            pendingPromise = false;
            runQueue();
        });
    };

    return (x) => new Promise((resolve) => {
        queue.push(() => func(x).finally(resolve));

        runQueue();
    });
};

export const cachingDecorator = (func) => {
    const cache = new Map();

    return (x) => {
        if (cache.has(x)) {
            return cache.get(x);
        }

        const result = func(x);

        cache.set(x, result);
        return result;
    };
};
