import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2, Check, ImagePlus, X } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { api } from '../lib/api'

const categories = ['SaaS', 'E-Commerce', 'Marketplace', 'FinTech', 'Health', 'Education', 'AI/ML', 'Social', 'Productivity', 'Clothing', 'Food', 'Fitness', 'Other']

const creatingSteps = [
    'Saving your startup...',
    'Reading optional brand assets...',
    'Generating premium pages...',
    'Preparing products and posters...',
]

interface UploadedImage {
    name: string
    dataUrl: string
}

function readImageFile(file: File): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error(`${file.name} is not an image.`))
            return
        }
        if (file.size > 2.5 * 1024 * 1024) {
            reject(new Error(`${file.name} is larger than 2.5MB.`))
            return
        }

        const reader = new FileReader()
        reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) })
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
        reader.readAsDataURL(file)
    })
}

export default function CreateStartup() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('SaaS')
    const [tagline, setTagline] = useState('')
    const [creating, setCreating] = useState(false)
    const [stepIndex, setStepIndex] = useState(0)
    const [error, setError] = useState('')
    const [logoAsset, setLogoAsset] = useState<UploadedImage | null>(null)
    const [productAssets, setProductAssets] = useState<UploadedImage[]>([])

    async function handleLogoChange(files: FileList | null) {
        setError('')
        const file = files?.[0]
        if (!file) return
        try {
            setLogoAsset(await readImageFile(file))
        } catch (err: any) {
            setError(err?.message ?? 'Could not read logo image.')
        }
    }

    async function handleProductImagesChange(files: FileList | null) {
        setError('')
        const selected = Array.from(files || []).slice(0, 5)
        if (selected.length === 0) return
        try {
            setProductAssets(await Promise.all(selected.map(readImageFile)))
        } catch (err: any) {
            setError(err?.message ?? 'Could not read product images.')
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setCreating(true)
        setStepIndex(0)

        const timer = setInterval(() => {
            setStepIndex((i) => Math.min(i + 1, creatingSteps.length - 1))
        }, 800)

        try {
            const project = await api.post<{ id: number }>('/projects', {
                name,
                description,
                category,
                tagline,
                userAssets: {
                    logoDataUrl: logoAsset?.dataUrl || '',
                    productImages: productAssets,
                },
            })
            clearInterval(timer)
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
                                <div key={step} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${done ? 'bg-green-500/10 border border-green-500/20' : active ? 'bg-white/5 border border-white/10' : 'opacity-30'}`}>
                                    {done ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : active ? <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />}
                                    <span className={`text-sm ${done ? 'text-green-300' : ''}`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="text-sm text-gray-500">Your AI agents are creating the full site bundle...</div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Create a New Startup</h1>
                    <p className="text-gray-400 text-sm mt-1">Describe your idea. Optional logo and product images will be used directly in the generated website.</p>
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
                            placeholder="Tell us what you want to build. Mention the industry, products, style, and audience."
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

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Logo image <span className="text-gray-500">(optional)</span></label>
                                <p className="text-xs text-gray-500 mt-1">If uploaded, this logo is used across the website.</p>
                            </div>
                            {logoAsset ? (
                                <div className="flex items-center gap-3 rounded-lg bg-black/30 p-3">
                                    <img src={logoAsset.dataUrl} alt="Uploaded logo preview" className="w-14 h-14 rounded-md object-contain bg-white" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm text-white truncate">{logoAsset.name}</div>
                                        <div className="text-xs text-gray-500">Will replace generated logo</div>
                                    </div>
                                    <button type="button" onClick={() => setLogoAsset(null)} className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-black/20 text-gray-400 hover:bg-white/5 transition">
                                    <ImagePlus className="w-5 h-5" />
                                    <span className="text-xs">Choose logo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoChange(e.target.files)} />
                                </label>
                            )}
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Product images <span className="text-gray-500">(optional)</span></label>
                                <p className="text-xs text-gray-500 mt-1">Upload up to 5. They map onto generated product cards.</p>
                            </div>
                            {productAssets.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-5 gap-2">
                                        {productAssets.map((asset) => (
                                            <img key={asset.name} src={asset.dataUrl} alt={asset.name} className="aspect-square rounded-md object-cover bg-white" />
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => setProductAssets([])} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                                        <X className="w-3 h-3" /> Remove product images
                                    </button>
                                </div>
                            ) : (
                                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-black/20 text-gray-400 hover:bg-white/5 transition">
                                    <ImagePlus className="w-5 h-5" />
                                    <span className="text-xs">Choose product images</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleProductImagesChange(e.target.files)} />
                                </label>
                            )}
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
