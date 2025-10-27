import { describe, it, expect } from 'vitest';
import { normalizeNumber, aggregateValuation, calcVCMethod, calcDCF } from './engine';

describe('normalizeNumber', () => {
  it('parses numeric string', () => {
    expect(normalizeNumber('1200')).toBe(1200);
  });
  it('empty string -> 0', () => {
    expect(normalizeNumber('')).toBe(0);
  });
  it('non-numeric -> 0', () => {
    expect(normalizeNumber('abc')).toBe(0);
  });
});

describe('aggregateValuation', () => {
  it('empty array returns zeros', () => {
    expect(aggregateValuation([])).toEqual({ min: 0, target: 0, max: 0 });
  });
  it('calculates min/target/max', () => {
    const res = aggregateValuation([{ method: 'a', value: 10 }, { method: 'b', value: 30 }]);
    expect(res.min).toBe(10);
    expect(res.max).toBe(30);
    expect(res.target).toBe(20);
  });
});

describe('calcVCMethod', () => {
  it('calculates post-money correctly', () => {
    const out = calcVCMethod({ revenueYear5: 5_000_000, expectedMultiple: 4, dilutionPercent: 20 });
    expect(out.method).toBe('vcmethod');
    expect(out.value).toBe(16_000_000);
  });
});

describe('calcDCF', () => {
  it('calculates present value approximately', () => {
    const cashflows = [100000, 120000, 150000];
    const out = calcDCF({ cashflows, discountRate: 0.1 });
    // Calculate expected PV manually
    const expected = cashflows.reduce((s, cf, i) => s + cf / Math.pow(1.1, i + 1), 0);
    expect(out.method).toBe('dcf');
    // allow small floating point diff
    expect(Math.abs(out.value - expected)).toBeLessThan(1e-6);
  });
});
