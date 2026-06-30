import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { ProjectSummary, ProjectDetail, PipelineStep } from './auth'

/** Fetch + manage the current user's list of projects. */
export function useProjects() {
    const [projects, setProjects] = useState<ProjectSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const refresh = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await api.get<ProjectSummary[]>('/projects')
            setProjects(data)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const remove = useCallback(async (id: number) => {
        await api.del(`/projects/${id}`)
        setProjects((prev) => prev.filter((p) => p.id !== id))
    }, [])

    const create = useCallback(
        async (payload: { name: string; description: string; category: string; tagline?: string }) => {
            const project = await api.post<ProjectSummary>('/projects', payload)
            setProjects((prev) => [project, ...prev])
            return project
        },
        []
    )

    return { projects, loading, error, refresh, remove, create }
}

/** Fetch a single project with its pipeline steps. */
export function useProject(id: string | undefined) {
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [regenerating, setRegenerating] = useState(false)

    const refresh = useCallback(async () => {
        if (!id) {
            setLoading(false)
            return
        }
        setLoading(true)
        setError('')
        try {
            const data = await api.get<ProjectDetail>(`/projects/${id}`)
            setProject(data)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load project')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        refresh()
    }, [refresh])

    /** Advance a single pipeline step and merge the result back in. */
    const advanceStep = useCallback(
        async (stepId: number, status: 'working' | 'done', notes?: Record<string, unknown>) => {
            if (!id || !project) return
            const updated = await api.put<PipelineStep>(`/pipeline/${id}/${stepId}`, {
                status,
                notes,
            })
            setProject((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    steps: prev.steps.map((s) => (s.id === stepId ? updated : s)),
                }
            })
            // Re-fetch to pick up auto-advanced next step + recomputed progress
            refresh()
        },
        [id, project, refresh]
    )

    const regenerate = useCallback(async () => {
        if (!id) return
        setRegenerating(true)
        setError('')
        try {
            const data = await api.post<ProjectDetail>(`/projects/${id}/regenerate`)
            setProject(data)
            return data
        } catch (err: any) {
            setError(err?.message ?? 'Failed to regenerate project')
            throw err
        } finally {
            setRegenerating(false)
        }
    }, [id])

    return { project, loading, error, refresh, advanceStep, regenerate, regenerating }
}
