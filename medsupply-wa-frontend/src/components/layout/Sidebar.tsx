import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiDollarSign,
  FiShield,
  FiFileText,
  FiMessageCircle,
  FiUser,
  FiMonitor
} from 'react-icons/fi';

// Self-contained theme values
const theme = {
  colors: {
    white: '#ffffff',
    gray: {
      100: '#f3f4f6',
      200: '#e5e7eb',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
    },
    primary: '#3b82f6',
    error: '#ef4444',
    gradientPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
    textDark: '#1f2937',
    textMedium: '#6b7280',
    textLight: '#9ca3af',
  },
  spacing: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
  },
  borderRadius: {
    base: '0.375rem',
  },
  transitions: {
    normal: 'all 0.3s ease',
    fast: 'all 0.15s ease',
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      lg: '1.125rem',
    },
    fontWeights: {
      bold: '700',
    },
  },
};

interface SidebarProps {
  collapsed: boolean;
}

const SidebarContainer = styled.aside<SidebarProps>`
  width: ${({ collapsed }) => collapsed ? '64px' : '250px'};
  background-color: ${theme.colors.white};
  border-right: 1px solid ${theme.colors.gray[200]};
  transition: width ${theme.transitions.normal};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Prevents sidebar from shrinking */
  height: 100vh; /* Full viewport height */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
`;

const LogoSection = styled.div`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Logo = styled.div`
  width: 28px;
  height: 28px;
  background: ${theme.colors.gradientPrimary};
  border-radius: ${theme.borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: 0.9rem;
`;

const LogoText = styled.span<SidebarProps>`
  font-size: 0.9rem;
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.textDark};
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${theme.transitions.normal};
  white-space: nowrap;
`;

const NavSection = styled.nav`
  flex: 1;
  padding: ${theme.spacing.sm} 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NavGroup = styled.div`
  margin-bottom: ${theme.spacing.sm};
`;

const NavGroupTitle = styled.h3<SidebarProps>`
  font-size: 0.65rem;
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${theme.transitions.normal};
  white-space: nowrap;
  margin: 0;
`;

const NavItem = styled(NavLink)<SidebarProps>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  color: ${theme.colors.textMedium};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  position: relative;
  height: 32px;
  font-size: 0.8rem;
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.textDark};
  }
  
  &.active {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.white};
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: ${theme.colors.white};
    }
  }
`;

const NavIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavLabel = styled.span<SidebarProps>`
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${theme.transitions.normal};
  white-space: nowrap;
`;

const Badge = styled.span<SidebarProps>`
  background-color: ${theme.colors.error};
  color: ${theme.colors.white};
  font-size: 0.6rem;
  font-weight: ${theme.typography.fontWeights.bold};
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 14px;
  text-align: center;
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity ${theme.transitions.normal};
`;

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigationItems = [
    {
      group: 'Main',
      items: [
        { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
        { path: '/orders', icon: FiShoppingCart, label: 'Orders' },
        { path: '/catalog', icon: FiPackage, label: 'Catalog' },
        { path: '/customers', icon: FiUsers, label: 'Customers' },
      ]
    },
    {
      group: 'Analytics',
      items: [
        { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
        { path: '/payments', icon: FiDollarSign, label: 'Payments' },
      ]
    },
    {
      group: 'Management',
      items: [
        { path: '/agents', icon: FiMonitor, label: 'Agents' },
        { path: '/compliance', icon: FiShield, label: 'Compliance' },
        { path: '/audit-logs', icon: FiFileText, label: 'Audit Logs' },
        { path: '/support', icon: FiMessageCircle, label: 'Support' },
      ]
    },
    {
      group: 'Account',
      items: [
        { path: '/profile', icon: FiUser, label: 'Profile' },
        { path: '/settings', icon: FiSettings, label: 'Settings' },
        { path: '/help', icon: FiHelpCircle, label: 'Help' },
      ]
    }
  ];

  return (
    <SidebarContainer collapsed={collapsed}>
      <LogoSection>
        <Logo>DM</Logo>
        <LogoText collapsed={collapsed}>DARA-Medics</LogoText>
      </LogoSection>
      
      <NavSection>
        {navigationItems.map((group, groupIndex) => (
          <NavGroup key={groupIndex}>
            <NavGroupTitle collapsed={collapsed}>{group.group}</NavGroupTitle>
            {group.items.map((item, itemIndex) => (
              <NavItem
                key={itemIndex}
                to={item.path}
                collapsed={collapsed}
                end={item.path === '/dashboard'}
              >
                <NavIcon>
                  <item.icon size={16} />
                </NavIcon>
                <NavLabel collapsed={collapsed}>{item.label}</NavLabel>
                {item.path === '/orders' && (
                  <Badge collapsed={collapsed}>3</Badge>
                )}
              </NavItem>
            ))}
          </NavGroup>
        ))}
      </NavSection>
    </SidebarContainer>
  );
};

export default Sidebar;