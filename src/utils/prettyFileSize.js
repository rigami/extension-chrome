export default (bytes) => {
    const kb = bytes / 1024;

    if (kb <= 1024) {
        return [Math.round(kb), 'kb'];
    }

    return [Math.round(kb / 1024), 'mb'];
};
