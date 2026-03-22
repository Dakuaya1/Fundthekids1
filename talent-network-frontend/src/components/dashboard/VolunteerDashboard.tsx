import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, Calendar, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ProgressReport {
    id: string;
    description: string;
    date: string;
    validationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface AssignedChild {
    id: string;
    name: string;
    status: 'PENDING' | 'VERIFIED';
    ngo: { name: string; region: string };
    reports: ProgressReport[];
}

export default function VolunteerDashboard() {
    const [children, setChildren] = useState<AssignedChild[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegionTasks();
    }, []);

    const fetchRegionTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/volunteer/region-children');
            setChildren(response.data);
        } catch (error) {
            console.error('Failed to fetch volunteer regional tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyReport = async (reportId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await api.post(`/volunteer/verify-report/${reportId}`, { status });
            // Optimistically update UI
            setChildren(prev => prev.map(child => ({
                ...child,
                reports: child.reports.filter(r => r.id !== reportId)
            })));
            alert(status === 'VERIFIED' ? 'Report marked as reviewed. You earned +10 Impact Score.' : 'Report flagged for follow-up.');
        } catch (error) {
            console.error('Failed to verify report', error);
            alert('Failed to process verification.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-16">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Filter children who actually have pending reports to show
    const tasks = children.filter(c => c.reports.length > 0);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2rem] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-emerald-500"
            >
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/30">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        Field Verification Tasks
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 font-light max-w-xl">
                        Review children and pending reports from your assigned region. Mark reports as reviewed to keep the verification queue moving.
                    </p>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-emerald-100/50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 backdrop-blur-sm">
                        {tasks.reduce((acc, curr) => acc + curr.reports.length, 0)} Pending Reports
                    </span>
                </div>
            </motion.div>

            {tasks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 glass-card rounded-[2rem]"
                >
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-light">There are no pending reports in your region.</p>
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {tasks.map((child) => (
                        <motion.div key={child.id} variants={itemVariants} className="glass-card rounded-3xl overflow-hidden group">
                            <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {child.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 flex items-center mt-1">
                                        Hosted by <strong className="ml-1 text-slate-700 dark:text-slate-300">{child.ngo.name}</strong> <span className="mx-2">•</span> {child.ngo.region}
                                    </p>
                                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${child.status === 'VERIFIED'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        }`}>
                                        {child.status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>
                            <ul className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                                {child.reports.map((report) => (
                                    <li key={report.id} className="p-8 transition-colors hover:bg-white/40 dark:hover:bg-slate-800/40">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-4 flex-1">
                                                <div suppressHydrationWarning className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    <Calendar className="flex-shrink-0 mr-2 h-3.5 w-3.5" />
                                                    Submitted on {new Date(report.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-slate-800 dark:text-slate-200 flex items-start bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                    <FileText className="flex-shrink-0 mr-3 h-5 w-5 text-slate-400 mt-0.5" />
                                                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-light">{report.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-3 shrink-0 md:w-40 pt-1">
                                                <button
                                                    onClick={() => handleVerifyReport(report.id, 'VERIFIED')}
                                                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-md shadow-emerald-500/20 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex-1 transition-all hover:-translate-y-0.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark Reviewed
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyReport(report.id, 'REJECTED')}
                                                    className="inline-flex items-center justify-center px-4 py-3 border border-red-200 dark:border-red-900/50 shadow-sm text-sm font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-1 transition-all"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
