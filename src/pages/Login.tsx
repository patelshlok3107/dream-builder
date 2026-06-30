import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signIn(email, password)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err?.message ?? 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            <div className="hidden lg:flex flex-1 flex-col justify-center px-16 border-r border-white/10">
                <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">VEX</span>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Welcome back to your AI startup command center.
                    </h1>
                    <p className="text-gray-400 leading-relaxed">
                        Your AI team has been working while you were away. Check in on your
                        startups, review progress, and keep building the future.
                    </p>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">VEX</span>
                    </div>
                    <h2 className="text-2xl font-semibold mb-1">Sign in</h2>
                    <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue.</p>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'} required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition pr-10"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50">
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don&apos;t have an account?{' '}
                        <button onClick={() => navigate('/register')} className="text-white hover:underline">Create one</button>
                    </p>
                </div>
            </div>
        </div>
    )
}
