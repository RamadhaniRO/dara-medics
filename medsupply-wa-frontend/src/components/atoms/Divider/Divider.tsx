import React from 'react';
import styled from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    gray: {
      200: '#e5e7eb',
      300: '#d1d5db',
    },
  },
  spacing: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
  },
};

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  thickness?: 'thin' | 'medium' | 'thick';
  spacing?: keyof typeof theme.spacing | string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const getThicknessStyles = (thickness: string) => {
  switch (thickness) {
    case 'thin':
      return '1px';
    case 'thick':
      return '3px';
    default:
      return '2px';
  }
};

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'dashed':
      return 'dashed';
    case 'dotted':
      return 'dotted';
    default:
      return 'solid';
  }
};

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const HorizontalDivider = styled.hr<DividerProps>`
  border: none;
  border-top: ${({ thickness = 'medium' }) => getThicknessStyles(thickness)} ${({ variant = 'solid' }) => getVariantStyles(variant)} ${({ color }) => color || theme.colors.gray[200]};
  margin: ${({ spacing = '4' }) => getSpacingValue(spacing)} 0;
  width: 100%;
`;

const VerticalDivider = styled.div<DividerProps>`
  border: none;
  border-left: ${({ thickness = 'medium' }) => getThicknessStyles(thickness)} ${({ variant = 'solid' }) => getVariantStyles(variant)} ${({ color }) => color || theme.colors.gray[200]};
  margin: 0 ${({ spacing = '4' }) => getSpacingValue(spacing)};
  height: 100%;
  min-height: 1rem;
`;

const DividerWithText = styled.div<DividerProps>`
  display: flex;
  align-items: center;
  margin: ${({ spacing = '4' }) => getSpacingValue(spacing)} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-top: ${({ thickness = 'medium' }) => getThicknessStyles(thickness)} ${({ variant = 'solid' }) => getVariantStyles(variant)} ${({ color }) => color || theme.colors.gray[200]};
  }
  
  &::before {
    margin-right: ${theme.spacing[4]};
  }
  
  &::after {
    margin-left: ${theme.spacing[4]};
  }
`;

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  children,
  ...props
}) => {
  if (children) {
    return (
      <DividerWithText {...props}>
        {children}
      </DividerWithText>
    );
  }

  if (orientation === 'vertical') {
    return <VerticalDivider {...props} />;
  }

  return <HorizontalDivider {...props} />;
};

export default Divider;
