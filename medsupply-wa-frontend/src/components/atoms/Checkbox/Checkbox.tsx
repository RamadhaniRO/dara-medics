import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    primary: {
      500: '#3b82f6',
      600: '#2563eb',
    },
    gray: {
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
    },
    green: {
      500: '#22c55e',
    },
    yellow: {
      500: '#f59e0b',
    },
    red: {
      500: '#ef4444',
    },
  },
  spacing: {
    sm: '0.5rem',
  },
  borderRadius: {
    sm: '0.25rem',
  },
  transitions: {
    fast: '0.15s ease-in-out',
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
    },
    fontWeight: {
      medium: '500',
    },
    lineHeight: {
      normal: '1.5',
    },
  },
};

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  label?: React.ReactNode;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        width: 1rem;
        height: 1rem;
      `;
    case 'lg':
      return css`
        width: 1.5rem;
        height: 1.5rem;
      `;
    default:
      return css`
        width: 1.25rem;
        height: 1.25rem;
      `;
  }
};

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        accent-color: ${theme.colors.primary[500]};
      `;
    case 'success':
      return css`
        accent-color: ${theme.colors.green[500]};
      `;
    case 'warning':
      return css`
        accent-color: ${theme.colors.yellow[500]};
      `;
    case 'danger':
      return css`
        accent-color: ${theme.colors.red[500]};
      `;
    default:
      return css`
        accent-color: ${theme.colors.primary[500]};
      `;
  }
};

const CheckboxContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[2]};
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const StyledCheckbox = styled.input<CheckboxProps>`
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  
  ${({ size = 'md' }) => getSizeStyles(size)}
  ${({ variant = 'default' }) => getVariantStyles(variant)}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

const Label = styled.label<{ error?: boolean }>`
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[700]};
  line-height: ${theme.typography.lineHeight.normal};
  user-select: none;
`;

const HelperText = styled.div<{ error?: boolean }>`
  margin-top: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.xs};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[600]};
`;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  helperText,
  error = false,
  fullWidth = false,
  size = 'md',
  variant = 'default',
  className,
  ...props
}, ref) => {
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <CheckboxContainer fullWidth={fullWidth} className={className}>
      <CheckboxWrapper>
        <StyledCheckbox
          ref={ref}
          id={checkboxId}
          type="checkbox"
          variant={variant}
          {...props}
        />
      </CheckboxWrapper>
      
      {label && (
        <Label htmlFor={checkboxId} error={error}>
          {label}
        </Label>
      )}
      
      {helperText && (
        <HelperText error={error}>
          {helperText}
        </HelperText>
      )}
    </CheckboxContainer>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
