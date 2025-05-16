import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import ChartContainer from './ChartContainer';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieChartData[];
  loading: boolean;
  error?: string | null;
  height?: number;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  labelLine?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  subtitle,
  data,
  loading,
  error,
  height = 300,
  tooltipFormatter,
  labelLine = false,
  innerRadius = 60,
  outerRadius = 80
}) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataEntry = payload[0];
      const [formattedValue, formattedName] = tooltipFormatter 
        ? tooltipFormatter(dataEntry.value, dataEntry.name || "")
        : [dataEntry.value, dataEntry.name || ""];
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: dataEntry.payload.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {dataEntry.name}:
            </span>
            <span className="text-gray-700 dark:text-gray-300 ml-1">
              {formattedValue}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Render custom label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (!labelLine) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show too small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#6b7280" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {name}
      </text>
    );
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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={labelLine}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default PieChart;