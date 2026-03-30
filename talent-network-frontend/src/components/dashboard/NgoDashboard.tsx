import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, Variants } from 'framer-motion';
import { UserPlus, Users, Loader2, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Child {
    id: string;
    name: string;
    dob: string;
    talentCategory: string;
    isActive: boolean;
    status: 'PENDING' | 'VERIFIED';
    guardian?: {
        fullName: string;
        region: string;
        organizationName?: string | null;
    } | null;
}

interface AvailableGuardian {
    user: { id: string; email: string };
    fullName: string;
    region: string;
    organizationName?: string | null;
    specialties: string[];
    _count: { assignedChildren: number };
}

export default function NgoDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [guardians, setGuardians] = useState<AvailableGuardian[]>([]);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [talentCategory, setTalentCategory] = useState('');
    const [city, setCity] = useState('');
    const [location, setLocation] = useState('');
    const [pleaVideoUrl, setPleaVideoUrl] = useState('');
    const [mediaUrls, setMediaUrls] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Report Modal State
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [reportContent, setReportContent] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportMsg, setReportMsg] = useState('');
    const [verifyingChildId, setVerifyingChildId] = useState<string | null>(null);
    const [assigningChildId, setAssigningChildId] = useState<string | null>(null);
    const [guardianSelections, setGuardianSelections] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchChildren();
        fetchGuardians();
    }, []);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ngo/children');
            setChildren(res.data);
        } catch (err) {
            console.error('Failed to fetch children', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGuardians = async () => {
        try {
            const res = await api.get('/guardian/available');
            setGuardians(res.data);
        } catch (err) {
            console.error('Failed to fetch guardians', err);
        }
    };

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            const dobIso = new Date(dob).toISOString();

            // Convert comma-separated string to array
            const mediaUrlsArray = mediaUrls
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            await api.post('/ngo/children', {
                name,
                dob: dobIso,
                talentCategory,
                city,
                location,
                pleaVideoUrl: pleaVideoUrl || undefined,
                mediaUrls: mediaUrlsArray.length > 0 ? mediaUrlsArray : undefined
            });

            setName('');
            setDob('');
            setTalentCategory('');
            setCity('');
            setLocation('');
            setPleaVideoUrl('');
            setMediaUrls('');
            setShowForm(false);
            fetchChildren();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string | string[] } } };
            setFormError(error.response?.data?.message as string || 'Failed to onboard child');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChildId) return;

        setReportSubmitting(true);
        setReportMsg('');

        try {
            await api.post(`/children/${selectedChildId}/reports`, { content: reportContent });
            setReportMsg('Successfully submitted and analyzed report!');
            setTimeout(() => {
                setSelectedChildId(null);
                setReportContent('');
                setReportMsg('');
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string | string[] } } };
            setReportMsg(error.response?.data?.message as string || 'Failed to submit report');
        } finally {
            setReportSubmitting(false);
        }
    };

    const handleVerifyChild = async (childId: string) => {
        try {
            setVerifyingChildId(childId);
            await api.post(`/ngo/verify-child/${childId}`);
            await fetchChildren();
        } catch (err) {
            console.error('Failed to verify child', err);
        } finally {
            setVerifyingChildId(null);
        }
    };

    const handleAssignGuardian = async (childId: string) => {
        const guardianUserId = guardianSelections[childId];
        if (!guardianUserId) return;

        try {
            setAssigningChildId(childId);
            await api.post('/guardian/assign-child', { childId, guardianUserId });
            await fetchChildren();
        } catch (err) {
            console.error('Failed to assign guardian', err);
        } finally {
            setAssigningChildId(null);
        }
    };

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
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card rounded-[2rem] p-8"
            >
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        Onboarded Children
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 font-light max-w-xl">
                        Manage child submissions, move verified profiles into public discovery, and submit regular progress reports to keep sponsors updated.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {showForm ? 'Cancel Onboarding' : 'Onboard New Child'}
                </button>
            </motion.div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    className="glass-card rounded-3xl p-8 border-l-4 border-l-blue-500 overflow-hidden"
                >
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Child Onboarding Form</h3>
                    <p className="mb-6 text-sm font-medium text-amber-700 dark:text-amber-300">
                        New child profiles start in Pending Verification and stay hidden from Explore until they are approved.
                    </p>
                    <form onSubmit={handleAddChild} className="space-y-6">
                        {formError && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-200 dark:border-red-800 font-medium">
                                {formError}
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                    placeholder="e.g. Alex Johnson"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Talent Category</label>
                                <select
                                    required
                                    value={talentCategory}
                                    onChange={(e) => setTalentCategory(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Education">Education & Academics</option>
                                    <option value="Sports">Sports & Athletics</option>
                                    <option value="Music">Music & Performing Arts</option>
                                    <option value="Arts">Visual Arts</option>
                                    <option value="Technology">Technology & Coding</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                                <input
                                    type="text"
                                    required
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                    placeholder="e.g. Nairobi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location/Neighborhood</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                    placeholder="e.g. Kibera"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Plea Video URL (Optional)</label>
                                <input
                                    type="url"
                                    value={pleaVideoUrl}
                                    onChange={(e) => setPleaVideoUrl(e.target.value)}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all"
                                    placeholder="e.g. https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Other Media URLs (Images/Videos, comma-separated)</label>
                                <textarea
                                    value={mediaUrls}
                                    onChange={(e) => setMediaUrls(e.target.value)}
                                    rows={3}
                                    className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all resize-none"
                                    placeholder="e.g. https://example.com/art1.jpg, https://example.com/art2.jpg"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center px-8 py-3 border border-transparent shadow-lg shadow-blue-500/20 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {submitting ? 'Registering...' : 'Register Child'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center p-16">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
            ) : children.length === 0 && !showForm ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-16 glass-card rounded-[2rem] border-dashed"
                >
                    <Users className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No children onboarded</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-light">You haven&apos;t onboarded any children yet. Click the button above to start.</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-card rounded-[2rem] overflow-hidden"
                >
                    <ul className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                        {children.map((child) => (
                            <motion.li key={child.id} variants={itemVariants} className="transition-colors hover:bg-white/40 dark:hover:bg-slate-800/40">
                                <div className="px-8 py-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{child.name}</p>
                                        <div className="ml-2 flex-shrink-0 flex gap-2">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wider rounded-full bg-white/50 dark:bg-slate-800/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm backdrop-blur-md">
                                                {child.talentCategory}
                                            </span>
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wider rounded-full border shadow-sm backdrop-blur-md ${child.status === 'VERIFIED'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                                }`}>
                                                {child.status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                                            </span>
                                            <p className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm backdrop-blur-md ${child.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>
                                                {child.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:flex sm:justify-between sm:items-center">
                                        <div className="sm:flex">
                                            <div className="space-y-2">
                                                <p className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-light gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    Born: <time suppressHydrationWarning dateTime={child.dob} className="font-medium text-slate-700 dark:text-slate-300">{new Date(child.dob).toLocaleDateString()}</time>
                                                </p>
                                                {child.guardian ? (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Assigned guardian: <span className="font-semibold text-slate-800 dark:text-slate-200">{child.guardian.fullName}</span>
                                                    </p>
                                                ) : child.status === 'VERIFIED' ? (
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                        <select
                                                            value={guardianSelections[child.id] || ''}
                                                            onChange={(e) => setGuardianSelections(prev => ({ ...prev, [child.id]: e.target.value }))}
                                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                        >
                                                            <option value="">Assign a guardian</option>
                                                            {guardians.map((guardian) => (
                                                                <option key={guardian.user.id} value={guardian.user.id}>
                                                                    {guardian.fullName} • {guardian.region} • {guardian._count.assignedChildren} cases
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleAssignGuardian(child.id)}
                                                            disabled={!guardianSelections[child.id] || assigningChildId === child.id}
                                                            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                                                        >
                                                            {assigningChildId === child.id ? 'Assigning...' : 'Assign Guardian'}
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center text-sm sm:mt-0">
                                            {child.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleVerifyChild(child.id)}
                                                    disabled={verifyingChildId === child.id}
                                                    className="mr-3 inline-flex items-center justify-center px-4 py-2 border border-emerald-200 dark:border-emerald-900/50 shadow-sm text-sm font-bold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                                                >
                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                    {verifyingChildId === child.id ? 'Verifying...' : 'Verify Child'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedChildId(child.id)}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-blue-200 dark:border-blue-900/50 shadow-sm text-sm font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all backdrop-blur-md"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                Add Progress Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Modal for Reports */}
            {selectedChildId && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedChildId(null)}></div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-block align-bottom glass-card rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20 relative z-50"
                        >
                            <div className="px-6 pt-8 pb-6 sm:p-8">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mr-3">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Submit Progress Update
                                </h3>
                                <div className="mt-4">
                                    <p className="text-[15px] text-slate-600 dark:text-slate-400 mb-6 font-light">
                                        Write a detailed update on the child&apos;s recent activities. Our AI will automatically summarize this for existing sponsors.
                                    </p>
                                    <form onSubmit={handleAddReport}>
                                        {reportMsg && (
                                            <div className={`p-4 rounded-xl text-sm mb-6 border font-medium flex items-center ${reportMsg.includes('Success') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'}`}>
                                                {reportMsg.includes('Success') && <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                {reportMsg}
                                            </div>
                                        )}
                                        <textarea
                                            required
                                            rows={5}
                                            value={reportContent}
                                            onChange={(e) => setReportContent(e.target.value)}
                                            placeholder="e.g. Alex won the regional science fair today with an exceptional robotics project..."
                                            className="block w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium outline-none backdrop-blur-sm shadow-sm transition-all resize-none"
                                        />
                                        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedChildId(null)}
                                                className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={reportSubmitting || reportMsg.includes('Success')}
                                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
