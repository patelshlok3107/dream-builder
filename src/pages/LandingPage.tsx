import { useNavigate } from 'react-router-dom'

const navLinks = ['Home', 'Studio', 'About', 'Journal', 'Reach Us']

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <main className="min-h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <section className="relative isolate min-h-screen overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
                />

                <div className="relative z-10 flex min-h-screen flex-col">
                    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
                        <a
                            href="#"
                            className="text-3xl tracking-tight text-[hsl(var(--foreground))]"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Velorah<sup className="text-xs">®</sup>
                        </a>

                        <nav className="hidden items-center gap-8 md:flex">
                            {navLinks.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className={`text-sm transition-colors ${
                                        link === 'Home'
                                            ? 'text-[hsl(var(--foreground))]'
                                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                                    }`}
                                >
                                    {link}
                                </a>
                            ))}
                        </nav>

                        <button
                            onClick={() => navigate('/login')}
                            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-[hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.03]"
                        >
                            Begin Journey
                        </button>
                    </header>

                    <div className="flex flex-1 items-center justify-center px-6 pb-16 pt-20 sm:px-8 md:px-10 lg:px-12">
                        <div className="flex w-full max-w-7xl flex-col items-center text-center">
                            <h1
                                className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                Where <em className="not-italic text-[hsl(var(--muted-foreground))]">dreams</em> rise{' '}
                                <em className="not-italic text-[hsl(var(--muted-foreground))]">through the silence.</em>
                            </h1>

                            <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
                                We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
                            </p>

                            <button
                                onClick={() => navigate('/register')}
                                className="animate-fade-rise-delay-2 liquid-glass mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-[hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.03]"
                            >
                                Begin Journey
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
