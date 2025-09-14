import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

// Self-contained theme values
const theme = {
  colors: {
    background: '#faf9f6',
    gray: {
      50: '#f9fafb',
    },
  },
  spacing: {
    lg: '1.5rem',
  },
};

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.main<{ sidebarCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevents flex item from overflowing */
  margin-left: ${({ sidebarCollapsed }) => sidebarCollapsed ? '64px' : '250px'};
  transition: margin-left 0.3s ease;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.gray[50]};
`;

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <LayoutContainer>
      <Sidebar collapsed={sidebarCollapsed} />
      <MainContent sidebarCollapsed={sidebarCollapsed}>
        <Header 
          onMenuToggle={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
