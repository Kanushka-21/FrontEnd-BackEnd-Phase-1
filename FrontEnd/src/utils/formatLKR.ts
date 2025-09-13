/**
 * Enhanced LKR currency formatter that handles large numbers
 * Converts very large numbers to readable formats (e.g., 1.2B, 500M, 15K)
 * while preserving exact amounts for smaller numbers
 */

export const formatLKR = (amount: number): string => {
  if (amount === 0) return 'LKR 0';
  
  // Handle negative numbers
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // For very small amounts (less than 1000), show exact amount
  if (absAmount < 1000) {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  // For amounts 1,000 to 999,999, show exact amount with thousands separator
  if (absAmount < 1000000) {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  // For larger amounts, use abbreviated format
  const units = [
    { value: 1e12, suffix: 'T' }, // Trillion
    { value: 1e9, suffix: 'B' },  // Billion
    { value: 1e6, suffix: 'M' },  // Million
    { value: 1e3, suffix: 'K' }   // Thousand
  ];
  
  for (const unit of units) {
    if (absAmount >= unit.value) {
      const value = absAmount / unit.value;
      const formattedValue = value >= 100 
        ? Math.round(value) 
        : Math.round(value * 10) / 10;
      
      const sign = isNegative ? '-' : '';
      return `${sign}LKR ${formattedValue}${unit.suffix}`;
    }
  }
  
  // Fallback for unexpected cases
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Alternative formatter that always shows exact amount (for tooltips, detailed views)
 */
export const formatLKRExact = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatter for displaying compact numbers without currency symbol
 */
export const formatNumberCompact = (amount: number): string => {
  if (amount === 0) return '0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  if (absAmount < 1000) {
    return amount.toString();
  }
  
  if (absAmount < 1000000) {
    return new Intl.NumberFormat('en-LK').format(amount);
  }
  
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];
  
  for (const unit of units) {
    if (absAmount >= unit.value) {
      const value = absAmount / unit.value;
      const formattedValue = value >= 100 
        ? Math.round(value) 
        : Math.round(value * 10) / 10;
      
      const sign = isNegative ? '-' : '';
      return `${sign}${formattedValue}${unit.suffix}`;
    }
  }
  
  return new Intl.NumberFormat('en-LK').format(amount);
};