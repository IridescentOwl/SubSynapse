import React, { useEffect, useState } from 'react';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import * as api from '../../services/api';

const TransactionsList: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await api.getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (isLoading) return <div className="text-white">Loading transactions...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Transactions</h2>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-900/50 text-gray-300 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {txn.type === 'credit' ? (
                                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                                    <FiArrowDownLeft />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                                    <FiArrowUpRight />
                                                </div>
                                            )}
                                            <span className="capitalize font-medium text-white">{txn.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{txn.user?.name}</div>
                                        <div className="text-xs">{txn.user?.email}</div>
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${txn.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${txn.status === 'completed'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : txn.status === 'pending'
                                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString()}
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

export default TransactionsList;
