import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export interface AnalyticsStats {
    total_projects: string
    active_projects: string
    completed_projects: string
    total_actions: string
    total_logins: string
    steps_completed: string
    steps_total: string
}

export interface ActivityEntry {
    id: number
    user_id: number
    action: string
    details: Record<string, unknown>
    created_at: string
}

export interface DailyActivity {
    date: string
    count: string
    logins: string
    projects: string
    steps: string
}

export interface ProjectBreakdown {
    id: number
    name: string
    stage: string
    progress: number
    created_at: string
    steps_done: string
    steps_total: string
    last_step_at: string | null
}

export interface ActionDist {
    action: string
    count: string
}

export interface AnalyticsData {
    stats: AnalyticsStats
    activity: ActivityEntry[]
    dailyActivity: DailyActivity[]
    projectBreakdown: ProjectBreakdown[]
    actionDist: ActionDist[]
}

/** Fetch the current user's analytics. */
export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const refresh = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const result = await api.get<AnalyticsData>('/analytics')
            setData(result)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { data, loading, error, refresh }
}
