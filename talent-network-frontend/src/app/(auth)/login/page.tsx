'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.access_token, response.data.user);
            router.push('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string | string[] } } };
            const msg = error.response?.data?.message;
            if (Array.isArray(msg)) {
                setError(msg.join(', '));
            } else {
                setError(msg || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="hidden lg:block">
                    <div className="max-w-xl">
                        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                            Platform Access
                        </div>
                        <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            Step back into the network.
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                            Review sponsor activity, manage NGO workflows, and track impact through the same dashboard without changing how the app behaves.
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="glass-card panel-outline rounded-[1.75rem] p-5">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Guest Access</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Seeded Sponsor</p>
                            </div>
                            <div className="glass-card panel-outline rounded-[1.75rem] p-5">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Fast Path</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">One-click sign in</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="glass-card panel-outline mx-auto w-full max-w-md rounded-[2rem] p-8 shadow-2xl shadow-slate-900/5">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                            Welcome Back
                        </p>
                        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                            Sign in to your dashboard
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Use your account credentials or the seeded sponsor shortcut.
                        </p>
                    </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                            <input
                                type="email"
                                required
                                className="field-input dark:bg-slate-900/70 dark:text-white dark:placeholder-slate-500"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <input
                                type="password"
                                required
                                className="field-input dark:bg-slate-900/70 dark:text-white dark:placeholder-slate-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="primary-button w-full disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <div>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={async () => {
                                setError('');
                                setLoading(true);
                                try {
                                    const response = await api.post('/auth/login', {
                                        email: 'sponsor.john@example.com',
                                        password: 'password123'
                                    });
                                    login(response.data.access_token, response.data.user);
                                    router.push('/dashboard');
                                } catch {
                                    setError('Guest login failed. Did you run the database seeder?');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="secondary-button mt-3 w-full disabled:opacity-50 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                            Sign in as Guest (Sponsor)
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <span className="text-slate-600 dark:text-slate-400">Don&apos;t have an account? </span>
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Register here
                        </Link>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}
