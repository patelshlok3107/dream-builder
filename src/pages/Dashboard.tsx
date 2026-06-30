import { useNavigate } from 'react-router-dom'
import { PlusCircle, TrendingUp, Clock, Layers, ArrowUpRight, Sparkles } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useProjects } from '../lib/useProjects'
import { formatNumber, timeAgo } from '../lib/utils'

export default function Dashboard() {
    const navigate = useNavigate()
    const { projects, loading, error } = useProjects()

    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.stage === 'Building').length
    const completedProjects = projects.filter((p) => p.stage === 'Complete').length
    const stepsDone = projects.reduce((s, p) => s + Number(p.steps_done || 0), 0)

    const stats = [
        { label: 'Total Projects', value: String(totalProjects), icon: Layers, change: '' },
        { label: 'Active (Building)', value: String(activeProjects), icon: Clock, change: '' },
        { label: 'Completed', value: String(completedProjects), icon: TrendingUp, change: '' },
        { label: 'Pipeline Steps Done', value: formatNumber(stepsDone), icon: Sparkles, change: '' },
    ]

    return (
        <AppLayout>
            <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Your Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Your private workspace — only your startups appear here</p>
                    </div>
                    <button onClick={() => navigate('/create')}
                        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        <PlusCircle className="w-4 h-4" /> New Startup
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(({ label, value, icon: Icon, change }) => (
                        <div key={label} className="glass-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{label}</span>
                                <Icon className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">{value}</span>
                                {change && (
                                    <span className="text-xs text-green-400 flex items-center gap-0.5 mb-1">
                                        <ArrowUpRight className="w-3 h-3" /> {change}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Projects */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Your Startups</h2>

                    {loading ? (
                        <div className="glass-card p-8 text-center text-gray-500 text-sm animate-pulse">Loading your projects…</div>
                    ) : error ? (
                        <div className="glass-card p-8 text-center text-red-300 text-sm border-red-500/20">{error}</div>
                    ) : projects.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                            <h3 className="font-semibold mb-1">No startups yet</h3>
                            <p className="text-gray-400 text-sm mb-6">Create your first AI-powered startup to get started.</p>
                            <button onClick={() => navigate('/create')}
                                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                <PlusCircle className="w-4 h-4" /> Create your first startup
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <button key={project.id} onClick={() => navigate(`/project/${project.id}`)}
                                    className="w-full text-left glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all group">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold group-hover:text-white transition-colors">{project.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${project.stage === 'Complete' ? 'bg-green-500/20 text-green-300' : project.stage === 'Building' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-gray-400'}`}>
                                                {project.stage}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate mt-0.5">{project.tagline || project.description || project.category}</p>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm shrink-0">
                                        <div className="text-center">
                                            <div className="text-gray-500 text-xs">Progress</div>
                                            <div className="font-medium">{project.progress}%</div>
                                        </div>
                                        <div className="text-center hidden sm:block">
                                            <div className="text-gray-500 text-xs">Steps</div>
                                            <div className="font-medium">{project.steps_done}/{project.steps_total}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{timeAgo(project.created_at)}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
