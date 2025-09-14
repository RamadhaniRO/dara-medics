import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { PasswordStrengthIndicator } from '../../atoms/PasswordStrengthIndicator/PasswordStrengthIndicator';

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
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
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

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  showStrength?: boolean;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  requirements?: Array<{
    text: string;
    met: boolean;
  }>;
  strength?: 'weak' | 'medium' | 'strong';
  disabled?: boolean;
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
    default:
      return css`
        padding: 0.875rem 1rem;
        font-size: ${theme.typography.fontSize.base};
        height: 2.75rem;
        min-height: 2.75rem;
      `;
  }
};

const FieldContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  margin-bottom: 1.25rem;
`;

const Label = styled.label<{ required?: boolean; error?: boolean }>`
  display: block;
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: ${theme.typography.lineHeight.tight};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[700]};
  margin-bottom: 0.5rem;
  
  ${({ required }) => required && css`
    &::after {
      content: ' *';
      color: ${theme.colors.red[500]};
    }
  `}
`;

const InputContainer = styled.div<{ hasLeftIcon?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: boolean;
  hasLeftIcon?: boolean;
}>`
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
  
  ${({ hasLeftIcon }) => hasLeftIcon && css`
    padding-left: 2.5rem;
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
    left: ${theme.spacing.md};
  ` : css`
    right: ${theme.spacing.md};
  `}
`;


// const PasswordStrengthContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: ${theme.spacing.sm};
//   margin-top: ${theme.spacing.sm};
// `;

// const StrengthBar = styled.div<{ strength: 'weak' | 'medium' | 'strong' }>`
//   height: 0.25rem;
//   border-radius: 0.125rem;
//   background-color: ${props => {
//     switch (props.strength) {
//       case 'weak': return theme.colors.red[500];
//       case 'medium': return theme.colors.warning[500];
//       case 'strong': return theme.colors.success[500];
//       default: return theme.colors.gray[300];
//     }
//   }};
//   width: ${props => {
//     switch (props.strength) {
//       case 'weak': return '33%';
//       case 'medium': return '66%';
//       case 'strong': return '100%';
//       default: return '0%';
//     }
//   }};
//   transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
// `;

// const StrengthText = styled.span<{ strength: 'weak' | 'medium' | 'strong' }>`
//   font-size: 0.75rem;
//   font-weight: 500;
//   color: ${props => {
//     switch (props.strength) {
//       case 'weak': return theme.colors.red[500];
//       case 'medium': return theme.colors.warning[500];
//       case 'strong': return theme.colors.success[500];
//       default: return theme.colors.gray[500];
//     }
//   }};
// `;

// const RequirementsList = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.25rem;
//   margin-top: ${theme.spacing.sm};
// `;

// const RequirementItem = styled.div<{ met: boolean }>`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   font-size: 0.75rem;
//   color: ${props => props.met ? theme.colors.success[600] : theme.colors.gray[500]};
// `;

// const RequirementIcon = styled.div<{ met: boolean }>`
//   width: 0.75rem;
//   height: 0.75rem;
//   border-radius: 50%;
//   background-color: ${props => props.met ? theme.colors.success[500] : theme.colors.gray[300]};
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: white;
//   font-size: 0.5rem;
//   font-weight: bold;
//   flex-shrink: 0;
// `;

const HelperText = styled.div<{ error?: boolean }>`
  margin-top: 0.25rem;
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[600]};
`;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(({
  label,
  helperText,
  error = false,
  required = false,
  fullWidth = false,
  variant = 'default',
  inputSize = 'md',
  leftIcon,
  showStrength = false,
  showStrengthIndicator = false,
  showRequirements = false,
  requirements = [],
  strength,
  disabled = false,
  ...props
}, ref) => {

  // Enhanced password strength calculation
  const getStrengthFromPassword = (password: string): 'weak' | 'medium' | 'strong' => {
    if (!password || password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteria = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteria >= 4 && password.length >= 8) return 'strong';
    if (criteria >= 2) return 'medium';
    return 'weak';
  };

  const currentValue = (props.value as string) || '';
  // const currentStrength = strength || getStrengthFromPassword(currentValue);

  // Enhanced password requirements
  const defaultRequirements = [
    { text: 'At least 8 characters long', met: currentValue.length >= 8 },
    { text: 'Contains uppercase letters (A-Z)', met: /[A-Z]/.test(currentValue) },
    { text: 'Contains lowercase letters (a-z)', met: /[a-z]/.test(currentValue) },
    { text: 'Contains at least one number (0-9)', met: /\d/.test(currentValue) },
    { text: 'Contains at least one special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(currentValue) },
  ];

  // const displayRequirements = requirements.length > 0 ? requirements : defaultRequirements;

  return (
    <FieldContainer fullWidth={fullWidth}>
      {label && (
        <Label required={required} error={error}>
          {label}
        </Label>
      )}
      
      <InputContainer hasLeftIcon={!!leftIcon}>
        {leftIcon && (
          <IconWrapper position="left">
            {leftIcon}
          </IconWrapper>
        )}
        
        <StyledInput
          ref={ref}
          type="password"
          error={error}
          hasLeftIcon={!!leftIcon}
          fullWidth={fullWidth}
          variant={variant}
          inputSize={inputSize}
          disabled={disabled}
          {...props}
        />
        
      </InputContainer>

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator 
        password={currentValue} 
        show={showStrength || showStrengthIndicator} 
      />

      {helperText && (
        <HelperText error={error}>
          {helperText}
        </HelperText>
      )}
    </FieldContainer>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;