import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight } from 'react-icons/fi';
import * as api from '../../services/api';

const PendingRequests: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api.getPendingGroups();
                setRequests(data);
            } catch (error) {
                console.error('Failed to fetch pending requests:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    if (isLoading) return <div className="text-white">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Pending Requests</h2>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        No pending requests found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {requests.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-gray-700/30 transition-colors cursor-pointer flex items-center justify-between group"
                                onClick={() => navigate(`/admin/requests/${request.id}`, { state: { request } })}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                                        {request.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{request.name}</h3>
                                        <p className="text-gray-400 text-sm">
                                            Posted by <span className="text-purple-400">{request.owner?.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <div className="text-gray-400 text-sm flex items-center space-x-1">
                                            <FiClock size={14} />
                                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-white font-medium mt-1">
                                            ₹{request.totalPrice} / month
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-gray-500 group-hover:text-white transition-colors" size={24} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingRequests;
