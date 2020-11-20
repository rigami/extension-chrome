const nodeConsole = typeof console !== 'undefined' ? console : null;

const { console: nativeConsole } = typeof window !== 'undefined'
    ? window
    : { console: nodeConsole || { log: () => {} } };

if (typeof window !== 'undefined') {
    window.forceConsole = nativeConsole;
}

export default nativeConsole;
