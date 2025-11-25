import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiLayers, FiDollarSign, FiActivity } from 'react-icons/fi';
import * as api from '../../services/api';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getAdminDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="text-white">Loading stats...</div>;
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Groups', value: stats?.activeGroups || 0, icon: FiLayers, color: 'from-purple-500 to-pink-500' },
        { label: 'Pending Requests', value: stats?.pendingGroups || 0, icon: FiActivity, color: 'from-orange-500 to-red-500' },
        { label: 'Total Transactions', value: stats?.totalTransactions || 0, icon: FiDollarSign, color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />

                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                                <stat.icon className="text-white text-xl" />
                            </div>
                        </div>

                        <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Section could go here */}
        </div>
    );
};

export default AdminDashboard;
