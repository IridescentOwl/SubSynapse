import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import * as api from '../../services/api';

const RequestDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const request = location.state?.request;
    const [isProcessing, setIsProcessing] = useState(false);

    if (!request) {
        return <div className="text-white">Request not found</div>;
    }

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve this group?')) return;
        setIsProcessing(true);
        try {
            await api.approveGroup(request.id);
            navigate('/admin/requests');
        } catch (error) {
            console.error('Failed to approve group:', error);
            alert('Failed to approve group');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this group?')) return;
        setIsProcessing(true);
        try {
            await api.rejectGroup(request.id);
            navigate('/admin/requests');
        } catch (error) {
            console.error('Failed to reject group:', error);
            alert('Failed to reject group');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/admin/requests')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
                <FiArrowLeft />
                <span>Back to Requests</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Details Column */}
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                        <h1 className="text-3xl font-bold text-white mb-6">{request.name}</h1>

                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-gray-700">
                                <span className="text-gray-400">Service Type</span>
                                <span className="text-white font-medium capitalize">{request.serviceType}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-700">
                                <span className="text-gray-400">Total Price</span>
                                <span className="text-white font-medium">₹{request.totalPrice}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-700">
                                <span className="text-gray-400">Total Slots</span>
                                <span className="text-white font-medium">{request.slotsTotal}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-700">
                                <span className="text-gray-400">Posted By</span>
                                <span className="text-white font-medium">{request.owner?.name}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-700">
                                <span className="text-gray-400">Email</span>
                                <span className="text-white font-medium">{request.owner?.email}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex space-x-4">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                            >
                                <FiCheck />
                                <span>Approve</span>
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                            >
                                <FiX />
                                <span>Reject</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Proof Column */}
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-fit">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                        <span>Proof Document</span>
                        {request.proofDocument && (
                            <a
                                href={request.proofDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
                            >
                                <span>Open Original</span>
                                <FiExternalLink />
                            </a>
                        )}
                    </h3>

                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 min-h-[300px] flex items-center justify-center">
                        {request.proofDocument ? (
                            <img
                                src={request.proofDocument}
                                alt="Proof"
                                className="max-w-full max-h-[600px] object-contain"
                            />
                        ) : (
                            <div className="text-gray-500">No proof document provided</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
