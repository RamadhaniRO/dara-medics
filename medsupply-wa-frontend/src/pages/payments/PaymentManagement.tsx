import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiDollarSign, 
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiCalendar,
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
  PaymentsSkeleton
} from '../../components';

// Import API client
import { apiClient } from '../../services/api';

interface Payment {
  id: string;
  order_id: string;
  transaction_id: string;
  amount: number;
  payment_method: string;
  payment_type: string;
  status: string;
  phone_number?: string;
  customer_name?: string;
  confirmation_code?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  orders: {
    order_number: string;
    pharmacy_id: string;
    pharmacies: {
      name: string;
    };
  };
}

interface FormattedPayment {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: 'card' | 'bank_transfer' | 'mobile_money' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  transactionId: string;
  fees: number;
  netAmount: number;
}

const PaymentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
  const handleDateRange = () => {
    console.log('Date Range clicked');
    // TODO: Implement date range picker modal
    alert('Date Range functionality will be implemented');
  };

  const handleProcessRefund = () => {
    console.log('Process Refund clicked');
    // TODO: Implement refund processing modal
    alert('Process Refund functionality will be implemented');
  };

  const handleExportPayments = () => {
    console.log('Export Payments clicked');
    // TODO: Implement export functionality
    alert('Export Payments functionality will be implemented');
  };

  const handleAdvancedFilter = () => {
    console.log('Advanced Filter clicked');
    // TODO: Implement advanced filter modal
    alert('Advanced Filter functionality will be implemented');
  };

  const handleViewPayment = (paymentId: string) => {
    console.log('View Payment clicked:', paymentId);
    // TODO: Implement view payment modal/page
    alert(`View Payment ${paymentId} functionality will be implemented`);
  };

  const handleEditPayment = (paymentId: string) => {
    console.log('Edit Payment clicked:', paymentId);
    // TODO: Implement edit payment modal/page
    alert(`Edit Payment ${paymentId} functionality will be implemented`);
  };

  const handleDownloadReceipt = (paymentId: string) => {
    console.log('Download Receipt clicked:', paymentId);
    // TODO: Implement receipt download functionality
    alert(`Download Receipt ${paymentId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getPayments(1, 100); // Get first 100 payments
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.data) {
          setPayments(response.data.data);
        } else {
          throw new Error('No payments data received');
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Format payments for display
  const formatPayments = (payments: Payment[]): FormattedPayment[] => {
    return payments.map(payment => {
      // Map payment method to display values
      const getPaymentMethod = (method: string): 'card' | 'bank_transfer' | 'mobile_money' | 'cash' => {
        switch (method.toLowerCase()) {
          case 'card':
          case 'credit_card':
            return 'card';
          case 'bank_transfer':
          case 'bank':
            return 'bank_transfer';
          case 'mobile_money':
          case 'mobile':
            return 'mobile_money';
          case 'cash':
            return 'cash';
          default:
            return 'card';
        }
      };
      
      // Map payment status to display values
      const getPaymentStatus = (status: string): 'pending' | 'completed' | 'failed' | 'refunded' => {
        switch (status.toLowerCase()) {
          case 'completed':
          case 'success':
            return 'completed';
          case 'pending':
            return 'pending';
          case 'failed':
          case 'error':
            return 'failed';
          case 'refunded':
          case 'refund':
            return 'refunded';
          default:
            return 'pending';
        }
      };
      
      // Format date
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      // Calculate fees (mock - would be from payment gateway data)
      const calculateFees = (amount: number, method: string): number => {
        switch (method.toLowerCase()) {
          case 'card':
            return amount * 0.03; // 3% fee
          case 'bank_transfer':
            return amount * 0.01; // 1% fee
          case 'mobile_money':
            return amount * 0.02; // 2% fee
          case 'cash':
            return 0; // No fee for cash
          default:
            return amount * 0.03;
        }
      };
      
      const fees = calculateFees(payment.amount, payment.payment_method);
      const netAmount = payment.amount - fees;
      
      return {
        id: payment.id,
        orderId: payment.orders?.order_number || 'Unknown',
        customer: payment.customer_name || payment.orders?.pharmacies?.name || 'Unknown Customer',
        amount: payment.amount,
        method: getPaymentMethod(payment.payment_method),
        status: getPaymentStatus(payment.status),
        date: formatDate(payment.created_at),
        transactionId: payment.transaction_id,
        fees,
        netAmount
      };
    });
  };

  const formattedPayments = formatPayments(payments);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'secondary';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'card': return 'primary';
      case 'bank_transfer': return 'info';
      case 'mobile_money': return 'success';
      case 'cash': return 'warning';
      default: return 'secondary';
    }
  };

  const filteredPayments = formattedPayments.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || payment.method === selectedMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const completedPayments = formattedPayments.filter(p => p.status === 'completed').length;
  const pendingPayments = formattedPayments.filter(p => p.status === 'pending').length;
  const totalRevenue = formattedPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.netAmount, 0);
  const totalFees = formattedPayments.reduce((sum, p) => sum + p.fees, 0);

  // Show loading state
  if (loading) {
    return <PaymentsSkeleton />;
  }

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Payment Management
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Track and manage payment transactions, refunds, and financial records
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
              onClick={handleProcessRefund}
            >
              <FiPlus style={{ marginRight: '0.5rem' }} />
              Process Refund
            </Button>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Revenue"
              value={loading ? '...' : `$${totalRevenue.toLocaleString()}`}
              icon={FiDollarSign}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Completed Payments"
              value={loading ? '...' : completedPayments.toString()}
              icon={FiCheckCircle}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Pending Payments"
              value={loading ? '...' : pendingPayments.toString()}
              icon={FiClock}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Fees"
              value={loading ? '...' : `$${totalFees.toFixed(2)}`}
              icon={FiAlertCircle}
              color="#ef4444"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Payment Methods Overview */}
        <Flex gap="2xl" wrap justify="center">
          {loading ? (
            [1, 2, 3, 4].map((index) => (
              <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
                <Card elevation="sm" padding="4" style={{ 
                  minHeight: '90px',
                  backgroundColor: 'white',
                  border: '1px solid #f1f5f9'
                }}>
                  <Flex justify="space-between" align="start" style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" color="#64748b" weight="medium" style={{ marginBottom: '0.375rem', fontSize: '0.7rem' }}>
                        Loading...
                      </Text>
                      <Text size="xl" weight="bold" style={{ marginBottom: '0.375rem', fontSize: '1.5rem', color: '#0f172a' }}>
                        ...
                      </Text>
                      <Text size="xs" color="#64748b" margin="0" style={{ fontSize: '0.6rem' }}>
                        ... transactions
                      </Text>
                    </Box>
                    <Box style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem' }}>
                      <FiCreditCard size={20} style={{ color: '#64748b' }} />
                    </Box>
                  </Flex>
                </Card>
              </Box>
            ))
          ) : error ? (
            <Box style={{ flex: '0 0 auto', width: '100%' }}>
              <Card elevation="sm" padding="4" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
                <Box style={{ textAlign: 'center', padding: '2rem' }}>
                  <Text color="#ef4444" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Error: {error}
                  </Text>
                  <Text color="#64748b" style={{ fontSize: '0.75rem' }}>
                    Failed to load payment methods data
                  </Text>
                </Box>
              </Card>
            </Box>
          ) : (
            [
              { method: 'Card', count: formattedPayments.filter(p => p.method === 'card').length, amount: formattedPayments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.netAmount, 0), color: '#3182ce' },
              { method: 'Bank Transfer', count: formattedPayments.filter(p => p.method === 'bank_transfer').length, amount: formattedPayments.filter(p => p.method === 'bank_transfer').reduce((sum, p) => sum + p.netAmount, 0), color: '#805ad5' },
              { method: 'Mobile Money', count: formattedPayments.filter(p => p.method === 'mobile_money').length, amount: formattedPayments.filter(p => p.method === 'mobile_money').reduce((sum, p) => sum + p.netAmount, 0), color: '#38a169' },
              { method: 'Cash', count: formattedPayments.filter(p => p.method === 'cash').length, amount: formattedPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.netAmount, 0), color: '#d69e2e' }
            ].map((method, index) => (
              <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
                <Card elevation="sm" padding="4" hover={true} style={{ 
                  cursor: 'pointer',
                  minHeight: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  marginBottom: '0',
                  backgroundColor: 'white',
                  border: '1px solid #f1f5f9'
                }}>
                  <Flex justify="space-between" align="start" style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text 
                        size="sm" 
                        color="#64748b" 
                        weight="medium"
                        style={{ 
                          marginBottom: '0.375rem',
                          fontSize: '0.7rem',
                          lineHeight: '1.2'
                        }}
                      >
                        {method.method}
                      </Text>
                      <Text 
                        size="xl" 
                        weight="bold" 
                        style={{ 
                          marginBottom: '0.375rem',
                          fontSize: '1.5rem',
                          lineHeight: '1.1',
                          color: '#0f172a'
                        }}
                      >
                        ${method.amount.toLocaleString()}
                      </Text>
                      <Text 
                        size="xs" 
                        color="#64748b" 
                        margin="0"
                        style={{ 
                          fontSize: '0.6rem',
                          lineHeight: '1.2'
                        }}
                      >
                        {method.count} transactions
                      </Text>
                    </Box>
                    
                    <Box
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: `${method.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: method.color,
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                      }}
                    >
                      <FiCreditCard size={20} />
                    </Box>
                  </Flex>
                </Card>
              </Box>
            ))
          )}
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={3} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Payments
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by customer, order ID, or transaction ID..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Payment Method
              </Text>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Methods</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cash">Cash</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Payments Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Payment Transactions ({filteredPayments.length})
            </Heading>
            <Flex gap="2">
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleExportPayments}
              >
                <FiDownload size={14} style={{ marginRight: '0.375rem' }} />
                Export
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                onClick={handleAdvancedFilter}
              >
                <FiFilter size={14} style={{ marginRight: '0.375rem' }} />
                Advanced Filter
              </Button>
            </Flex>
          </Flex>

          {loading ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>Loading payments...</Text>
            </Box>
          ) : error ? (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#ef4444" style={{ fontSize: '0.875rem' }}>Error: {error}</Text>
              <Text color="#64748b" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Failed to load payments</Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Payment ID</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Order ID</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Customer</th>
                    <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Amount</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Method</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Fees</th>
                    <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Net Amount</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Date</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {payment.id}
                      </Text>
                      <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>
                        {payment.transactionId}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {payment.orderId}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {payment.customer}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        ${payment.amount.toFixed(2)}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getMethodColor(payment.method)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {payment.method.replace('_', ' ').charAt(0).toUpperCase() + payment.method.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(payment.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                        ${payment.fees.toFixed(2)}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        ${payment.netAmount.toFixed(2)}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {payment.date}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleViewPayment(payment.id)}
                        >
                          <FiEye size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleEditPayment(payment.id)}
                        >
                          <FiEdit size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                          onClick={() => handleDownloadReceipt(payment.id)}
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
          )}

          {!loading && !error && filteredPayments.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No payments found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default PaymentManagement;