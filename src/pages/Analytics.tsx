import { Layers, Clock, Sparkles, Activity, Loader2, LogIn, FolderPlus, CheckCircle2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAnalytics } from '../lib/useAnalytics'
import { formatNumber, timeAgo } from '../lib/utils'

const ACTION_LABELS: Record<string, string> = {
    login: 'Signed in',
    register: 'Created account',
    create_project: 'Created a project',
    delete_project: 'Deleted a project',
    complete_step: 'Completed a pipeline step',
}

const ACTION_ICONS: Record<string, typeof LogIn> = {
    login: LogIn,
    register: Sparkles,
    create_project: FolderPlus,
    delete_project: FolderPlus,
    complete_step: CheckCircle2,
}

export default function Analytics() {
    const { data, loading, error } = useAnalytics()

    if (loading) {
        return (
            <AppLayout>
                <div className="p-8 flex items-center justify-center min-h-[60vh] text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading analytics…
                </div>
            </AppLayout>
        )
    }

    if (error || !data) {
        return (
            <AppLayout>
                <div className="p-8 max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center text-red-300">{error || 'Failed to load analytics.'}</div>
                </div>
            </AppLayout>
        )
    }

    const s = data.stats
    const kpis = [
        { label: 'Total Projects', value: s.total_projects, icon: Layers },
        { label: 'Active (Building)', value: s.active_projects, icon: Clock },
        { label: 'Completed', value: s.completed_projects, icon: CheckCircle2 },
        { label: 'Steps Completed', value: `${s.steps_completed}/${s.steps_total}`, icon: Sparkles },
    ]

    const maxDaily = Math.max(1, ...data.dailyActivity.map((d) => Number(d.count)))
    const maxAction = Math.max(1, ...data.actionDist.map((a) => Number(a.count)))

    return (
        <AppLayout>
            <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time activity and build metrics from your account</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="glass-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{label}</span>
                                <Icon className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="text-2xl font-bold">{value}</div>
                        </div>
                    ))}
                </div>

                {/* Charts + breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Daily activity chart */}
                    <div className="glass-card p-5 space-y-4">
                        <h3 className="font-semibold">Activity (last 30 days)</h3>
                        {data.dailyActivity.length === 0 ? (
                            <p className="text-sm text-gray-500 py-8 text-center">No activity yet this month.</p>
                        ) : (
                            <div className="flex items-end gap-1 h-40">
                                {data.dailyActivity.map((d) => (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div className="w-full rounded-t bg-white/60 hover:bg-white transition-all" style={{ height: `${(Number(d.count) / maxDaily) * 100}%` }} />
                                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition bg-black border border-white/10 text-xs px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                            {d.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action distribution */}
                    <div className="glass-card p-5 space-y-4">
                        <h3 className="font-semibold">Actions Breakdown</h3>
                        {data.actionDist.length === 0 ? (
                            <p className="text-sm text-gray-500 py-8 text-center">No actions recorded yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.actionDist.map((a) => (
                                    <div key={a.action} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{ACTION_LABELS[a.action] || a.action}</span>
                                            <span className="text-gray-500">{a.count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/10">
                                            <div className="h-1.5 rounded-full bg-white/60" style={{ width: `${(Number(a.count) / maxAction) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Project breakdown */}
                <div className="glass-card p-5 space-y-4">
                    <h3 className="font-semibold">Project Progress</h3>
                    {data.projectBreakdown.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">No projects yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {data.projectBreakdown.map((p) => (
                                <div key={p.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="text-gray-500 text-xs">{p.progress}% · {p.steps_done}/{p.steps_total} steps</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/10">
                                        <div className="h-2 rounded-full bg-white/60 transition-all" style={{ width: `${p.progress}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Activity feed */}
                <div className="glass-card p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <h3 className="font-semibold">Recent Activity</h3>
                    </div>
                    {data.activity.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">No activity yet.</p>
                    ) : (
                        <div className="space-y-1">
                            {data.activity.slice(0, 20).map((entry) => {
                                const Icon = ACTION_ICONS[entry.action] || Activity
                                const label = ACTION_LABELS[entry.action] || entry.action
                                const detail = (entry.details as any)?.project_name || (entry.details as any)?.step_name
                                return (
                                    <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-gray-300" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-sm">{label}</span>
                                            {detail && <span className="text-sm text-gray-500"> · {detail}</span>}
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0">{timeAgo(entry.created_at)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-600">
                    Total tracked actions: {formatNumber(Number(s.total_actions))} · Logins: {s.total_logins}
                </p>
            </div>
        </AppLayout>
    )
}
