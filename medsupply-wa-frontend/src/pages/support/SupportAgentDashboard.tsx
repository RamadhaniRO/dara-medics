import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiMessageCircle, 
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
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

interface SupportTicket {
  id: string;
  customer: string;
  customerPhone: string;
  customerEmail: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'order' | 'general';
  assignedAgent: string;
  createdAt: string;
  updatedAt: string;
  responseTime: number;
}

interface SupportData {
  data: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    urgentTickets: number;
    averageResponseTime: number;
  };
}

const SupportAgentDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [supportData, setSupportData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleCreateTicket = () => {
    console.log('Create Ticket clicked');
    // TODO: Implement create ticket modal
    alert('Create Ticket functionality will be implemented');
  };

  const handleAssignTicket = () => {
    console.log('Assign Ticket clicked');
    // TODO: Implement assign ticket functionality
    alert('Assign Ticket functionality will be implemented');
  };

  const handleBulkActions = () => {
    console.log('Bulk Actions clicked');
    // TODO: Implement bulk actions modal
    alert('Bulk Actions functionality will be implemented');
  };

  const handleViewTicket = (ticketId: string) => {
    console.log('View Ticket clicked:', ticketId);
    // TODO: Implement view ticket modal/page
    alert(`View Ticket ${ticketId} functionality will be implemented`);
  };

  const handleEditTicket = (ticketId: string) => {
    console.log('Edit Ticket clicked:', ticketId);
    // TODO: Implement edit ticket modal/page
    alert(`Edit Ticket ${ticketId} functionality will be implemented`);
  };

  const handleCloseTicket = (ticketId: string) => {
    console.log('Close Ticket clicked:', ticketId);
    // TODO: Implement close ticket functionality
    if (window.confirm('Are you sure you want to close this ticket?')) {
      alert(`Close Ticket ${ticketId} functionality will be implemented`);
    }
  };

  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getSupportTickets(1, 100, selectedStatus !== 'all' ? selectedStatus : undefined, selectedPriority !== 'all' ? selectedPriority : undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setSupportData(response.data);
        } else {
          throw new Error('No support data received');
        }
      } catch (err) {
        console.error('Failed to fetch support data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load support data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportData();
  }, [selectedStatus, selectedPriority]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'error';
      case 'billing': return 'warning';
      case 'order': return 'info';
      case 'general': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading support tickets...</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#ef4444" size="lg" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
            <Text color="#718096">Failed to load support tickets</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!supportData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No support tickets data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: tickets, statistics } = supportData;

  // Apply search filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Support Agent Dashboard
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Manage customer support tickets and provide excellent service
            </Text>
          </Box>
          <Button 
            variant="primary" 
            size="lg" 
            style={{ 
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
            onClick={handleCreateTicket}
          >
            <FiPlus size={16} style={{ marginRight: '0.5rem' }} />
            New Ticket
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Tickets"
              value={statistics.totalTickets.toString()}
              icon={FiMessageCircle}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Open Tickets"
              value={statistics.openTickets.toString()}
              icon={FiAlertCircle}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="In Progress"
              value={statistics.inProgressTickets.toString()}
              icon={FiActivity}
              color="#805ad5"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Avg Response Time"
              value={`${statistics.averageResponseTime}m`}
              icon={FiCheckCircle}
              color="#38a169"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={3} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Tickets
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by customer, subject, or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    paddingLeft: '3rem', 
                    fontSize: '0.875rem',
                    padding: '0.75rem'
                  }}
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
                Status
              </Text>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Priority
              </Text>
              <select
                value={selectedPriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Tickets Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Support Tickets ({filteredTickets.length})
            </Heading>
            <Flex gap="5">
              <Button 
                variant="secondary" 
                size="sm" 
                style={{ 
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onClick={handleAssignTicket}
              >
                <FiFilter size={14} style={{ marginRight: '0.375rem' }} />
                Export
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                style={{ 
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onClick={handleBulkActions}
              >
                <FiActivity size={14} style={{ marginRight: '0.375rem' }} />
                Analytics
              </Button>
            </Flex>
          </Flex>

          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Ticket ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Subject</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Priority</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Assigned Agent</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Created</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {ticket.id}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Box>
                        <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                          {ticket.customer}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          {ticket.customerPhone}
                        </Text>
                      </Box>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Box>
                        <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                          {ticket.subject}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '0.75rem'
                        }}>
                          {ticket.description}
                        </Text>
                      </Box>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getPriorityColor(ticket.priority)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(ticket.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getCategoryColor(ticket.category)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {ticket.assignedAgent}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                        {ticket.createdAt}
                      </Text>
                      <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                        Updated: {ticket.updatedAt}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ 
                            padding: '0.5rem',
                            borderRadius: '6px'
                          }}
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <FiEye size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ 
                            padding: '0.5rem',
                            borderRadius: '6px'
                          }}
                          onClick={() => handleEditTicket(ticket.id)}
                        >
                          <FiEdit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ 
                            padding: '0.5rem',
                            borderRadius: '6px'
                          }}
                          onClick={() => handleCloseTicket(ticket.id)}
                        >
                          <FiMessageCircle size={14} />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {filteredTickets.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No tickets found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default SupportAgentDashboard;