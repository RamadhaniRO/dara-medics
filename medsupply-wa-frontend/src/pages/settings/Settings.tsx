import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiShield, 
  FiBell,
  FiCreditCard,
  FiGlobe,
  FiSave,
  FiEdit,
  FiCamera
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

interface SettingsData {
  profile: {
    pharmacyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    logoUrl?: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
  };
  notifications: {
    orderUpdates: boolean;
    paymentAlerts: boolean;
    inventoryAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
  billing: {
    billingAddress: string;
    taxId: string;
    paymentMethods: Array<{
      id: string;
      last4: string;
      expiryMonth: number;
      expiryYear: number;
      isPrimary: boolean;
    }>;
  };
  integrations: {
    whatsappBusiness: { connected: boolean; status: string };
    quickbooks: { connected: boolean; status: string };
    googleAnalytics: { connected: boolean; status: string };
    mailchimp: { connected: boolean; status: string };
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getSettings('default-user-id');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setSettingsData(response.data);
          setFormData(response.data);
        } else {
          throw new Error('No settings data received');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (settingsType: string) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.updateSettings('default-user-id', settingsType, formData[settingsType]);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Show success message (could add a toast notification here)
      console.log('Settings updated successfully');
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Additional button handlers
  const handleUploadLogo = () => {
    console.log('Upload Logo clicked');
    // TODO: Implement file upload functionality
    alert('Upload Logo functionality will be implemented');
  };

  const handleAddPaymentMethod = () => {
    console.log('Add Payment Method clicked');
    // TODO: Implement add payment method functionality
    alert('Add Payment Method functionality will be implemented');
  };

  const handleConnectIntegration = (integrationName: string) => {
    console.log('Connect Integration clicked:', integrationName);
    // TODO: Implement integration connection functionality
    alert(`Connect ${integrationName} functionality will be implemented`);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'billing', label: 'Billing', icon: FiCreditCard },
    { id: 'integrations', label: 'Integrations', icon: FiGlobe }
  ];

  const renderProfileTab = () => {
    if (loading) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#718096">Loading profile settings...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#ef4444" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
          <Text color="#718096" style={{ fontSize: '0.875rem' }}>Failed to load profile settings</Text>
        </Box>
      );
    }

    return (
      <Flex direction="column" gap="2xl">
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
            Profile Information
          </Heading>
          <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Update your personal information and pharmacy details
          </Text>

          <Grid columns={2} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Pharmacy Name
              </Text>
              <Input
                placeholder="Enter pharmacy name"
                value={formData.profile?.pharmacyName || ''}
                onChange={(e) => handleInputChange('profile', 'pharmacyName', e.target.value)}
              />
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Contact Person
              </Text>
              <Input
                placeholder="Enter contact person name"
                value={formData.profile?.contactPerson || ''}
                onChange={(e) => handleInputChange('profile', 'contactPerson', e.target.value)}
              />
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Email Address
              </Text>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.profile?.email || ''}
                onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
              />
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Phone Number
              </Text>
              <Input
                placeholder="Enter phone number"
                value={formData.profile?.phone || ''}
                onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              />
            </Box>

            <Box style={{ gridColumn: '1 / -1' }}>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Address
              </Text>
              <textarea
                placeholder="Enter pharmacy address"
                value={formData.profile?.address || ''}
                onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </Box>
          </Grid>

          <Flex justify="end" style={{ marginTop: '2rem' }}>
            <Button 
              variant="primary" 
              loading={isLoading} 
              onClick={() => handleSave('profile')}
              style={{ 
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <FiSave size={16} style={{ marginRight: '0.5rem' }} />
              Save Changes
            </Button>
          </Flex>
        </Card>

        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
            Pharmacy Logo
          </Heading>
          <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Upload your pharmacy logo for branding
          </Text>

          <Flex align="center" gap="4">
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #d1d5db',
                backgroundImage: formData.profile?.logoUrl ? `url(${formData.profile.logoUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!formData.profile?.logoUrl && <FiCamera size={24} color="#9ca3af" />}
            </Box>
            <Box>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUploadLogo}
              >
                <FiEdit />
                Upload Logo
              </Button>
              <Text size="sm" color="#718096" style={{ marginTop: '0.5rem' }}>
                PNG, JPG up to 2MB
              </Text>
            </Box>
          </Flex>
        </Card>
      </Flex>
    );
  };

  const renderSecurityTab = () => (
    <Flex direction="column" gap="2xl">
      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
          Password & Security
        </Heading>
        <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Manage your account security settings
        </Text>

        <Flex direction="column" gap="4">
          <Box>
            <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
              Current Password
            </Text>
            <Input
              type="password"
              placeholder="Enter current password"
            />
          </Box>

          <Box>
            <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
              New Password
            </Text>
            <Input
              type="password"
              placeholder="Enter new password"
            />
          </Box>

          <Box>
            <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
              Confirm New Password
            </Text>
            <Input
              type="password"
              placeholder="Confirm new password"
            />
          </Box>
        </Flex>

        <Flex justify="end" style={{ marginTop: '2rem' }}>
          <Button variant="primary" loading={isLoading} style={{ 
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <FiSave size={16} style={{ marginRight: '0.5rem' }} />
            Update Password
          </Button>
        </Flex>
      </Card>

      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
          Two-Factor Authentication
        </Heading>
        <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Add an extra layer of security to your account
        </Text>

        <Flex justify="space-between" align="center">
          <Box>
            <Text weight="medium" margin="0">
              Enable 2FA
            </Text>
            <Text size="sm" color="#718096" margin="0">
              Use an authenticator app for additional security
            </Text>
          </Box>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontSize: '0.875rem' }}>Enable</span>
          </label>
        </Flex>
      </Card>
    </Flex>
  );

  const renderNotificationsTab = () => {
    if (loading) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#718096">Loading notification settings...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#ef4444" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
          <Text color="#718096" style={{ fontSize: '0.875rem' }}>Failed to load notification settings</Text>
        </Box>
      );
    }

    return (
      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
          Notification Preferences
        </Heading>
        <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Choose how you want to be notified about important updates
        </Text>

        <Flex direction="column" gap="4">
          {[
            { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified when orders are processed or shipped' },
            { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Receive notifications about payment status changes' },
            { key: 'inventoryAlerts', label: 'Inventory Alerts', description: 'Get notified when stock levels are low' },
            { key: 'systemUpdates', label: 'System Updates', description: 'Receive notifications about system maintenance' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional offers and updates' }
          ].map((item, index) => (
            <Flex key={index} justify="space-between" align="center">
              <Box>
                <Text weight="medium" margin="0">
                  {item.label}
                </Text>
                <Text size="sm" color="#718096" margin="0">
                  {item.description}
                </Text>
              </Box>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.notifications?.[item.key] || false}
                  onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Enable</span>
              </label>
            </Flex>
          ))}
        </Flex>

        <Flex justify="end" style={{ marginTop: '2rem' }}>
          <Button 
            variant="primary" 
            loading={isLoading} 
            onClick={() => handleSave('notifications')}
            style={{ 
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <FiSave size={16} style={{ marginRight: '0.5rem' }} />
            Save Preferences
          </Button>
        </Flex>
      </Card>
    );
  };

  const renderBillingTab = () => {
    if (loading) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#718096">Loading billing settings...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#ef4444" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
          <Text color="#718096" style={{ fontSize: '0.875rem' }}>Failed to load billing settings</Text>
        </Box>
      );
    }

    return (
      <Flex direction="column" gap="2xl">
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
            Billing Information
          </Heading>
          <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Manage your billing and payment information
          </Text>

          <Grid columns={2} gap="6">
            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Billing Address
              </Text>
              <Input
                placeholder="Enter billing address"
                value={formData.billing?.billingAddress || ''}
                onChange={(e) => handleInputChange('billing', 'billingAddress', e.target.value)}
              />
            </Box>

            <Box>
              <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem' }}>
                Tax ID
              </Text>
              <Input
                placeholder="Enter tax identification number"
                value={formData.billing?.taxId || ''}
                onChange={(e) => handleInputChange('billing', 'taxId', e.target.value)}
              />
            </Box>
          </Grid>

          <Flex justify="end" style={{ marginTop: '2rem' }}>
            <Button 
              variant="primary" 
              loading={isLoading} 
              onClick={() => handleSave('billing')}
              style={{ 
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <FiSave size={16} style={{ marginRight: '0.5rem' }} />
              Update Billing
            </Button>
          </Flex>
        </Card>

        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
            Payment Methods
          </Heading>
          <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Manage your payment methods
          </Text>

          <Flex direction="column" gap="3">
            {formData.billing?.paymentMethods?.map((method: any, index: number) => (
              <Flex key={index} justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <Flex align="center" gap="3">
                  <FiCreditCard size={20} />
                  <Box>
                    <Text weight="medium" margin="0">
                      **** **** **** {method.last4}
                    </Text>
                    <Text size="sm" color="#718096" margin="0">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </Text>
                  </Box>
                </Flex>
                {method.isPrimary && (
                  <Badge variant="success" size="sm">
                    Primary
                  </Badge>
                )}
              </Flex>
            )) || (
              <Flex justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <Flex align="center" gap="3">
                  <FiCreditCard size={20} />
                  <Box>
                    <Text weight="medium" margin="0">
                      **** **** **** 1234
                    </Text>
                    <Text size="sm" color="#718096" margin="0">
                      Expires 12/25
                    </Text>
                  </Box>
                </Flex>
                <Badge variant="success" size="sm">
                  Primary
                </Badge>
              </Flex>
            )}
          </Flex>

          <Button 
            variant="outline" 
            size="sm" 
            style={{ marginTop: '1rem' }}
            onClick={handleAddPaymentMethod}
          >
            <FiCreditCard />
            Add Payment Method
          </Button>
        </Card>
      </Flex>
    );
  };

  const renderIntegrationsTab = () => {
    if (loading) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#718096">Loading integration settings...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <Text color="#ef4444" style={{ marginBottom: '0.5rem' }}>Error: {error}</Text>
          <Text color="#718096" style={{ fontSize: '0.875rem' }}>Failed to load integration settings</Text>
        </Box>
      );
    }

    return (
      <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
        <Heading as="h3" size="xl" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
          Third-Party Integrations
        </Heading>
        <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Connect with external services to enhance your workflow
        </Text>

        <Flex direction="column" gap="4">
          {[
            { key: 'whatsappBusiness', name: 'WhatsApp Business', description: 'Connect your WhatsApp Business account for customer communication' },
            { key: 'quickbooks', name: 'QuickBooks', description: 'Sync your financial data with QuickBooks' },
            { key: 'googleAnalytics', name: 'Google Analytics', description: 'Track website and app analytics' },
            { key: 'mailchimp', name: 'Mailchimp', description: 'Manage email marketing campaigns' }
          ].map((integration, index) => (
            <Flex key={index} justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
              <Box>
                <Text weight="medium" margin="0">
                  {integration.name}
                </Text>
                <Text size="sm" color="#718096" margin="0">
                  {integration.description}
                </Text>
              </Box>
              <Box>
                {formData.integrations?.[integration.key]?.connected ? (
                  <Badge variant="success" size="sm">
                    Connected
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConnectIntegration(integration.name)}
                  >
                    Connect
                  </Button>
                )}
              </Box>
            </Flex>
          ))}
        </Flex>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'billing':
        return renderBillingTab();
      case 'integrations':
        return renderIntegrationsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Box>
          <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
            Settings
          </Heading>
          <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
            Manage your account settings and preferences
          </Text>
        </Box>

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
                    fontSize: '0.875rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#3182ce' : '#6b7280',
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
        {renderTabContent()}
      </Flex>
    </Container>
  );
};

export default Settings;