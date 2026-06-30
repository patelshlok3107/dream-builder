import { useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from './api'

export interface AuthUser {
    id: string
    email: string
    name: string
}

const USER_KEY = 'vex_user'

/** Persist + restore the user object so refreshes keep you signed in. */
function loadStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
}

function storeUser(user: AuthUser | null) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
}

/**
 * useAuth — the single auth hook used across the app.
 *
 * Talks to the Express + PostgreSQL backend via JWT. No demo fallback.
 */
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(loadStoredUser)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // If we have a token but no user yet, the /me call is implicit —
        // the stored user is enough. We mark loading false.
        setLoading(false)
    }, [])

    const signIn = useCallback(async (email: string, password: string) => {
        const data = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
            email,
            password,
        })
        setToken(data.token)
        storeUser(data.user)
        setUser(data.user)
        return data.user
    }, [])

    const signUp = useCallback(async (email: string, password: string, name?: string) => {
        const data = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
            email,
            password,
            name,
        })
        setToken(data.token)
        storeUser(data.user)
        setUser(data.user)
        return data.user
    }, [])

    const signOut = useCallback(async () => {
        clearToken()
        storeUser(null)
        setUser(null)
    }, [])

    return { user, loading, signIn, signUp, signOut, isAuthenticated: !!getToken() }
}

export interface ProjectSummary {
    id: number
    user_id: number
    name: string
    description: string
    category: string
    tagline: string
    stage: string
    progress: number
    brand_colors: Record<string, string>
    logo_url: string
    website_url: string
    created_at: string
    updated_at: string
    steps_done?: string
    steps_total?: string
}

export interface PipelineStep {
    id: number
    project_id: number
    step_name: string
    step_order: number
    status: 'pending' | 'working' | 'done'
    started_at: string | null
    completed_at: string | null
    notes: Record<string, unknown>
}

export interface ProjectDetail extends ProjectSummary {
    steps: PipelineStep[]
}
