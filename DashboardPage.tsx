import React, { useMemo, useState, useEffect } from 'react';
import SubscriptionCard from './components/SubscriptionCard.tsx';
import GlassmorphicCard from './components/GlassmorphicCard.tsx';
import type { SubscriptionGroup, MySubscription } from './types.ts';
import MyDetailedSubscriptionCard from './components/MyDetailedSubscriptionCard.tsx';
import type { DashboardTab } from './App.tsx';
import SubscriptionDonutChart from './components/SubscriptionDonutChart.tsx';
import CustomSelect from './components/CustomSelect.tsx';
import * as api from './services/api.ts';

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

interface DashboardPageProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  mySubscriptions: MySubscription[];
  onManageSubscription: (subscription: MySubscription) => void;
  onJoinGroup: (group: SubscriptionGroup) => void;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => {
    const numericValue = useMemo(() => parseFloat(value.replace(/[^0-9.-]+/g, "")), [value]);
    const animatedValue = useCountUp(isNaN(numericValue) ? 0 : numericValue);
    const suffix = useMemo(() => value.match(/[ a-zA-Z/]*$/)?.[0] || '', [value]);
    const formattedValue = isNaN(numericValue) ? value : `${Math.round(animatedValue).toLocaleString()}${suffix}`;

    return (
        <GlassmorphicCard className="p-6 text-center" hasAnimation>
            <p className="text-slate-300 mb-2">{title}</p>
            <p className={`text-4xl font-bold text-shadow ${className}`}>{formattedValue}</p>
        </GlassmorphicCard>
    );
};

const ALL_CATEGORIES = 'All Categories';

const DashboardPage: React.FC<DashboardPageProps> = ({ activeTab, setActiveTab, mySubscriptions, onManageSubscription, onJoinGroup }) => {
  const [allGroups, setAllGroups] = useState<SubscriptionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(ALL_CATEGORIES);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  const categories = useMemo(() => [ALL_CATEGORIES, ...Array.from(new Set(allGroups.map(g => g.category)))], [allGroups]);
  const categoryOptions = categories.map(c => ({ value: c, label: c }));

  useEffect(() => {
      const loadGroups = async () => {
          setIsLoading(true);
          try {
              const groups = await api.fetchGroups();
              setAllGroups(groups);
          } catch (error) {
              console.error("Failed to fetch groups", error);
          } finally {
              setIsLoading(false);
          }
      };
      if (activeTab === 'explore') {
        loadGroups();
      }
  }, [activeTab]);


  type SortOption = 'default' | 'price' | 'slots';

  const filteredSubscriptions = useMemo(() => {
    let groups = allGroups.filter(group => group.status === 'active');

    if (searchTerm) {
      groups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterCategory !== ALL_CATEGORIES) {
        groups = groups.filter(group => group.category === filterCategory);
    }
    
    if (sortBy === 'price') {
      return groups.sort((a, b) => (a.totalPrice / a.slotsTotal) - (b.totalPrice / b.slotsTotal));
    } else if (sortBy === 'slots') {
      return groups.sort((a, b) => (b.slotsTotal - b.slotsFilled) - (a.slotsTotal - a.slotsFilled));
    }

    return groups;
  }, [searchTerm, filterCategory, sortBy, allGroups]);

  const { totalMonthlySavings, monthlyCreditUsage } = useMemo(() => {
      const savings = mySubscriptions.reduce((acc, sub) => {
        if (sub.membershipType === 'monthly') {
           return acc + (sub.totalPrice / sub.slotsTotal) - sub.myShare;
        }
        return acc;
      }, 0);
      const usage = mySubscriptions.reduce((acc, sub) => {
         if (sub.membershipType === 'monthly') {
          return acc + sub.myShare;
         }
         return acc;
      }, 0);
      return { totalMonthlySavings: savings, monthlyCreditUsage: usage };
  }, [mySubscriptions]);

  return (
    <main className="container mx-auto px-4 py-8">
      {activeTab === 'explore' && (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center pt-8">Explore More Groups</h1>
            
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  </div>
                  <input type="text" placeholder="Search for Netflix, Spotify..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
                </div>
                <CustomSelect
                  options={categoryOptions}
                  value={filterCategory}
                  onChange={setFilterCategory}
                  triggerClassName="rounded-full py-3"
                  label=""
                />
            </div>
            <div className="flex justify-center items-center gap-4 mb-8 text-sm text-slate-300">
                <span>Sort by:</span>
                <button onClick={() => setSortBy('default')} className={`px-3 py-1 rounded-full transition active:scale-95 ${sortBy === 'default' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Default</button>
                <button onClick={() => setSortBy('price')} className={`px-3 py-1 rounded-full transition active:scale-95 ${sortBy === 'price' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Price</button>
                <button onClick={() => setSortBy('slots')} className={`px-3 py-1 rounded-full transition active:scale-95 ${sortBy === 'slots' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Slots Available</button>
            </div>


            {isLoading ? (
                 <div className="text-center py-16">
                    <p className="text-2xl font-semibold text-slate-300">Loading groups...</p>
                 </div>
            ) : filteredSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 group pointer-events-none">
                    {filteredSubscriptions.map((group, index) => (
                        <SubscriptionCard key={group.id} group={group} animationDelay={index * 100} onJoinGroup={onJoinGroup} />
                    ))}
                </div>
            ) : (
                <GlassmorphicCard className="text-center py-16 flex flex-col items-center justify-center" hasAnimation>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-2xl font-semibold text-slate-300">No groups found.</p>
                    <p className="text-slate-400 mt-2">Try adjusting your filters or create your own group!</p>
                </GlassmorphicCard>
            )}
        </div>
      )}
      
      {activeTab === 'dashboard' && (
          <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center pt-8">My Dashboard</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1">
                      <StatCard title="Monthly Savings" value={`${totalMonthlySavings.toFixed(0)} Credits`} className="text-green-400" />
                      <StatCard title="Monthly Usage" value={`${monthlyCreditUsage.toFixed(0)} Credits`} className="text-sky-300" />
                      <StatCard title="Active Subscriptions" value={mySubscriptions.length.toString()} className="text-purple-400 md:col-span-2" />
                  </div>
                  <GlassmorphicCard className="p-6 flex items-center justify-center min-h-[200px]" hasAnimation animationDelay={150}>
                      <SubscriptionDonutChart subscriptions={mySubscriptions} />
                  </GlassmorphicCard>
              </div>

              <h2 className="text-2xl font-bold mb-6">Manage Your Subscriptions</h2>
              {mySubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 group pointer-events-none">
                    {mySubscriptions.map((sub, index) => (
                        <MyDetailedSubscriptionCard 
                          key={sub.id} 
                          sub={sub} 
                          animationDelay={index * 100}
                          onManageClick={() => onManageSubscription(sub)}
                        />
                    ))}
                </div>
              ) : (
                 <GlassmorphicCard className="text-center py-16" hasAnimation>
                    <p className="text-2xl font-semibold text-slate-300">No active subscriptions.</p>
                    <p className="text-slate-400 mt-2">Explore the marketplace to join a group!</p>
                </GlassmorphicCard>
              )}
          </div>
      )}

    </main>
  );
};

export default DashboardPage;