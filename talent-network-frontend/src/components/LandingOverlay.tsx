'use client';

import { Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import BrandLogo from '@/components/BrandLogo';

export default function LandingOverlay() {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    if (!isOpen || pathname !== '/') {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/65 px-4 backdrop-blur-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_24%)]" />

            <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/88 p-8 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl dark:bg-slate-950/84 sm:p-12">
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-500/18 via-cyan-400/10 to-indigo-500/18" />

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/45 dark:text-blue-300">
                        <Sparkles className="h-4 w-4" />
                        Agentic AI
                    </div>

                    <div className="mx-auto mt-8 flex justify-center">
                        <BrandLogo href="/" imageClassName="w-[16rem] sm:w-[21rem]" />
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                        NextGenius helps discover exceptional children early, verify their context, and connect them with meaningful support.
                    </p>
                    <p className="mt-5 text-sm font-medium tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Multi-agent orchestration • Real-time insights • Autonomous intelligence
                    </p>

                    <div className="mx-auto mt-8 max-w-xl rounded-[1.5rem] border border-slate-200/80 bg-white/70 px-5 py-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                            Try asking
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                            Which children need urgent funding?
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="mt-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                        Enter Platform
                    </button>
                </div>
            </div>
        </div>
    );
}
