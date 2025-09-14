import React from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    primary: {
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    gray: {
      500: '#6b7280',
      600: '#4b5563',
    },
    red: {
      500: '#ef4444',
      600: '#dc2626',
    },
    green: {
      500: '#22c55e',
      600: '#16a34a',
    },
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
  },
  typography: {
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
    },
    fontWeight: {
      medium: '500',
    },
  },
  borderRadius: {
    sm: '0.25rem',
  },
  transitions: {
    duration: {
      fast: '0.15s',
    },
    easing: {
      easeInOut: 'ease-in-out',
    },
  },
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  underline?: 'none' | 'hover' | 'always';
  disabled?: boolean;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  to?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        color: ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          color: ${theme.colors.primary[600]};
        }
        
        &:active:not(:disabled) {
          color: ${theme.colors.primary[700]};
        }
      `;
    case 'secondary':
      return css`
        color: ${theme.colors.gray[600]};
        
        &:hover:not(:disabled) {
          color: ${theme.colors.gray[700]};
        }
      `;
    case 'ghost':
      return css`
        color: ${theme.colors.gray[500]};
        
        &:hover:not(:disabled) {
          color: ${theme.colors.gray[600]};
          background-color: ${theme.colors.gray[50]};
        }
      `;
    case 'danger':
      return css`
        color: ${theme.colors.red[500]};
        
        &:hover:not(:disabled) {
          color: ${theme.colors.red[600]};
        }
      `;
    case 'success':
      return css`
        color: ${theme.colors.green[500]};
        
        &:hover:not(:disabled) {
          color: ${theme.colors.green[600]};
        }
      `;
    default:
      return css`
        color: ${theme.colors.primary[500]};
      `;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        font-size: ${theme.typography.fontSize.sm};
      `;
    case 'lg':
      return css`
        font-size: ${theme.typography.fontSize.lg};
      `;
    default:
      return css`
        font-size: ${theme.typography.fontSize.base};
      `;
  }
};

const getUnderlineStyles = (underline: string) => {
  switch (underline) {
    case 'hover':
      return css`
        text-decoration: none;
        
        &:hover:not(:disabled) {
          text-decoration: underline;
        }
      `;
    case 'always':
      return css`
        text-decoration: underline;
      `;
    default:
      return css`
        text-decoration: none;
      `;
  }
};

const StyledLink = styled.a<LinkProps>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  margin: -${theme.spacing[1]} -${theme.spacing[2]};
  
  ${({ variant = 'primary' }) => getVariantStyles(variant)}
  ${({ size = 'md' }) => getSizeStyles(size)}
  ${({ underline = 'none' }) => getUnderlineStyles(underline)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const Link: React.FC<LinkProps> = ({
  children,
  as,
  disabled = false,
  ...props
}) => {
  return (
    <StyledLink
      as={as}
      disabled={disabled}
      {...props}
    >
      {children}
    </StyledLink>
  );
};

export default Link;
