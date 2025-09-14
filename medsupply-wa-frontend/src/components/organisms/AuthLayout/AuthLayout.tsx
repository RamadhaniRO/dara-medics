import React from 'react';
import styled from 'styled-components';
import { MessageCircle, Plus, Cross } from 'lucide-react';
// import { Flex } from '../../atoms/Flex';
// import { Box } from '../../atoms/Box';
import { Text } from '../../atoms/Text';
import { Heading } from '../../atoms/Heading';

// Embedded theme values for self-containment
const theme = {
  colors: {
    white: '#ffffff',
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
  },
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
  borderRadius: {
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    sizes: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weights: {
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
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export interface AuthLayoutProps {
  children?: React.ReactNode;
  leftPanel?: {
    title: string;
    subtitle?: string;
    description?: string;
    features?: string[];
    icons?: React.ReactNode[];
    securityIcons?: Array<{
      icon: React.ReactNode;
      label: string;
    }>;
    securityMessage?: string;
    gradient?: string;
  };
  rightPanel: {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
  };
}

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #faf9f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const AuthCard = styled.div`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 0;
  align-items: stretch;
  min-height: 700px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  background: white;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const LeftPanel = styled.div<{ gradient?: string }>`
  padding: 3rem 2rem;
  background: ${({ gradient }) => gradient || 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'};
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const RightPanel = styled.div`
  padding: 3rem 2.5rem;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-family: ${theme.typography.fontFamily.sans};
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FeatureList = styled.div`
  margin: 1.5rem 0;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const FeatureIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`;

const BottomIconsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0 1rem 0;
`;

const BottomIcon = styled.div`
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// const SecurityIconsContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: 2rem;
//   margin: 2rem 0;
// `;

// const SecurityIcon = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const SecurityIconWrapper = styled.div`
//   width: 48px;
//   height: 48px;
//   border: 2px solid rgba(255, 255, 255, 0.3);
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: white;
//   font-size: 1.25rem;
// `;

// const SecurityIconLabel = styled.span`
//   font-size: 0.75rem;
//   color: rgba(255, 255, 255, 0.8);
//   text-align: center;
// `;

// const SecurityMessage = styled.div`
//   text-align: center;
//   font-size: 0.875rem;
//   color: rgba(255, 255, 255, 0.9);
//   line-height: 1.4;
//   margin-top: 1rem;
// `;

// const CentralIcon = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin: 2rem 0;
// `;

// const CentralIconWrapper = styled.div`
//   width: 120px;
//   height: 120px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: white;
//   font-size: 3rem;
//   position: relative;

//   &::before,
//   &::after {
//     content: '';
//     position: absolute;
//     border: 2px solid rgba(255, 255, 255, 0.3);
//     border-radius: 50%;
//     animation: pulse 2s infinite;
//   }

//   &::before {
//     width: 140px;
//     height: 140px;
//     animation-delay: 0s;
//   }

//   &::after {
//     width: 160px;
//     height: 160px;
//     animation-delay: 1s;
//   }

//   @keyframes pulse {
//     0% {
//       transform: scale(1);
//       opacity: 1;
//     }
//     100% {
//       transform: scale(1.1);
//       opacity: 0;
//     }
//   }
// `;

const Copyright = styled(Text)`
  margin-top: auto;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const RightPanelHeader = styled.div`
  margin-bottom: ${theme.spacing[6]};
  font-family: ${theme.typography.fontFamily.sans};
`;

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  leftPanel,
  rightPanel
}) => {
  return (
    <PageContainer>
      <AuthCard>
        {leftPanel && (
          <LeftPanel gradient={leftPanel.gradient}>
            <div>
              <LogoSection>
                <LogoIcon>
                  <Cross size={20} />
                </LogoIcon>
                <Heading level={2} color="white" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  DARA Medics
                </Heading>
              </LogoSection>

              <div>
                <Heading level={1} color="white" style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700', 
                  lineHeight: '1.1', 
                  marginBottom: '1rem' 
                }}>
                  {leftPanel.title}
                </Heading>
                
                {leftPanel.subtitle && (
                  <Text size="lg" color="rgba(255, 255, 255, 0.9)" style={{ 
                    fontSize: '1.125rem', 
                    lineHeight: '1.3', 
                    marginBottom: '1rem' 
                  }}>
                    {leftPanel.subtitle}
                  </Text>
                )}
                
                {leftPanel.description && (
                  <Text color="rgba(255, 255, 255, 0.8)" style={{ 
                    fontSize: '1rem', 
                    lineHeight: '1.5', 
                    marginBottom: '1.5rem' 
                  }}>
                    {leftPanel.description}
                  </Text>
                )}
              </div>

              {leftPanel.features && leftPanel.features.length > 0 && (
                <FeatureList>
                  {leftPanel.features.map((feature, index) => (
                    <FeatureItem key={index}>
                      <FeatureIcon>✓</FeatureIcon>
                      <Text color="rgba(255, 255, 255, 0.9)" style={{ fontSize: '1rem' }}>
                        {feature}
                      </Text>
                    </FeatureItem>
                  ))}
                </FeatureList>
              )}

              <BottomIconsContainer>
                <BottomIcon>
                  <MessageCircle size={20} />
                </BottomIcon>
                <BottomIcon>
                  <Cross size={20} />
                </BottomIcon>
                <BottomIcon>
                  <Plus size={20} />
                </BottomIcon>
              </BottomIconsContainer>

              {leftPanel.securityMessage && (
                <Text color="rgba(255, 255, 255, 0.9)" style={{ 
                  fontSize: '0.875rem', 
                  lineHeight: '1.4',
                  marginBottom: '1rem'
                }}>
                  {leftPanel.securityMessage}
                </Text>
              )}
            </div>

            <Copyright>
              © 2023 DARA Medics. All rights reserved.
            </Copyright>
          </LeftPanel>
        )}

        <RightPanel>
          <RightPanelHeader>
            <Heading level={2} color="#1a202c" style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              lineHeight: '1.2',
              marginBottom: '0.5rem'
            }}>
              {rightPanel.title}
            </Heading>
            
            {rightPanel.subtitle && (
              <Text color="#718096" style={{ 
                fontSize: '1rem', 
                lineHeight: '1.4' 
              }}>
                {rightPanel.subtitle}
              </Text>
            )}
          </RightPanelHeader>

          {rightPanel.children}
        </RightPanel>
      </AuthCard>
    </PageContainer>
  );
};

export default AuthLayout;
