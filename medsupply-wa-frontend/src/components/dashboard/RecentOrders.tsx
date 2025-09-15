import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit } from 'react-icons/fi';

// Import new component system
import {
  Card,
  Text,
  Flex,
  Box,
  Heading,
  Badge,
  Link,
  Button,
  SkeletonList,
  SkeletonOrderCard
} from '../atoms';

// Import API client
import { apiClient } from '../../services/api';

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
  pharmacy: string;
  amount: string;
  paymentStatus: string;
  orderStatus: string;
  paymentColor: string;
  orderColor: string;
  date: string;
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
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

  const handleViewAllOrders = () => {
    console.log('View All Orders clicked');
    // TODO: Implement navigation to orders page
    alert('View All Orders functionality will be implemented');
  };

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getOrders(1, 5); // Get first 5 orders
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.data) {
          setOrders(response.data.data);
        } else if (response.data?.orders) {
          setOrders(response.data.orders);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.log('Orders API response structure:', response.data);
          // Use mock data if API doesn't return expected structure
          const mockOrders: Order[] = [
            {
              id: '1',
              order_number: 'ORD-001',
              customer_name: 'Sample Pharmacy',
              final_amount: 1250.00,
              payment_status: 'paid',
              order_status: 'completed',
              created_at: new Date().toISOString()
            }
          ];
          setOrders(mockOrders);
        }
      } catch (err) {
        console.error('Failed to fetch recent orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recent orders');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Format orders for display
  const formatOrders = (orders: Order[]): FormattedOrder[] => {
    return orders.map(order => {
      // Format amount
      const amount = `$${order.final_amount.toLocaleString()}`;
      
      // Map payment status to display values and colors
      const getPaymentStatus = (status: string) => {
        switch (status.toLowerCase()) {
          case 'paid':
            return { status: 'Paid', color: 'success' };
          case 'pending':
            return { status: 'Pending', color: 'warning' };
          case 'failed':
            return { status: 'Failed', color: 'danger' };
          default:
            return { status: 'Unknown', color: 'secondary' };
        }
      };
      
      // Map order status to display values and colors
      const getOrderStatus = (status: string) => {
        switch (status.toLowerCase()) {
          case 'delivered':
            return { status: 'Completed', color: 'primary' };
          case 'processing':
          case 'confirmed':
            return { status: 'Processing', color: 'secondary' };
          case 'pending':
            return { status: 'Pending', color: 'warning' };
          case 'cancelled':
            return { status: 'Cancelled', color: 'danger' };
          default:
            return { status: 'Unknown', color: 'secondary' };
        }
      };
      
      // Format date
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
          return 'Just now';
        } else if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
      };
      
      const paymentInfo = getPaymentStatus(order.payment_status);
      const orderInfo = getOrderStatus(order.status);
      
      return {
        id: order.order_number,
        pharmacy: order.pharmacies?.name || 'Unknown Pharmacy',
        amount,
        paymentStatus: paymentInfo.status,
        orderStatus: orderInfo.status,
        paymentColor: paymentInfo.color,
        orderColor: orderInfo.color,
        date: formatDate(order.created_at)
      };
    });
  };

  const formattedOrders = formatOrders(orders);

  return (
    <Card elevation="sm" padding="4" style={{ height: '100%', backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: '1rem' }}>
        <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
          Recent Orders
        </Heading>
        <Link 
          variant="primary" 
          size="sm" 
          style={{ fontSize: '0.7rem', fontWeight: '500' }}
          onClick={handleViewAllOrders}
        >
          View All
        </Link>
      </Flex>

      {loading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonOrderCard key={i} />
          ))}
        </div>
      ) : error ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '200px' }}>
          <Text size="sm" color="#ef4444">Error: {error}</Text>
          <Text size="xs" color="#64748b" style={{ marginTop: '0.5rem' }}>Failed to load recent orders</Text>
        </Flex>
      ) : formattedOrders.length === 0 ? (
        <Flex direction="column" align="center" justify="center" style={{ minHeight: '200px' }}>
          <Text size="sm" color="#64748b">No recent orders found</Text>
        </Flex>
      ) : (
        <Box>
          {formattedOrders.map((order, index) => (
          <Box 
            key={index}
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              marginBottom: index < orders.length - 1 ? '0.75rem' : '0'
            }}
          >
            {/* Order Header with Actions */}
            <Flex justify="space-between" align="center" style={{ marginBottom: '0.5rem' }}>
              <Box>
                <Text weight="bold" margin="0" style={{ color: '#0f172a', fontSize: '0.75rem', marginBottom: '0.125rem' }}>
                  {order.id}
                </Text>
                <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.65rem' }}>
                  {order.pharmacy}
                </Text>
              </Box>
              <Flex align="center" gap="2">
                <Text weight="bold" size="md" margin="0" style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                  {order.amount}
                </Text>
                <Flex gap="2">
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ 
                      padding: '0.125rem 0.25rem', 
                      borderRadius: '3px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.6rem',
                      fontWeight: '500',
                      minWidth: 'auto'
                    }}
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <FiEye size={8} style={{ color: '#64748b' }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ 
                      padding: '0.125rem 0.25rem', 
                      borderRadius: '3px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.6rem',
                      fontWeight: '500',
                      minWidth: 'auto'
                    }}
                    onClick={() => handleEditOrder(order.id)}
                  >
                    <FiEdit size={8} style={{ color: '#64748b' }} />
                  </Button>
                </Flex>
              </Flex>
            </Flex>

            {/* Order Status Section */}
            <Flex justify="space-between" align="center">
              <Flex gap="4">
                <Box style={{ marginRight: '0.25rem' }}>
                  <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.6rem', marginBottom: '0.125rem', fontWeight: '500' }}>
                    Payment
                  </Text>
                  <Badge variant={order.paymentColor as any} size="sm" style={{ fontSize: '0.65rem', padding: '0.125rem 0.25rem' }}>
                    {order.paymentStatus}
                  </Badge>
                </Box>
                <Box>
                  <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.6rem', marginBottom: '0.125rem', fontWeight: '500' }}>
                    Status
                  </Text>
                  <Badge variant={order.orderColor as any} size="sm" style={{ fontSize: '0.65rem', padding: '0.125rem 0.25rem' }}>
                    {order.orderStatus}
                  </Badge>
                </Box>
              </Flex>
              
              <Box style={{ textAlign: 'right' }}>
                <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.6rem', marginBottom: '0.125rem', fontWeight: '500' }}>
                  Order Date
                </Text>
                <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.65rem' }}>
                  {order.date}
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
        </Box>
      )}
    </Card>
  );
};

export default RecentOrders;
