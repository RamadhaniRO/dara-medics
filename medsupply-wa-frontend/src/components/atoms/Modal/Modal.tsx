import React, { useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Text } from '../Text';
// import { Button } from '../Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
`;

const Overlay = styled.div<{ isOpen: boolean; isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${({ isClosing }) => isClosing ? fadeOut : fadeIn} 0.3s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div<{ 
  size: ModalProps['size'];
  isClosing: boolean;
}>`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: ${({ isClosing }) => isClosing ? slideOut : slideIn} 0.3s ease-out;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return css`
          width: 90%;
          max-width: 400px;
        `;
      case 'lg':
        return css`
          width: 90%;
          max-width: 800px;
        `;
      case 'xl':
        return css`
          width: 95%;
          max-width: 1200px;
        `;
      default:
        return css`
          width: 90%;
          max-width: 600px;
        `;
    }
  }}
`;

const Header = styled.div`
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled(Text)`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Content = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
}) => {
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (isOpen && closeOnEscape) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} isClosing={isClosing} onClick={handleOverlayClick}>
      <ModalContainer size={size} isClosing={isClosing}>
        {(title || showCloseButton) && (
          <Header>
            {title && <Title>{title}</Title>}
            {showCloseButton && (
              <CloseButton onClick={handleClose} type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </CloseButton>
            )}
          </Header>
        )}
        
        <Content>
          {children}
        </Content>
        
        {footer && (
          <Footer>
            {footer}
          </Footer>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;
