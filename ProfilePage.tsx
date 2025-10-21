import React, { useState, useEffect, useMemo } from 'react';
import GlassmorphicCard from './components/GlassmorphicCard';

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

const ProfilePage: React.FC = () => {
    // Mock user data
    const user = {
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Alex`,
        memberSince: 'January 15, 2024',
    };

    const lifetimeSavings = 4550; // Mock lifetime savings
    const animatedSavings = useCountUp(lifetimeSavings);

    const SettingItem: React.FC<{ title: string, description: string, buttonText: string }> = ({ title, description, buttonText }) => (
        <div className="flex items-center justify-between p-4 border-b border-white/10 last:border-b-0">
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <button className="font-semibold py-2 px-5 rounded-xl transition duration-300 bg-white/10 hover:bg-white/20 text-white flex-shrink-0">
                {buttonText}
            </button>
        </div>
    );

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center">My Profile</h1>

            <div className="max-w-4xl mx-auto space-y-10">
                {/* Profile Header Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <GlassmorphicCard className="p-8 flex items-center space-x-6 md:col-span-2" hasAnimation>
                        <img
                            src={user.avatarUrl}
                            alt="User Avatar"
                            className="w-24 h-24 rounded-full border-2 border-sky-400/50 shadow-lg"
                        />
                        <div className="flex-grow">
                            <h2 className="text-3xl font-bold text-white text-shadow">{user.name}</h2>
                            <p className="text-sky-300">{user.email}</p>
                            <p className="text-sm text-slate-400 mt-1">Member since {user.memberSince}</p>
                        </div>
                    </GlassmorphicCard>
                    <GlassmorphicCard className="p-6 text-center flex flex-col justify-center" hasAnimation animationDelay={150}>
                        <p className="text-slate-300 mb-2">Lifetime Savings</p>
                        <p className={`text-4xl font-bold text-green-400 text-shadow`}>₹{animatedSavings}</p>
                        <p className="text-sm text-slate-400 mt-2">You've saved enough for a weekend trip! ✈️</p>
                    </GlassmorphicCard>
                </div>

                {/* Account Settings */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 ml-2">Account Settings</h3>
                    <GlassmorphicCard className="overflow-hidden" hasAnimation animationDelay={300}>
                        <SettingItem 
                            title="Email Address" 
                            description="alex.doe@example.com"
                            buttonText="Change"
                        />
                        <SettingItem 
                            title="Password" 
                            description="Last changed 3 months ago"
                            buttonText="Change"
                        />
                         <SettingItem 
                            title="Notifications" 
                            description="Email and Push enabled"
                            buttonText="Manage"
                        />
                    </GlassmorphicCard>
                </div>

                {/* Payment Methods */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 ml-2">Payment Methods</h3>
                    <GlassmorphicCard className="overflow-hidden" hasAnimation animationDelay={450}>
                       <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                <div>
                                    <h4 className="font-semibold text-white">Visa ending in 4242</h4>
                                    <p className="text-sm text-slate-400">Expires 12/2026</p>
                                </div>
                            </div>
                            <button className="font-semibold text-sm text-slate-300 hover:text-white transition">
                                Remove
                            </button>
                        </div>
                    </GlassmorphicCard>
                    <button className="mt-4 w-full font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 shadow-lg text-center bg-white/10 hover:bg-white/20 text-white">
                        Add New Payment Method
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;