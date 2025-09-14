import React from 'react';
import styled from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    white: '#ffffff',
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
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5rem',
    '6xl': '6rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

export interface BoxProps {
  children?: React.ReactNode;
  padding?: keyof typeof theme.spacing | string;
  margin?: keyof typeof theme.spacing | string;
  marginBottom?: keyof typeof theme.spacing | string;
  marginTop?: keyof typeof theme.spacing | string;
  marginLeft?: keyof typeof theme.spacing | string;
  marginRight?: keyof typeof theme.spacing | string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  borderRadius?: keyof typeof theme.borderRadius | string;
  border?: string;
  boxShadow?: string;
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: keyof typeof theme.spacing | string;
  flex?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const getBorderRadiusValue = (value: string | keyof typeof theme.borderRadius): string => {
  if (typeof value === 'string' && value in theme.borderRadius) {
    return theme.borderRadius[value as unknown as keyof typeof theme.borderRadius];
  }
  return String(value);
};

const StyledBox = styled.div<BoxProps>`
  padding: ${({ padding }) => padding ? getSpacingValue(padding) : '0'};
  margin: ${({ margin }) => margin ? getSpacingValue(margin) : '0'};
  margin-bottom: ${({ marginBottom }) => marginBottom ? getSpacingValue(marginBottom) : '0'};
  margin-top: ${({ marginTop }) => marginTop ? getSpacingValue(marginTop) : '0'};
  margin-left: ${({ marginLeft }) => marginLeft ? getSpacingValue(marginLeft) : '0'};
  margin-right: ${({ marginRight }) => marginRight ? getSpacingValue(marginRight) : '0'};
  width: ${({ width }) => width || 'auto'};
  height: ${({ height }) => height || 'auto'};
  background-color: ${({ backgroundColor }) => backgroundColor || 'transparent'};
  border-radius: ${({ borderRadius }) => borderRadius ? getBorderRadiusValue(borderRadius) : '0'};
  border: ${({ border }) => border || 'none'};
  box-shadow: ${({ boxShadow }) => boxShadow || 'none'};
  display: ${({ display }) => display || 'block'};
  flex-direction: ${({ flexDirection }) => flexDirection || 'row'};
  align-items: ${({ alignItems }) => alignItems || 'stretch'};
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  gap: ${({ gap }) => gap ? getSpacingValue(gap) : '0'};
  flex: ${({ flex }) => flex || 'none'};
  text-align: ${({ textAlign }) => textAlign || 'left'};
  
  ${({ onClick }) => onClick && `
    cursor: pointer;
  `}
`;

export const Box: React.FC<BoxProps> = ({ children, as, ...props }) => {
  return <StyledBox as={as} {...props}>{children}</StyledBox>;
};

export default Box;
