import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiUsers, FiDollarSign, FiLogOut, FiActivity, FiLayers } from 'react-icons/fi';
import * as api from '../../services/api';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await api.fetchAuthenticatedUser();
                if (!user || !user.isAdmin) {
                    navigate('/admin/login');
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                navigate('/admin/login');
            }
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = () => {
        api.logout();
        navigate('/admin/login');
    };

    if (!isAuthenticated) return null;

    const navItems = [
        { path: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
        { path: '/admin/requests', icon: FiList, label: 'Requests' },
        { path: '/admin/groups/active', icon: FiLayers, label: 'Active Groups' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
        { path: '/admin/transactions', icon: FiDollarSign, label: 'Transactions' },
        { path: '/admin/withdrawals', icon: FiActivity, label: 'Withdrawals' },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Synapse Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <FiLogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
