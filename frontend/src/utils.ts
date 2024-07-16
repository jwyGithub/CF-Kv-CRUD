export function formatPath(path: string) {
    return path.replace(/\/\//g, '/');
}

export function decode(v: string) {
    try {
        return decodeURIComponent(v);
    } catch {
        return v;
    }
}
