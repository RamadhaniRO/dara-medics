import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Embedded theme values for self-containment
const theme = {
  colors: {
    primary: {
      500: '#3b82f6',
    },
    gray: {
      500: '#6b7280',
    },
  },
  spacing: {
    sm: '0.5rem',
  },
  borderRadius: {
    md: '0.375rem',
  },
};

const TimerContainer = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.primary[500]};
  background-color: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

export interface CountdownTimerProps {
  initialMinutes: number;
  onExpire?: () => void;
  onTick?: (remainingTime: number) => void;
  format?: 'mm:ss' | 'hh:mm:ss';
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialMinutes,
  onExpire,
  onTick,
  format = 'mm:ss',
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      onTick?.(newTime);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onExpire, onTick]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (format === 'hh:mm:ss') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return <TimerContainer className={className}>00:00</TimerContainer>;
  }

  return (
    <TimerContainer className={className}>
      {formatTime(timeLeft)}
    </TimerContainer>
  );
};

export default CountdownTimer;
