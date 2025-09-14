import React, { useState, useEffect } from 'react';
import { 
  FiMessageCircle, 
  FiSend, 
  FiPaperclip, 
  FiSmile, 
  FiMoreVertical,
  FiCheck,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiSearch,
  FiFilter
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
  Box
} from '../../components';

// Import API client
import { apiClient } from '../../services/api';

interface Conversation {
  id: string;
  pharmacy_id: string;
  whatsapp_number: string;
  customer_name?: string;
  status: string;
  last_message_at: string;
  agent_id?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  pharmacies?: {
    name: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
  };
  users?: {
    name: string;
    email: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  whatsapp_message_id?: string;
  direction: string;
  message_type: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  status: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

interface FormattedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'away';
  unreadCount: number;
}

interface FormattedMessage {
  id: string;
  sender: 'customer' | 'agent';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document' | 'order';
  orderId?: string;
}

const WhatsAppPreview: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Button handlers
  const handleFilter = () => {
    console.log('Filter clicked');
    // TODO: Implement filter modal
    alert('Filter functionality will be implemented');
  };

  const handleNewConversation = () => {
    console.log('New Conversation clicked');
    // TODO: Implement new conversation modal
    alert('New Conversation functionality will be implemented');
  };

  const handleCallCustomer = (customerId: string) => {
    console.log('Call Customer clicked:', customerId);
    // TODO: Implement call functionality
    alert(`Call Customer ${customerId} functionality will be implemented`);
  };

  const handleMoreOptions = (customerId: string) => {
    console.log('More Options clicked:', customerId);
    // TODO: Implement more options menu
    alert(`More Options for Customer ${customerId} functionality will be implemented`);
  };

  const handleAttachFile = () => {
    console.log('Attach File clicked');
    // TODO: Implement file attachment functionality
    alert('Attach File functionality will be implemented');
  };

  const handleAddEmoji = () => {
    console.log('Add Emoji clicked');
    // TODO: Implement emoji picker
    alert('Add Emoji functionality will be implemented');
  };

  const handleViewOrders = (customerId: string) => {
    console.log('View Orders clicked:', customerId);
    // TODO: Implement view orders functionality
    alert(`View Orders for Customer ${customerId} functionality will be implemented`);
  };

  const handlePaymentHistory = (customerId: string) => {
    console.log('Payment History clicked:', customerId);
    // TODO: Implement payment history functionality
    alert(`Payment History for Customer ${customerId} functionality will be implemented`);
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getWhatsAppConversations(1, 100);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data?.data) {
          setConversations(response.data.data);
          // Set first conversation as selected if available
          if (response.data.data.length > 0 && !selectedCustomer) {
            setSelectedCustomer(response.data.data[0].id);
          }
        } else {
          throw new Error('No conversations data received');
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      const fetchMessages = async () => {
        try {
          setMessagesLoading(true);
          
          const response = await apiClient.getWhatsAppMessages(selectedCustomer, 1, 100);
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          if (response.data?.data) {
            setMessages(response.data.data);
          } else {
            setMessages([]);
          }
        } catch (err) {
          console.error('Failed to fetch messages:', err);
          setMessages([]);
        } finally {
          setMessagesLoading(false);
        }
      };

      fetchMessages();
    }
  }, [selectedCustomer]);

  // Format conversations as customers for display
  const formatCustomers = (conversations: Conversation[]): FormattedCustomer[] => {
    return conversations.map(conversation => {
      // Format date for last seen
      const formatLastSeen = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
      };
      
      // Determine status based on last message time
      const getStatus = (lastMessageAt: string): 'online' | 'offline' | 'away' => {
        const date = new Date(lastMessageAt);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 5) return 'online';
        if (diffInMinutes < 60) return 'away';
        return 'offline';
      };
      
      // Mock unread count (would come from unread messages count)
      const unreadCount = Math.floor(Math.random() * 5);
      
      return {
        id: conversation.id,
        name: conversation.customer_name || conversation.pharmacies?.name || 'Unknown Customer',
        phone: conversation.whatsapp_number,
        email: conversation.pharmacies?.email || 'No email',
        location: conversation.pharmacies?.city && conversation.pharmacies?.state 
          ? `${conversation.pharmacies.city}, ${conversation.pharmacies.state}`
          : 'Unknown Location',
        lastSeen: formatLastSeen(conversation.last_message_at),
        status: getStatus(conversation.last_message_at),
        unreadCount
      };
    });
  };

  // Format messages for display
  const formatMessages = (messages: Message[]): FormattedMessage[] => {
    return messages.map(message => {
      // Format timestamp
      const formatTimestamp = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };
      
      // Map direction to sender
      const getSender = (direction: string): 'customer' | 'agent' => {
        return direction === 'inbound' ? 'customer' : 'agent';
      };
      
      // Map message type
      const getMessageType = (type: string): 'text' | 'image' | 'document' | 'order' => {
        switch (type.toLowerCase()) {
          case 'image':
            return 'image';
          case 'document':
            return 'document';
          case 'order':
            return 'order';
          default:
            return 'text';
        }
      };
      
      // Map status
      const getStatus = (status: string, readAt?: string): 'sent' | 'delivered' | 'read' => {
        if (readAt) return 'read';
        if (status === 'delivered') return 'delivered';
        return 'sent';
      };
      
      return {
        id: message.id,
        sender: getSender(message.direction),
        content: message.content || 'Media message',
        timestamp: formatTimestamp(message.created_at),
        status: getStatus(message.status, message.read_at),
        type: getMessageType(message.message_type),
        orderId: message.message_type === 'order' ? 'ORD-123' : undefined
      };
    });
  };

  const formattedCustomers = formatCustomers(conversations);
  const formattedMessages = formatMessages(messages);

  const filteredCustomers = formattedCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const currentCustomer = formattedCustomers.find(c => c.id === selectedCustomer);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'away': return 'warning';
      case 'offline': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <FiCheck size={12} color="#a0aec0" />;
      case 'delivered':
        return <FiCheck size={12} color="#a0aec0" />;
      case 'read':
        return <FiCheck size={12} color="#3182ce" />;
      default:
        return null;
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Simulate sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" color="#1a202c" margin="0">
              WhatsApp Business Integration
            </Heading>
            <Text color="#718096" size="md" style={{ marginTop: '0.25rem' }}>
              Manage customer conversations and orders through WhatsApp
            </Text>
          </Box>
          <Flex gap="2">
            <Button 
              variant="outline" 
              size="md"
              onClick={handleFilter}
            >
              <FiFilter />
              Filter
            </Button>
            <Button 
              variant="primary" 
              size="md"
              onClick={handleNewConversation}
            >
              <FiMessageCircle />
              New Conversation
            </Button>
          </Flex>
        </Flex>

        <Grid columns={4} gap="6" responsive>
          {/* Customer List */}
          <Box style={{ gridColumn: '1' }}>
            <Card elevation="md" padding="0" style={{ height: '600px' }}>
              <Box padding="4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <Text weight="medium" color="#1a202c" margin="0 0 3 0">
                  Conversations
                </Text>
                <Box style={{ position: 'relative' }}>
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <FiSearch
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a0aec0',
                    }}
                  />
                </Box>
              </Box>

              <Box style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                {loading ? (
                  <Box style={{ padding: '2rem', textAlign: 'center' }}>
                    <Text color="#718096">Loading conversations...</Text>
                  </Box>
                ) : error ? (
                  <Box style={{ padding: '2rem', textAlign: 'center' }}>
                    <Text color="#ef4444" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
                    <Text color="#718096" style={{ fontSize: '0.875rem' }}>Failed to load conversations</Text>
                  </Box>
                ) : filteredCustomers.length === 0 ? (
                  <Box style={{ padding: '2rem', textAlign: 'center' }}>
                    <Text color="#718096">No conversations found</Text>
                  </Box>
                ) : (
                  filteredCustomers.map((customer) => (
                    <Box
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer.id)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        backgroundColor: selectedCustomer === customer.id ? '#f0f9ff' : 'transparent',
                        borderLeft: selectedCustomer === customer.id ? '3px solid #3182ce' : '3px solid transparent'
                      }}
                    >
                      <Flex justify="space-between" align="start">
                        <Flex align="center" gap="3">
                          <Box
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#4a5568'
                            }}
                          >
                            <FiUser size={20} />
                          </Box>
                          <Box>
                            <Text weight="medium" margin="0">
                              {customer.name}
                            </Text>
                            <Text size="sm" color="#718096" margin="0">
                              {customer.phone}
                            </Text>
                            <Flex align="center" gap="2" style={{ marginTop: '0.25rem' }}>
                              <Badge variant={getStatusColor(customer.status)} size="sm">
                                {customer.status}
                              </Badge>
                              <Text size="xs" color="#718096">
                                {customer.lastSeen}
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                        {customer.unreadCount > 0 && (
                          <Badge variant="error" size="sm">
                            {customer.unreadCount}
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          </Box>

          {/* Chat Interface */}
          <Box style={{ gridColumn: '2 / -1' }}>
            <Card elevation="md" padding="0" style={{ height: '600px' }}>
              {/* Chat Header */}
              <Box padding="4" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap="3">
                    <Box
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4a5568'
                      }}
                    >
                      <FiUser size={20} />
                    </Box>
                    <Box>
                      <Text weight="medium" margin="0">
                        {currentCustomer?.name}
                      </Text>
                      <Flex align="center" gap="2">
                        <Badge variant={getStatusColor(currentCustomer?.status || 'offline')} size="sm">
                          {currentCustomer?.status}
                        </Badge>
                        <Text size="sm" color="#718096">
                          {currentCustomer?.lastSeen}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex gap="2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCallCustomer(currentCustomer?.id || '')}
                    >
                      <FiPhone />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMoreOptions(currentCustomer?.id || '')}
                    >
                      <FiMoreVertical />
                    </Button>
                  </Flex>
                </Flex>
              </Box>

              {/* Messages */}
              <Box style={{ 
                height: 'calc(100% - 140px)', 
                overflowY: 'auto', 
                padding: '1rem',
                backgroundColor: '#f8fafc'
              }}>
                {messagesLoading ? (
                  <Box style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text color="#718096">Loading messages...</Text>
                  </Box>
                ) : formattedMessages.length === 0 ? (
                  <Box style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text color="#718096">No messages yet</Text>
                    <Text color="#718096" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Start a conversation with this customer
                    </Text>
                  </Box>
                ) : (
                  <Flex direction="column" gap="3">
                    {formattedMessages.map((message) => (
                      <Flex
                        key={message.id}
                        justify={message.sender === 'agent' ? 'end' : 'start'}
                      >
                        <Box
                          style={{
                            maxWidth: '70%',
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem',
                            backgroundColor: message.sender === 'agent' ? '#3182ce' : 'white',
                            color: message.sender === 'agent' ? 'white' : '#1a202c',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <Text margin="0" style={{ color: 'inherit' }}>
                            {message.content}
                          </Text>
                          {message.type === 'order' && message.orderId && (
                            <Box style={{ 
                              marginTop: '0.5rem', 
                              padding: '0.5rem', 
                              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                              borderRadius: '0.5rem' 
                            }}>
                              <Flex align="center" gap="2">
                                <FiPackage size={16} />
                                <Text size="sm" style={{ color: 'inherit' }}>
                                  Order #{message.orderId}
                                </Text>
                              </Flex>
                            </Box>
                          )}
                          <Flex justify="space-between" align="center" style={{ marginTop: '0.5rem' }}>
                            <Text size="xs" style={{ color: 'inherit', opacity: 0.7 }}>
                              {message.timestamp}
                            </Text>
                            {message.sender === 'agent' && (
                              <Box>
                                {getMessageStatusIcon(message.status)}
                              </Box>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Box>

              {/* Message Input */}
              <Box padding="4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <Flex align="center" gap="2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleAttachFile}
                  >
                    <FiPaperclip />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{ flex: 1 }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleAddEmoji}
                  >
                    <FiSmile />
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSendMessage}>
                    <FiSend />
                  </Button>
                </Flex>
              </Box>
            </Card>
          </Box>
        </Grid>

        {/* Customer Details */}
        {currentCustomer && (
          <Card elevation="md" padding="6">
            <Heading as="h3" size="lg" color="#1a202c" margin="0 0 4 0">
              Customer Information
            </Heading>
            <Grid columns={4} gap="6">
              <Box>
                <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                  Contact Information
                </Text>
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="2">
                    <FiPhone size={14} color="#718096" />
                    <Text size="sm">{currentCustomer.phone}</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <FiMail size={14} color="#718096" />
                    <Text size="sm">{currentCustomer.email}</Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <FiMapPin size={14} color="#718096" />
                    <Text size="sm">{currentCustomer.location}</Text>
                  </Flex>
                </Flex>
              </Box>

              <Box>
                <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                  Status
                </Text>
                <Flex direction="column" gap="2">
                  <Badge variant={getStatusColor(currentCustomer.status)} size="sm">
                    {currentCustomer.status}
                  </Badge>
                  <Text size="sm" color="#718096">
                    Last seen: {currentCustomer.lastSeen}
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                  Recent Activity
                </Text>
                <Flex direction="column" gap="2">
                  <Text size="sm" color="#718096">3 orders this month</Text>
                  <Text size="sm" color="#718096">Total spent: $2,450</Text>
                  <Text size="sm" color="#718096">Member since: Jan 2023</Text>
                </Flex>
              </Box>

              <Box>
                <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                  Quick Actions
                </Text>
                <Flex direction="column" gap="2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => handleViewOrders(selectedCustomer)}
                  >
                    <FiPackage />
                    View Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    onClick={() => handlePaymentHistory(selectedCustomer)}
                  >
                    <FiDollarSign />
                    Payment History
                  </Button>
                </Flex>
              </Box>
            </Grid>
          </Card>
        )}
      </Flex>
    </Container>
  );
};

export default WhatsAppPreview;