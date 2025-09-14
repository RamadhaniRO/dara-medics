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
    '7xl': '7rem',
    '8xl': '8rem',
    '9xl': '9rem',
    '10xl': '10rem',
  },
};

export interface FlexProps {
  children?: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'start' | 'end';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end';
  gap?: keyof typeof theme.spacing | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  padding?: keyof typeof theme.spacing | string;
  margin?: keyof typeof theme.spacing | string;
  marginBottom?: keyof typeof theme.spacing | string;
  marginTop?: keyof typeof theme.spacing | string;
  marginLeft?: keyof typeof theme.spacing | string;
  marginRight?: keyof typeof theme.spacing | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const StyledFlex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'stretch' }) => {
    if (align === 'start') return 'flex-start';
    if (align === 'end') return 'flex-end';
    return align;
  }};
  justify-content: ${({ justify = 'flex-start' }) => {
    if (justify === 'start') return 'flex-start';
    if (justify === 'end') return 'flex-end';
    return justify;
  }};
  gap: ${({ gap = '0' }) => getSpacingValue(gap)};
  flex-wrap: ${({ wrap = false }) => wrap ? 'wrap' : 'nowrap'};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  height: ${({ fullHeight }) => fullHeight ? '100%' : 'auto'};
  padding: ${({ padding }) => padding ? getSpacingValue(padding) : '0'};
  margin: ${({ margin }) => margin ? getSpacingValue(margin) : '0'};
  margin-bottom: ${({ marginBottom }) => marginBottom ? getSpacingValue(marginBottom) : '0'};
  margin-top: ${({ marginTop }) => marginTop ? getSpacingValue(marginTop) : '0'};
  margin-left: ${({ marginLeft }) => marginLeft ? getSpacingValue(marginLeft) : '0'};
  margin-right: ${({ marginRight }) => marginRight ? getSpacingValue(marginRight) : '0'};
  
  ${({ onClick }) => onClick && `
    cursor: pointer;
  `}
`;

export const Flex: React.FC<FlexProps> = ({ children, ...props }) => {
  return <StyledFlex {...props}>{children}</StyledFlex>;
};

export default Flex;
