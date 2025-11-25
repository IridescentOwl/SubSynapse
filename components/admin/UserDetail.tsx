import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiCalendar, FiShield, FiCreditCard } from 'react-icons/fi';
import * as api from '../../services/api';

const UserDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            try {
                const data = await api.getAdminUserDetails(id);
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (isLoading) return <div className="text-white">Loading user details...</div>;
    if (!user) return <div className="text-white">User not found</div>;

    return (
        <div className="space-y-8">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
                <FiArrowLeft />
                <span>Back to Users</span>
            </button>

            {/* User Profile Header */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                    <img
                        src={user.avatar || `https://api.dicebear.com/8.x/adventurer/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-full h-full rounded-full bg-gray-900 object-cover"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        {user.isAdmin && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center space-x-1">
                                <FiShield size={12} />
                                <span>ADMIN</span>
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
                        <div className="flex items-center space-x-2">
                            <FiMail className="text-gray-500" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiPhone className="text-gray-500" />
                            <span>{user.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiCalendar className="text-gray-500" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiCreditCard className="text-gray-500" />
                            <span>Balance: ₹{user.creditBalance}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Owned Groups */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Created Groups</h2>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        {user.ownedGroups && user.ownedGroups.length > 0 ? (
                            <div className="divide-y divide-gray-700">
                                {user.ownedGroups.map((group: any) => (
                                    <div key={group.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-white font-medium">{group.name}</h3>
                                                <p className="text-sm text-gray-400 capitalize">{group.serviceType}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs ${group.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    group.status === 'pending_review' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-gray-700 text-gray-400'
                                                }`}>
                                                {group.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">No groups created</div>
                        )}
                    </div>
                </div>

                {/* Memberships */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Joined Subscriptions</h2>
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        {user.memberships && user.memberships.length > 0 ? (
                            <div className="divide-y divide-gray-700">
                                {user.memberships.map((membership: any) => (
                                    <div key={membership.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-white font-medium">{membership.group?.name || 'Unknown Group'}</h3>
                                                <p className="text-sm text-gray-400">Share: ₹{membership.shareAmount}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Joined</p>
                                                <p className="text-sm text-gray-300">{new Date(membership.joinDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">No subscriptions joined</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
