import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiEdit, 
  FiShield, 
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiDownload,
  FiCalendar,
  FiFileText,
  FiPlus
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

interface ComplianceItem {
  id: string;
  title: string;
  category: 'regulatory' | 'quality' | 'safety' | 'documentation';
  status: 'compliant' | 'non_compliant' | 'pending' | 'review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  lastUpdated: string;
  assignedTo: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComplianceData {
  data: ComplianceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalItems: number;
    compliantItems: number;
    nonCompliantItems: number;
    pendingItems: number;
    complianceRate: number;
  };
  categoryStats: Array<{
    category: string;
    compliant: number;
    total: number;
  }>;
}

const ComplianceDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleScheduleAudit = () => {
    console.log('Schedule Audit clicked');
    // TODO: Implement schedule audit modal
    alert('Schedule Audit functionality will be implemented');
  };

  const handleAddRequirement = () => {
    console.log('Add Requirement clicked');
    // TODO: Implement add requirement modal
    alert('Add Requirement functionality will be implemented');
  };

  const handleExportReport = () => {
    console.log('Export Report clicked');
    // TODO: Implement export report functionality
    alert('Export Report functionality will be implemented');
  };

  const handleGenerateReport = () => {
    console.log('Generate Report clicked');
    // TODO: Implement generate report functionality
    alert('Generate Report functionality will be implemented');
  };

  const handleViewRequirement = (requirementId: string) => {
    console.log('View Requirement clicked:', requirementId);
    // TODO: Implement view requirement modal/page
    alert(`View Requirement ${requirementId} functionality will be implemented`);
  };

  const handleEditRequirement = (requirementId: string) => {
    console.log('Edit Requirement clicked:', requirementId);
    // TODO: Implement edit requirement modal/page
    alert(`Edit Requirement ${requirementId} functionality will be implemented`);
  };

  const handleViewDocument = (requirementId: string) => {
    console.log('View Document clicked:', requirementId);
    // TODO: Implement view document functionality
    alert(`View Document for Requirement ${requirementId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getCompliance(1, 100, selectedCategory !== 'all' ? selectedCategory : undefined, selectedStatus !== 'all' ? selectedStatus : undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setComplianceData(response.data);
        } else {
          throw new Error('No compliance data received');
        }
      } catch (err) {
        console.error('Failed to fetch compliance data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load compliance data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [selectedCategory, selectedStatus]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non_compliant': return 'error';
      case 'pending': return 'warning';
      case 'review': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'regulatory': return 'error';
      case 'quality': return 'warning';
      case 'safety': return 'info';
      case 'documentation': return 'success';
      default: return 'secondary';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'regulatory': return 'Regulatory';
      case 'quality': return 'Quality';
      case 'safety': return 'Safety';
      case 'documentation': return 'Documentation';
      default: return category;
    }
  };

  const getCategoryColorCode = (category: string) => {
    switch (category) {
      case 'regulatory': return '#e53e3e';
      case 'quality': return '#f59e0b';
      case 'safety': return '#3182ce';
      case 'documentation': return '#38a169';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading compliance data...</Text>
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
            <Text color="#718096">Failed to load compliance data</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!complianceData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No compliance data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: complianceItems, statistics, categoryStats } = complianceData;

  // Apply search filter
  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Compliance Dashboard
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Monitor regulatory compliance, quality standards, and safety requirements
            </Text>
          </Box>
          <Flex gap="2">
            <Button 
              variant="ghost" 
              size="sm" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              onClick={handleScheduleAudit}
            >
              <FiCalendar size={14} style={{ marginRight: '0.375rem' }} />
              Schedule Audit
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600' }}
              onClick={handleAddRequirement}
            >
              <FiPlus style={{ marginRight: '0.5rem' }} />
              Add Requirement
            </Button>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Requirements"
              value={statistics.totalItems.toString()}
              icon={FiShield}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Compliant"
              value={statistics.compliantItems.toString()}
              icon={FiCheckCircle}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Non-Compliant"
              value={statistics.nonCompliantItems.toString()}
              icon={FiXCircle}
              color="#ef4444"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Compliance Rate"
              value={`${statistics.complianceRate.toFixed(1)}%`}
              icon={FiTrendingUp}
              color="#f59e0b"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Compliance Overview */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
                Compliance Status
              </Heading>
              <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Current compliance status by category
              </Text>

            <Flex direction="column" gap="6">
              {categoryStats.map((item, index) => (
                <Box 
                  key={index} 
                  style={{ 
                    padding: '0.875rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: index < 3 ? '0.75rem' : '0'
                  }}
                >
                  <Flex justify="space-between" align="center" style={{ marginBottom: '0.75rem' }}>
                    <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                      {getCategoryDisplayName(item.category)}
                    </Text>
                    <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                      {item.compliant}/{item.total}
                    </Text>
                  </Flex>
                  <Box
                    style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      style={{
                        width: `${(item.compliant / item.total) * 100}%`,
                        height: '100%',
                        backgroundColor: getCategoryColorCode(item.category),
                        transition: 'width 0.3s ease',
                        borderRadius: '6px'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Flex>
            </Card>
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
                Upcoming Deadlines
              </Heading>
              <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Critical compliance deadlines
              </Text>

            <Flex direction="column" gap="0">
              {complianceItems
                .filter(item => item.status !== 'compliant')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5)
                .map((item, index) => (
                  <Flex key={item.id} align="center" gap="4" style={{ 
                    padding: '0.875rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: index < 4 ? '0.75rem' : '0'
                  }}>
                    <Box
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(item.priority) === 'error' ? '#e53e3e' : 
                                       getPriorityColor(item.priority) === 'warning' ? '#f59e0b' : '#3182ce',
                        flexShrink: 0
                      }}
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                        {item.title}
                      </Text>
                      <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                        Due: {item.dueDate}
                      </Text>
                    </Box>
                    <Badge variant={getStatusColor(item.status)} size="sm" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </Flex>
                ))}
            </Flex>
            </Card>
          </Box>
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={3} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Requirements
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by title, description, or ID..."
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
                <option value="regulatory">Regulatory</option>
                <option value="quality">Quality</option>
                <option value="safety">Safety</option>
                <option value="documentation">Documentation</option>
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
                <option value="compliant">Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
                <option value="pending">Pending</option>
                <option value="review">Under Review</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Compliance Items Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Compliance Requirements ({filteredItems.length})
            </Heading>
            <Flex gap="3">
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleExportReport}
              >
                <FiDownload size={14} style={{ marginRight: '0.375rem' }} />
                Export Report
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleGenerateReport}
              >
                <FiFileText size={14} style={{ marginRight: '0.375rem' }} />
                Generate Report
              </Button>
            </Flex>
          </Flex>

          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Requirement ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Title</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Category</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Priority</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Risk Level</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Due Date</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Assigned To</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {item.id}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Box>
                        <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          {item.title}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '0.75rem'
                        }}>
                          {item.description}
                        </Text>
                      </Box>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getCategoryColor(item.category)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(item.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getPriorityColor(item.priority)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getRiskLevelColor(item.riskLevel)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {item.dueDate}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {item.assignedTo}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleViewRequirement(item.id)}
                        >
                          <FiEye size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleEditRequirement(item.id)}
                        >
                          <FiEdit size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleViewDocument(item.id)}
                        >
                          <FiFileText size={12} />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {filteredItems.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No compliance requirements found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default ComplianceDashboard;