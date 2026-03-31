'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, PlayCircle, MapPin, School, ChevronLeft, ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getGuardianGalleryChildren, mergeChildrenWithGuardianProfiles } from '@/lib/mockGuardianProfiles';

interface Child {
    id: string;
    name: string;
    dob: string;
    talentCategory: string;
    status: 'PENDING' | 'VERIFIED';
    city?: string;
    location?: string;
    pleaVideoUrl?: string;
    mediaUrls?: string[];
    ngo: { name: string; region: string };
    isMockProfile?: boolean;
}

function resolvePleaVideoUrl(child: Child) {
    if (child.name === 'Aisha Mwangi') {
        return '/aisha-mwangi-math-plea.mp4';
    }

    return child.pleaVideoUrl;
}

export default function ExplorePage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        const mockChildren = getGuardianGalleryChildren();

        try {
            setLoading(true);
            setFetchError('');
            const res = await api.get('/children');
            const apiChildren = res.data as Child[];
            // Mock or random sort to simulate "explore" feel
            setChildren(mergeChildrenWithGuardianProfiles(apiChildren, mockChildren).sort(() => Math.random() - 0.5));
        } catch (err: unknown) {
            console.error('Failed to fetch children for explore:', err);
            if (mockChildren.length > 0) {
                setChildren(mockChildren.sort(() => Math.random() - 0.5));
            } else {
                setFetchError('Failed to load the gallery. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="glass-card p-10 rounded-3xl text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 font-bold text-3xl">!</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{fetchError}</p>
                    <button onClick={fetchChildren} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95">
                        Retry Call
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-32 px-4 selection:bg-indigo-200">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-16 text-center">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 glass text-indigo-800 dark:text-indigo-200 font-medium mb-6 shadow-sm">
                    <Search className="w-4 h-4 text-indigo-500" />
                    <span>Explore Verified Talent Gallery</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
                    Discover and <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Sponsor</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-3xl mx-auto">
                    Browse sponsor-ready profiles of gifted children that have already passed verification. Guests can explore freely, while signed-in sponsors can pledge instantly.
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Only verified children are shown here
                </motion.p>
            </header>

            {/* Grid */}
            <div className="max-w-7xl mx-auto">
                {children.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-3xl">
                        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">No profiles currently available</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {children.map(child => (
                            <KidCard key={child.id} child={child} isAuthenticated={isAuthenticated} router={router} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Complex Kid Card Component
function KidCard({ child, isAuthenticated, router }: { child: Child, isAuthenticated: boolean, router: ReturnType<typeof useRouter> }) {
    const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
    const [amount, setAmount] = useState(100);
    const [pledging, setPledging] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSupporting, setIsSupporting] = useState(false);

    // Pre-process media: combine video(s) and images if they exist
    const allMedia: { type: 'video' | 'image', url: string }[] = [];
    const pleaVideoUrl = resolvePleaVideoUrl(child);

    if (pleaVideoUrl) {
        allMedia.push({ type: 'video', url: pleaVideoUrl });
    }
    if (child.mediaUrls && child.mediaUrls.length > 0) {
        child.mediaUrls.forEach(url => allMedia.push({ type: 'image', url }));
    }

    const nextMedia = () => setCurrentMediaIdx((prev) => (prev + 1) % allMedia.length);
    const prevMedia = () => setCurrentMediaIdx((prev) => (prev - 1 + allMedia.length) % allMedia.length);

    const openPledgeModal = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/explore');
            return;
        }

        setErrorMsg('');
        setSuccessMsg('');
        setIsModalOpen(true);
    };

    const handlePledge = async (e: React.FormEvent) => {
        e.preventDefault();

        setPledging(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (child.isMockProfile) {
                setIsSupporting(true);
                setSuccessMsg('Thank you for supporting this child');
                setTimeout(() => {
                    setIsModalOpen(false);
                }, 1200);
                return;
            }

            const res = await api.post('/sponsorships/pledge', {
                childId: child.id,
                amount: Number(amount)
            });

            if (res.data?.message) {
                setIsSupporting(true);
                setSuccessMsg('Thank you for supporting this child');
                setTimeout(() => {
                    setIsModalOpen(false);
                }, 1200);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setErrorMsg(error.response?.data?.message || 'Failed to process pledge');
        } finally {
            setPledging(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} className="glass-card rounded-[2rem] overflow-hidden flex flex-col group border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
            {/* Gallery Section */}
            <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex-shrink-0">
                {allMedia.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div key={currentMediaIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
                            {allMedia[currentMediaIdx].type === 'video' ? (
                                <div className="relative w-full h-full">
                                    <video src={allMedia[currentMediaIdx].url} controls controlsList="nodownload" className="w-full h-full object-cover" poster={allMedia.length > 1 ? allMedia[1].url : undefined}></video>
                                    {!allMedia[currentMediaIdx].url.includes('blob') && <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center text-xs font-bold text-white uppercase tracking-wider"><PlayCircle className="w-3 h-3 mr-1.5 text-red-500" /> Plea Video</div>}
                                </div>
                            ) : (
                                <Image src={allMedia[currentMediaIdx].url} alt={child.name} fill className="object-cover" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-b border-white/10">
                        <School className="w-16 h-16 text-indigo-300/50 mb-3" />
                        <span className="text-sm font-medium text-indigo-200/70">No media available</span>
                    </div>
                )}

                {/* Gallery Navigation */}
                {allMedia.length > 1 && (
                    <>
                        <button onClick={prevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10">
                            <ChevronLeft className="w-5 h-5 -ml-0.5" />
                        </button>
                        <button onClick={nextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10">
                            <ChevronRight className="w-5 h-5 -mr-0.5" />
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {allMedia.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentMediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}></div>
                            ))}
                        </div>
                    </>
                )}

                {/* Badges Overlaid */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 shadow-lg backdrop-blur-md">
                        {child.talentCategory}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100/95 text-emerald-700 shadow-lg backdrop-blur-md dark:bg-emerald-900/80 dark:text-emerald-300">
                        {child.status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                    </span>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-6 pb-4 flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {child.name}
                    </h2>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            {child.dob ? `${new Date().getFullYear() - new Date(child.dob).getFullYear()} yrs old` : 'Age N/A'}
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2 leading-snug">{child.location || child.city || child.ngo.region}, Verified by {child.ngo.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-20 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex justify-between items-center">
                        Demo Sponsorship
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px]">No Payment Gateway</span>
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Simulate a support pledge for this child with a simple sponsor action.
                    </p>
                    {successMsg && <div className="text-emerald-500 text-xs font-bold text-center mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> {successMsg}</div>}
                    <button
                        type="button"
                        onClick={openPledgeModal}
                        disabled={isSupporting}
                        className="mt-1 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100"
                    >
                        <Heart className="w-4 h-4 fill-white/20" />
                        {isSupporting ? 'You are supporting this child' : 'Support this child'}
                    </button>
                    {!isAuthenticated && (
                        <p className="text-[10px] text-center text-slate-500 mt-1 font-medium">Log in as a sponsor to create a demo pledge.</p>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            className="glass-card w-full max-w-md rounded-[2rem] p-6 shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Support {child.name}</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Enter a demo pledge amount to simulate sponsorship without real payment processing.
                            </p>

                            <form onSubmit={handlePledge} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Pledge amount</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 font-bold text-slate-500">$</span>
                                        <input
                                            type="number"
                                            min="10"
                                            step="10"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 font-bold text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {errorMsg && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">{errorMsg}</div>}
                                {successMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">{successMsg}</div>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={pledging || isSupporting}
                                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                                    >
                                        {pledging ? 'Processing...' : 'Confirm Pledge'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
