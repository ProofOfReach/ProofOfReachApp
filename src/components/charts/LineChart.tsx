import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ChartContainer from './ChartContainer';
import { formatDate } from '@/utils/chartHelpers';

interface DataKey {
  key: string;
  name: string;
  color: string;
}

interface LineChartProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKeys: DataKey[];
  xAxisDataKey: string;
  loading: boolean;
  error?: string | null;
  height?: number;
  tooltipFormatter?: (value: number, name: string) => [string, string];
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  data,
  dataKeys,
  xAxisDataKey,
  loading,
  error,
  height = 300,
  tooltipFormatter
}) => {
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {xAxisDataKey === 'date' ? formatDate(label) : label}
          </p>
          {payload.map((entry: any, index: number) => {
            const formattedValue = tooltipFormatter 
              ? tooltipFormatter(entry.value, entry.name)[0]
              : entry.value;
            const formattedName = tooltipFormatter 
              ? tooltipFormatter(entry.value, entry.name)[1] || entry.name
              : entry.name;
            
            return (
              <div 
                key={`tooltip-${index}`} 
                className="flex items-center text-sm mb-1"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {formattedName}: {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer 
      title={title} 
      subtitle={subtitle}
      loading={loading}
      error={error}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tickFormatter={xAxisDataKey === 'date' ? formatDate : undefined} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((dataKey) => (
            <Line
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stroke={dataKey.color}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default LineChart;