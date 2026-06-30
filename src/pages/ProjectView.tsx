import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Loader2, Globe2, Megaphone, Palette, Package, Download, RotateCcw } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import PipelineTimeline from '../components/PipelineTimeline'
import { useProject } from '../lib/useProjects'
import { api } from '../lib/api'

export default function ProjectView() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { project, loading, error, advanceStep, refresh, regenerate, regenerating } = useProject(id)
    const [selectedPreviewPage, setSelectedPreviewPage] = useState('Landing')

    async function handleDelete() {
        if (!project) return
        if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
        try {
            await api.del(`/projects/${project.id}`)
            navigate('/dashboard')
        } catch (err: any) {
            alert(err?.message ?? 'Failed to delete project')
        }
    }

    async function handleRegenerate() {
        if (!project || regenerating) return
        try {
            await regenerate()
        } catch (err: any) {
            alert(err?.message ?? 'Failed to regenerate project')
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="p-8 flex items-center justify-center min-h-[60vh] text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading project…
                </div>
            </AppLayout>
        )
    }

    if (error || !project) {
        return (
            <AppLayout>
                <div className="p-8 max-w-2xl mx-auto">
                    <div className="glass-card p-8 text-center">
                        <p className="text-red-300 mb-4">{error || 'Project not found.'}</p>
                        <button onClick={() => navigate('/dashboard')}
                            className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </AppLayout>
        )
    }

    const steps = project.steps || []
    const stepsDone = steps.filter((s) => s.status === 'done').length
    const notesFor = (name: string) => steps.find((s) => s.step_name === name)?.notes as any
    const identity = notesFor('Identity')?.brand || {}
    const logo = notesFor('Logo') || {}
    const website = notesFor('Website')?.website || {}
    const marketing = notesFor('Marketing')?.marketing || {}
    const products = notesFor('Products')?.products || []
    const palette = Object.entries(project.brand_colors || identity.palette || {}).filter(([, value]) => typeof value === 'string') as [string, string][]
    const logoSrc = project.logo_url || logo.logoDataUrl || identity.logoDataUrl
    const websiteHtml = typeof website.html === 'string' ? website.html : ''
    const previewPages: Record<string, string> = website.previewPages && typeof website.previewPages === 'object'
        ? website.previewPages as Record<string, string>
        : { Landing: website.previewHtml || websiteHtml }
    const previewPageEntries = Object.entries(previewPages).filter(([, html]) => typeof html === 'string' && html.length > 0)
    const activePreviewPage = previewPages[selectedPreviewPage] ? selectedPreviewPage : previewPageEntries[0]?.[0] || 'Landing'
    const activePreviewHtml = previewPages[activePreviewPage] || website.previewHtml || websiteHtml
    const instagramPosts = Array.isArray(marketing.instagramPosts) ? marketing.instagramPosts : Array.isArray(marketing.ads) ? marketing.ads : []
    const websiteFiles = website.files && typeof website.files === 'object' ? website.files as Record<string, string> : {}
    const websiteFileEntries = Object.entries(websiteFiles)
        .filter(([, content]) => typeof content === 'string')
        .sort(([a], [b]) => a.localeCompare(b))
    const bundleJson = JSON.stringify({
        name: project.name,
        generated_at: new Date().toISOString(),
        files: websiteFiles,
    }, null, 2)
    const downloadName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'website'

    return (
        <AppLayout>
            <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => navigate('/dashboard')}
                            className="w-9 h-9 shrink-0 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${project.stage === 'Complete' ? 'bg-green-500/20 text-green-300' : project.stage === 'Building' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-gray-400'}`}>
                                    {project.stage}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{project.tagline || project.description || project.category}</p>
                        </div>
                    </div>
                    <button onClick={handleDelete}
                        className="shrink-0 w-9 h-9 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Build Progress</span>
                        <span className="font-medium">{project.progress}% · {stepsDone}/{steps.length} steps</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-2.5 rounded-full bg-white transition-all duration-700" style={{ width: `${project.progress}%` }} />
                    </div>
                </div>

                {(logoSrc || website.headline || instagramPosts.length > 0 || products.length > 0) && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">Generated Assets</h2>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="inline-flex items-center gap-2 text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-gray-100 transition-colors disabled:opacity-60"
                                >
                                    {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                    Regenerate
                                </button>
                                {websiteHtml && (
                                    <a
                                        href={`data:text/html;charset=utf-8,${encodeURIComponent(websiteHtml)}`}
                                        download={`${downloadName}.html`}
                                        className="inline-flex items-center gap-2 text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        <Download className="w-3 h-3" /> HTML
                                    </a>
                                )}
                                {websiteFileEntries.length > 0 && (
                                    <a
                                        href={`data:application/json;charset=utf-8,${encodeURIComponent(bundleJson)}`}
                                        download={`${downloadName}-project-bundle.json`}
                                        className="inline-flex items-center gap-2 text-xs bg-white/10 text-white px-3 py-1.5 rounded-md font-medium hover:bg-white/15 transition-colors"
                                    >
                                        <Download className="w-3 h-3" /> Full Bundle
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-4">
                            <div className="glass-card p-4 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Palette className="w-4 h-4 text-gray-400" /> Identity
                                </div>
                                {logoSrc && (
                                    <div className="h-32 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                                        <img src={logoSrc} alt={`${project.name} logo`} className="h-24 w-24 object-contain" />
                                    </div>
                                )}
                                {palette.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {palette.slice(0, 4).map(([name, color]) => (
                                            <div key={name} className="space-y-1">
                                                <div className="h-8 rounded-md border border-white/10" style={{ backgroundColor: color }} />
                                                <div className="text-[10px] text-gray-500 capitalize truncate">{name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-gray-300">{identity.positioning || project.tagline}</p>
                            </div>

                            <div className="glass-card p-4 space-y-4 lg:col-span-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Globe2 className="w-4 h-4 text-gray-400" /> Website Preview
                                </div>
                                {previewPageEntries.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {previewPageEntries.map(([page]) => (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => setSelectedPreviewPage(page)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activePreviewPage === page ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {activePreviewHtml ? (
                                    <div className="rounded-lg border border-white/10 overflow-hidden bg-white">
                                        <iframe
                                            title={`${project.name} ${activePreviewPage} preview`}
                                            srcDoc={activePreviewHtml}
                                            sandbox="allow-scripts allow-forms"
                                            className="w-full h-[calc(100vh-180px)] min-h-[720px] bg-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-white/10 bg-white text-black p-5">
                                        <h3 className="text-xl font-bold leading-tight">{website.headline || project.name}</h3>
                                        <p className="text-sm text-gray-700 mt-2">{website.subheadline || project.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {products.length > 0 && (
                                <div className="glass-card p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Package className="w-4 h-4 text-gray-400" /> 5 Pre-Products
                                    </div>
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        {products.slice(0, 5).map((item: any, index: number) => (
                                            <div key={index} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                                {item.imageDataUrl && (
                                                    <img src={item.imageDataUrl} alt={`${item.name} product preview`} className="w-full aspect-[3/2] object-cover bg-white" />
                                                )}
                                                <div className="p-3 flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-medium">{item.name}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{item.value}</div>
                                                </div>
                                                <div className="text-xs text-gray-300 shrink-0">{item.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {instagramPosts.length > 0 && (
                                <div className="glass-card p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Megaphone className="w-4 h-4 text-gray-400" /> Instagram Posters
                                    </div>
                                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                        {instagramPosts.slice(0, 4).map((post: any, index: number) => (
                                            <div key={index} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                                {post.posterDataUrl && (
                                                    <img src={post.posterDataUrl} alt={`${post.headline} Instagram poster`} className="w-full aspect-square object-cover bg-white" />
                                                )}
                                                <div className="p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-xs text-gray-500">{post.size || '1080x1080'}</div>
                                                    <a
                                                        href={post.posterDataUrl}
                                                        download={`${downloadName}-instagram-${index + 1}.svg`}
                                                        className="text-[10px] text-gray-300 hover:text-white"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                                <div className="text-sm font-medium mt-1">{post.headline}</div>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-3">{post.caption || post.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {websiteFileEntries.length > 0 && (
                            <div className="glass-card p-4 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-medium">Company App Bundle</h3>
                                        <p className="text-xs text-gray-500 mt-1">Generated frontend, TypeScript, API, database, config, and docs.</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{websiteFileEntries.length} files</span>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {websiteFileEntries.map(([path, content]) => {
                                        const isDb = path.startsWith('db/')
                                        const isTs = path.endsWith('.ts') || path.endsWith('.tsx')
                                        const type = isDb ? 'Database' : isTs ? 'TypeScript' : path.split('.').pop()?.toUpperCase() || 'FILE'
                                        return (
                                            <a
                                                key={path}
                                                href={`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`}
                                                download={path.replace(/[\\/]/g, '__')}
                                                className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium truncate">{path}</span>
                                                    <Download className="w-3 h-3 text-gray-500 shrink-0" />
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-1">{type} · {content.length.toLocaleString()} chars</div>
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Build timeline */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Build Timeline</h2>
                        <button onClick={refresh}
                            className="text-xs text-gray-400 hover:text-white transition">Refresh</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Watch your website being built. Click <span className="text-white">Complete</span> on the active step
                        to advance the AI agents through the pipeline.
                    </p>
                    <PipelineTimeline steps={steps} onComplete={(stepId) => advanceStep(stepId, 'done')} />
                </div>
            </div>
        </AppLayout>
    )
}
