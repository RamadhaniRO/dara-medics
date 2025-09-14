import React, { useEffect, useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Text } from '../Text';

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  icon?: React.ReactNode;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// const pulse = keyframes`
//   0%, 100% {
//     opacity: 1;
//   }
//   50% {
//     opacity: 0.7;
//   }
// `;

const Container = styled.div<{ 
  show: boolean; 
  type: AlertProps['type'];
  isClosing: boolean;
}>`
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  animation: ${({ isClosing }) => isClosing ? slideOut : slideIn} 0.3s ease-out;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return css`
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #166534;
        `;
      case 'error':
        return css`
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        `;
      case 'warning':
        return css`
          background: #fffbeb;
          border-color: #fed7aa;
          color: #d97706;
        `;
      case 'info':
        return css`
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        `;
      default:
        return '';
    }
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ type }) => {
      switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'info': return '#3b82f6';
        default: return '#6b7280';
      }
    }};
  }
`;

const IconContainer = styled.div<{ type: AlertProps['type'] }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 0.125rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${({ type }) => {
      switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'info': return '#3b82f6';
        default: return '#6b7280';
      }
    }};
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProgressBar = styled.div<{ 
  type: AlertProps['type'];
  progress: number;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${({ progress }) => progress}%;
  background: ${({ type }) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  transition: width 0.1s linear;
`;

const getDefaultIcon = (type: AlertProps['type']) => {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <path d="M12 9v4M12 17h.01"/>
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      );
    default:
      return null;
  }
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  show,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  icon,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      setProgress(100);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (show && autoClose) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (autoCloseDelay / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [show, autoClose, autoCloseDelay, handleClose]);

  if (!show) return null;

  return (
    <Container show={show} type={type} isClosing={isClosing}>
      <IconContainer type={type}>
        {icon || getDefaultIcon(type)}
      </IconContainer>
      
      <Content>
        {title && (
          <Text size="sm" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            {title}
          </Text>
        )}
        <Text size="sm">
          {message}
        </Text>
      </Content>
      
      {onClose && (
        <CloseButton onClick={handleClose} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </CloseButton>
      )}
      
      {autoClose && (
        <ProgressBar type={type} progress={progress} />
      )}
    </Container>
  );
};

export default Alert;