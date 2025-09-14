import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

interface StrengthLevel {
  score: number;
  label: string;
  color: string;
  width: string;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

const Container = styled.div<{ show: boolean }>`
  display: ${({ show }) => show ? 'block' : 'none'};
  animation: ${fadeIn} 0.3s ease-out;
  margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const StrengthFill = styled.div<{ color: string; width: string }>`
  height: 100%;
  background: ${({ color }) => color};
  width: ${({ width }) => width};
  border-radius: 2px;
  transition: all 0.3s ease;
  animation: ${progressAnimation} 0.5s ease-out;
  --target-width: ${({ width }) => width};
`;

const StrengthLabel = styled.div<{ color: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ color }) => color};
  text-align: center;
`;

const RequirementsList = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const RequirementItem = styled.div<{ met: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: ${({ met }) => met ? '#10b981' : '#6b7280'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RequirementIcon = styled.div<{ met: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ met }) => met ? '#10b981' : '#d1d5db'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 10px;
    height: 10px;
    color: white;
  }
`;

const calculatePasswordStrength = (password: string): StrengthLevel => {
  let score = 0;
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score
  Object.values(requirements).forEach(met => {
    if (met) score++;
  });

  // Determine strength level
  if (score <= 2) {
    return { score, label: 'Weak', color: '#ef4444', width: '25%' };
  } else if (score <= 3) {
    return { score, label: 'Fair', color: '#f59e0b', width: '50%' };
  } else if (score <= 4) {
    return { score, label: 'Good', color: '#3b82f6', width: '75%' };
  } else {
    return { score, label: 'Strong', color: '#10b981', width: '100%' };
  }
};

const getRequirements = (password: string) => [
  {
    text: 'At least 8 characters',
    met: password.length >= 8,
  },
  {
    text: 'One lowercase letter',
    met: /[a-z]/.test(password),
  },
  {
    text: 'One uppercase letter',
    met: /[A-Z]/.test(password),
  },
  {
    text: 'One number',
    met: /\d/.test(password),
  },
  {
    text: 'One special character',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  show = true,
}) => {
  if (!password || !show) return null;

  const strength = calculatePasswordStrength(password);
  const requirements = getRequirements(password);

  return (
    <Container show={show}>
      <StrengthBar>
        <StrengthFill color={strength.color} width={strength.width} />
      </StrengthBar>
      <StrengthLabel color={strength.color}>
        Password Strength: {strength.label}
      </StrengthLabel>
      
      <RequirementsList>
        {requirements.map((req, index) => (
          <RequirementItem key={index} met={req.met}>
            <RequirementIcon met={req.met}>
              {req.met ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              )}
            </RequirementIcon>
            {req.text}
          </RequirementItem>
        ))}
      </RequirementsList>
    </Container>
  );
};

export default PasswordStrengthIndicator;
