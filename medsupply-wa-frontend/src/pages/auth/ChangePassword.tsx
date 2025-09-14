import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lock, HelpCircle } from 'lucide-react';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { PasswordField } from '../../components/molecules/PasswordField';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Flex } from '../../components/atoms/Flex';
import { Box } from '../../components/atoms/Box';
import { Link } from '../../components/atoms/Link';
import { useAuth } from '../../hooks/useAuth';

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    navigate('/help');
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Update Your Password',
        subtitle: 'Keep your account secure',
        description: 'Regularly updating your password helps protect sensitive information and ensures the security of your pharmacy wholesale operations.',
        features: [
          'Use a unique password for your MedSupply-WA account',
          'Include a mix of letters, numbers, and special characters',
          'Avoid using easily guessable information',
          'Change your password every 90 days'
        ],
        icons: [
          <div key="logo">💊</div>,
          <Lock key="lock" size={24} />
        ],
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
      }}
      rightPanel={{
        title: 'Change Password',
        subtitle: 'Please enter your current password and create a new secure password',
        children: (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box marginBottom="lg">
              <PasswordField
                label="Current Password"
                placeholder="Enter your current password"
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                required
                fullWidth
                inputSize="md"
                {...register('currentPassword', {
                  required: 'Current password is required'
                })}
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
                  ✓ At least 8 characters long
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ Contains uppercase letters
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ Contains lowercase letters
                </Text>
                <Text as="li" color="success.500" size="sm" marginBottom="xs">
                  ✓ Contains at least one number
                </Text>
                <Text as="li" color="gray.400" size="sm" marginBottom="xs">
                  ○ Contains at least one special character
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
              Update Password
            </Button>

            <Flex justify="space-between" align="center" marginBottom="lg">
              <Link onClick={handleCancel}>
                Cancel
              </Link>
              <Link onClick={handleContactSupport}>
                <HelpCircle size={16} style={{ marginRight: '0.5rem' }} />
                Need help?
              </Link>
            </Flex>

            <Box marginBottom="lg">
              <Text color="gray.500" size="sm">
                Last password change: May 15, 2023
              </Text>
            </Box>

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

export default ChangePassword;