export default (func) => {
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
