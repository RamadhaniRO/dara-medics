import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiCalendar,
  FiShield,
  FiSettings
} from 'react-icons/fi';

// Import new component system
import {
  Container,
  Card,
  Heading,
  Text,
  Button,
  Input,
  Badge,
  Grid,
  Flex,
  Box,
  SimpleMetricCard
} from '../../components';

// Import API client
import { apiClient } from '../../services/api';
import { useAuthErrorHandler } from '../../utils/useAuthErrorHandler';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
  category: 'authentication' | 'data_access' | 'system_change' | 'security';
}

interface AuditData {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalLogs: number;
    successLogs: number;
    failedLogs: number;
    securityLogs: number;
    authenticationLogs: number;
    dataAccessLogs: number;
    systemChangeLogs: number;
  };
}

const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleDateRange = () => {
    console.log('Date Range clicked');
    // TODO: Implement date range picker modal
    alert('Date Range functionality will be implemented');
  };

  const handleExportLogs = () => {
    console.log('Export Logs clicked');
    // TODO: Implement export logs functionality
    alert('Export Logs functionality will be implemented');
  };

  const handleAdvancedFilter = () => {
    console.log('Advanced Filter clicked');
    // TODO: Implement advanced filter modal
    alert('Advanced Filter functionality will be implemented');
  };

  const handleConfigure = () => {
    console.log('Configure clicked');
    // TODO: Implement configuration modal
    alert('Configure functionality will be implemented');
  };

  const handleViewLog = (logId: string) => {
    console.log('View Log clicked:', logId);
    // TODO: Implement view log modal/page
    alert(`View Log ${logId} functionality will be implemented`);
  };

  const handleDownloadLog = (logId: string) => {
    console.log('Download Log clicked:', logId);
    // TODO: Implement download log functionality
    alert(`Download Log ${logId} functionality will be implemented`);
  };

  const handleViewAllAlerts = () => {
    console.log('View All Alerts clicked');
    // TODO: Implement view all alerts functionality
    alert('View All Alerts functionality will be implemented');
  };

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getAuditLogs(1, 100, selectedCategory !== 'all' ? selectedCategory : undefined, selectedStatus !== 'all' ? selectedStatus : undefined, dateRange);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setAuditData(response.data);
        } else {
          throw new Error('No audit data received');
        }
      } catch (err) {
        console.error('Failed to fetch audit data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load audit data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, [selectedCategory, selectedStatus, dateRange, handleAuthError]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'info';
      case 'data_access': return 'primary';
      case 'system_change': return 'warning';
      case 'security': return 'error';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading audit logs...</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#ef4444" size="lg" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
            <Text color="#718096">Failed to load audit logs</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!auditData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No audit logs data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: auditLogs, statistics } = auditData;

  // Apply search filter
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Audit Logs
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Monitor system activities, user actions, and security events
            </Text>
          </Box>
          <Flex gap="2">
            <Button 
              variant="ghost" 
              size="sm" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              onClick={handleDateRange}
            >
              <FiCalendar size={14} style={{ marginRight: '0.375rem' }} />
              Date Range
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600' }}
              onClick={handleExportLogs}
            >
              <FiDownload style={{ marginRight: '0.5rem' }} />
              Export Logs
            </Button>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Events"
              value={statistics.totalLogs.toString()}
              icon={FiActivity}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Successful Events"
              value={statistics.successLogs.toString()}
              icon={FiCheckCircle}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Failed Events"
              value={statistics.failedLogs.toString()}
              icon={FiXCircle}
              color="#ef4444"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Security Events"
              value={statistics.securityLogs.toString()}
              icon={FiShield}
              color="#f59e0b"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={4} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Logs
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by user, action, or resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '3rem', fontSize: '0.875rem' }}
                />
                <FiSearch
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a0aec0',
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Category
              </Text>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="data_access">Data Access</option>
                <option value="system_change">System Change</option>
                <option value="security">Security</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Status
              </Text>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Date Range
              </Text>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Audit Logs Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Audit Events ({filteredLogs.length})
            </Heading>
            <Flex gap="3">
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleAdvancedFilter}
              >
                <FiFilter size={14} style={{ marginRight: '0.375rem' }} />
                Advanced Filter
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleConfigure}
              >
                <FiSettings size={14} style={{ marginRight: '0.375rem' }} />
                Configure
              </Button>
            </Flex>
          </Flex>

          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Event ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Resource</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Timestamp</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>IP Address</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {log.id}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {log.user}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {log.action}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {log.resource}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(log.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getCategoryColor(log.category)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {log.category.replace('_', ' ').charAt(0).toUpperCase() + log.category.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {log.timestamp}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {log.ipAddress}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleViewLog(log.id)}
                        >
                          <FiEye size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleDownloadLog(log.id)}
                        >
                          <FiDownload size={12} />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {filteredLogs.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No audit logs found matching your criteria.</Text>
            </Box>
          )}
        </Card>

        {/* Security Alerts */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Security Alerts
            </Heading>
            <Button 
              variant="ghost" 
              size="sm" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              onClick={handleViewAllAlerts}
            >
              <FiAlertCircle size={14} style={{ marginRight: '0.375rem' }} />
              View All Alerts
            </Button>
          </Flex>

          <Flex direction="column" gap="3">
            {auditLogs.filter(log => log.status === 'failed' || log.category === 'security').slice(0, 3).map((log) => (
              <Flex key={log.id} align="center" gap="3" style={{ 
                padding: '1rem', 
                border: '1px solid #fecaca', 
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2'
              }}>
                <FiAlertCircle size={20} color="#e53e3e" />
                <Box>
                  <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                    {log.action}
                  </Text>
                  <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                    {log.details} - {log.timestamp}
                  </Text>
                </Box>
                <Badge variant="error" size="sm" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                  {log.status}
                </Badge>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
};

export default AuditLogs;