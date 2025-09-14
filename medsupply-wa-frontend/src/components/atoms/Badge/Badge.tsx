import React from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      600: '#4b5563',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
  typography: {
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
    },
    weights: {
      medium: '500',
      semibold: '600',
    },
  },
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'error';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: #dbeafe;
        color: #1d4ed8;
        border: 1px solid #93c5fd;
        font-weight: 600;
      `;
    case 'secondary':
      return css`
        background-color: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        font-weight: 500;
      `;
    case 'success':
      return css`
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #86efac;
        font-weight: 600;
      `;
    case 'warning':
      return css`
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
        font-weight: 600;
      `;
    case 'danger':
    case 'error':
      return css`
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        font-weight: 600;
      `;
    case 'info':
      return css`
        background-color: #dbeafe;
        color: #1e40af;
        border: 1px solid #93c5fd;
        font-weight: 600;
      `;
    default:
      return css`
        background-color: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        font-weight: 500;
      `;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1.2;
        border-radius: 0.375rem;
      `;
    case 'lg':
      return css`
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.3;
        border-radius: 0.5rem;
      `;
    default:
      return css`
        padding: 0.375rem 0.625rem;
        font-size: 0.8125rem;
        line-height: 1.3;
        border-radius: 0.375rem;
      `;
  }
};

const StyledBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: ${({ rounded }) => rounded ? '9999px' : '0.375rem'};
  transition: all 0.2s ease;
  
  ${({ variant = 'secondary' }) => getVariantStyles(variant)}
  ${({ size = 'md' }) => getSizeStyles(size)}
`;

export const Badge: React.FC<BadgeProps> = ({ children, ...props }) => {
  return <StyledBadge {...props}>{children}</StyledBadge>;
};

export default Badge;
