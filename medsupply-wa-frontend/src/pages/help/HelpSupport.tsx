import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiHelpCircle, 
  FiBook, 
  FiMessageCircle, 
  FiMail,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiVideo,
  FiFileText,
  FiExternalLink,
  FiEye
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
  Divider,
  Link
} from '../../components';

// Import API client
import { apiClient } from '../../services/api';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: string;
}

interface HelpData {
  data: HelpArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalArticles: number;
    totalViews: number;
    totalHelpful: number;
    categories: string[];
  };
}

const HelpSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('articles');
  const [helpData, setHelpData] = useState<HelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
  const handleSearchHelp = () => {
    console.log('Search Help clicked');
    // TODO: Implement search functionality
    alert('Search Help functionality will be implemented');
  };

  const handleClearSearch = () => {
    console.log('Clear Search clicked');
    setSearchTerm('');
  };

  const handleSubmitTicket = () => {
    console.log('Submit Ticket clicked');
    // TODO: Implement submit ticket functionality
    alert('Submit Ticket functionality will be implemented');
  };

  const handleStartChat = () => {
    console.log('Start Chat clicked');
    // TODO: Implement chat functionality
    alert('Start Chat functionality will be implemented');
  };

  const handleCallNow = () => {
    console.log('Call Now clicked');
    // TODO: Implement call functionality
    alert('Call Now functionality will be implemented');
  };

  const handleSendEmail = () => {
    console.log('Send Email clicked');
    // TODO: Implement email functionality
    alert('Send Email functionality will be implemented');
  };

  const handleViewArticle = (articleId: string) => {
    console.log('View Article clicked:', articleId);
    // TODO: Implement view article functionality
    alert(`View Article ${articleId} functionality will be implemented`);
  };

  const handleExternalLink = (linkType: string) => {
    console.log('External Link clicked:', linkType);
    // TODO: Implement external link functionality
    alert(`${linkType} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getHelpArticles(1, 100, selectedCategory !== 'all' ? selectedCategory : undefined);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setHelpData(response.data);
        } else {
          throw new Error('No help data received');
        }
      } catch (err) {
        console.error('Failed to fetch help data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load help data');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const categories = ['all', 'Orders', 'Payments', 'Inventory', 'Support', 'Account', 'Technical'];
  const tabs = [
    { id: 'articles', label: 'Help Articles', icon: FiBook },
    { id: 'contact', label: 'Contact Support', icon: FiMessageCircle },
    { id: 'resources', label: 'Resources', icon: FiDownload }
  ];

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading help articles...</Text>
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
            <Text color="#718096">Failed to load help articles</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!helpData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No help articles data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { data: helpArticles } = helpData;

  // Apply search filter
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const renderArticlesTab = () => (
    <Flex direction="column" gap="2xl">
      {/* Search and Filters */}
      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Flex direction="column" gap="4">
          <Box>
            <Heading as="h2" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>
              Search Help Articles
            </Heading>
            <Text color="#64748b" size="sm" style={{ fontSize: '0.8rem' }}>Find answers to your questions quickly</Text>
          </Box>
          
          <Grid columns={2} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                Search Articles
              </Text>
              <Box style={{ position: 'relative' }}>
                <Input
                  placeholder="Search articles, topics, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    paddingLeft: '3rem',
                    fontSize: '0.8rem',
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
                Filter by Category
              </Text>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  backgroundColor: 'white'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </Box>
          </Grid>
        </Flex>
      </Card>

      {/* Articles Grid */}
      <Flex gap="3xl" wrap justify="center">
        {filteredArticles.map((article) => (
          <Box key={article.id} style={{ flex: '0 0 auto', width: 'calc(33.333% - 48px)' }}>
            <Card elevation="sm" padding="5" hover={true} style={{ 
              backgroundColor: 'white', 
              border: '1px solid #f1f5f9',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%'
            }}>
            <Flex direction="column" gap="3" style={{ height: '100%', justifyContent: 'space-between' }}>
              {/* Header Section */}
              <Box>
                <Flex justify="space-between" align="start" style={{ marginBottom: '0.75rem' }}>
                  <Badge variant="primary" size="sm" style={{ fontSize: '0.7rem', borderRadius: '4px' }}>
                    {article.category}
                  </Badge>
                  <Text size="xs" color="#718096" style={{ fontSize: '0.65rem' }}>
                    {article.lastUpdated}
                  </Text>
                </Flex>
                
                <Heading as="h3" size="lg" margin="0" style={{ 
                  color: '#0f172a', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem', 
                  lineHeight: '1.3', 
                  fontSize: '0.9rem' 
                }}>
                  {article.title}
                </Heading>
                
                <Text color="#64748b" style={{ 
                  marginBottom: '0.75rem', 
                  fontSize: '0.75rem', 
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.content.length > 100 ? article.content.substring(0, 100) + '...' : article.content}
                </Text>
              </Box>

              {/* Footer Section */}
              <Box>
                {/* Tags */}
                <Flex gap="2" wrap style={{ marginBottom: '0.75rem' }}>
                  {article.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" size="sm" style={{ fontSize: '0.65rem', borderRadius: '3px' }}>
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 2 && (
                    <Badge variant="secondary" size="sm" style={{ fontSize: '0.65rem', borderRadius: '3px' }}>
                      +{article.tags.length - 2}
                    </Badge>
                  )}
                </Flex>

                {/* Metrics and Actions */}
                <Flex justify="space-between" align="center">
                  <Flex gap="3">
                    <Flex align="center" gap="1">
                      <FiEye size={12} color="#718096" />
                      <Text size="sm" color="#718096" style={{ fontSize: '0.7rem' }}>{article.views}</Text>
                    </Flex>
                    <Flex align="center" gap="1">
                      <FiCheckCircle size={12} color="#38a169" />
                      <Text size="sm" color="#718096" style={{ fontSize: '0.7rem' }}>{article.helpful}</Text>
                    </Flex>
                  </Flex>
                  
                  <Flex gap="2">
                    <Button variant="primary" size="md" style={{ 
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      minWidth: '100px'
                    }}>
                      <FiEye size={14} style={{ marginRight: '0.375rem' }} />
                      Read Article
                    </Button>
                    <Button variant="ghost" size="sm" style={{ 
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem'
                    }}>
                      <FiExternalLink size={12} />
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
            </Card>
          </Box>
        ))}
      </Flex>

      {filteredArticles.length === 0 && (
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Box style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Box
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}
            >
              <FiHelpCircle size={24} color="#a0aec0" />
            </Box>
            <Heading as="h3" size="lg" margin="0" style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
              No articles found
            </Heading>
            <Text color="#64748b" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              No articles found matching your search criteria. Try adjusting your search terms or category filter.
            </Text>
            <Button variant="outline" onClick={handleClearSearch} style={{ borderRadius: '6px', fontSize: '0.8rem' }}>
              Clear Search
            </Button>
          </Box>
        </Card>
      )}
    </Flex>
  );

  const renderContactTab = () => (
    <Grid columns={2} gap="6" responsive>
      <Card elevation="sm" padding="6" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
        <Flex direction="column" gap="5">
          <Box>
            <Heading as="h2" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>
              Contact Support
            </Heading>
            <Text color="#64748b" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
              Get in touch with our support team for personalized assistance
            </Text>
          </Box>

          <Flex direction="column" gap="4">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Subject
              </Text>
              <Input 
                placeholder="What can we help you with?" 
                style={{ padding: '0.875rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              />
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Priority Level
              </Text>
              <select
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Need assistance</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Message
              </Text>
              <textarea
                placeholder="Please describe your issue in detail..."
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  minHeight: '140px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </Box>

            <Button 
              variant="primary" 
              fullWidth 
              style={{ 
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                minHeight: '44px'
              }}
              onClick={handleSubmitTicket}
            >
              <FiMail size={16} style={{ marginRight: '0.5rem' }} />
              Send Message
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Flex direction="column" gap="4">
          <Box>
            <Heading as="h2" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>
              Support Channels
            </Heading>
            <Text color="#64748b" size="sm" style={{ fontSize: '0.8rem' }}>
              Choose your preferred way to get help
            </Text>
          </Box>

          <Flex direction="column" gap="3">
            <Flex align="center" gap="3" style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <Box
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#3182ce15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3182ce'
                }}
              >
                <FiMessageCircle size={18} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text weight="medium" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>Live Chat</Text>
                <Text size="sm" color="#718096" margin="0" style={{ fontSize: '0.7rem' }}>Available 24/7 • Average response: 2 minutes</Text>
              </Box>
              <Button 
                variant="primary" 
                size="md" 
                style={{ borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '0.8rem', fontWeight: '600', minWidth: '120px' }}
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            </Flex>

            <Flex align="center" gap="3" style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <Box
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#38a16915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38a169'
                }}
              >
                <FiPhone size={18} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text weight="medium" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>Phone Support</Text>
                <Text size="sm" color="#718096" margin="0" style={{ fontSize: '0.7rem' }}>+234 800 123 4567 • Mon-Fri 8AM-6PM</Text>
              </Box>
              <Button 
                variant="outline" 
                size="md" 
                style={{ borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '0.8rem', fontWeight: '600', minWidth: '120px' }}
                onClick={handleCallNow}
              >
                Call Now
              </Button>
            </Flex>

            <Flex align="center" gap="3" style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
              <Box
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#d69e2e15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d69e2e'
                }}
              >
                <FiMail size={18} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text weight="medium" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>Email Support</Text>
                <Text size="sm" color="#718096" margin="0" style={{ fontSize: '0.7rem' }}>support@medsupply-wa.com • Response within 24 hours</Text>
              </Box>
              <Button 
                variant="outline" 
                size="md" 
                style={{ borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '0.8rem', fontWeight: '600', minWidth: '120px' }}
                onClick={handleSendEmail}
              >
                Send Email
              </Button>
            </Flex>
          </Flex>

          <Divider style={{ margin: '1rem 0' }} />

          <Box>
            <Text weight="medium" color="#1a202c" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
              Support Hours
            </Text>
            <Flex direction="column" gap="2">
              <Flex justify="space-between" align="center">
                <Text size="sm" color="#718096" style={{ fontSize: '0.7rem' }}>Monday - Friday</Text>
                <Text size="sm" weight="medium" color="#0f172a" style={{ fontSize: '0.7rem' }}>8:00 AM - 6:00 PM</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text size="sm" color="#718096" style={{ fontSize: '0.7rem' }}>Saturday</Text>
                <Text size="sm" weight="medium" color="#0f172a" style={{ fontSize: '0.7rem' }}>9:00 AM - 4:00 PM</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text size="sm" color="#718096" style={{ fontSize: '0.7rem' }}>Sunday</Text>
                <Text size="sm" weight="medium" color="#ef4444" style={{ fontSize: '0.7rem' }}>Closed</Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </Grid>
  );

  const renderResourcesTab = () => (
    <Flex direction="column" gap="2xl">
      {/* Main Resources Grid */}
      <Flex gap="3xl" wrap justify="center">
        <Box style={{ flex: '0 0 auto', width: 'calc(33.333% - 48px)' }}>
          <Card elevation="sm" padding="5" hover={true} style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '8px', transition: 'all 0.2s ease', cursor: 'pointer', height: '100%' }}>
          <Flex direction="column" gap="3" align="center" style={{ textAlign: 'center', height: '100%', justifyContent: 'space-between' }}>
            {/* Icon and Title */}
            <Box>
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#3182ce15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3182ce',
                  margin: '0 auto 0.75rem auto'
                }}
              >
                <FiDownload size={20} />
              </Box>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                User Manual
              </Heading>
              <Text color="#64748b" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                Complete guide to using MedSupply-WA with step-by-step instructions
              </Text>
            </Box>
            
            {/* Action Button */}
            <Button variant="primary" fullWidth style={{ 
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              minHeight: '44px'
            }}>
              <FiDownload size={16} style={{ marginRight: '0.5rem' }} />
              Download PDF
            </Button>
          </Flex>
          </Card>
        </Box>

        <Box style={{ flex: '0 0 auto', width: 'calc(33.333% - 48px)' }}>
          <Card elevation="sm" padding="5" hover={true} style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '8px', transition: 'all 0.2s ease', cursor: 'pointer', height: '100%' }}>
          <Flex direction="column" gap="3" align="center" style={{ textAlign: 'center', height: '100%', justifyContent: 'space-between' }}>
            {/* Icon and Title */}
            <Box>
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#38a16915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38a169',
                  margin: '0 auto 0.75rem auto'
                }}
              >
                <FiVideo size={20} />
              </Box>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Video Tutorials
              </Heading>
              <Text color="#64748b" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                Step-by-step video guides covering all major features
              </Text>
            </Box>
            
            {/* Action Button */}
            <Button variant="primary" fullWidth style={{ 
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              minHeight: '44px'
            }}>
              <FiVideo size={16} style={{ marginRight: '0.5rem' }} />
              Watch Videos
            </Button>
          </Flex>
          </Card>
        </Box>

        <Box style={{ flex: '0 0 auto', width: 'calc(33.333% - 48px)' }}>
          <Card elevation="sm" padding="5" hover={true} style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '8px', transition: 'all 0.2s ease', cursor: 'pointer', height: '100%' }}>
          <Flex direction="column" gap="3" align="center" style={{ textAlign: 'center', height: '100%', justifyContent: 'space-between' }}>
            {/* Icon and Title */}
            <Box>
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#d69e2e15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d69e2e',
                  margin: '0 auto 0.75rem auto'
                }}
              >
                <FiFileText size={20} />
              </Box>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                API Documentation
              </Heading>
              <Text color="#64748b" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                Technical documentation for developers and integrations
              </Text>
            </Box>
            
            {/* Action Button */}
            <Button variant="primary" fullWidth style={{ 
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              minHeight: '44px'
            }}>
              <FiFileText size={16} style={{ marginRight: '0.5rem' }} />
              View Docs
            </Button>
          </Flex>
          </Card>
        </Box>
      </Flex>

      {/* Quick Links Section */}
      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Flex direction="column" gap="4">
          <Box>
            <Heading as="h2" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>
              Quick Links
            </Heading>
            <Text color="#64748b" size="sm" style={{ fontSize: '0.8rem' }}>
              Frequently accessed resources and tools
            </Text>
          </Box>

          <Flex gap="2xl" wrap justify="center">
            {[
              { title: 'System Status', description: 'Check current system status and uptime', icon: FiCheckCircle, color: '#38a169' },
              { title: 'Feature Requests', description: 'Submit new feature ideas and suggestions', icon: FiAlertCircle, color: '#3182ce' },
              { title: 'Bug Reports', description: 'Report technical issues and bugs', icon: FiXCircle, color: '#ef4444' },
              { title: 'Training Schedule', description: 'Upcoming training sessions and workshops', icon: FiClock, color: '#d69e2e' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Box key={index} style={{ flex: '0 0 auto', width: 'calc(50% - 24px)' }}>
                  <Flex align="center" gap="3" style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    height: '100%'
                  }}>
                    <Box
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: `${item.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                      }}
                    >
                      <Icon size={16} />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text weight="medium" margin="0" style={{ fontSize: '0.8rem', color: '#0f172a' }}>{item.title}</Text>
                      <Text size="sm" color="#718096" margin="0" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>{item.description}</Text>
                    </Box>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      style={{ borderRadius: '6px', padding: '0.25rem' }}
                      onClick={() => handleExternalLink(item.title)}
                    >
                      <FiExternalLink size={14} color="#a0aec0" />
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'articles':
        return renderArticlesTab();
      case 'contact':
        return renderContactTab();
      case 'resources':
        return renderResourcesTab();
      default:
        return renderArticlesTab();
    }
  };

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header Section */}
        <Box style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <Box
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#3182ce15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3182ce',
              margin: '0 auto 1rem auto'
            }}
          >
            <FiHelpCircle size={24} />
          </Box>
          <Heading as="h1" size="2xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>
            Help & Support Center
          </Heading>
          <Text color="#64748b" size="md" style={{ fontWeight: '500', maxWidth: '500px', margin: '0 auto' }}>
            Find answers, get help, and access resources to make the most of MedSupply-WA
          </Text>
        </Box>

        {/* Quick Stats */}
        <Flex gap="3xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <Card elevation="sm" padding="4" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', textAlign: 'center', minHeight: '100px' }}>
              <Text size="xl" weight="bold" color="#3182ce" margin="0" style={{ fontSize: '1.5rem' }}>
                {helpData?.statistics.totalArticles || 0}
              </Text>
              <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.8rem' }}>Help Articles</Text>
            </Card>
          </Box>
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <Card elevation="sm" padding="4" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', textAlign: 'center', minHeight: '100px' }}>
              <Text size="xl" weight="bold" color="#38a169" margin="0" style={{ fontSize: '1.5rem' }}>
                {helpData?.statistics.totalViews || 0}
              </Text>
              <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.8rem' }}>Total Views</Text>
            </Card>
          </Box>
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <Card elevation="sm" padding="4" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', textAlign: 'center', minHeight: '100px' }}>
              <Text size="xl" weight="bold" color="#d69e2e" margin="0" style={{ fontSize: '1.5rem' }}>
                {helpData?.statistics.totalHelpful || 0}
              </Text>
              <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.8rem' }}>Helpful Votes</Text>
            </Card>
          </Box>
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <Card elevation="sm" padding="4" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', textAlign: 'center', minHeight: '100px' }}>
              <Text size="xl" weight="bold" color="#805ad5" margin="0" style={{ fontSize: '1.5rem' }}>
                {helpData?.statistics.categories.length || 0}
              </Text>
              <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.8rem' }}>Categories</Text>
            </Card>
          </Box>
        </Flex>

        {/* Tabs */}
        <Card elevation="sm" padding="0" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Flex>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#f8fafc' : 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #3182ce' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#3182ce' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </Flex>
        </Card>

        {/* Tab Content */}
        <Box style={{ marginTop: '1rem' }}>
          {renderTabContent()}
        </Box>
      </Flex>
    </Container>
  );
};

export default HelpSupport;