import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, Check } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { api } from '../lib/api'

const categories = ['SaaS', 'E-Commerce', 'Marketplace', 'FinTech', 'Health', 'Education', 'AI/ML', 'Social', 'Productivity', 'Other']

// Stages that flash on screen as the project is created and pipeline seeds.
const creatingSteps = [
    'Saving your startup…',
    'Spinning up AI agents…',
    'Seeding the 11-step pipeline…',
    'Starting the first stage…',
]

export default function CreateStartup() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('SaaS')
    const [tagline, setTagline] = useState('')
    const [creating, setCreating] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const [error, setError] = useState('')

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setCreating(true)
        setStepIndex(0)

        // Drive the little on-screen progress animation
        const timer = setInterval(() => {
            setStepIndex((i) => Math.min(i + 1, creatingSteps.length - 1))
        }, 600)

        try {
            const project = await api.post<{ id: number }>('/projects', {
                name, description, category, tagline,
            })
            clearInterval(timer)
            // Navigate to the project view where the user watches the real build
            navigate(`/project/${project.id}`)
        } catch (err: any) {
            clearInterval(timer)
            setError(err?.message ?? 'Failed to create startup.')
            setCreating(false)
        }
    }

    if (creating) {
        return (
            <AppLayout>
                <div className="p-6 lg:p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-2">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold">Building <span className="text-white">{name}</span></h1>
                    <div className="w-full space-y-3 mt-4">
                        {creatingSteps.map((step, i) => {
                            const done = i < stepIndex
                            const active = i === stepIndex
                            return (
                                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${done ? 'bg-green-500/10 border border-green-500/20' : active ? 'bg-white/5 border border-white/10' : 'opacity-30'}`}>
                                    {done ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : active ? <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />}
                                    <span className={`text-sm ${done ? 'text-green-300' : ''}`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="text-sm text-gray-500">Your AI agents are getting to work…</div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Create a New Startup</h1>
                    <p className="text-gray-400 text-sm mt-1">Describe your idea and our AI agents will build everything for you.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Startup Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. NovaCart"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Tagline <span className="text-gray-500">(optional)</span></label>
                        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A short one-liner for your startup"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Describe your idea</label>
                        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us what you want to build — the more detail, the better."
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button key={cat} type="button" onClick={() => setCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === cat ? 'bg-white text-black' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        <Sparkles className="w-4 h-4" /> Launch with AI <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </AppLayout>
    )
}
