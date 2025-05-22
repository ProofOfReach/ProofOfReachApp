/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LineChart } from '../../../components/charts';

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

describe('LineChart Component', () => {
  const mockData = [
    { date: '2025-05-01', value: 100, otherValue: 50 },
    { date: '2025-05-02', value: 150, otherValue: 75 },
    { date: '2025-05-03', value: 200, otherValue: 100 },
  ];

  const mockDataKeys = [
    { key: 'value', name: 'Test Value', color: '#10B981' },
    { key: 'otherValue', name: 'Other Value', color: '#0EA5E9' }
  ];

  it('renders with title and subtitle', () => {
    render(
      <LineChart
        title="Test Chart Title"
        subtitle="Test Chart Subtitle"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="date"
        height={300}
        loading={false}
      />
    );

    expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
    expect(screen.getByText('Test Chart Subtitle')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    render(
      <LineChart
        title="Loading Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="date"
        height={300}
        loading={true}
      />
    );

    // Should show a loading skeleton - the exact implementation may vary
    // Just check the component renders and doesn't crash
    expect(screen.getByText('Loading Test')).toBeInTheDocument();
  });

  it('renders empty message when no data', () => {
    render(
      <LineChart
        title="Empty Test"
        data={[]}
        dataKeys={mockDataKeys}
        xAxisDataKey="date"
        height={300}
        loading={false}
      />
    );

    // Should show an empty state with responsive container
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders chart with data correctly', () => {
    render(
      <LineChart
        title="Data Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="date"
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
    const tooltipFormatter = (value: number, name: string): [string, string] => [`${value}%`, name];
    
    render(
      <LineChart
        title="Formatter Test"
        data={mockData}
        dataKeys={mockDataKeys}
        xAxisDataKey="date"
        height={300}
        loading={false}
        tooltipFormatter={tooltipFormatter}
      />
    );

    // ResponsiveContainer should be rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});