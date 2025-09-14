import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiEdit, 
  FiUser, 
  FiPhone,
  FiMail,
  FiMapPin,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiDownload
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

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  pharmacy_id?: string;
  pharmacies?: {
    name: string;
  };
}

interface FormattedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
  loyaltyPoints: number;
}

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
  const handleAddCustomer = () => {
    console.log('Add Customer clicked');
    // TODO: Implement add customer modal/page
    alert('Add Customer functionality will be implemented');
  };

  const handleExportCustomers = () => {
    console.log('Export Customers clicked');
    // TODO: Implement export functionality
    alert('Export functionality will be implemented');
  };

  const handleSendCampaign = () => {
    console.log('Send Campaign clicked');
    // TODO: Implement campaign functionality
    alert('Send Campaign functionality will be implemented');
  };

  const handleViewCustomer = (customerId: string) => {
    console.log('View Customer clicked:', customerId);
    // TODO: Implement view customer modal/page
    alert(`View Customer ${customerId} functionality will be implemented`);
  };

  const handleEditCustomer = (customerId: string) => {
    console.log('Edit Customer clicked:', customerId);
    // TODO: Implement edit customer modal/page
    alert(`Edit Customer ${customerId} functionality will be implemented`);
  };

  const handleEmailCustomer = (customerId: string) => {
    console.log('Email Customer clicked:', customerId);
    // TODO: Implement email customer functionality
    alert(`Email Customer ${customerId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getUsers(1, 100); // Get first 100 users
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.data) {
          setUsers(response.data.data);
        } else {
          throw new Error('No users data received');
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format users as customers for display
  const formatCustomers = (users: User[]): FormattedCustomer[] => {
    return users.map(user => {
      // Map user status to customer status
      const getCustomerStatus = (status: string): 'active' | 'inactive' | 'suspended' => {
        switch (status.toLowerCase()) {
          case 'active':
            return 'active';
          case 'inactive':
            return 'inactive';
          case 'suspended':
            return 'suspended';
          default:
            return 'active';
        }
      };
      
      // Format date
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      };
      
      // Mock data for orders and spending (would come from orders table in real implementation)
      const totalOrders = Math.floor(Math.random() * 50) + 1;
      const totalSpent = Math.floor(Math.random() * 20000) + 1000;
      const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per $10 spent
      
      // Calculate last order date (mock - would be from orders table)
      const lastOrderDate = new Date();
      lastOrderDate.setDate(lastOrderDate.getDate() - Math.floor(Math.random() * 30));
      
      return {
        id: user.id,
        name: user.name,
        phone: user.phone || '+234 801 234 5678', // Mock phone if not available
        email: user.email,
        location: user.pharmacies?.name ? `${user.pharmacies.name}, Nigeria` : 'Lagos, Nigeria',
        status: getCustomerStatus(user.status),
        totalOrders,
        totalSpent,
        lastOrder: formatDate(lastOrderDate.toISOString()),
        joinDate: formatDate(user.created_at),
        loyaltyPoints
      };
    });
  };

  const formattedCustomers = formatCustomers(users);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'suspended': return 'error';
      default: return 'secondary';
    }
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 1500) return { tier: 'Gold', color: 'warning' };
    if (points >= 1000) return { tier: 'Silver', color: 'secondary' };
    return { tier: 'Bronze', color: 'primary' };
  };

  const filteredCustomers = formattedCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = formattedCustomers.length;
  const activeCustomers = formattedCustomers.filter(c => c.status === 'active').length;
  const totalRevenue = formattedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageOrderValue = totalRevenue / formattedCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Customer Management
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Manage pharmacy customers, track orders, and maintain relationships
            </Text>
          </Box>
          <Button 
            variant="primary" 
            size="lg" 
            style={{ padding: '0.875rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', minHeight: '44px' }}
            onClick={handleAddCustomer}
          >
            <FiUser style={{ marginRight: '0.5rem' }} />
            Add Customer
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Customers"
              value={loading ? '...' : totalCustomers.toString()}
              icon={FiUser}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Active Customers"
              value={loading ? '...' : activeCustomers.toString()}
              icon={FiTrendingUp}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Revenue"
              value={loading ? '...' : `$${totalRevenue.toFixed(2)}`}
              icon={FiDollarSign}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Avg Order Value"
              value={loading ? '...' : `$${averageOrderValue.toFixed(2)}`}
              icon={FiPackage}
              color="#805ad5"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={2} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Customers
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by name, ID, or email..."
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
                onChange={(e) => setSelectedStatus(e.target.value)}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Customers Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Customers ({filteredCustomers.length})
            </Heading>
            <Flex gap="3">
              <Button 
                variant="ghost" 
                size="md" 
                style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem', fontWeight: '500', borderRadius: '8px' }}
                onClick={handleExportCustomers}
              >
                <FiDownload size={16} style={{ marginRight: '0.5rem' }} />
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="md" 
                style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem', fontWeight: '500', borderRadius: '8px' }}
                onClick={handleSendCampaign}
              >
                <FiMail size={16} style={{ marginRight: '0.5rem' }} />
                Send Campaign
              </Button>
            </Flex>
          </Flex>

          {loading ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>Loading customers...</Text>
            </Box>
          ) : error ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#ef4444" style={{ fontSize: '0.875rem' }}>Error: {error}</Text>
              <Text color="#64748b" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Failed to load customers</Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Contact</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Location</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Orders</th>
                    <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Total Spent</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Loyalty</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                  const loyaltyTier = getLoyaltyTier(customer.loyaltyPoints);
                  return (
                    <tr key={customer.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                      <td style={{ padding: '1rem' }}>
                        <Box>
                          <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                            {customer.name}
                          </Text>
                          <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                            {customer.id}
                          </Text>
                        </Box>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Box>
                          <Flex align="center" gap="1" style={{ marginBottom: '0.5rem' }}>
                            <FiPhone size={14} />
                            <Text size="sm" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>{customer.phone}</Text>
                          </Flex>
                          <Flex align="center" gap="1">
                            <FiMail size={14} />
                            <Text size="sm" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>{customer.email}</Text>
                          </Flex>
                        </Box>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Flex align="center" gap="1">
                          <FiMapPin size={14} />
                          <Text size="sm" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>{customer.location}</Text>
                        </Flex>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Badge variant={getStatusColor(customer.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Text margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>{customer.totalOrders}</Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          Last: {customer.lastOrder}
                        </Text>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          ${customer.totalSpent.toFixed(2)}
                        </Text>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Badge variant={loyaltyTier.color as 'primary' | 'secondary' | 'warning' | 'danger' | 'success' | 'info' | 'error'} size="sm" style={{ fontSize: '0.7rem' }}>
                          {loyaltyTier.tier}
                        </Badge>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          {customer.loyaltyPoints} pts
                        </Text>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Flex gap="2" justify="center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                            onClick={() => handleViewCustomer(customer.id)}
                          >
                            <FiEye size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                            onClick={() => handleEditCustomer(customer.id)}
                          >
                            <FiEdit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                            onClick={() => handleEmailCustomer(customer.id)}
                          >
                            <FiMail size={14} />
                          </Button>
                        </Flex>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </Box>
          )}

          {!loading && !error && filteredCustomers.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No customers found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default CustomerManagement;