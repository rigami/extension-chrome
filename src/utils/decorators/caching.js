export default (func) => {
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
