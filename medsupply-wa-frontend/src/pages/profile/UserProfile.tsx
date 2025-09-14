import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiShield, 
  FiBell,
  FiCreditCard,
  FiGlobe,
  FiSave,
  FiEdit,
  FiLogOut,
  FiSettings,
  FiCalendar,
  FiActivity
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

interface UserProfileData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pharmacy: string;
    role: string;
    location: string;
    joinDate: string;
    lastLogin: string;
    avatar?: string;
    status: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    memberSince: string;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsAlerts: boolean;
    darkMode: boolean;
  };
}

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getUserProfile('default-user-id');
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (response.data) {
          setProfileData(response.data);
          setFormData({
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            phone: response.data.user.phone,
            pharmacy: response.data.user.pharmacy,
            location: response.data.user.location,
            role: response.data.user.role
          });
        } else {
          throw new Error('No profile data received');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.updateUserProfile('default-user-id', formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update local state with new data
      if (profileData) {
        setProfileData({
          ...profileData,
          user: {
            ...profileData.user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            pharmacy: formData.pharmacy,
            location: formData.location,
            role: formData.role
          }
        });
      }
      
      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Additional button handlers
  const handleSettings = () => {
    console.log('Settings clicked');
    // TODO: Navigate to settings page
    alert('Settings functionality will be implemented');
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // TODO: Implement logout functionality
    if (window.confirm('Are you sure you want to logout?')) {
      alert('Logout functionality will be implemented');
    }
  };

  const handleChangePassword = () => {
    console.log('Change Password clicked');
    // TODO: Implement change password functionality
    alert('Change Password functionality will be implemented');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">Loading profile...</Text>
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
            <Text color="#718096">Failed to load profile data</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container maxWidth="1400px" center>
        <Flex direction="column" gap="2xl">
          <Box style={{ textAlign: 'center', padding: '4rem' }}>
            <Text color="#718096" size="lg">No profile data available</Text>
          </Box>
        </Flex>
      </Container>
    );
  }

  const { user, stats, preferences } = profileData;

  return (
    <Container maxWidth="1400px" center>
      <Flex direction="column" gap="2xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="2xl" margin="0" style={{ color: '#1f2937', fontWeight: '700' }}>
              User Profile
            </Heading>
            <Text color="#6b7280" size="md" style={{ marginTop: '0.25rem', fontWeight: '500' }}>
              Manage your personal information and account settings
            </Text>
          </Box>
          <Flex gap="5">
            <Button 
              variant="outline" 
              size="md" 
              style={{ 
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                color: '#374151',
                fontWeight: '500'
              }}
              onClick={handleSettings}
            >
              <FiSettings size={16} style={{ marginRight: '0.5rem' }} />
              Settings
            </Button>
            <Button 
              variant="danger" 
              size="md" 
              style={{ 
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                border: '1px solid #ef4444',
                color: 'white',
                fontWeight: '500'
              }}
              onClick={handleLogout}
            >
              <FiLogOut size={16} style={{ marginRight: '0.5rem' }} />
              Logout
            </Button>
          </Flex>
        </Flex>

        {/* Stats Cards */}
        <Flex gap="2xl" wrap justify="center">
          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Orders"
              value={stats.totalOrders.toString()}
              icon={FiActivity}
              color="#3182ce"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Total Spent"
              value={`$${stats.totalSpent.toLocaleString()}`}
              icon={FiCreditCard}
              color="#38a169"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Loyalty Points"
              value={stats.loyaltyPoints.toString()}
              icon={FiShield}
              color="#f59e0b"
              compact={true}
            />
          </Box>

          <Box style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
            <SimpleMetricCard
              title="Member Since"
              value={stats.memberSince}
              icon={FiCalendar}
              color="#805ad5"
              compact={true}
            />
          </Box>
        </Flex>

        {/* Main Content Grid */}
        <Flex gap="2xl" wrap justify="center">
          {/* Profile Card */}
          <Box style={{ flex: '0 0 auto', width: 'calc(66.67% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Flex justify="space-between" align="start" style={{ marginBottom: '2rem' }}>
                <Flex align="center" gap="4">
                  <Box
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4a5568',
                      fontSize: '2rem',
                      backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!user.avatar && <FiUser />}
                  </Box>
                  <Box>
                    <Heading as="h2" size="2xl" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
                      {user.firstName} {user.lastName}
                    </Heading>
                    <Text color="#64748b" style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      {user.role} at {user.pharmacy}
                    </Text>
                    <Badge variant="success" size="sm" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      {user.status === 'active' ? 'Active Member' : 'Inactive'}
                    </Badge>
                  </Box>
                </Flex>
                <Button
                  variant={isEditing ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ 
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  <FiEdit size={14} style={{ marginRight: '0.375rem' }} />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Flex>

              <Grid columns={2} gap="6">
                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    First Name
                  </Text>
                  <Input
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Last Name
                  </Text>
                  <Input
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Phone Number
                  </Text>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box style={{ gridColumn: '1 / -1' }}>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Pharmacy Name
                  </Text>
                  <Input
                    value={formData.pharmacy || ''}
                    onChange={(e) => handleInputChange('pharmacy', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Location
                  </Text>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>

                <Box>
                  <Text size="sm" weight="medium" color="#374151" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    Role
                  </Text>
                  <Input
                    value={formData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={!isEditing}
                    style={{ 
                      backgroundColor: isEditing ? 'white' : '#f9fafb',
                      fontSize: '0.875rem',
                      padding: '0.75rem'
                    }}
                  />
                </Box>
              </Grid>

              {isEditing && (
                <Flex justify="end" style={{ marginTop: '2rem' }}>
                  <Button variant="primary" loading={isLoading} onClick={handleSave} style={{ 
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    <FiSave size={16} style={{ marginRight: '0.5rem' }} />
                    Save Changes
                  </Button>
                </Flex>
              )}
            </Card>
          </Box>

          {/* Account Information Card */}
          <Box style={{ flex: '0 0 auto', width: 'calc(33.33% - 16px)' }}>
            <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
              <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
                Account Information
              </Heading>
              <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Important account details
              </Text>

              <Flex direction="column" gap="4">
                <Flex justify="space-between" align="center" style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <Text size="sm" color="#64748b" style={{ fontSize: '0.8rem' }}>Member ID</Text>
                  <Text weight="medium" style={{ fontSize: '0.875rem', color: '#0f172a' }}>PH-{user.firstName.toUpperCase()}-001</Text>
                </Flex>

                <Flex justify="space-between" align="center" style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <Text size="sm" color="#64748b" style={{ fontSize: '0.8rem' }}>Join Date</Text>
                  <Text weight="medium" style={{ fontSize: '0.875rem', color: '#0f172a' }}>{user.joinDate}</Text>
                </Flex>

                <Flex justify="space-between" align="center" style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <Text size="sm" color="#64748b" style={{ fontSize: '0.8rem' }}>Last Login</Text>
                  <Text weight="medium" style={{ fontSize: '0.875rem', color: '#0f172a' }}>{user.lastLogin}</Text>
                </Flex>

                <Flex justify="space-between" align="center" style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                  <Text size="sm" color="#64748b" style={{ fontSize: '0.8rem' }}>Account Status</Text>
                  <Badge variant="success" size="sm" style={{ fontSize: '0.75rem' }}>Verified</Badge>
                </Flex>
              </Flex>
            </Card>
          </Box>
        </Flex>

        {/* Notification Preferences */}
        <Card elevation="sm" padding="5" style={{ backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
          <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600', marginBottom: '1rem' }}>
            Notification Preferences
          </Heading>
          <Text color="#64748b" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Manage your notification settings
          </Text>

          <Flex direction="column" gap="4">
            <Flex justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', backgroundColor: '#fafafa' }}>
              <Box>
                <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>Email Notifications</Text>
                <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>Receive updates via email</Text>
              </Box>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={preferences.emailUpdates}
                  style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Enable</span>
              </label>
            </Flex>

            <Flex justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', backgroundColor: '#fafafa' }}>
              <Box>
                <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>SMS Alerts</Text>
                <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>Receive SMS notifications</Text>
              </Box>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={preferences.smsAlerts}
                  style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Enable</span>
              </label>
            </Flex>

            <Flex justify="space-between" align="center" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', backgroundColor: '#fafafa' }}>
              <Box>
                <Text weight="medium" margin="0" style={{ fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.25rem' }}>Push Notifications</Text>
                <Text size="sm" color="#64748b" margin="0" style={{ fontSize: '0.75rem' }}>Receive push notifications</Text>
              </Box>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={preferences.notifications}
                  style={{ marginRight: '0.5rem', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Enable</span>
              </label>
            </Flex>
          </Flex>

          <Button variant="outline" size="sm" style={{ 
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <FiBell size={16} style={{ marginRight: '0.5rem' }} />
            Manage All Notifications
          </Button>
        </Card>
      </Flex>
    </Container>
  );
};

export default UserProfile;