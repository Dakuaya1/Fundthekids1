'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShieldCheck, ShieldAlert, CheckCircle2, Users, DollarSign, Activity, Loader2 } from 'lucide-react';

interface AdminStats {
    totalUsers: number;
    activeSponsorships: number;
    totalFundsRaisedUsd: number;
    activeChildrenByNgo: unknown[];
}

interface UserData {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    ngo?: { verifiedStatus: string | boolean; name: string; region: string };
    sponsor?: { impactScore: number; leaderboardRank: number };
    guardian?: { fullName: string; region: string; organizationName?: string | null; isAvailable: boolean };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users?limit=50') // fetching 50 for demo overview
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyNgo = async (userId: string) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { action: 'VERIFY_NGO' });
            // Refresh local state to show verified
            setUsers(prev => prev.map(u => {
                if (u.id === userId && u.ngo) {
                    return { ...u, ngo: { ...u.ngo, verifiedStatus: true } };
                }
                return u;
            }));
            alert('NGO successfully verified.');
        } catch (error) {
            console.error('Error verifying NGO', error);
            alert('Failed to verify NGO. Check console.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-t-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalUsers || 0}</p>
                        </div>
                        <Users className="w-10 h-10 text-purple-200 dark:text-purple-900" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-t-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Pledges</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.activeSponsorships || 0}</p>
                        </div>
                        <Activity className="w-10 h-10 text-emerald-200 dark:text-emerald-900" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-t-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Funds Raised</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${stats?.totalFundsRaisedUsd || 0}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-blue-200 dark:text-blue-900" />
                    </div>
                </div>
            </div>

            {/* User Moderation Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        User Moderation View
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Impact</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{u.email}</div>
                                        <div suppressHydrationWarning className="text-xs text-gray-500 dark:text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                u.role === 'NGO' ? 'bg-amber-100 text-amber-800' :
                                                    u.role === 'SPONSOR' ? 'bg-blue-100 text-blue-800' :
                                                        u.role === 'GUARDIAN' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {u.role === 'NGO' && u.ngo && (
                                            <div className="flex items-center">
                                                {u.ngo.verifiedStatus === 'VERIFIED' || u.ngo.verifiedStatus === true ? (
                                                    <span className="flex items-center text-green-600"><CheckCircle2 className="w-4 h-4 mr-1" /> Verified</span>
                                                ) : (
                                                    <span className="flex items-center text-amber-600"><ShieldAlert className="w-4 h-4 mr-1" /> Pending</span>
                                                )}
                                                <span className="ml-2 text-xs truncate max-w-[120px]">({u.ngo.name})</span>
                                            </div>
                                        )}
                                        {u.role === 'SPONSOR' && u.sponsor && (
                                            <span>Impact Score: {u.sponsor.impactScore}</span>
                                        )}
                                        {u.role === 'ADMIN' && (
                                            <span className="text-purple-600 font-medium">System Operator</span>
                                        )}
                                        {u.role === 'GUARDIAN' && u.guardian && (
                                            <span>
                                                {u.guardian.fullName} • {u.guardian.region} • {u.guardian.isAvailable ? 'Available' : 'Busy'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {u.role === 'NGO' && u.ngo && (u.ngo.verifiedStatus === 'PENDING' || u.ngo.verifiedStatus === false) && (
                                            <button
                                                onClick={() => handleVerifyNgo(u.id)}
                                                className="text-emerald-600 hover:text-emerald-900 flex items-center justify-end w-full"
                                            >
                                                <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
