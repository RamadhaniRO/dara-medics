import React from 'react';
import styled, { css } from 'styled-components';

// Self-contained theme values
const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    red: {
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    green: {
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
  },
  spacing: {
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
  },
  borderRadius: {
    md: '0.375rem',
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
    },
  },
  transitions: {
    duration: {
      fast: '150ms',
    },
    easing: {
      easeInOut: 'ease-in-out',
    },
  },
};

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  marginBottom?: keyof typeof theme.spacing | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary[500]};
        color: white;
        border: 1px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[600]};
        }
        
        &:active:not(:disabled) {
          background-color: ${theme.colors.primary[700]};
          border-color: ${theme.colors.primary[700]};
        }
      `;
    case 'secondary':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary[500]};
        border: 1px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[50]};
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${theme.colors.gray[600]};
        border: 1px solid ${theme.colors.gray[300]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.gray[50]};
          border-color: ${theme.colors.gray[400]};
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.gray[600]};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.gray[50]};
          color: ${theme.colors.gray[700]};
        }
      `;
    case 'danger':
      return css`
        background-color: ${theme.colors.red[500]};
        color: white;
        border: 1px solid ${theme.colors.red[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.red[600]};
          border-color: ${theme.colors.red[600]};
        }
      `;
    case 'success':
      return css`
        background-color: ${theme.colors.green[500]};
        color: white;
        border: 1px solid ${theme.colors.green[500]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.green[600]};
          border-color: ${theme.colors.green[600]};
        }
      `;
    case 'link':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary[500]};
        border: 1px solid transparent;
        text-decoration: underline;
        
        &:hover:not(:disabled) {
          color: ${theme.colors.primary[600]};
        }
      `;
    default:
      return css`
        background-color: ${theme.colors.primary[500]};
        color: white;
        border: 1px solid ${theme.colors.primary[500]};
      `;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        padding: 0.75rem 1rem;
        font-size: ${theme.typography.fontSize.sm};
        height: 2.5rem;
      `;
    case 'md':
      return css`
        padding: 0.875rem 1rem;
        font-size: ${theme.typography.fontSize.base};
        height: 2.75rem;
      `;
    case 'lg':
      return css`
        padding: 1rem 1.25rem;
        font-size: ${theme.typography.fontSize.lg};
        height: 3rem;
      `;
    case 'xl':
      return css`
        padding: 1.125rem 1.5rem;
        font-size: ${theme.typography.fontSize.xl};
        height: 3.25rem;
      `;
    default:
      return css`
        padding: 0.875rem 1rem;
        font-size: ${theme.typography.fontSize.base};
        height: 2.75rem;
      `;
  }
};

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

interface StyledButtonProps extends Omit<ButtonProps, 'loading'> {
  $loading?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.sans};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.tight};
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  text-decoration: none;
  outline: none;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  margin-bottom: ${({ marginBottom }) => marginBottom ? getSpacingValue(marginBottom) : '0'};
  
  ${({ variant = 'primary' }) => getVariantStyles(variant)}
  ${({ size = 'md' }) => getSizeStyles(size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    box-shadow: 0 0 0 3px ${theme.colors.primary[200]};
  }
  
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
  `}
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <StyledButton
      disabled={disabled || loading}
      $loading={loading}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </StyledButton>
  );
};

export default Button;