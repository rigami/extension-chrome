export const queuingDecorator = (func) => {
    let queue = [];
    let pendingPromise = false;

    const runQueue = () => {
        if (pendingPromise) {
            console.log("Queue is pending. Wait...");
            return;
        }

        if (queue.length === 0) {
            console.log("End queue");
            return;
        }

        pendingPromise = true;
        console.log("Calc from queue");
        queue.shift()().finally(() => {
            console.log("Calc!");
            pendingPromise = false;
            runQueue();
        });
    };

    return (x) => {
        return new Promise((resolve, reject) => {
            console.log("Add to queue for file:", x);
            queue.push(() => func(x).finally(resolve));

            runQueue();
        });
    };
};

export const cachingDecorator = (func) => {
    let cache = new Map();

    return (x) => {
        if (cache.has(x)) {
            console.log("FROM CACHE")
            return cache.get(x);
        }

        let result = func(x);
        console.log("CALC")

        cache.set(x, result);
        return result;
    };
};