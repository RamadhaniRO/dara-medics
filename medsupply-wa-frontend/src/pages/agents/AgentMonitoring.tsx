import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiMessageCircle, 
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiUser
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

interface Agent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  role: 'customer_service' | 'sales' | 'support';
  performance: {
    responseTime: number;
    satisfaction: number;
    conversations: number;
    resolutionRate: number;
  };
  currentTask: string;
  lastActive: string;
  availability: 'available' | 'unavailable' | 'in_meeting';
}

interface AgentsData {
  data: Agent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalAgents: number;
    onlineAgents: number;
    busyAgents: number;
    averageResponseTime: number;
    averageSatisfaction: number;
    totalConversations: number;
    averageResolutionRate: number;
  };
}

const AgentMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [agentsData, setAgentsData] = useState<AgentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleAddAgent = () => {
    console.log('Add Agent clicked');
    // TODO: Implement add agent modal
    alert('Add Agent functionality will be implemented');
  };

  const handleViewAgent = (agentId: string) => {
    console.log('View Agent clicked:', agentId);
    // TODO: Implement view agent modal/page
    alert(`View Agent ${agentId} functionality will be implemented`);
  };

  const handleEditAgent = (agentId: string) => {
    console.log('Edit Agent clicked:', agentId);
    // TODO: Implement edit agent modal/page
    alert(`Edit Agent ${agentId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchAgentsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getAgents(1, 100, selectedStatus !== 'all' ? selectedStatus : undefined, selectedRole !== 'all' ? selectedRole : undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setAgentsData(response.data);
        } else {
          throw new Error('No agents data received');
        }
      } catch (err) {
        console.error('Failed to fetch agents data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load agents data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentsData();
  }, [selectedStatus, selectedRole]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'secondary';
      case 'busy': return 'warning';
      case 'away': return 'info';
      default: return 'secondary';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'success';
      case 'unavailable': return 'error';
      case 'in_meeting': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading agents data...</Text>
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
            <Text color="#718096">Failed to load agents data</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!agentsData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No agents data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: agents, statistics } = agentsData;

  // Apply search filter
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Agent Monitoring
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Monitor agent performance, availability, and customer interactions
            </Text>
          </Box>
          <Button 
            variant="primary" 
            size="lg" 
            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600' }}
            onClick={handleAddAgent}
          >
            <FiActivity style={{ marginRight: '0.5rem' }} />
            Add Agent
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Agents"
              value={statistics.totalAgents.toString()}
              icon={FiUser}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Online Agents"
              value={statistics.onlineAgents.toString()}
              icon={FiCheckCircle}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Busy Agents"
              value={statistics.busyAgents.toString()}
              icon={FiClock}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Avg Response Time"
              value={`${statistics.averageResponseTime.toFixed(1)}m`}
              icon={FiActivity}
              color="#805ad5"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={3} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Agents
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by name or ID..."
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
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Role
              </Text>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Roles</option>
                <option value="customer_service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Agents Grid */}
        <Flex gap="3xl" wrap justify="center">
          {filteredAgents.map((agent) => (
            <Box key={agent.id} style={{ flex: '0 0 auto', width: 'calc(33.333% - 32px)' }}>
              <Card 
                elevation="sm" 
                padding="4" 
                style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Flex direction="column" gap="8" style={{ height: '100%' }}>
                  {/* Agent Header with Actions */}
                  <Flex justify="space-between" align="start">
                    <Flex align="center" gap="5">
                      <Box
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4a5568',
                          flexShrink: 0
                        }}
                      >
                        <FiUser size={20} />
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Text weight="semibold" margin="0" style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                          {agent.name}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                          {agent.id}
                        </Text>
                      </Box>
                    </Flex>
                    <Flex align="center" gap="5">
                      <Badge variant={getStatusColor(agent.status)} size="sm" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </Badge>
                      <Flex gap="4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.375rem',
                            borderRadius: '6px',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0',
                            minWidth: 'auto'
                          }}
                          onClick={() => handleViewAgent(agent.id)}
                        >
                          <FiEye size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.375rem',
                            borderRadius: '6px',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0',
                            minWidth: 'auto'
                          }}
                          onClick={() => handleEditAgent(agent.id)}
                        >
                          <FiMessageCircle size={12} />
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>

                  {/* Performance Metrics - Compact Grid */}
                  <Box style={{ 
                    padding: '1.25rem', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Grid columns={4} gap="6">
                      <Box style={{ textAlign: 'center' }}>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                          Response
                        </Text>
                        <Text weight="bold" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                          {agent.performance.responseTime}m
                        </Text>
                      </Box>
                      <Box style={{ textAlign: 'center' }}>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                          Rating
                        </Text>
                        <Text weight="bold" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                          {agent.performance.satisfaction}
                        </Text>
                      </Box>
                      <Box style={{ textAlign: 'center' }}>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                          Chats
                        </Text>
                        <Text weight="bold" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                          {agent.performance.conversations}
                        </Text>
                      </Box>
                      <Box style={{ textAlign: 'center' }}>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                          Resolved
                        </Text>
                        <Text weight="bold" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                          {agent.performance.resolutionRate}%
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Current Task and Last Active - Combined */}
                  <Box>
                    <Text size="sm" color="#64748b" weight="medium" margin="0" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                      Current Task
                    </Text>
                    <Text size="sm" style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.4', marginBottom: '1.25rem' }}>
                      {agent.currentTask}
                    </Text>
                    <Flex justify="space-between" align="center" gap="5">
                      <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
                        Last active: {agent.lastActive}
                      </Text>
                      <Badge variant={getAvailabilityColor(agent.availability)} size="sm" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                        {agent.availability.replace('_', ' ')}
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            </Box>
          ))}
        </Flex>

        {filteredAgents.length === 0 && (
          <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No agents found matching your criteria.</Text>
            </Box>
          </Card>
        )}
      </Flex>
    </Container>
  );
};

export default AgentMonitoring;