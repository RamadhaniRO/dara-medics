import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
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
      relaxed: '1.75',
    },
  },
  transitions: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s',
    },
    easing: {
      easeInOut: 'ease-in-out',
    },
  },
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  label?: string;
  required?: boolean;
  hasError?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'filled':
      return css`
        background-color: ${theme.colors.gray[50]};
        border: 1px solid transparent;
        
        &:focus {
          background-color: white;
          border-color: ${theme.colors.primary[500]};
        }
      `;
    case 'outlined':
      return css`
        background-color: transparent;
        border: 2px solid ${theme.colors.gray[300]};
        
        &:focus {
          border-color: ${theme.colors.primary[500]};
        }
      `;
    default:
      return css`
        background-color: white;
        border: 1px solid ${theme.colors.gray[300]};
        
        &:focus {
          border-color: ${theme.colors.primary[500]};
          box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
        }
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
        min-height: 2.5rem;
      `;
    case 'md':
      return css`
        padding: 0.875rem 1rem;
        font-size: ${theme.typography.fontSize.base};
        height: 2.75rem;
        min-height: 2.75rem;
      `;
    case 'lg':
      return css`
        padding: 1rem 1.25rem;
        font-size: ${theme.typography.fontSize.lg};
        height: 3rem;
        min-height: 3rem;
      `;
    case 'xl':
      return css`
        padding: 1.125rem 1.5rem;
        font-size: ${theme.typography.fontSize.xl};
        height: 3.25rem;
        min-height: 3.25rem;
      `;
    default:
      return css`
        padding: 0.875rem 1rem;
        font-size: ${theme.typography.fontSize.base};
        height: 2.75rem;
        min-height: 2.75rem;
      `;
  }
};

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  position: relative;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.tight};
  color: ${theme.colors.gray[700]};
  margin-bottom: 0.5rem;
  
  ${({ required }) => required && css`
    &::after {
      content: ' *';
      color: ${theme.colors.red[500]};
    }
  `}
`;

const InputWrapper = styled.div<{ hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

interface StyledInputProps {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hasError?: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.typography.fontFamily.sans};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  outline: none;
  box-sizing: border-box;
  
  ${({ variant = 'default' }) => getVariantStyles(variant)}
  ${({ inputSize = 'md' }) => getSizeStyles(inputSize)}
  
  ${({ leftIcon }) => leftIcon && css`
    padding-left: 2.5rem;
  `}
  
  ${({ rightIcon }) => rightIcon && css`
    padding-right: 2.5rem;
  `}
  
  ${({ error }) => error && css`
    border-color: ${theme.colors.red[500]};
    
    &:focus {
      border-color: ${theme.colors.red[500]};
      box-shadow: 0 0 0 3px ${theme.colors.red[100]};
    }
  `}
  
  &::placeholder {
    color: ${theme.colors.gray[400]};
    font-weight: ${theme.typography.fontWeight.normal};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[500]};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.gray[400]};
  pointer-events: none;
  z-index: 1;
  
  ${({ position }) => position === 'left' ? css`
    left: ${theme.spacing[3]};
  ` : css`
    right: ${theme.spacing[3]};
  `}
`;

const HelperText = styled.div<{ error?: boolean }>`
  margin-top: 0.25rem;
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[600]};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error = false,
  leftIcon,
  rightIcon,
  required = false,
  fullWidth = false,
  variant = 'default',
  size = 'md',
  ...inputProps
}, ref) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      <InputWrapper hasLeftIcon={!!leftIcon} hasRightIcon={!!rightIcon}>
        {leftIcon && (
          <IconWrapper position="left">
            {leftIcon}
          </IconWrapper>
        )}
        <StyledInput
          ref={ref}
          error={error}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          fullWidth={fullWidth}
          variant={variant}
          inputSize={size}
          {...inputProps}
        />
        {rightIcon && (
          <IconWrapper position="right">
            {rightIcon}
          </IconWrapper>
        )}
      </InputWrapper>
      {helperText && (
        <HelperText error={error}>
          {helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;
