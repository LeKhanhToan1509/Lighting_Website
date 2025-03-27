import React from 'react';
import { Area } from 'recharts';

export const AreaChart = () => {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 270 },
    { name: 'May', value: 600 },
    { name: 'Jun', value: 550 },
    { name: 'Jul', value: 350 },
    { name: 'Aug', value: 400 },
    { name: 'Sep', value: 500 },
    { name: 'Oct', value: 450 },
    { name: 'Nov', value: 550 },
    { name: 'Dec', value: 650 },
  ];

  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#ff9800" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MiniChart = ({ trend, color }) => {
  const upPath = "M1,16 L10,10 L20,14 L30,4 L40,8 L50,6 L59,12";
  const downPath = "M1,8 L10,12 L20,6 L30,14 L40,10 L50,14 L59,6";
  
  const chartColor = 
    color === 'green' ? '#10b981' : 
    color === 'red' ? '#ef4444' : 
    color === 'orange' ? '#f59e0b' : 
    '#3b82f6';
  
  return (
    <svg width="60" height="24" viewBox="0 0 60 24">
      <path
        d={trend === 'up' ? upPath : downPath}
        fill="none"
        stroke={chartColor}
        strokeWidth="2"
      />
    </svg>
  );
};

export const EnhancedBarChart = () => {
  const values = [50, 80, 60, 90, 40, 70, 50, 80, 30, 60, 40, 70];
  const highlightIndex = 3;
  
  return (
    <div className="h-48 flex items-end justify-between px-4">
      {values.map((value, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className={`w-4 ${index === highlightIndex ? 'bg-red-500' : 'bg-orange-500'}`} 
            style={{ height: `${value * 0.4}%` }}
          ></div>
          <span className="text-xs text-gray-500 mt-2">{index + 1}</span>
        </div>
      ))}
    </div>
  );
};

