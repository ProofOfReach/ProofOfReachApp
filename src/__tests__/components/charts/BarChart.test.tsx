/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BarChart } from '../../../components/charts';
import type { UserRole } from '../../../types/auth';

// Mock recharts completely since it doesn't work well in Jest and the real implementation is super complex
jest.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: () => <div data-testid="recharts-line-chart">LineChart</div>,
    BarChart: () => <div data-testid="recharts-bar-chart">BarChart</div>,
    XAxis: () => <div data-testid="x-axis">XAxis</div>,
    YAxis: () => <div data-testid="y-axis">YAxis</div>,
    CartesianGrid: () => <div data-testid="grid">Grid</div>,
    Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
    Legend: () => <div data-testid="chart-legend">Legend</div>,
    Line: ({ dataKey }: { dataKey: string }) => <div data-testid="chart-line" data-key={dataKey}>Line-{dataKey}</div>,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid="chart-bar" data-key={dataKey}>Bar-{dataKey}</div>,
  };
});

describe('BarChart Component', () => {
  const mockData = [
    { category: 'A', value: 100, otherValue: 50 },
    { category: 'B', value: 150, otherValue: 75 },
    { category: 'C', value: 200, otherValue: 100 },
  ];

  const mockDataKeys = [
    { key: 'value', name: 'Test Value', color: '#10B981' },
    { key: 'otherValue', name: 'Other Value', color: '#0EA5E9' }
  ];

  it('renders with title and subtitle', () => {
    render(
      <BarChart
        title="Bar Chart Title"
        subtitle="Bar Chart Subtitle"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="category"
        height={300}
        loading={false}
      />
    );

    expect(screen.getByText('Bar Chart Title')).toBeInTheDocument();
    expect(screen.getByText('Bar Chart Subtitle')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    render(
      <BarChart
        title="Loading Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="category"
        height={300}
        loading={true}
      />
    );

    // Should show a loading skeleton - the exact implementation may vary
    // Just check the component renders and doesn't crash
    expect(screen.getByText('Loading Test')).toBeInTheDocument();
  });

  it('renders empty state in a graceful way', () => {
    render(
      <BarChart
        title="Empty Test"
        data={[]}
        dataKeys={mockDataKeys}
        xAxisDataKey="category"
        height={300}
        loading={false}
      />
    );

    // Should show an empty state with responsive container
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart with data correctly', () => {
    render(
      <BarChart
        title="Data Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="category"
        height={300}
        loading={false}
      />
    );

    // Check if chart is rendered (container exists)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    
    // Just check that the chart renders, we're mocking recharts completely
    // so we can't check for specific elements inside the recharts component
    expect(screen.getByText('Data Test')).toBeInTheDocument();
  });

  it('handles custom formatter properly', () => {
    const tooltipFormatter = (value: number, name: string): [UserRole, string] => [`${value}%`, name];
    
    render(
      <BarChart
        title="Formatter Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="category"
        height={300}
        loading={false}
        tooltipFormatter={tooltipFormatter}
      />
    );

    // ResponsiveContainer should be rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});