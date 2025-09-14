import React from 'react';
import styled, { css } from 'styled-components';
import { Input, InputProps } from '../../atoms/Input';
import { Text } from '../../atoms/Text';

// Embedded theme values for self-containment
const theme = {
  colors: {
    gray: {
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
    },
    red: {
      500: '#ef4444',
      600: '#dc2626',
    },
    error: {
      500: '#ef4444',
    },
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    4: '1rem',
  },
};

export interface FormFieldProps extends Omit<InputProps, 'helperText'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

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

const HelperText = styled(Text)<{ error?: boolean }>`
  margin-top: 0.25rem;
  font-family: ${theme.typography.fontFamily.sans};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  color: ${({ error }) => error ? theme.colors.red[600] : theme.colors.gray[600]};
`;

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error = false,
  required = false,
  fullWidth = false,
  icon,
  onIconClick,
  ...inputProps
}) => {
  return (
    <FieldContainer fullWidth={fullWidth}>
      {label && (
        <Label required={required} error={error}>
          {label}
        </Label>
      )}
      <Input
        error={error}
        fullWidth={fullWidth}
        leftIcon={icon}
        {...inputProps}
      />
      {helperText && (
        <HelperText error={error}>
          {helperText}
        </HelperText>
      )}
    </FieldContainer>
  );
};

export default FormField;
