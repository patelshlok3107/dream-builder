/**
 * Small utility helpers shared across the app.
 */

/** Merge class names, dropping falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ')
}

/** Format a number as USD currency. */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value)
}

/** Format a number with thousands separators. */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value)
}

/** Format an ISO date string into a readable short date. */
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/** Return a relative time string, e.g. "3 days ago". */
export function timeAgo(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    const intervals: [number, string][] = [
        [31536000, 'year'],
        [2592000, 'month'],
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute'],
    ]
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs)
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`
    }
    return 'just now'
}
