
export function parent(url: string): string {
    // remove any trailing /
    const base =  url.slice(0, -1)
    const parent = base.substring(0, base.lastIndexOf('/') + 1)
    return parent
}