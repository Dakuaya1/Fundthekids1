'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function AboutCreator() {
    const [imageMissing, setImageMissing] = useState(false);

    return (
        <aside className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500/12 via-indigo-500/10 to-transparent" />

            <div className="relative z-10 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Built with Agentic AI
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
                        {imageMissing ? (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
                                PS
                            </div>
                        ) : (
                            <Image
                                src="/profile.jpg"
                                alt="Priyanshu Sharma"
                                fill
                                sizes="72px"
                                className="object-cover"
                                onError={() => setImageMissing(true)}
                            />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Priyanshu Sharma</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            AI Engineer | Full Stack Developer
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Built an Agentic AI platform using LangChain, LangGraph, and multi-agent orchestration to automate real-world decision-making.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="https://www.linkedin.com/in/priyanshu-sharma"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:text-blue-300"
                    >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                    </Link>
                    <Link
                        href="https://github.com/priyanshusharma"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                    </Link>
                </div>
            </div>
        </aside>
    );
}
