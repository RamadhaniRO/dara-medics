import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const dots = keyframes`
  0%, 20% {
    color: rgba(0, 0, 0, 0);
    text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  40% {
    color: currentColor;
    text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  60% {
    text-shadow: 0.25em 0 0 currentColor, 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  80%, 100% {
    text-shadow: 0.25em 0 0 currentColor, 0.5em 0 0 currentColor;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
`;

const bars = keyframes`
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
`;

const Container = styled.div<{ fullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  ${({ fullScreen }) => fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: 9999;
  `}
`;

const Spinner = styled.div<{ size: LoadingProps['size']; color: string }>`
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }};
  border: 2px solid transparent;
  border-top: 2px solid ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Dots = styled.div<{ size: LoadingProps['size']; color: string }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '2rem';
      default: return '1.5rem';
    }
  }};
  color: ${({ color }) => color};
  animation: ${dots} 1.4s infinite linear;
  
  &::after {
    content: '...';
  }
`;

const Pulse = styled.div<{ size: LoadingProps['size']; color: string }>`
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '3rem';
      default: return '2rem';
    }
  }};
  background: ${({ color }) => color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const BarsContainer = styled.div<{ size: LoadingProps['size'] }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '1rem';
      case 'lg': return '2rem';
      default: return '1.5rem';
    }
  }};
`;

const Bar = styled.div<{ 
  size: LoadingProps['size']; 
  color: string;
  delay: number;
}>`
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '0.25rem';
      case 'lg': return '0.5rem';
      default: return '0.375rem';
    }
  }};
  height: 100%;
  background: ${({ color }) => color};
  border-radius: 0.125rem;
  animation: ${bars} 1.2s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const Text = styled.div<{ size: LoadingProps['size'] }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1.125rem';
      default: return '1rem';
    }
  }};
  font-weight: 500;
  color: #6b7280;
  text-align: center;
`;

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = '#3b82f6',
  text,
  fullScreen = false,
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <Dots size={size} color={color} />;
      case 'pulse':
        return <Pulse size={size} color={color} />;
      case 'bars':
        return (
          <BarsContainer size={size}>
            <Bar size={size} color={color} delay={0} />
            <Bar size={size} color={color} delay={0.1} />
            <Bar size={size} color={color} delay={0.2} />
            <Bar size={size} color={color} delay={0.3} />
            <Bar size={size} color={color} delay={0.4} />
          </BarsContainer>
        );
      default:
        return <Spinner size={size} color={color} />;
    }
  };

  return (
    <Container fullScreen={fullScreen}>
      {renderLoader()}
      {text && <Text size={size}>{text}</Text>}
    </Container>
  );
};

export default Loading;
