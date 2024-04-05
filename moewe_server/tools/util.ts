export function maybe(f: () => any): any | null{
    try {
        return f();
    } catch {
        return null;
    }
}