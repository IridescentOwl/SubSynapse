import React, { useState, useEffect, useRef } from 'react';
import GlassmorphicCard from './components/GlassmorphicCard.tsx';
import type { User } from './types.ts';

const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);

  useEffect(() => {
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = 1 - Math.pow(1 - progress, 5);
      setCount(Math.round(end * easedProgress));

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [end, duration]);

  return count;
};

interface ProfilePageProps {
  user: User;
  onAddCredits: () => void;
  onWithdrawCredits: () => void;
  onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
  onUpdateProfilePicture: (imageDataUrl: string) => Promise<void>;
  onLogout: () => void;
}

const ChangePasswordForm: React.FC<{ onChangePassword: (oldPass: string, newPass: string) => Promise<void> }> = ({ onChangePassword }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await onChangePassword(oldPassword, newPassword);
            setSuccess('Password updated successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to update password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <h4 className="text-xl font-bold text-white mb-4">Change Password</h4>
            <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}
            <button type="submit" disabled={isLoading} className="w-full font-semibold py-2 px-5 rounded-xl transition duration-300 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/50">
                {isLoading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onAddCredits, onWithdrawCredits, onChangePassword, onUpdateProfilePicture, onLogout }) => {
    const lifetimeSavings = 4550; // Mock lifetime savings
    const animatedSavings = useCountUp(lifetimeSavings);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePicture = async () => {
        if (previewUrl) {
            await onUpdateProfilePicture(previewUrl);
            setPreviewUrl(null);
        }
    };
    
    const canWithdraw = user.creditBalance >= 500;

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center">My Profile</h1>

            <div className="max-w-4xl mx-auto space-y-10">
                {/* Profile Header Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <GlassmorphicCard className="p-8 flex items-center space-x-6 md:col-span-2" hasAnimation>
                        <div className="relative group">
                            <img
                                src={previewUrl || user.avatarUrl}
                                alt="User Avatar"
                                className="w-24 h-24 rounded-full border-2 border-sky-400/50 shadow-lg"
                            />
                            <button onClick={handleAvatarClick} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>

                        <div className="flex-grow">
                            <h2 className="text-3xl font-bold text-white text-shadow">{user.name}</h2>
                            <p className="text-sky-300">{user.email}</p>
                            <p className="text-sm text-slate-400 mt-1">Member since {user.memberSince}</p>
                            {previewUrl && (
                                <div className="mt-2 flex gap-2">
                                    <button onClick={handleSavePicture} className="text-xs bg-green-500/80 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-full">Save</button>
                                    <button onClick={() => setPreviewUrl(null)} className="text-xs bg-slate-500/80 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded-full">Cancel</button>
                                </div>
                            )}
                        </div>
                    </GlassmorphicCard>
                    <GlassmorphicCard className="p-6 text-center flex flex-col justify-center" hasAnimation animationDelay={150}>
                        <p className="text-slate-300 mb-2">Lifetime Savings</p>
                        <p className={`text-4xl font-bold text-green-400 text-shadow`}>{animatedSavings.toLocaleString()} Credits</p>
                        <p className="text-sm text-slate-400 mt-2">You're a savvy saver! ✨</p>
                    </GlassmorphicCard>
                </div>

                 {/* My Wallet */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 ml-2">My Wallet</h3>
                    <GlassmorphicCard className="p-6 flex items-center justify-between" hasAnimation animationDelay={300}>
                        <div>
                            <p className="text-slate-300 mb-1">Current Balance</p>
                            <p className="text-3xl font-bold text-amber-300">{user.creditBalance.toLocaleString()} Credits</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onAddCredits} className="font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-sky-500 hover:bg-sky-400 text-white">
                                Add Credits
                            </button>
                             <button 
                                onClick={onWithdrawCredits}
                                disabled={!canWithdraw}
                                className="font-semibold py-3 px-6 rounded-xl transition duration-300 bg-white/10 hover:bg-white/20 text-white disabled:bg-slate-700/50 disabled:text-slate-400 disabled:cursor-not-allowed"
                                title={!canWithdraw ? "Minimum 500 credits required to withdraw" : ""}
                             >
                                Withdraw
                            </button>
                        </div>
                    </GlassmorphicCard>
                </div>


                {/* Account Settings */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 ml-2">Account Settings</h3>
                    <GlassmorphicCard className="overflow-hidden" hasAnimation animationDelay={450}>
                        <ChangePasswordForm onChangePassword={onChangePassword} />
                    </GlassmorphicCard>
                    <GlassmorphicCard className="mt-4" hasAnimation animationDelay={600}>
                        <div className="p-6">
                            <button 
                                onClick={onLogout}
                                className="w-full font-semibold py-3 px-6 rounded-xl transition duration-300 bg-red-500/80 hover:bg-red-500 text-white"
                            >
                                Logout
                            </button>
                        </div>
                    </GlassmorphicCard>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;