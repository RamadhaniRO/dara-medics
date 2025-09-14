import React from 'react';
import styled, { css } from 'styled-components';

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
    '7xl': '7rem',
    '8xl': '8rem',
    '9xl': '9rem',
    '10xl': '10rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  gap?: keyof typeof theme.spacing | string;
  rowGap?: keyof typeof theme.spacing | string;
  columnGap?: keyof typeof theme.spacing | string;
  padding?: keyof typeof theme.spacing | string;
  margin?: keyof typeof theme.spacing | string;
  fullWidth?: boolean;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const getGridColumns = (columns: number | string) => {
  if (typeof columns === 'number') {
    return `repeat(${columns}, 1fr)`;
  }
  return columns;
};

const StyledGrid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${({ columns = 1 }) => getGridColumns(columns)};
  gap: ${({ gap = '6' }) => getSpacingValue(gap)};
  row-gap: ${({ rowGap }) => rowGap ? getSpacingValue(rowGap) : 'unset'};
  column-gap: ${({ columnGap }) => columnGap ? getSpacingValue(columnGap) : 'unset'};
  padding: ${({ padding }) => padding ? getSpacingValue(padding) : '0'};
  margin: ${({ margin }) => margin ? getSpacingValue(margin) : '0'};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  ${({ responsive }) => responsive && css`
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
  `}
`;

export const Grid: React.FC<GridProps> = ({ children, ...props }) => {
  return <StyledGrid {...props}>{children}</StyledGrid>;
};

export default Grid;
