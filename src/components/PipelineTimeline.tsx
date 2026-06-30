import { Check, Clock, Loader2, Circle, Play, Image } from 'lucide-react'
import type { PipelineStep } from '../lib/auth'
import { timeAgo } from '../lib/utils'

interface Props {
    steps: PipelineStep[]
    onComplete: (stepId: number, notes?: Record<string, unknown>) => void
    busy?: boolean
}

export default function PipelineTimeline({ steps, onComplete, busy }: Props) {
    function previewFor(step: PipelineStep) {
        if (step.status !== 'done') return null
        const name = step.step_name.toLowerCase()
        const notes = step.notes as any

        if (name === 'identity' || name === 'logo') {
            const palette = notes?.brand?.palette || notes?.palette || {}
            const colors = Object.values(palette).filter((color) => typeof color === 'string') as string[]
            const logoSrc = notes?.brand?.logoDataUrl || notes?.logoDataUrl

            return (
                <div className="mt-3 flex items-center gap-3">
                    {logoSrc && (
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                            <img src={logoSrc} alt="" className="w-9 h-9 object-contain" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 min-w-0">
                        {colors.slice(0, 5).map((c) => (
                            <div key={c} className="w-8 h-8 rounded-md border border-white/10 shrink-0" style={{ background: c }} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1 truncate">{notes?.brand?.websiteName || 'Brand palette'}</span>
                    </div>
                </div>
            )
        }

        if (name === 'website') {
            const website = notes?.website || {}
            const fileCount = website.files && typeof website.files === 'object' ? Object.keys(website.files).length : 0
            return (
                <div className="mt-3 glass-card p-3">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                        <Image className="w-3 h-3" /> Company app bundle{fileCount ? ` · ${fileCount} files` : ''}
                    </div>
                    <div className="space-y-1.5">
                        <div className="text-sm font-medium truncate">{website.headline || 'Landing page generated'}</div>
                        <div className="text-xs text-gray-400 line-clamp-2">{website.subheadline}</div>
                        {Array.isArray(website.sections) && (
                            <div className="grid grid-cols-3 gap-1.5 mt-2">
                                {website.sections.slice(0, 3).map((section: any, index: number) => (
                                    <div key={index} className="rounded bg-white/10 p-2 min-h-12">
                                        <div className="text-[10px] text-gray-300 truncate">{section.title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        if (name === 'products') {
            const products = Array.isArray(notes?.products) ? notes.products : []
            return (
                <div className="mt-3 flex flex-wrap gap-2">
                    {products.slice(0, 4).map((p: any) => (
                        <span key={p.name} className="text-xs px-2 py-1 rounded-md bg-white/10 text-gray-300">{p.name}</span>
                    ))}
                </div>
            )
        }

        if (notes?.summary) {
            return <div className="mt-2 text-xs text-gray-400 line-clamp-2">{notes.summary}</div>
        }

        return (
            <div className="mt-2 text-xs text-green-400/70">Completed{step.completed_at ? ` - ${timeAgo(step.completed_at)}` : ''}</div>
        )
    }

    return (
        <div className="relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />

            <div className="space-y-1">
                {steps.map((step) => {
                    const done = step.status === 'done'
                    const working = step.status === 'working'
                    return (
                        <div key={step.id} className="relative pl-10 py-3">
                            <div className={`absolute left-0 top-3.5 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${done ? 'bg-green-500 border-green-500' : working ? 'bg-yellow-500/20 border-yellow-400' : 'bg-black border-white/20'}`}>
                                {done ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : working ? (
                                    <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />
                                ) : (
                                    <Circle className="w-3 h-3 text-gray-600" />
                                )}
                            </div>

                            <div className={`rounded-lg px-4 py-3 ${working ? 'bg-white/5 border border-yellow-400/20' : done ? '' : 'opacity-60'}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{step.step_order}. {step.step_name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wide ${done ? 'bg-green-500/20 text-green-300' : working ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-gray-500'}`}>
                                                {step.status}
                                            </span>
                                        </div>
                                        {(step.started_at || step.completed_at) && (
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {step.completed_at
                                                    ? `Completed ${timeAgo(step.completed_at)}`
                                                    : `Started ${timeAgo(step.started_at!)}`}
                                            </div>
                                        )}
                                    </div>

                                    {working && (
                                        <button
                                            onClick={() => onComplete(step.id)}
                                            disabled={busy}
                                            className="shrink-0 inline-flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                                        >
                                            <Play className="w-3 h-3" /> Complete
                                        </button>
                                    )}
                                </div>

                                {previewFor(step)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
