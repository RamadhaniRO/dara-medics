import React from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
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
  },
};

export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  margin?: string;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

const getSizeStyles = (size: string) => {
  return css`
    font-size: ${theme.typography.fontSize[size as keyof typeof theme.typography.fontSize] || theme.typography.fontSize['3xl']};
  `;
};

const getLevelStyles = (level: number) => {
  switch (level) {
    case 1:
      return css`
        font-size: ${theme.typography.fontSize['4xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: 1.2;
      `;
    case 2:
      return css`
        font-size: ${theme.typography.fontSize['3xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: 1.2;
      `;
    case 3:
      return css`
        font-size: ${theme.typography.fontSize['2xl']};
        font-weight: ${theme.typography.fontWeight.semibold};
        line-height: 1.2;
      `;
    case 4:
      return css`
        font-size: ${theme.typography.fontSize.xl};
        font-weight: ${theme.typography.fontWeight.semibold};
        line-height: 1.2;
      `;
    case 5:
      return css`
        font-size: ${theme.typography.fontSize.lg};
        font-weight: ${theme.typography.fontWeight.medium};
        line-height: 1.2;
      `;
    case 6:
      return css`
        font-size: ${theme.typography.fontSize.base};
        font-weight: ${theme.typography.fontWeight.medium};
        line-height: 1.2;
      `;
    default:
      return css`
        font-size: ${theme.typography.fontSize['3xl']};
        font-weight: ${theme.typography.fontWeight.bold};
        line-height: 1.2;
      `;
  }
};

const StyledHeading = styled.h1<HeadingProps>`
  margin: 0;
  color: ${({ color }) => color || theme.colors.gray[900]};
  text-align: ${({ align = 'left' }) => align};
  margin: ${({ margin }) => margin || '0'};
  
  ${({ level = 1, size }) => size ? getSizeStyles(size) : getLevelStyles(level)}
`;

export const Heading: React.FC<HeadingProps> = ({ 
  level = 1, 
  as, 
  ...props 
}) => {
  const Component = as || (`h${level}` as keyof JSX.IntrinsicElements);
  return <StyledHeading as={Component} level={level} {...props} />;
};

export default Heading;
