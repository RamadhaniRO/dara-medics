import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  animation?: 'pulse' | 'bounce' | 'shake' | 'none';
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledButton = styled.button<{
  variant: AnimatedButtonProps['variant'];
  size: AnimatedButtonProps['size'];
  fullWidth: boolean;
  loading: boolean;
  disabled: boolean;
  animation: AnimatedButtonProps['animation'];
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  
  /* Size variants */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 2rem;
        `;
      case 'lg':
        return `
          padding: 1rem 2rem;
          font-size: 1.125rem;
          min-height: 3rem;
        `;
      default:
        return `
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          min-height: 2.5rem;
        `;
    }
  }}
  
  /* Color variants */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(107, 114, 128, 0.3);
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
            box-shadow: 0 6px 8px -1px rgba(107, 114, 128, 0.4);
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          
          &:hover:not(:disabled) {
            background: #3b82f6;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: #6b7280;
          
          &:hover:not(:disabled) {
            background: #f3f4f6;
            color: #374151;
          }
        `;
      default:
        return '';
    }
  }}
  
  /* Disabled state */
  ${({ disabled }) => disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  `}
  
  /* Loading state */
  ${({ loading }) => loading && `
    cursor: wait;
    pointer-events: none;
  `}
  
  /* Animation variants */
  ${({ animation }) => {
    switch (animation) {
      case 'pulse':
        return `
          animation: ${pulse} 2s infinite;
        `;
      case 'bounce':
        return `
          animation: ${bounce} 1s infinite;
        `;
      case 'shake':
        return `
          animation: ${shake} 0.5s ease-in-out;
        `;
      default:
        return '';
    }
  }}
  
  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }
  
  &:active:not(:disabled)::before {
    width: 300px;
    height: 300px;
  }
  
  /* Focus state */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  animation = 'none',
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={className}
      animation={animation}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};

export default AnimatedButton;
