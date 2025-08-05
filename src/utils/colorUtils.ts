import { ColorRule, DataSource } from '@/types';

export const getColorForValue = (
  value: number,
  dataSource: DataSource
): string => {
  // Sort rules by value to ensure proper evaluation order
  const sortedRules = [...dataSource.colorRules].sort((a, b) => a.value - b.value);
  
  for (const rule of sortedRules) {
    if (evaluateRule(value, rule)) {
      return rule.color;
    }
  }
  
  // Default color if no rules match
  return '#cccccc';
};

export const evaluateRule = (value: number, rule: ColorRule): boolean => {
  switch (rule.operator) {
    case '=':
      return value === rule.value;
    case '<':
      return value < rule.value;
    case '>':
      return value > rule.value;
    case '<=':
      return value <= rule.value;
    case '>=':
      return value >= rule.value;
    default:
      return false;
  }
};

export const generateColorPalette = (count: number): string[] => {
  const colors = [
    '#ff4444', // Red
    '#4444ff', // Blue
    '#44ff44', // Green
    '#ffff44', // Yellow
    '#ff44ff', // Magenta
    '#44ffff', // Cyan
    '#ff8844', // Orange
    '#8844ff', // Purple
    '#44ff88', // Light Green
    '#ff4488', // Pink
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors: string[] = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return [...colors, ...additionalColors];
};

export const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const validateColorRule = (rule: ColorRule): boolean => {
  return (
    rule.value !== undefined &&
    rule.value !== null &&
    !isNaN(rule.value) &&
    rule.color &&
    rule.color.match(/^#[0-9A-Fa-f]{6}$/) !== null
  );
}; 