const consoleBinder = (namespace) => ({
    log: (msg, ...args) => console.log(`[${namespace}] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[${namespace}] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[${namespace}] ${msg}`, ...args),
    info: (msg, ...args) => console.info(`[${namespace}] ${msg}`, ...args),
});

export default consoleBinder;
