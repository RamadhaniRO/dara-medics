import React from 'react';
import styled, { keyframes, css } from 'styled-components';

export interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '3rem' | string;
  shadow?: 'sm' | 'md' | 'lg';
  border?: boolean | string;
  borderRadius?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  marginBottom?: string;
  elevation?: 'sm' | 'md' | 'lg';
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const hoverScale = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.02);
  }
`;

const StyledCard = styled.div<{
  hover: boolean;
  clickable: boolean;
  padding: CardProps['padding'];
  shadow: CardProps['shadow'];
  border: boolean | string;
  borderRadius: CardProps['borderRadius'];
  backgroundColor?: string;
  marginBottom?: string;
  elevation?: CardProps['elevation'];
}>`
  background: ${({ backgroundColor }) => backgroundColor || '#ffffff'};
  border-radius: ${({ borderRadius }) => {
    switch (borderRadius) {
      case 'sm': return '0.375rem';
      case 'lg': return '1rem';
      default: return '0.5rem';
    }
  }};
  padding: ${({ padding }) => {
    switch (padding) {
      case 'sm': return '0.75rem';
      case 'lg': return '2rem';
      case '0': return '0';
      case '1': return '0.25rem';
      case '2': return '0.5rem';
      case '3': return '0.75rem';
      case '4': return '1rem';
      case '5': return '1.25rem';
      case '6': return '1.5rem';
      case '3rem': return '3rem';
      default: return typeof padding === 'string' ? padding : '1.5rem';
    }
  }};
  margin-bottom: ${({ marginBottom }) => marginBottom || '0'};
  box-shadow: ${({ shadow, elevation }) => {
    const shadowValue = elevation || shadow;
    switch (shadowValue) {
      case 'sm': return '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      case 'lg': return '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      default: return '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }
  }};
  border: ${({ border }) => {
    if (typeof border === 'string') return border;
    return border ? '1px solid #e5e7eb' : 'none';
  }};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;
  
  ${({ clickable }) => clickable && css`
    cursor: pointer;
  `}
    
  ${({ hover, clickable }) => (hover || clickable) && css`
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: ${hoverScale} 0.2s ease-out;
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${({ hover, clickable }) => (hover || clickable) && css`
    &:hover::before {
      opacity: 1;
    }
  `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  clickable = false,
  padding = 'md',
  shadow = 'md',
  border = false,
  borderRadius = 'md',
  backgroundColor,
  onClick,
  className,
  style,
  marginBottom,
  elevation,
}) => {
  return (
    <StyledCard
      hover={hover}
      clickable={clickable}
      padding={padding}
      shadow={shadow}
      border={border}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      marginBottom={marginBottom}
      elevation={elevation}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </StyledCard>
  );
};

export default Card;