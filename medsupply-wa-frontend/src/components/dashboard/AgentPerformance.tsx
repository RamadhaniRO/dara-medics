import React, { useState, useEffect } from 'react';

// Import new component system
import {
  Card,
  Text,
  Flex,
  Box,
  Heading,
  Badge,
  Grid,
  Divider,
  Link
} from '../atoms';

// Import API client
import { apiClient } from '../../services/api';

interface Agent {
  id: string;
  name: string;
  email: string;
  conversations: number;
  avgResponse: string;
  resolutionRate: number;
  status: string;
  avatar: string;
}

interface ResolutionData {
  label: string;
  value: number;
  color: string;
  count: number;
}

interface ResponseTimeData {
  name: string;
  time: number;
}

interface AgentPerformanceData {
  totalConversations: number;
  averageResponseTime: number;
  resolutionRate: number;
  agentBreakdown: Agent[];
  resolutionData: ResolutionData[];
  responseTimeData: ResponseTimeData[];
  period: string;
}

const AgentPerformance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<AgentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getAgentPerformance();
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setPerformanceData(response.data);
        } else {
          throw new Error('No agent performance data received');
        }
      } catch (err) {
        console.error('Failed to fetch agent performance:', err);
        setError(err instanceof Error ? err.message : 'Failed to load agent performance');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentPerformance();
  }, []);

  return (
    <Card elevation="sm" padding="4" style={{ height: '100%', backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: '1rem' }}>
        <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
          Agent Performance
        </Heading>
        <Flex align="center" gap="4">
          <Text size="xs" color="#64748b" margin="0" weight="medium" style={{ fontSize: '0.7rem' }}>
            {performanceData?.period || 'This Week'}
          </Text>
          <Link variant="primary" size="sm" style={{ fontSize: '0.7rem', fontWeight: '500' }}>
            View All
          </Link>
        </Flex>
      </Flex>

      {loading ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '300px' }}>
          <Text size="sm" color="#64748b">Loading agent performance...</Text>
        </Flex>
      ) : error ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '300px' }}>
          <Text size="sm" color="#ef4444">Error: {error}</Text>
          <Text size="xs" color="#64748b" style={{ marginTop: '0.5rem' }}>Failed to load agent performance</Text>
        </Flex>
      ) : !performanceData ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '300px' }}>
          <Text size="sm" color="#64748b">No agent performance data available</Text>
        </Flex>
      ) : (
        <>
          {/* Main Content Grid */}
          <Grid columns={2} gap="6" style={{ marginBottom: '1rem' }}>
            {/* Response Time Chart */}
            <Box style={{ padding: '0.25rem' }}>
              <Text size="xs" color="#64748b" weight="medium" style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                Response Time (minutes)
              </Text>
              <Box
                style={{
                  height: '80px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  position: 'relative'
                }}
              >
                <Flex align="end" justify="space-between" style={{ height: '100%' }}>
                  {performanceData.responseTimeData.map((agent, index) => (
                    <Box key={index} style={{ textAlign: 'center', flex: 1, padding: '0 0.125rem' }}>
                      <Box
                        style={{
                          height: `${(agent.time / 2.5) * 50}px`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px 2px 0 0',
                          marginBottom: '0.25rem',
                          minHeight: '10px',
                          opacity: 0.8
                        }}
                      />
                      <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.6rem' }}>
                        {agent.name}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </Box>
            </Box>

            {/* Resolution Rate */}
            <Box style={{ padding: '0.25rem' }}>
              <Text size="xs" color="#64748b" weight="medium" style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                Resolution Rate
              </Text>
              <Box
                style={{
                  height: '80px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  position: 'relative'
                }}
              >
                <Flex align="center" gap="3" style={{ height: '100%' }}>
                  <Box
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: `conic-gradient(from 0deg, ${performanceData.resolutionData.map((item, i) => 
                        `${item.color} ${i * 90}deg ${(i + 1) * 90}deg`
                      ).join(', ')})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <Box
                      style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Text size="sm" weight="bold" margin="0" style={{ color: '#0f172a', fontSize: '0.7rem' }}>
                        {performanceData.resolutionRate}%
                      </Text>
                    </Box>
                  </Box>
                  <Flex direction="column" gap="2" style={{ flex: 1 }}>
                    {performanceData.resolutionData.map((item, index) => (
                      <Flex key={index} align="center" justify="space-between">
                        <Flex align="center" gap="2">
                          <Box
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '2px',
                              backgroundColor: item.color
                            }}
                          />
                          <Text size="xs" margin="0" weight="medium" style={{ color: '#374151', fontSize: '0.65rem' }}>
                            {item.label}
                          </Text>
                        </Flex>
                        <Text size="xs" margin="0" weight="semibold" style={{ color: '#64748b', fontSize: '0.65rem' }}>
                          {item.value}%
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Box>
            </Box>
          </Grid>

          <Divider style={{ margin: '0.75rem 0' }} />

          {/* Agent Details Table */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Text size="xs" color="#64748b" weight="medium" style={{ marginBottom: '0.75rem', fontSize: '0.7rem' }}>
              Agent Details
            </Text>
            
            {/* Table Header */}
            <Grid columns={4} gap="3" style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Text size="xs" color="#64748b" weight="semibold" margin="0" style={{ fontSize: '0.65rem' }}>
                Agent
              </Text>
              <Text size="xs" color="#64748b" weight="semibold" margin="0" style={{ fontSize: '0.65rem', textAlign: 'center' }}>
                Conversations
              </Text>
              <Text size="xs" color="#64748b" weight="semibold" margin="0" style={{ fontSize: '0.65rem', textAlign: 'center' }}>
                Response Time
              </Text>
              <Text size="xs" color="#64748b" weight="semibold" margin="0" style={{ fontSize: '0.65rem', textAlign: 'center' }}>
                Resolution Rate
              </Text>
            </Grid>

            {/* Agent Rows */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {performanceData.agentBreakdown.map((agent, index) => (
                <Box 
                  key={index}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    marginBottom: index < performanceData.agentBreakdown.length - 1 ? '0.5rem' : '0',
                    flex: index < performanceData.agentBreakdown.length - 1 ? '0 0 auto' : '1 1 auto'
                  }}
                >
                  <Grid columns={4} gap="3">
                    <Flex align="center" gap="2">
                      <Box
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          flexShrink: 0
                        }}
                      >
                        {agent.avatar}
                      </Box>
                      <Box style={{ minWidth: 0 }}>
                        <Text weight="semibold" margin="0" style={{ color: '#0f172a', fontSize: '0.75rem', marginBottom: '0.125rem' }}>
                          {agent.name}
                        </Text>
                        <Badge 
                          variant={agent.status === 'online' ? 'success' : 'secondary'} 
                          size="sm"
                          style={{ fontSize: '0.6rem' }}
                        >
                          {agent.status}
                        </Badge>
                      </Box>
                    </Flex>
                    <Box style={{ textAlign: 'center', padding: '0.25rem 0' }}>
                      <Text weight="bold" margin="0" style={{ color: '#0f172a', fontSize: '0.8rem' }}>
                        {agent.conversations}
                      </Text>
                    </Box>
                    <Box style={{ textAlign: 'center', padding: '0.25rem 0' }}>
                      <Text weight="bold" margin="0" style={{ color: '#0f172a', fontSize: '0.8rem' }}>
                        {agent.avgResponse}
                      </Text>
                    </Box>
                    <Box style={{ textAlign: 'center', padding: '0.25rem 0' }}>
                      <Text weight="bold" margin="0" style={{ color: '#0f172a', fontSize: '0.8rem' }}>
                        {agent.resolutionRate}%
                      </Text>
                    </Box>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
};

export default AgentPerformance;