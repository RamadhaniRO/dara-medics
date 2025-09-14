import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Plus, HelpCircle, Lock, FileText, Shield } from 'lucide-react';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { FormField } from '../../components/molecules/FormField';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Flex } from '../../components/atoms/Flex';
import { Box } from '../../components/atoms/Box';
import { Link } from '../../components/atoms/Link';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  // const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        leftPanel={{
          title: 'Reset Your Password',
          subtitle: 'Password reset link sent',
          description: 'We understand that you may have forgotten your password. Don\'t worry, we\'ll help you regain access to your MedSupply-WA account quickly and securely.',
          securityIcons: [
            { icon: <Lock size={24} />, label: 'Secure' },
            { icon: <FileText size={24} />, label: 'Verified' },
            { icon: <Shield size={24} />, label: 'Protected' }
          ],
          securityMessage: 'Your account security is our priority. We use industry-standard encryption to protect your information.',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
        }}
        rightPanel={{
          title: 'Check Your Email',
          subtitle: 'We\'ve sent you a password reset link'
        }}
      >
        <Box textAlign="center">
          <Box marginBottom="lg">
            <Mail size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
            <Text size="lg" color="gray.600">
              We've sent a password reset link to your email address.
            </Text>
          </Box>

          <Box marginBottom="lg">
            <Text color="gray.500" size="sm">
              Please check your inbox and click the link to reset your password.
              The link will expire in 24 hours.
            </Text>
          </Box>

          <Flex justify="space-between" align="center" marginBottom="lg">
            <Link as={RouterLink} to="/login">
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Remember your password? Sign in
            </Link>
            <Link>
              <HelpCircle size={16} style={{ marginRight: '0.5rem' }} />
              Need help?
            </Link>
          </Flex>

          <Box marginBottom="lg">
            <Text size="md" color="gray.700" marginBottom="sm">
              Support Contact
            </Text>
            <Text color="gray.600" size="sm">
              If you're experiencing issues with password reset, please contact our support team at{' '}
              <Link href="mailto:support@medsupply-wa.com">support@medsupply-wa.com</Link>
              {' '}or call <Link href="tel:+18005559101">+1 (800) 555-9101</Link>.
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
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      leftPanel={{
        title: 'Reset Your Password',
        subtitle: 'We understand that you may have forgotten your password',
        description: 'Don\'t worry, we\'ll help you regain access to your MedSupply-WA account quickly and securely.',
        securityIcons: [
          { icon: <Lock size={24} />, label: 'Secure' },
          { icon: <FileText size={24} />, label: 'Verified' },
          { icon: <Shield size={24} />, label: 'Protected' }
        ],
        securityMessage: 'Your account security is our priority. We use industry-standard encryption to protect your information.',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
      }}
      rightPanel={{
        title: 'Forgot Password',
        subtitle: 'Enter your email address, and we\'ll send you a link to reset your password',
        children: (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box marginBottom="lg">
              <FormField
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                size="md"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
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
              <Mail size={20} style={{ marginRight: '0.5rem' }} />
              Send Reset Link
            </Button>

            <Flex justify="space-between" align="center" marginBottom="lg">
              <Link as={RouterLink} to="/login">
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                Remember your password? Sign in
              </Link>
              <Link>
                <HelpCircle size={16} style={{ marginRight: '0.5rem' }} />
                Need help?
              </Link>
            </Flex>

            <Box marginBottom="lg" padding="md" backgroundColor="gray.50" borderRadius="md">
              <Flex align="center" gap="sm" marginBottom="sm">
                <Text size="md" color="gray.700">Support Contact</Text>
              </Flex>
              <Text color="gray.600" size="sm">
                If you're experiencing issues with password reset, please contact our support team at{' '}
                <Link href="mailto:support@medsupply-wa.com">support@medsupply-wa.com</Link>
                {' '}or call <Link href="tel:+18005559101">+1 (800) 555-9101</Link>.
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

export default ForgotPassword;