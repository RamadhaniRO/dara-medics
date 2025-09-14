import React, { useState, useEffect } from 'react';
import { 
  FiShoppingCart, 
  FiMessageCircle, 
  FiDollarSign, 
  FiAlertTriangle
} from 'react-icons/fi';

// Import new component system
import {
  Container,
  Heading,
  Text,
  Flex,
  Box,
  DashboardSkeleton
} from '../../components';

// Import custom components
import MetricCard from '../../components/dashboard/MetricCard';
import AgentPerformance from '../../components/dashboard/AgentPerformance';
import RecentOrders from '../../components/dashboard/RecentOrders';
import SystemHealth from '../../components/dashboard/SystemHealth';

// Import API client
import { apiClient } from '../../services/api';
import { useAuthErrorHandler } from '../../utils/useAuthErrorHandler';

interface DashboardMetrics {
  totalOrdersToday: {
    value: number;
    change: number;
    trend: 'up' | 'down';
  };
  activeConversations: {
    value: number;
    change: number;
    trend: 'up' | 'down';
  };
  pendingEscalations: {
    value: number;
    change: number;
    trend: 'up' | 'down';
  };
  revenueToday: {
    value: number;
    change: number;
    trend: 'up' | 'down';
  };
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getDashboard();
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.metrics) {
          setMetrics(response.data.metrics);
        } else {
          throw new Error('No metrics data received');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [handleAuthError]);

  // Format metrics for display
  const formatMetrics = (data: DashboardMetrics) => {
    const formatChange = (change: number | undefined | null) => {
      if (change === undefined || change === null || isNaN(change)) {
        return '0.0% from yesterday';
      }
      return `${Math.abs(change).toFixed(1)}% from yesterday`;
    };

    return [
      {
        title: 'Total Orders Today',
        value: (data.totalOrdersToday?.value || 0).toString(),
        change: `${data.totalOrdersToday?.trend === 'up' ? '↑' : '↓'}${formatChange(data.totalOrdersToday?.change)}`,
        trend: data.totalOrdersToday?.trend || 'up',
        icon: FiShoppingCart,
        color: '#3182ce'
      },
      {
        title: 'Active Conversations',
        value: (data.activeConversations?.value || 0).toString(),
        change: `${data.activeConversations?.trend === 'up' ? '↑' : '↓'}${formatChange(data.activeConversations?.change)}`,
        trend: data.activeConversations?.trend || 'up',
        icon: FiMessageCircle,
        color: '#38a169'
      },
      {
        title: 'Pending Escalations',
        value: (data.pendingEscalations?.value || 0).toString(),
        change: `${data.pendingEscalations?.trend === 'up' ? '↑' : '↓'}${formatChange(data.pendingEscalations?.change)}`,
        trend: data.pendingEscalations?.trend || 'up',
        icon: FiAlertTriangle,
        color: '#d69e2e'
      },
      {
        title: 'Revenue Today',
        value: `$${(data.revenueToday?.value || 0).toLocaleString()}`,
        change: `${data.revenueToday?.trend === 'up' ? '↑' : '↓'}${formatChange(data.revenueToday?.change)}`,
        trend: data.revenueToday?.trend || 'up',
        icon: FiDollarSign,
        color: '#805ad5'
      }
    ];
  };

  // Show loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl" align="center" justify="center" style={{ minHeight: '400px' }}>
          <Text size="lg" color="#ef4444">Error: {error}</Text>
          <Text size="sm" color="#64748b">Please try refreshing the page</Text>
        </Flex>
      </Container>
    );
  }

  // Show dashboard with real data
  const displayMetrics = metrics ? formatMetrics(metrics) : [];

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Box>
          <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
            Welcome back, Admin
          </Heading>
          <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
            {currentDate}
          </Text>
        </Box>

        {/* Metrics Grid */}
        <Flex gap="2xl" wrap justify="center">
          {displayMetrics.map((metric, index) => (
            <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 24px)' }}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                color={metric.color}
                compact={true}
              />
            </Box>
          ))}
        </Flex>

        {/* Main Content Grid */}
        <Flex gap="xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 12px)' }}>
            <AgentPerformance />
          </Box>
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 12px)' }}>
            <RecentOrders />
          </Box>
        </Flex>

        {/* System Health */}
        <Box style={{ marginTop: '1rem' }}>
          <SystemHealth />
        </Box>
      </Flex>
    </Container>
  );
};

export default Dashboard;