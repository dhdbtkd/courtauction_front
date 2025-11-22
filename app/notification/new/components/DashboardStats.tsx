'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Home, Mail } from 'lucide-react';

interface StatsResponse {
    active_alerts: number;
    total_matches: number;
    this_week: number;
}

export default function DashboardStats() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // 📌 /api/notification/stats 호출
    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notification/stats');
            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('🔥 대시보드 통계 로드 실패:', err);
            setStats({
                active_alerts: 0,
                total_matches: 0,
                this_week: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cards = [
        {
            icon: <Bell className="w-4 md:w-6 h-4 md:h-6 text-blue-600" />,
            title: 'Active Alerts',
            value: stats?.active_alerts ?? '-',
            color: 'bg-blue-50',
        },
        {
            icon: <Home className="w-4 md:w-6 h-4 md:h-6 text-green-600" />,
            title: 'Total Matches',
            value: stats?.total_matches ?? '-',
            color: 'bg-green-50',
        },
        {
            icon: <Mail className="w-4 md:w-6 h-4 md:h-6 text-purple-600" />,
            title: 'This Week',
            value: stats?.this_week ?? '-',
            color: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8 mx-2 md:mx-0">
            {(loading ? [1, 2, 3] : cards).map((card: any, i) => (
                <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.25 }}
                    className={`p-3 md:p-5 rounded-xl border border-zinc-200 ${
                        loading ? 'bg-gray-100 animate-pulse' : card.color
                    }`}
                >
                    {loading ? (
                        <div className="h-4 md:h-6 w-16 md:w-24 bg-gray-300 rounded-lg" />
                    ) : (
                        <div className="flex items-center gap-3">
                            {card.icon}
                            <div>
                                <div className="text-lg md:text-2xl font-bold">{card.value}</div>
                                <div className="text-gray-600 text-[0.7rem] md:text-sm">{card.title}</div>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
