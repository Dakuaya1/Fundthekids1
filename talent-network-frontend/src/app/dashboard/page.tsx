'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { LogOut, User, Loader2 } from 'lucide-react';
import NgoDashboard from '@/components/dashboard/NgoDashboard';
import SponsorDashboard from '@/components/dashboard/SponsorDashboard';
import ImpactWidget from '@/components/dashboard/ImpactWidget';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
import AIAssistant from '@/components/AIAssistant';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [paymentToast, setPaymentToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (authLoading) return;
        
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Parse local browser URL to avoid Next.js build warnings with unwrapped useSearchParams
        const params = new URLSearchParams(window.location.search);
        const paymentOutcome = params.get('payment');
        if (paymentOutcome === 'success') {
            setPaymentToast({ type: 'success', message: 'Sponsorship pledge successfully processed via Stripe! Thank you.' });
            window.history.replaceState(null, '', window.location.pathname);
        } else if (paymentOutcome === 'cancel') {
            setPaymentToast({ type: 'error', message: 'Payment flow was cancelled. You can try again later.' });
            window.history.replaceState(null, '', window.location.pathname);
        }

        const fetchProfile = async () => {
            try {
                await api.get(`/users/${user?.id}`);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    logout();
                    return;
                }
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id && !authLoading) {
            fetchProfile();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, logout, router, user?.id]);

    if (loading || authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Talent Network
                            </span>
                        </div>
                        <div className="flex items-center space-x-5">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">
                                {user?.email}
                            </span>
                            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-red-200 dark:border-red-900/50 text-sm font-semibold rounded-full text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
                {/* Payment Toast Notification */}
                {paymentToast && (
                    <div className={`px-4 py-3 rounded-lg shadow-md font-medium flex justify-between items-center ${paymentToast.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'} mx-4 sm:mx-0 animate-in fade-in slide-in-from-top-4`}>
                        <span>{paymentToast.message}</span>
                        <button onClick={() => setPaymentToast(null)} className="opacity-70 hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                )}

                {/* Header */}
                <div className="px-4 sm:px-0">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2rem] shadow-xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10">
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                                Welcome to your Dashboard
                            </h1>
                            <p className="mt-2 max-w-2xl text-lg text-blue-100/90 font-light">
                                You are logged in as a <strong className="font-semibold text-white bg-white/20 px-3 py-1 rounded-full text-sm inline-block ml-1">{user?.role}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Role bypasses standard layout */}
                {user?.role === 'ADMIN' ? (
                    <div className="px-4 sm:px-0">
                        <AdminDashboard />
                    </div>
                ) : (
                    <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {user?.role === 'NGO' && <NgoDashboard />}
                            {user?.role === 'SPONSOR' && <SponsorDashboard />}
                            {user?.role === 'VOLUNTEER' && <VolunteerDashboard />}
                        </div>

                        {/* Sidebar Area */}
                        <div className="lg:col-span-1 space-y-8">
                            {(user?.role === 'SPONSOR' || user?.role === 'VOLUNTEER') && (
                                <ImpactWidget />
                            )}

                            <AIAssistant />

                            {/* Profile Details Container */}
                            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Credentials
                                </h2>
                                <dl className="space-y-5 relative z-10">
                                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                                        <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email</dt>
                                        <dd className="text-sm font-medium text-slate-900 dark:text-white break-all">{user?.email}</dd>
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                                        <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Access Level</dt>
                                        <dd className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            {user?.role}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
