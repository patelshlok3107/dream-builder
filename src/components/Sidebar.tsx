import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, PlusCircle, BarChart3, Sparkles,
    LogOut, Rocket
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/utils'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'New Startup', icon: PlusCircle },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
    const navigate = useNavigate()
    const { user, signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <aside className="w-64 shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-6 border-b border-white/10"
            >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-semibold tracking-tight">VEX</span>
            </button>

            {/* Nav */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + sign out */}
            <div className="px-3 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{user?.name || user?.email}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>
    )
}
