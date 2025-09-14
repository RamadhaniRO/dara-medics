import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTruck, 
  FiPackage,
  FiDollarSign,
  FiClock,
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
  SimpleMetricCard,
  OrdersSkeleton
} from '../../components';

// Import API client
import { apiClient } from '../../services/api';
import { useAuthErrorHandler } from '../../utils/useAuthErrorHandler';

interface Order {
  id: string;
  order_number: string;
  pharmacy_id: string;
  status: string;
  total_amount: number;
  final_amount: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
  pharmacies?: {
    name: string;
  };
}

interface FormattedOrder {
  id: string;
  customer: string;
  customerPhone: string;
  products: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderDate: string;
  deliveryDate?: string;
  priority: 'low' | 'medium' | 'high';
}

const OrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleCreateOrder = () => {
    console.log('Create Order clicked');
    // TODO: Implement create order modal/page
    alert('Create Order functionality will be implemented');
  };

  const handleExportOrders = () => {
    console.log('Export Orders clicked');
    // TODO: Implement export functionality
    alert('Export functionality will be implemented');
  };

  const handleBulkActions = () => {
    console.log('Bulk Actions clicked');
    // TODO: Implement bulk actions modal
    alert('Bulk Actions functionality will be implemented');
  };

  const handleViewOrder = (orderId: string) => {
    console.log('View Order clicked:', orderId);
    // TODO: Implement view order modal/page
    alert(`View Order ${orderId} functionality will be implemented`);
  };

  const handleEditOrder = (orderId: string) => {
    console.log('Edit Order clicked:', orderId);
    // TODO: Implement edit order modal/page
    alert(`Edit Order ${orderId} functionality will be implemented`);
  };

  const handleTrackOrder = (orderId: string) => {
    console.log('Track Order clicked:', orderId);
    // TODO: Implement order tracking
    alert(`Track Order ${orderId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getOrders(1, 100); // Get first 100 orders
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.data) {
          setOrders(response.data.data);
        } else {
          throw new Error('No orders data received');
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format orders for display
  const formatOrders = (orders: Order[]): FormattedOrder[] => {
    return orders.map(order => {
      // Map order status to display values
      const getOrderStatus = (status: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' => {
        switch (status.toLowerCase()) {
          case 'pending':
            return 'pending';
          case 'confirmed':
          case 'processing':
            return 'processing';
          case 'shipped':
            return 'shipped';
          case 'delivered':
            return 'delivered';
          case 'cancelled':
            return 'cancelled';
          default:
            return 'pending';
        }
      };
      
      // Map payment status to display values
      const getPaymentStatus = (status: string): 'pending' | 'paid' | 'failed' => {
        switch (status.toLowerCase()) {
          case 'paid':
            return 'paid';
          case 'pending':
            return 'pending';
          case 'failed':
            return 'failed';
          default:
            return 'pending';
        }
      };
      
      // Determine priority based on order amount
      const getPriority = (amount: number): 'low' | 'medium' | 'high' => {
        if (amount >= 10000) return 'high';
        if (amount >= 5000) return 'medium';
        return 'low';
      };
      
      // Format date
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      };
      
      // Calculate delivery date (mock - 3 days after order)
      const orderDate = new Date(order.created_at);
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(orderDate.getDate() + 3);
      
      return {
        id: order.order_number,
        customer: order.pharmacies?.name || 'Unknown Pharmacy',
        customerPhone: '+234 801 234 5678', // Mock phone - would come from customer data
        products: Math.floor(Math.random() * 20) + 1, // Mock product count
        total: order.final_amount,
        status: getOrderStatus(order.status),
        paymentStatus: getPaymentStatus(order.payment_status),
        orderDate: formatDate(order.created_at),
        deliveryDate: order.status === 'delivered' ? formatDate(deliveryDate.toISOString()) : undefined,
        priority: getPriority(order.final_amount)
      };
    });
  };

  const formattedOrders = formatOrders(orders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const filteredOrders = formattedOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'all' || order.paymentStatus === selectedPaymentStatus;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const totalOrders = formattedOrders.length;
  const pendingOrders = formattedOrders.filter(o => o.status === 'pending').length;
  const processingOrders = formattedOrders.filter(o => o.status === 'processing').length;
  const totalRevenue = formattedOrders.reduce((sum, o) => sum + o.total, 0);

  // Show loading state
  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Order Management
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Track and manage pharmacy wholesale orders efficiently
            </Text>
          </Box>
          <Button 
            variant="primary" 
            size="lg" 
            style={{ padding: '0.875rem 1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', minHeight: '44px' }}
            onClick={handleCreateOrder}
          >
            <FiPlus style={{ marginRight: '0.5rem' }} />
            Create Order
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Orders"
              value={loading ? '...' : totalOrders.toString()}
              icon={FiPackage}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Pending Orders"
              value={loading ? '...' : pendingOrders.toString()}
              icon={FiClock}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Processing"
              value={loading ? '...' : processingOrders.toString()}
              icon={FiTruck}
              color="#805ad5"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Revenue"
              value={loading ? '...' : `$${totalRevenue.toFixed(2)}`}
              icon={FiDollarSign}
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
                Search Orders
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by customer or order ID..."
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
                Order Status
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Payment Status
              </Text>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Orders Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Orders ({filteredOrders.length})
            </Heading>
            <Flex gap="3">
              <Button 
                variant="ghost" 
                size="md" 
                style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem', fontWeight: '500', borderRadius: '8px' }}
                onClick={handleExportOrders}
              >
                <FiFilter size={16} style={{ marginRight: '0.5rem' }} />
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="md" 
                style={{ fontSize: '0.8rem', padding: '0.75rem 1.25rem', fontWeight: '500', borderRadius: '8px' }}
                onClick={handleBulkActions}
              >
                <FiTruck size={16} style={{ marginRight: '0.5rem' }} />
                Bulk Actions
              </Button>
            </Flex>
          </Flex>

          {loading ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>Loading orders...</Text>
            </Box>
          ) : error ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#ef4444" style={{ fontSize: '0.875rem' }}>Error: {error}</Text>
              <Text color="#64748b" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Failed to load orders</Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Order ID</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Customer</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Products</th>
                    <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Total</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Payment</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Priority</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Order Date</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {order.id}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Box>
                        <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          {order.customer}
                        </Text>
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                          {order.customerPhone}
                        </Text>
                      </Box>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Text margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>{order.products}</Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        ${order.total.toFixed(2)}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(order.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getPaymentStatusColor(order.paymentStatus)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getPriorityColor(order.priority)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {order.orderDate}
                      </Text>
                      {order.deliveryDate && (
                        <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.7rem' }}>
                          Delivery: {order.deliveryDate}
                        </Text>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <FiEye size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                          onClick={() => handleEditOrder(order.id)}
                        >
                          <FiEdit size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}
                          onClick={() => handleTrackOrder(order.id)}
                        >
                          <FiTruck size={14} />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </Box>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No orders found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default OrderManagement;