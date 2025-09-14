import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiShoppingCart,
  FiBarChart2,
  FiPieChart,
  FiDownload
} from 'react-icons/fi';

// Import new component system
import {
  Container,
  Card,
  Heading,
  Text,
  Button,
  Flex,
  Box,
  Link
} from '../../components';

// Import enhanced components
import MetricCard from '../../components/dashboard/MetricCard';
import ChartPlaceholder from '../../components/dashboard/ChartPlaceholder';

// Import API client
import { apiClient } from '../../services/api';


interface AnalyticsData {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  revenueChange?: number;
  ordersChange?: number;
  customersChange?: number;
  avgOrderValueChange?: number;
  revenueTrend?: Array<{
    date: string;
    revenue: number;
  }>;
  ordersTrend?: Array<{
    date: string;
    orders: number;
  }>;
  customersTrend?: Array<{
    date: string;
    customers: number;
  }>;
}

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
  const handleDownloadReport = () => {
    console.log('Download Report clicked');
    // TODO: Implement download report functionality
    alert('Download Report functionality will be implemented');
  };

  const handleExportData = () => {
    console.log('Export Data clicked');
    // TODO: Implement export data functionality
    alert('Export Data functionality will be implemented');
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getAnalytics();
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setAnalyticsData(response.data);
        } else {
          throw new Error('No analytics data received');
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  // Format metrics for display
  const formatMetrics = (data: AnalyticsData) => {
    const formatCurrency = (amount: number | undefined | null) => {
      if (amount === undefined || amount === null || isNaN(amount)) {
        return '$0';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const formatNumber = (num: number | undefined | null) => {
      if (num === undefined || num === null || isNaN(num)) {
        return '0';
      }
      return num.toLocaleString();
    };

    const formatChange = (change: number | undefined | null) => {
      if (change === undefined || change === null || isNaN(change)) {
        return '+0.0% from last month';
      }
      const sign = change >= 0 ? '+' : '';
      return `${sign}${change.toFixed(1)}% from last month`;
    };

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(data.totalRevenue),
        change: formatChange(data.revenueChange),
        trend: (data.revenueChange || 0) >= 0 ? 'up' as const : 'down' as const,
        icon: FiDollarSign,
        color: '#10b981'
      },
      {
        title: 'Total Orders',
        value: formatNumber(data.totalOrders),
        change: formatChange(data.ordersChange),
        trend: (data.ordersChange || 0) >= 0 ? 'up' as const : 'down' as const,
        icon: FiShoppingCart,
        color: '#3b82f6'
      },
      {
        title: 'Active Customers',
        value: formatNumber(data.totalCustomers),
        change: formatChange(data.customersChange),
        trend: (data.customersChange || 0) >= 0 ? 'up' as const : 'down' as const,
        icon: FiUsers,
        color: '#f59e0b'
      },
      {
        title: 'Average Order Value',
        value: formatCurrency(data.averageOrderValue),
        change: formatChange(data.avgOrderValueChange),
        trend: (data.avgOrderValueChange || 0) >= 0 ? 'up' as const : 'down' as const,
        icon: FiPackage,
        color: '#8b5cf6'
      }
    ];
  };

  // Mock data for top products and customers (would come from separate API calls)
  const topProducts = [
    { name: 'Paracetamol 500mg', sales: 234, revenue: 3744 },
    { name: 'Amoxicillin 250mg', sales: 189, revenue: 4819.5 },
    { name: 'Ibuprofen 400mg', sales: 156, revenue: 2024.4 },
    { name: 'Omeprazole 20mg', sales: 98, revenue: 3209.5 },
    { name: 'Cetirizine 10mg', sales: 312, revenue: 5694 }
  ];

  const topCustomers = [
    { name: 'Pharmacy ABC', orders: 45, spent: 12500 },
    { name: 'Pharmacy GHI', orders: 67, spent: 18900 },
    { name: 'Pharmacy XYZ', orders: 32, spent: 8900 },
    { name: 'Pharmacy DEF', orders: 18, spent: 4500 },
    { name: 'Pharmacy JKL', orders: 12, spent: 3200 }
  ];

  const metrics = analyticsData ? formatMetrics(analyticsData) : [];

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Analytics Dashboard
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Track performance, analyze trends, and make data-driven decisions
            </Text>
          </Box>
          <Flex gap="5" align="center">
            <Box
              style={{
                position: 'relative',
                minWidth: '140px'
              }}
            >
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </Box>
            <Button 
              variant="primary" 
              size="md"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '600'
              }}
              onClick={handleDownloadReport}
            >
              <FiDownload style={{ marginRight: '0.5rem' }} />
              Export Report
            </Button>
          </Flex>
        </Flex>

        {/* Key Metrics */}
        {loading ? (
          <Flex gap="2xl" wrap justify="center">
            {[1, 2, 3, 4].map((index) => (
              <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
                <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
                  <Flex align="center" gap="4" style={{ marginBottom: '1rem' }}>
                    <Box style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: '#f1f5f9', 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text color="#64748b" style={{ fontSize: '1.5rem' }}>...</Text>
                    </Box>
                    <Box>
                      <Text size="sm" color="#64748b" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        Loading...
                      </Text>
                      <Text weight="bold" size="xl" margin="0" style={{ fontSize: '1.5rem', color: '#0f172a' }}>
                        ...
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              </Box>
            ))}
          </Flex>
        ) : error ? (
          <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
            <Box style={{ textAlign: 'center', padding: '2rem' }}>
              <Text color="#ef4444" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Error: {error}
              </Text>
              <Text color="#64748b" style={{ fontSize: '0.75rem' }}>
                Failed to load analytics data
              </Text>
            </Box>
          </Card>
        ) : (
          <Flex gap="2xl" wrap justify="center">
            {metrics.map((metric, index) => (
              <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  trend={metric.trend}
                  icon={metric.icon}
                  color={metric.color}
                />
              </Box>
            ))}
          </Flex>
        )}

        {/* Charts Section */}
        <Flex gap="2xl" wrap justify="center">
          {/* Revenue Chart */}
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
                <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
                  Revenue Trend
                </Heading>
                <Button 
                  variant="ghost" 
                  size="sm"
                  style={{ 
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                  onClick={handleExportData}
                >
                  <FiBarChart2 size={16} style={{ color: '#6b7280' }} />
                </Button>
              </Flex>
              
              <ChartPlaceholder
                title="Revenue chart will be displayed here"
                description="Chart component integration"
                icon={FiBarChart2}
                height="300px"
              />
            </Card>
          </Box>

          {/* Orders Chart */}
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
                <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
                  Orders Overview
                </Heading>
                <Button 
                  variant="ghost" 
                  size="sm"
                  style={{ 
                    padding: '0.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                  onClick={handleExportData}
                >
                  <FiPieChart size={16} style={{ color: '#6b7280' }} />
                </Button>
              </Flex>
              
              <ChartPlaceholder
                title="Orders chart will be displayed here"
                description="Chart component integration"
                icon={FiPieChart}
                height="300px"
              />
            </Card>
          </Box>
        </Flex>

        {/* Top Performers */}
        <Flex gap="2xl" wrap justify="center">
          {/* Top Products */}
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
                <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
                  Top Products
                </Heading>
                <Link variant="primary" size="sm" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                  View All
                </Link>
              </Flex>
              
              <Box>
                {topProducts.map((product, index) => (
                  <Box 
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      marginBottom: index < topProducts.length - 1 ? '1rem' : '0'
                    }}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text weight="semibold" margin="0" style={{ color: '#0f172a', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          {product.name}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          {product.sales} units sold
                        </Text>
                      </Box>
                      <Text weight="bold" size="lg" margin="0" style={{ color: '#0f172a', fontSize: '1rem' }}>
                        ${product.revenue.toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>

          {/* Top Customers */}
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
                <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
                  Top Customers
                </Heading>
                <Link variant="primary" size="sm" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                  View All
                </Link>
              </Flex>
              
              <Box>
                {topCustomers.map((customer, index) => (
                  <Box 
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      marginBottom: index < topCustomers.length - 1 ? '1rem' : '0'
                    }}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text weight="semibold" margin="0" style={{ color: '#0f172a', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                          {customer.name}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          {customer.orders} orders
                        </Text>
                      </Box>
                      <Text weight="bold" size="lg" margin="0" style={{ color: '#0f172a', fontSize: '1rem' }}>
                        ${customer.spent.toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Analytics;