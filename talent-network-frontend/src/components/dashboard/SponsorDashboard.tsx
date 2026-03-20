import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Star, BookOpen, GraduationCap, Sparkles, School, Trophy, Medal } from 'lucide-react';

interface Child {
    id: string;
    name: string;
    dob: string;
    talentCategory: string;
    aiSummary?: string;
    ngo: { name: string; region: string };
}

interface SponsorScore {
    id: string;
    impactScore: number;
    weeklyImpactScore: number;
    user: { email: string };
}

export default function SponsorDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    // Gamification State
    const [leaderboard, setLeaderboard] = useState<SponsorScore[]>([]);
    const [sponsorOfWeek, setSponsorOfWeek] = useState<SponsorScore | null>(null);

    // Modal State
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [planCategory, setPlanCategory] = useState('EDUCATION');
    const [planType, setPlanType] = useState('MONTHLY');
    const [amount, setAmount] = useState(50);
    const [pledging, setPledging] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Report Timeline State
    const [viewingChild, setViewingChild] = useState<Child | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setFetchError('');
            const results = await Promise.allSettled([
                api.get('/children'),
                api.get('/gamification/leaderboard'),
                api.get('/gamification/sponsor-of-week')
            ]);

            const [childrenRes, leaderboardRes, weekRes] = results;

            if (childrenRes.status === 'fulfilled') {
                setChildren(childrenRes.value.data);
            } else {
                setChildren([]);
                console.warn('Failed to load children data');
            }

            if (leaderboardRes.status === 'fulfilled') {
                setLeaderboard(leaderboardRes.value.data);
            } else {
                setLeaderboard([]);
                console.warn('Failed to load leaderboard data');
            }

            if (weekRes.status === 'fulfilled') {
                setSponsorOfWeek(weekRes.value.data);
            } else {
                setSponsorOfWeek(null);
                console.warn('Failed to load sponsor of week data');
            }

            // Show a generic error only if the primary content (children) fails
            if (childrenRes.status === 'rejected') {
                setFetchError('Failed to load main dashboard data. Please try again.');
            }
        } catch {
            // Should rarely hit this since Promise.allSettled catches internal rejections
            setFetchError('An unexpected networking error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handlePledge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChild) return;

        setPledging(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const res = await api.post('/sponsorships/plan', {
                childId: selectedChild.id,
                category: planCategory,
                type: planType,
                amount: Number(amount)
            });

            if (res.data?.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            } else {
                setSuccessMsg(`Successfully sponsored ${selectedChild.name}!`);
                setTimeout(() => {
                    setSelectedChild(null);
                    setSuccessMsg('');
                }, 2500);
            }

        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string | string[] } } };
            setErrorMsg(error.response?.data?.message as string || 'Failed to process pledge');
        } finally {
            setPledging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-16">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4 glass-card rounded-[2rem] border-dashed">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="text-red-500 dark:text-red-400 font-bold text-3xl">!</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connection Error</h3>
                <p className="text-slate-500 dark:text-slate-400 font-light">{fetchError}</p>
                <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md font-bold mt-4 hover:bg-indigo-700 transition active:scale-95">
                    Retry Fetching Data
                </button>
            </div>
        );
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8 relative">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2rem] p-8"
            >
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center mb-2 tracking-tight">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    Transform a Life Today
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-light max-w-2xl">
                    Browse verified profiles of exceptionally gifted children awaiting your generous support to foster their talents.
                </p>
            </motion.div>

            {children.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-16 glass-card rounded-[2rem] border-dashed"
                >
                    <BookOpen className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No children available</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-light">Check back later for newly onboarded profiles.</p>
                </motion.div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-8 sm:grid-cols-2 flex-grow"
                    >
                        {children.map((child) => (
                            <motion.div
                                key={child.id}
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                                className="glass-card rounded-3xl overflow-hidden flex flex-col group relative"
                            >
                                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>

                                <div className="px-8 pt-8 pb-6 flex-1 relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 dark:bg-slate-800/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm backdrop-blur-md">
                                            {child.talentCategory}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white truncate mb-3">
                                        {child.name}
                                    </h3>
                                    <div className="space-y-2">
                                        <p suppressHydrationWarning className="text-[15px] text-slate-600 dark:text-slate-400 font-light flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                            {new Date().getFullYear() - new Date(child.dob).getFullYear()} years old
                                        </p>
                                        <p className="text-[15px] text-slate-600 dark:text-slate-400 font-light flex items-center gap-2 line-clamp-1">
                                            <School className="w-4 h-4 text-slate-400" />
                                            {child.ngo ? child.ngo.name : 'Unknown NGO'}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/50 dark:border-slate-700/50 flex space-x-3 relative z-10">
                                    <button
                                        onClick={() => setSelectedChild(child)}
                                        className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-md shadow-indigo-500/20 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        Sponsor
                                    </button>
                                    <button
                                        onClick={() => setViewingChild(child)}
                                        className="flex-shrink-0 inline-flex justify-center items-center px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all backdrop-blur-md"
                                        title="View Progress Updates"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Gamification Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-80 space-y-6 flex-shrink-0"
                    >
                        {/* Sponsor of the Week Card */}
                        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full group-hover:bg-yellow-400/20 transition-all duration-500"></div>

                            <div className="flex items-center space-x-3 mb-4 relative z-10">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Sponsor of the Week
                                </h3>
                            </div>

                            {sponsorOfWeek ? (
                                <div className="space-y-2 relative z-10">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {sponsorOfWeek.user.email.split('@')[0]}
                                    </p>
                                    <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                        <Trophy className="w-4 h-4 mr-1.5" />
                                        {sponsorOfWeek.weeklyImpactScore} Weekly Points
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-light relative z-10">
                                    No sponsors active this week yet. Be the first!
                                </p>
                            )}
                        </div>

                        {/* Leaderboard Card */}
                        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full"></div>

                            <div className="flex items-center space-x-3 mb-6 relative z-10">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                    <Medal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Top Sponsors
                                </h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((sponsor, index) => (
                                        <div key={sponsor.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50">
                                            <div className="flex items-center space-x-3 truncate">
                                                <div className="flex-shrink-0 w-6 text-center font-bold text-slate-400 dark:text-slate-500">
                                                    #{index + 1}
                                                </div>
                                                <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {sponsor.user.email.split('@')[0]}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                {sponsor.impactScore} <span className="text-[10px] text-slate-500 font-normal uppercase ml-0.5">pts</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 font-light">
                                        Leaderboard is empty
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Sponsor Modal Form */}
            <AnimatePresence>
                {selectedChild && (
                    <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full">
                        <div className="flex items-center justify-center min-h-screen p-4 text-center">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                                onClick={() => setSelectedChild(null)}
                            />

                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                className="inline-block align-bottom glass-card rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20 relative z-50"
                            >
                            <div className="px-6 pt-8 pb-6 sm:p-8">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 sm:mx-0">
                                        <Heart className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left w-full">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            Pledge Sponsorship
                                        </h3>
                                        <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-400 font-light">
                                            You are setting up a sponsorship plan for <strong className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedChild.name}</strong>.
                                        </p>

                                        <form onSubmit={handlePledge} className="mt-8 space-y-6 text-left">
                                            {successMsg && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800 font-medium">
                                                    {successMsg}
                                                </div>
                                            )}
                                            {errorMsg && (
                                                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-800 font-medium">
                                                    {errorMsg}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Plan Category</label>
                                                <select
                                                    value={planCategory}
                                                    onChange={(e) => setPlanCategory(e.target.value)}
                                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm"
                                                >
                                                    <option value="EDUCATION">Education & School Fee</option>
                                                    <option value="LODGING">Lodging & Housing</option>
                                                    <option value="SPORTS">Sports & Athletics Activity</option>
                                                    <option value="SPECIAL_GIFT">Special Gift</option>
                                                    <option value="OTHER">Other Fund</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Plan Type</label>
                                                    <select
                                                        value={planType}
                                                        onChange={(e) => setPlanType(e.target.value)}
                                                        className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm"
                                                    >
                                                        <option value="MONTHLY">Monthly</option>
                                                        <option value="ONE_TIME">One-time</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Amount (USD)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={amount}
                                                        onChange={(e) => setAmount(Number(e.target.value))}
                                                        className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedChild(null)}
                                                    className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={pledging || !!successMsg}
                                                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                    {pledging ? 'Processing...' : 'Confirm Pledge'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Updates Modal */}
            <AnimatePresence>
                {viewingChild && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen p-4 text-center">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                                onClick={() => setViewingChild(null)}
                            />

                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                                className="inline-block align-bottom glass-card rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-white/20 relative z-50"
                            >
                                <div className="px-6 pt-8 pb-6 sm:p-8">
                                    <div className="flex items-start gap-4 sm:gap-5">
                                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                                            <Star className="w-5 h-5 text-white fill-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <span className="truncate">Progress: {viewingChild.name}</span>
                                            </h3>
                                            <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-400 font-light">
                                                Verified update summaries and progress insights for this child appear here as reports are uploaded.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-100 dark:border-blue-900 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <BookOpen className="w-24 h-24" />
                                        </div>
                                        <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider flex items-center">
                                            <Sparkles className="w-4 h-4 mr-2" /> AI Summary Insight
                                        </h4>
                                        {viewingChild.aiSummary ? (
                                            <p className="text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed relative z-10 font-light">
                                                &quot;{viewingChild.aiSummary}&quot;
                                            </p>
                                        ) : (
                                            <p className="text-slate-500 dark:text-slate-400 font-light relative z-10">
                                                No verified progress reports have been uploaded for {viewingChild.name.split(' ')[0]} yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 sm:px-8 flex justify-end border-t border-slate-200/50 dark:border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={() => setViewingChild(null)}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
