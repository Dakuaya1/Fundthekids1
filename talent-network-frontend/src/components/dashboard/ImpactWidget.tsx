import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { Award, Trophy, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GamificationProfile {
    impactScore: number;
    badges: { id: string; name: string; criteria: string }[];
}

export default function ImpactWidget() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setFetchError(false);
            const res = await api.get('/gamification/profile');
            setProfile(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                logout();
                return;
            }
            console.error('ImpactWidget fetch error:', err instanceof Error ? err.message : String(err));
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            setLoading(false);
            setFetchError(true);
        }
    }, [authLoading, fetchProfile, user]);

    if (loading || authLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px]">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <span className="text-xs text-gray-500">Loading gamification...</span>
            </div>
        );
    }

    if (fetchError || !profile) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[150px] border border-red-100 dark:border-red-900/30">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Failed to load gamification profile.</p>
                <button
                    onClick={fetchProfile}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div className="ml-5">
                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Total Impact Score
                        </h2>
                        <div className="mt-1 flex items-baseline">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                {profile.impactScore.toLocaleString()}
                            </span>
                            <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                points
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-4">
                    <Award className="w-4 h-4 mr-2 text-indigo-500" />
                    Earned Badges ({profile.badges.length})
                </h3>
                {profile.badges.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No badges earned yet. Make your first pledge to unlock your first badge!
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {profile.badges.map((badge, idx) => (
                            <div
                                key={idx}
                                className="relative group flex flex-col items-center p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-inner mb-2">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{badge.name}</span>
                                <span className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.criteria}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
