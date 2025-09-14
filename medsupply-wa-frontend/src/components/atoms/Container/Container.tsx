import React from 'react';
import styled from 'styled-components';

// Embedded theme values for self-containment
const theme = {
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
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | string;
  center?: boolean;
  padding?: keyof typeof theme.spacing | string;
  margin?: keyof typeof theme.spacing | string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getMaxWidth = (maxWidth: string) => {
  switch (maxWidth) {
    case 'sm':
      return '640px';
    case 'md':
      return '768px';
    case 'lg':
      return '1024px';
    case 'xl':
      return '1280px';
    case '2xl':
      return '1536px';
    case 'full':
      return '100%';
    default:
      return maxWidth;
  }
};

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const StyledContainer = styled.div<ContainerProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  max-width: ${({ maxWidth = 'xl' }) => getMaxWidth(maxWidth)};
  margin: ${({ center, margin }) => {
    if (center) return '0 auto';
    return margin ? getSpacingValue(margin) : '0';
  }};
  padding: ${({ padding = '4' }) => getSpacingValue(padding)};
  
  @media (max-width: 640px) {
    padding: ${({ padding = '4' }) => {
      const value = getSpacingValue(padding);
      // Reduce padding on mobile
      return value.replace(/\d+/, (match) => String(Math.max(1, parseInt(match) - 1)));
    }};
  }
`;

export const Container: React.FC<ContainerProps> = ({ children, ...props }) => {
  return <StyledContainer {...props}>{children}</StyledContainer>;
};

export default Container;
