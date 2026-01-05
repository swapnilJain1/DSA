import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ComplexityData } from '../types';

interface ComplexityChartProps {
  data: ComplexityData[];
  type: 'time' | 'space';
}

const ComplexityChart: React.FC<ComplexityChartProps> = ({ data, type }) => {
  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="n" 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#4b5563' }}
            label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 10 }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: '#4b5563' }}
            label={{ value: 'Operations', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
            itemStyle={{ color: '#60a5fa' }}
            cursor={{ stroke: '#4b5563' }}
          />
          <ReferenceLine x={0} stroke="#4b5563" />
          <Line 
            type="monotone" 
            dataKey="steps" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#60a5fa' }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplexityChart;