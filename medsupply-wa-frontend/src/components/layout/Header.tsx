import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMenu, FiSearch, FiBell, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

// Self-contained theme values
const theme = {
  colors: {
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
    },
    primary: '#3b82f6',
    error: '#ef4444',
    success: '#10b981',
    gradientPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    textDark: '#1f2937',
    textMedium: '#6b7280',
    textLight: '#9ca3af',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
  },
  borderRadius: {
    base: '0.375rem',
    lg: '0.5rem',
    full: '50%',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    fast: 'all 0.15s ease',
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
    },
    fontWeights: {
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background-color: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  box-shadow: ${theme.shadows.sm};
  height: 64px;
  flex-shrink: 0; /* Prevents header from shrinking */
  z-index: 10; /* Ensures header stays above content */
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.base};
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.textMedium};
  transition: all ${theme.transitions.fast};
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.textDark};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 40px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.gray[50]};
  font-size: ${theme.typography.fontSizes.sm};
  outline: none;
  
  &:focus {
    background-color: ${theme.colors.white};
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textLight};
  pointer-events: none;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.base};
  background-color: ${theme.colors.gray[100]};
  color: ${theme.colors.textMedium};
  transition: all ${theme.transitions.fast};
  position: relative;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.textDark};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background-color: ${theme.colors.error};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSizes.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeights.bold};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.base};
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.gradientPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: ${theme.typography.fontWeights.semibold};
  font-size: ${theme.typography.fontSizes.sm};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const UserName = styled.span`
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.textDark};
`;

const UserRole = styled.span`
  font-size: ${theme.typography.fontSizes.xs};
  color: ${theme.colors.textLight};
`;

const SystemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.success};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.base};
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.medium};
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.full};
`;

const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'JD';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onMenuToggle}>
          <FiMenu size={20} />
        </MenuButton>
        
        <SearchContainer>
          <SearchIcon size={16} />
          <SearchInput
            type="text"
            placeholder="Search orders, products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <SystemStatus>
          <StatusDot />
          System Online
        </SystemStatus>
        
        <IconButton>
          <FiBell size={18} />
          <NotificationBadge>3</NotificationBadge>
        </IconButton>
        
        <IconButton>
          <FiSettings size={18} />
        </IconButton>
        
        <IconButton>
          <FiHelpCircle size={18} />
        </IconButton>
        
        <UserSection>
          <UserAvatar>
            {getUserInitials(user?.full_name)}
          </UserAvatar>
          <UserInfo>
            <UserName>{user?.full_name || 'John Doe'}</UserName>
            <UserRole>{user?.role || 'Warehouse Staff'}</UserRole>
          </UserInfo>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;