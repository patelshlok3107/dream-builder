/**
 * API client — thin wrapper around fetch() that talks to the Express backend.
 *
 * - Automatically attaches the JWT (stored in localStorage) to every request.
 * - Parses JSON responses and throws on non-2xx status codes.
 * - On 401, clears the stored token so the UI can redirect to /login.
 */

const TOKEN_KEY = 'vex_token'

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
}

export interface ApiError extends Error {
    status: number
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    let res: Response
    try {
        res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    } catch (err) {
        throw makeError('Cannot reach the server. Is the API running?', 0)
    }

    if (res.status === 401) {
        clearToken()
    }

    let data: any = null
    const text = await res.text()
    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            data = { error: text }
        }
    }

    if (!res.ok) {
        throw makeError(data?.error || `Request failed (${res.status})`, res.status)
    }

    return data as T
}

function makeError(message: string, status: number): ApiError {
    const err = new Error(message) as ApiError
    err.status = status
    return err
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
