import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

const progressAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const Container = styled.div`
  width: 100%;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Label = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Value = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
`;

const ProgressBar = styled.div<{ size: ProgressProps['size'] }>`
  width: 100%;
  background: #e5e7eb;
  border-radius: ${({ size }) => {
    switch (size) {
      case 'sm': return '0.25rem';
      case 'lg': return '0.75rem';
      default: return '0.5rem';
    }
  }};
  overflow: hidden;
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '0.5rem';
      case 'lg': return '1rem';
      default: return '0.75rem';
    }
  }};
`;

const ProgressFill = styled.div<{
  value: number;
  max: number;
  variant: ProgressProps['variant'];
  animated: boolean;
  striped: boolean;
}>`
  height: 100%;
  width: ${({ value, max }) => (value / max) * 100}%;
  background: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'linear-gradient(90deg, #10b981, #059669)';
      case 'warning': return 'linear-gradient(90deg, #f59e0b, #d97706)';
      case 'error': return 'linear-gradient(90deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
    }
  }};
  border-radius: inherit;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
  
  ${({ animated }) => animated && `
    animation: ${pulse} 2s infinite;
  `}
  
  ${({ striped }) => striped && `
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 40px 40px;
    animation: ${progressAnimation} 1s linear infinite;
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${progressAnimation} 2s infinite;
  }
`;

const CircularProgressContainer = styled.div<{
  size: ProgressProps['size'];
  value: number;
  max: number;
  variant: ProgressProps['variant'];
}>`
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '3rem';
      case 'lg': return '6rem';
      default: return '4rem';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '3rem';
      case 'lg': return '6rem';
      default: return '4rem';
    }
  }};
  border-radius: 50%;
  background: conic-gradient(
    ${({ variant }) => {
      switch (variant) {
        case 'success': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#3b82f6';
      }
    }} ${({ value, max }) => (value / max) * 360}deg,
    #e5e7eb 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.5s ease;
  
  &::before {
    content: '';
    position: absolute;
    width: 70%;
    height: 70%;
    background: white;
    border-radius: 50%;
  }
`;

const CircularValue = styled.span`
  position: relative;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  striped = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <Container>
      {showLabel && (
        <LabelContainer>
          <Label>{label || 'Progress'}</Label>
          <Value>{Math.round(percentage)}%</Value>
        </LabelContainer>
      )}
      
      <ProgressBar size={size}>
        <ProgressFill
          value={value}
          max={max}
          variant={variant}
          animated={animated}
          striped={striped}
        />
      </ProgressBar>
    </Container>
  );
};

export const CircularProgress: React.FC<Omit<ProgressProps, 'showLabel' | 'label' | 'striped'> & {
  showValue?: boolean;
}> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = false,
  showValue = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <CircularProgressContainer
      size={size}
      value={value}
      max={max}
      variant={variant}
    >
      {showValue && (
        <CircularValue>{Math.round(percentage)}%</CircularValue>
      )}
    </CircularProgressContainer>
  );
};

export default Progress;
