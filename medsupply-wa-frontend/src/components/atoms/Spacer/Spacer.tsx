import React from 'react';
import styled from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5rem',
    '6xl': '6rem',
  },
};

export interface SpacerProps {
  size?: keyof typeof theme.spacing | string;
  className?: string;
}

const getSpacingValue = (value: string | keyof typeof theme.spacing): string => {
  if (typeof value === 'string' && value in theme.spacing) {
    return theme.spacing[value as unknown as keyof typeof theme.spacing];
  }
  return String(value);
};

const StyledSpacer = styled.div<SpacerProps>`
  flex: 1;
  min-width: ${({ size = '4' }) => getSpacingValue(size)};
  min-height: ${({ size = '4' }) => getSpacingValue(size)};
`;

export const Spacer: React.FC<SpacerProps> = ({ ...props }) => {
  return <StyledSpacer {...props} />;
};

export default Spacer;
