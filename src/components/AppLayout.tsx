import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../lib/auth'

/** Wraps protected pages: redirects to /login when signed out, renders the Sidebar shell otherwise. */
export default function AppLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white/60 text-sm animate-pulse">Loading…</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
        </div>
    )
}
