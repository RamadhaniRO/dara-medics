import React from 'react';
import styled from 'styled-components';
import { Button } from '../../atoms/Button';
import { FaGoogle, FaMicrosoft, FaApple } from 'react-icons/fa';

// Embedded theme values for self-containment
const theme = {
  spacing: {
    3: '0.75rem',
  },
  colors: {
    gray: {
      50: '#f9fafb',
      200: '#e5e7eb',
      600: '#4b5563',
    },
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

export interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
  onAppleLogin?: () => void;
  providers?: Array<{
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  disabled?: boolean;
  loading?: boolean;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const Container = styled.div<{ direction: 'horizontal' | 'vertical' }>`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: center;
  align-items: center;
  flex-direction: ${({ direction }) => direction === 'vertical' ? 'column' : 'row'};
  flex-wrap: nowrap;
`;

const SocialButton = styled(Button)`
  width: 50px;
  height: 50px;
  padding: 0;
  border: 1px solid ${theme.colors.gray[200]};
  background-color: white;
  color: ${theme.colors.gray[600]};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background-color: ${theme.colors.gray[50]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleIcon = styled(FaGoogle)`
  color: #4285F4;
  font-size: 20px;
`;

const MicrosoftIcon = styled(FaMicrosoft)`
  color: #00BCF2;
  font-size: 20px;
`;

const AppleIcon = styled(FaApple)`
  color: #000000;
  font-size: 20px;
`;

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onMicrosoftLogin,
  onAppleLogin,
  providers,
  disabled = false,
  loading = false,
  direction = 'horizontal',
  size = 'md'
}) => {
  // Use providers prop if provided, otherwise use individual handlers
  const socialProviders = providers || [
    {
      name: 'Google',
      icon: <GoogleIcon />,
      onClick: onGoogleLogin || (() => {})
    },
    {
      name: 'Microsoft',
      icon: <MicrosoftIcon />,
      onClick: onMicrosoftLogin || (() => {})
    },
    {
      name: 'Apple',
      icon: <AppleIcon />,
      onClick: onAppleLogin || (() => {})
    }
  ];

  return (
    <Container direction={direction}>
      {socialProviders.map((provider, index) => (
        <SocialButton
          key={index}
          variant="ghost"
          size="sm"
          onClick={provider.onClick}
          disabled={disabled || loading}
          title={`Sign in with ${provider.name}`}
        >
          {provider.icon}
        </SocialButton>
      ))}
    </Container>
  );
};

export default SocialLoginButtons;
