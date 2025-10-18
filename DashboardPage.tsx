import React, { useMemo, useState } from 'react';
import SubscriptionCard from './components/SubscriptionCard';
import GlassmorphicCard from './components/GlassmorphicCard';
import { SUBSCRIPTION_GROUPS, MY_SUBSCRIPTIONS } from './constants';
import type { SubscriptionGroup } from './types';
import MyDetailedSubscriptionCard from './components/MyDetailedSubscriptionCard';
import type { DashboardTab } from './App';
import SubscriptionDonutChart from './components/SubscriptionDonutChart';

interface DashboardPageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
    <GlassmorphicCard className="p-6 text-center">
        <p className="text-slate-300 mb-2">{title}</p>
        <p className={`text-4xl font-bold ${className}`}>{value}</p>
    </GlassmorphicCard>
);

const ALL_CATEGORIES = 'All Categories';
const categories = [ALL_CATEGORIES, ...Array.from(new Set(SUBSCRIPTION_GROUPS.map(g => g.category)))];

type SortOption = 'default' | 'price' | 'slots';

const DashboardPage: React.FC<DashboardPageProps> = ({ searchTerm, setSearchTerm, activeTab, setActiveTab }) => {
  const [filterCategory, setFilterCategory] = useState(ALL_CATEGORIES);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const filteredSubscriptions = useMemo(() => {
    let groups: SubscriptionGroup[] = [...SUBSCRIPTION_GROUPS]; // Create a copy to prevent mutation

    // Filter by search term
    if (searchTerm) {
      groups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (filterCategory !== ALL_CATEGORIES) {
        groups = groups.filter(group => group.category === filterCategory);
    }
    
    // Sort
    if (sortBy === 'price') {
      return groups.sort((a, b) => (a.totalPrice / a.slotsTotal) - (b.totalPrice / b.slotsTotal));
    } else if (sortBy === 'slots') {
      return groups.sort((a, b) => (b.slotsTotal - b.slotsFilled) - (a.slotsTotal - a.slotsFilled));
    }

    return groups;
  }, [searchTerm, filterCategory, sortBy]);

  const { totalMonthlySavings, nextBillTotal } = useMemo(() => {
      const savings = MY_SUBSCRIPTIONS.reduce((acc, sub) => acc + (sub.totalPrice / sub.slotsTotal) - sub.myShare, 0);
      const bill = MY_SUBSCRIPTIONS.reduce((acc, sub) => acc + sub.myShare, 0);
      return { totalMonthlySavings: savings, nextBillTotal: bill };
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      {activeTab === 'explore' && (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center pt-8">Explore More Groups</h1>
            
            {/* Search and Filter Controls */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  </div>
                  <input type="text" placeholder="Search for Netflix, Spotify..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder-gray-400 transition" />
                </div>
                <div className="relative">
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full appearance-none px-4 py-3 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 text-white transition">
                        {categories.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-center items-center gap-4 mb-8 text-sm text-slate-300">
                <span>Sort by:</span>
                <button onClick={() => setSortBy('default')} className={`px-3 py-1 rounded-full ${sortBy === 'default' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Default</button>
                <button onClick={() => setSortBy('price')} className={`px-3 py-1 rounded-full ${sortBy === 'price' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Price</button>
                <button onClick={() => setSortBy('slots')} className={`px-3 py-1 rounded-full ${sortBy === 'slots' ? 'bg-sky-500/50 text-white' : 'hover:bg-white/10'}`}>Slots Available</button>
            </div>


            {filteredSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 group pointer-events-none">
                    {filteredSubscriptions.map((group: SubscriptionGroup) => (
                        <SubscriptionCard key={group.id} group={group} />
                    ))}
                </div>
            ) : (
                <GlassmorphicCard className="text-center py-16">
                    <p className="text-2xl font-semibold text-slate-300">No groups found.</p>
                    <p className="text-slate-400 mt-2">Try adjusting your filters.</p>
                </GlassmorphicCard>
            )}
        </div>
      )}
      
      {activeTab === 'dashboard' && (
          <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-8 text-shadow text-center pt-8">My Dashboard</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-1">
                      <StatCard title="Monthly Savings" value={`₹${totalMonthlySavings.toFixed(0)}`} className="text-green-400" />
                      <StatCard title="Next Bill Total" value={`₹${nextBillTotal.toFixed(0)}`} className="text-sky-300" />
                      <StatCard title="Active Subscriptions" value={MY_SUBSCRIPTIONS.length.toString()} className="text-purple-400 md:col-span-2" />
                  </div>
                  <GlassmorphicCard className="p-6 flex items-center justify-center min-h-[200px]">
                      <SubscriptionDonutChart subscriptions={MY_SUBSCRIPTIONS} />
                  </GlassmorphicCard>
              </div>

              <h2 className="text-2xl font-bold mb-6">Manage Your Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 group pointer-events-none">
                  {MY_SUBSCRIPTIONS.map(sub => (
                      <MyDetailedSubscriptionCard key={sub.id} sub={sub} />
                  ))}
              </div>
          </div>
      )}

    </main>
  );
};

export default DashboardPage;