import React from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  colors: {
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
};

export interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'md';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  margin?: string;
  marginBottom?: string;
  marginTop?: string;
  marginLeft?: string;
  marginRight?: string;
  marginX?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'xs':
      return css`font-size: ${theme.typography.fontSize.xs};`;
    case 'sm':
      return css`font-size: ${theme.typography.fontSize.sm};`;
    case 'md':
      return css`font-size: ${theme.typography.fontSize.base};`;
    case 'lg':
      return css`font-size: ${theme.typography.fontSize.lg};`;
    case 'xl':
      return css`font-size: ${theme.typography.fontSize.xl};`;
    case '2xl':
      return css`font-size: ${theme.typography.fontSize['2xl']};`;
    case '3xl':
      return css`font-size: ${theme.typography.fontSize['3xl']};`;
    case '4xl':
      return css`font-size: ${theme.typography.fontSize['4xl']};`;
    default:
      return css`font-size: ${theme.typography.fontSize.base};`;
  }
};

const getWeightStyles = (weight: string) => {
  switch (weight) {
    case 'light':
      return css`font-weight: ${theme.typography.fontWeight.light};`;
    case 'medium':
      return css`font-weight: ${theme.typography.fontWeight.medium};`;
    case 'semibold':
      return css`font-weight: ${theme.typography.fontWeight.semibold};`;
    case 'bold':
      return css`font-weight: ${theme.typography.fontWeight.bold};`;
    case 'extrabold':
      return css`font-weight: ${theme.typography.fontWeight.extrabold};`;
    default:
      return css`font-weight: ${theme.typography.fontWeight.normal};`;
  }
};

const StyledText = styled.p<TextProps>`
  margin: 0;
  font-family: ${theme.typography.fontFamily.sans};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${({ color }) => color || theme.colors.gray[900]};
  text-align: ${({ align = 'left' }) => align};
  margin: ${({ margin }) => margin || '0'};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0'};
  margin-top: ${({ marginTop }) => marginTop || '0'};
  margin-left: ${({ marginLeft }) => marginLeft || '0'};
  margin-right: ${({ marginRight }) => marginRight || '0'};
  margin-left: ${({ marginX }) => marginX || '0'};
  margin-right: ${({ marginX }) => marginX || '0'};
  
  ${({ size = 'base' }) => getSizeStyles(size)}
  ${({ weight = 'normal' }) => getWeightStyles(weight)}
`;

export const Text: React.FC<TextProps> = ({ as = 'p', ...props }) => {
  return <StyledText as={as} {...props} />;
};

export default Text;
