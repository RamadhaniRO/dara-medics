import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiUpload
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

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  sales: number;
  trend: 'up' | 'down';
  lastUpdated: string;
}

interface CatalogData {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    totalValue: number;
    totalSales: number;
  };
  categoryStats: Array<{
    category: string;
    count: number;
    sales: number;
    color: string;
  }>;
}

const CatalogManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { handleAuthError } = useAuthErrorHandler();

  // Button handlers
  const handleImportProducts = () => {
    console.log('Import Products clicked');
    // TODO: Implement import functionality
    alert('Import Products functionality will be implemented');
  };

  const handleAddProduct = () => {
    console.log('Add Product clicked');
    // TODO: Implement add product modal/page
    alert('Add Product functionality will be implemented');
  };

  const handleExportProducts = () => {
    console.log('Export Products clicked');
    // TODO: Implement export functionality
    alert('Export Products functionality will be implemented');
  };

  const handleAdvancedFilter = () => {
    console.log('Advanced Filter clicked');
    // TODO: Implement advanced filter modal
    alert('Advanced Filter functionality will be implemented');
  };

  const handleViewProduct = (productId: string) => {
    console.log('View Product clicked:', productId);
    // TODO: Implement view product modal/page
    alert(`View Product ${productId} functionality will be implemented`);
  };

  const handleEditProduct = (productId: string) => {
    console.log('Edit Product clicked:', productId);
    // TODO: Implement edit product modal/page
    alert(`Edit Product ${productId} functionality will be implemented`);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete Product clicked:', productId);
    // TODO: Implement delete product functionality
    if (window.confirm('Are you sure you want to delete this product?')) {
      alert(`Delete Product ${productId} functionality will be implemented`);
    }
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getCatalog(1, 100, selectedCategory !== 'all' ? selectedCategory : undefined, selectedStatus !== 'all' ? selectedStatus : undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setCatalogData(response.data);
        } else {
          throw new Error('No catalog data received');
        }
      } catch (err) {
        console.error('Failed to fetch catalog data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load catalog data';
        
        // Check if it's an authentication error
        if (handleAuthError(errorMessage)) {
          return; // Error was handled by redirecting to login
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [selectedCategory, selectedStatus]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'out_of_stock': return 'error';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <FiTrendingUp color="#38a169" /> : <FiTrendingDown color="#e53e3e" />;
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading catalog data...</Text>
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
            <Text color="#718096">Failed to load catalog data</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!catalogData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="3xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No catalog data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: products, statistics, categoryStats } = catalogData;

  // Apply search filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              Catalog Management
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Manage product catalog, inventory, and pricing
            </Text>
          </Box>
          <Flex gap="2">
            <Button 
              variant="ghost" 
              size="sm" 
              style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
              onClick={handleImportProducts}
            >
              <FiUpload size={14} style={{ marginRight: '0.375rem' }} />
              Import
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600' }}
              onClick={handleAddProduct}
            >
              <FiPlus style={{ marginRight: '0.5rem' }} />
              Add Product
            </Button>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Products"
              value={statistics.totalProducts.toString()}
              icon={FiPackage}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Active Products"
              value={statistics.activeProducts.toString()}
              icon={FiTrendingUp}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Out of Stock"
              value={statistics.outOfStockProducts.toString()}
              icon={FiPackage}
              color="#ef4444"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Inventory Value"
              value={`$${statistics.totalValue.toLocaleString()}`}
              icon={FiDollarSign}
              color="#f59e0b"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Category Overview */}
        <Flex gap="lg" wrap justify="center">
          {categoryStats.map((cat, index) => (
            <Box key={index} style={{ flex: '0 0 auto', width: 'calc(20% - 16px)' }}>
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
                      {cat.category}
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
                      {cat.sales} sales
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
                      {cat.count} products
                    </Text>
                  </Box>
                  
                  <Box
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: `${cat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color,
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}
                  >
                    <FiPackage size={20} />
                  </Box>
                </Flex>
              </Card>
            </Box>
          ))}
        </Flex>

        {/* Filters */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Grid columns={3} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Products
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search by name, ID, or category..."
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
                <option value="Pain Relief">Pain Relief</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Digestive">Digestive</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </Box>
          </Grid>
        </Card>

        {/* Products Table */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
              Product Catalog ({filteredProducts.length})
            </Heading>
            <Flex gap="3">
              <Button variant="ghost" size="sm" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                <FiDownload size={14} style={{ marginRight: '0.375rem' }} />
                Export
              </Button>
              <Button variant="ghost" size="sm" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                <FiFilter size={14} style={{ marginRight: '0.375rem' }} />
                Advanced Filter
              </Button>
            </Flex>
          </Flex>

          <Box style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Product ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Name</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Price</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Stock</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Sales</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Trend</th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Last Updated</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f7fafc' }}>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {product.id}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {product.name}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant="info" size="sm" style={{ fontSize: '0.7rem' }}>
                        {product.category}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        ${product.price.toFixed(2)}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Text margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {product.stock}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Badge variant={getStatusColor(product.status)} size="sm" style={{ fontSize: '0.7rem' }}>
                        {product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Text margin="0" style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {product.sales}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {getTrendIcon(product.trend)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Text size="sm" margin="0" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                        {product.lastUpdated}
                      </Text>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Flex gap="2" justify="center">
                        <Button variant="ghost" size="sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
                          <FiEye size={12} />
                        </Button>
                        <Button variant="ghost" size="sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
                          <FiEdit size={12} />
                        </Button>
                        <Button variant="ghost" size="sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
                          <FiTrash2 size={12} />
                        </Button>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {filteredProducts.length === 0 && (
            <Box style={{ textAlign: 'center', padding: '3rem' }}>
              <Text color="#64748b" style={{ fontSize: '0.875rem' }}>No products found matching your criteria.</Text>
            </Box>
          )}
        </Card>
      </Flex>
    </Container>
  );
};

export default CatalogManagement;