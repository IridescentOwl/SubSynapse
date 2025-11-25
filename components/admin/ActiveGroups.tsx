import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight, FiUsers } from 'react-icons/fi';
import * as api from '../../services/api';

const ActiveGroups: React.FC = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await api.getActiveGroups();
                setGroups(data);
            } catch (error) {
                console.error('Failed to fetch active groups:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroups();
    }, []);

    if (isLoading) return <div className="text-white">Loading groups...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Active Subscriptions</h2>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {groups.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        No active groups found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {groups.map((group) => (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-gray-700/30 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-lg">
                                        {group.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{group.name}</h3>
                                        <p className="text-gray-400 text-sm">
                                            Posted by <span className="text-purple-400">{group.owner?.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-8">
                                    <div className="text-right">
                                        <div className="text-gray-400 text-sm flex items-center space-x-1 justify-end">
                                            <FiUsers size={14} />
                                            <span>{group.slotsFilled} / {group.slotsTotal} Slots</span>
                                        </div>
                                        <div className="text-white font-medium mt-1">
                                            ₹{group.totalPrice} / month
                                        </div>
                                    </div>

                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${group.status === 'full'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {group.status === 'full' ? 'FULL' : 'ACTIVE'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveGroups;
