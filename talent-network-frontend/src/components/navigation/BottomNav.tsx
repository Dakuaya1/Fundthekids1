'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogIn, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4">
            <div className="glass panel-outline flex items-center gap-1.5 rounded-[2rem] px-2.5 py-2 shadow-2xl shadow-blue-500/10">
                <Link
                    href="/"
                    className={`flex min-w-[5.5rem] items-center justify-center gap-2 px-4 py-3 rounded-[1.35rem] font-medium text-sm transition-all ${pathname === '/'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/70'
                        }`}
                >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                <Link
                    href="/explore"
                    className={`flex min-w-[5.5rem] items-center justify-center gap-2 px-4 py-3 rounded-[1.35rem] font-medium text-sm transition-all ${pathname.startsWith('/explore')
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/70'
                        }`}
                >
                    <Compass className="w-4 h-4" />
                    <span className="hidden sm:inline">Explore</span>
                </Link>

                {isAuthenticated ? (
                    <Link
                        href="/dashboard"
                        className={`flex min-w-[6.5rem] items-center justify-center gap-2 px-4 py-3 rounded-[1.35rem] font-medium text-sm transition-all ${pathname.startsWith('/dashboard')
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/70'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className={`flex min-w-[5.5rem] items-center justify-center gap-2 px-4 py-3 rounded-[1.35rem] font-medium text-sm transition-all ${pathname === '/login'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/70'
                            }`}
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="hidden sm:inline">Login</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
