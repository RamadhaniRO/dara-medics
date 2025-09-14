import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, Shield, FileText, ArrowLeft, HelpCircle } from 'lucide-react';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { PasswordField } from '../../components/molecules/PasswordField';
import { Alert } from '../../components/atoms/Alert';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Flex } from '../../components/atoms/Flex';
import { Box } from '../../components/atoms/Box';
import { Link } from '../../components/atoms/Link';
// import { useAuth } from '../../hooks/useAuth';

interface SetNewPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const SetNewPassword: React.FC = () => {
  const navigate = useNavigate();
  // const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetNewPasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: SetNewPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // await resetPassword(data.newPassword);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Password set successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleContactSupport = () => {
    navigate('/help');
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Set Your New Password',
        subtitle: 'Create a strong, unique password',
        description: 'Create a strong, unique password to protect your MedSupply-WA account. A secure password helps safeguard your pharmacy\'s sensitive information and transaction data.',
        securityIcons: [
          { icon: <Lock size={24} />, label: 'Secure' },
          { icon: <Shield size={24} />, label: 'Protected' },
          { icon: <FileText size={24} />, label: 'Verified' }
        ],
        securityMessage: 'Secure access to your wholesale pharmacy management system',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
      }}
      rightPanel={{
        title: 'Create New Password',
        subtitle: 'Please set a new password for your MedSupply-WA account',
        children: (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Expiration Alert */}
            <Box marginBottom="lg">
              <Alert
                type="warning"
                title="This password reset link will expire in 29:55 minutes"
                message="Please complete the password reset process before the link expires."
                show={true}
                icon={true}
              />
            </Box>

            <Box marginBottom="lg">
              <PasswordField
                label="New Password"
                placeholder="Enter your new password"
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
                showStrength={true}
                showRequirements={true}
                required
                fullWidth
                inputSize="md"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                })}
              />
            </Box>

            {/* Password Requirements */}
            <Box marginBottom="lg" padding="md" backgroundColor="gray.50" borderRadius="md">
              <Text size="md" color="gray.700" weight="medium" marginBottom="sm">
                Password Requirements
              </Text>
              <Box as="ul" style={{ paddingLeft: '1.5rem' }}>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ At least 8 characters
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ At least one uppercase letter
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ At least one lowercase letter
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ At least one number
                </Text>
                <Text as="li" color="gray.400" size="sm" marginBottom="xs">
                  ○ At least one special character (!@#$%^&*)
                </Text>
              </Box>
            </Box>

            <Box marginBottom="lg">
              <PasswordField
                label="Confirm New Password"
                placeholder="Confirm your new password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                fullWidth
                inputSize="md"
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match'
                })}
              />
            </Box>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              marginBottom="lg"
            >
              Set New Password
            </Button>

            <Flex justify="space-between" align="center" marginBottom="lg">
              <Link onClick={handleBackToLogin}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
                Back to Login
              </Link>
              <Link onClick={handleContactSupport}>
                <HelpCircle size={16} style={{ marginRight: '0.5rem' }} />
                Need help?
              </Link>
            </Flex>

            <Flex justify="center" align="center">
              <Text color="gray.500" size="sm">
                <Link as={RouterLink} to="/terms-of-service">Terms of Service</Link>
                {' | '}
                <Link as={RouterLink} to="/privacy-policy">Privacy Policy</Link>
                {' | '}
                <Link as={RouterLink} to="/help">Contact Support</Link>
              </Text>
            </Flex>
          </form>
        )
      }}
    />
  );
};

export default SetNewPassword;