import React, { useEffect, useState } from 'react';
import { FiCheck, FiClock } from 'react-icons/fi';
import * as api from '../../services/api';

const WithdrawalsList: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api.getWithdrawalRequests();
                setRequests(data);
            } catch (error) {
                console.error('Failed to fetch withdrawal requests:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleProcess = async (requestId: string) => {
        if (!window.confirm('Mark this withdrawal as processed?')) return;
        try {
            await api.processWithdrawal(requestId);
            setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'processed', processedAt: new Date() } : r));
        } catch (error) {
            console.error('Failed to process withdrawal:', error);
            alert('Failed to process withdrawal');
        }
    };

    if (isLoading) return <div className="text-white">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Withdrawal Requests</h2>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-900/50 text-gray-300 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">UPI ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Requested At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{req.user?.name}</div>
                                        <div className="text-xs">{req.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        ₹{req.amount}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {req.upiId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'processed'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(req.requestedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' && (
                                            <button
                                                onClick={() => handleProcess(req.id)}
                                                className="text-green-400 hover:bg-green-500/10 p-2 rounded-lg transition-colors"
                                                title="Mark as Processed"
                                            >
                                                <FiCheck size={20} />
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
};

export default WithdrawalsList;
