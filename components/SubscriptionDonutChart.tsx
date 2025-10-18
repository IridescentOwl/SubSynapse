import React from 'react';
import type { MySubscription } from '../types';

interface ChartData {
  category: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Video': '#38bdf8', // sky-400
  'Music': '#34d399', // emerald-400
  'Productivity': '#f472b6', // pink-400
  'Design': '#c084fc', // purple-400
};

const SubscriptionDonutChart: React.FC<{ subscriptions: MySubscription[] }> = ({ subscriptions }) => {
  const data: ChartData[] = React.useMemo(() => {
    const categoryTotals = subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + sub.myShare;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,
        value,
        color: CATEGORY_COLORS[category] || '#94a3b8', // slate-400 for fallback
      }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) {
    return <div className="text-center text-slate-400">No subscription data to display.</div>;
  }
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Pre-calculate segment data declaratively to avoid mutation during render
  const segmentsData = data.reduce<Array<ChartData & { percentage: number; accumulatedPercentage: number; }>>((acc, item) => {
    const percentage = (item.value / totalValue) * 100;
    const prevAccumulated = acc.length > 0 ? acc[acc.length - 1].accumulatedPercentage : 0;
    acc.push({
        ...item,
        percentage,
        accumulatedPercentage: prevAccumulated + percentage,
    });
    return acc;
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-8">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
          {segmentsData.map(({ color, percentage, accumulatedPercentage }, index) => {
            const prevAccumulated = index > 0 ? segmentsData[index - 1].accumulatedPercentage : 0;
            const rotation = (prevAccumulated / 100) * 360;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="20"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
              />
            );
          })}
        </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-slate-300 text-sm">Total Bill</span>
            <span className="text-3xl font-bold text-white">₹{totalValue.toFixed(0)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        {data.map(({ category, value, color }) => (
          <div key={category} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            <span className="text-slate-300 mr-2">{category}:</span>
            <span className="font-semibold text-white">₹{value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionDonutChart;