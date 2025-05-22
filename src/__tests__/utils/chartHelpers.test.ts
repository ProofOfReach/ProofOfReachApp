import {
  formatDate,
  formatNumber,
  formatSats,
  formatPercent,
  getChartColor,
  generateChartData
} from '../../utils/chartHelpers';

describe('Chart Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      expect(formatDate('2025-05-01')).toBe('May 1');
      expect(formatDate('2025-12-25')).toBe('Dec 25');
    });

    it('should format Date objects correctly', () => {
      const date = new Date('2025-05-01');
      expect(formatDate(date)).toBe('May 1');
    });

    it('should format timestamps correctly', () => {
      const timestamp = new Date('2025-05-01').getTime();
      expect(formatDate(timestamp)).toBe('May 1');
    });

    it('should return the original input if it cannot be parsed', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers under 1,000 correctly', () => {
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(0)).toBe('0');
    });

    it('should format numbers between 1,000 and 1,000,000 with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(12345)).toBe('12.3K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('should format numbers over 1,000,000 with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(12345678)).toBe('12.3M');
    });
  });

  describe('formatSats', () => {
    it('should format satoshi values under 1,000 correctly', () => {
      expect(formatSats(123)).toBe('123 sats');
      expect(formatSats(0)).toBe('0 sats');
    });

    it('should format satoshi values between 1,000 and 1,000,000 with K suffix', () => {
      expect(formatSats(1000)).toBe('1.0K sats');
      expect(formatSats(12345)).toBe('12.3K sats');
      expect(formatSats(999999)).toBe('1000.0K sats');
    });

    it('should format satoshi values over 1,000,000 with M suffix', () => {
      expect(formatSats(1000000)).toBe('1.00M sats');
      expect(formatSats(12345678)).toBe('12.35M sats');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal values as percentages with two decimal places', () => {
      expect(formatPercent(0)).toBe('0.00%');
      expect(formatPercent(0.123)).toBe('12.30%');
      expect(formatPercent(1)).toBe('100.00%');
      expect(formatPercent(0.0567)).toBe('5.67%');
    });
  });

  describe('getChartColor', () => {
    it('should return valid color strings for different indices', () => {
      // Test a few indices to verify we get different colors
      const color0 = getChartColor(0);
      const color1 = getChartColor(1);
      const color7 = getChartColor(7);

      // Verify they're all valid hex color strings
      expect(color0).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color7).toMatch(/^#[0-9A-F]{6}$/i);

      // Verify different indices give different colors
      expect(color0).not.toBe(color1);
      expect(color1).not.toBe(color7);
    });

    it('should cycle colors when index exceeds the number of defined colors', () => {
      // If there are 8 colors, index 8 should be the same as index 0
      const color0 = getChartColor(0);
      const color8 = getChartColor(8);
      expect(color0).toBe(color8);
    });
  });

  describe('generateChartData', () => {
    it('should generate the correct number of data points', () => {
      const days = 7;
      const data = generateChartData(days, ['value'], [100]);
      expect(data.length).toBe(days);
    });

    it('should include all specified metrics in each data point', () => {
      const metrics = ['earnings', 'impressions', 'clicks'];
      const data = generateChartData(3, metrics, [100, 200, 5]);
      
      // Check first data point has all metrics
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('earnings');
      expect(data[0]).toHaveProperty('impressions');
      expect(data[0]).toHaveProperty('clicks');
    });

    it('should calculate CTR when impressions and clicks are provided', () => {
      const data = generateChartData(1, ['impressions', 'clicks'], [1000, 50]);
      
      // First data point should have ctr calculated as clicks/impressions * 100
      expect(data[0]).toHaveProperty('ctr');
      
      // Since random variation is applied, we can't test the exact value
      // but we can verify it's in a reasonable range (roughly 5% ± variation)
      expect(data[0].ctr).toBeGreaterThan(0);
      expect(data[0].ctr).toBeLessThan(10);
    });

    it('should format dates in YYYY-MM-DD format', () => {
      const data = generateChartData(1, ['value'], [100]);
      expect(data[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});