import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { CheckCircle, Info } from 'lucide-react';
import { FaGoogle, FaMicrosoft, FaApple } from 'react-icons/fa';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { Input } from '../../components/atoms/Input';
import { PasswordField } from '../../components/molecules/PasswordField';
import { SocialLoginButtons } from '../../components/molecules/SocialLoginButtons';
import { Alert } from '../../components/atoms/Alert/Alert';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Box } from '../../components/atoms/Box';
import { Flex } from '../../components/atoms/Flex';
import { Link } from '../../components/atoms/Link';
import { Checkbox } from '../../components/atoms/Checkbox';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, socialLogin, getSocialProviders } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Load available social providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await getSocialProviders();
        setAvailableProviders(providers);
      } catch (error) {
        console.error('Failed to load social providers:', error);
      }
    };

    loadProviders();
  }, [getSocialProviders]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      setAlertMessage('Login successful! Welcome back to DARA Medics.');
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      toast.success('Login successful!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
      setShowSuccessAlert(false);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      await socialLogin(provider as 'google' | 'microsoft' | 'apple');
      // The redirect will happen automatically
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `${provider} login failed`;
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
      setShowSuccessAlert(false);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Welcome to DARA Medics',
        subtitle: 'WhatsApp-powered pharmacy wholesale management',
        description: 'Streamline your pharmacy wholesale operations with our integrated WhatsApp SaaS platform. Manage inventory, process orders, and communicate with suppliers all in one place.',
        features: [
          'Order medicines and supplies via WhatsApp',
          'Track deliveries in real-time',
          'Access exclusive wholesale pricing',
          'Manage inventory with smart alerts'
        ],
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        securityMessage: 'Connecting pharmacies with suppliers through WhatsApp'
      }}
      rightPanel={{
        title: 'Sign In',
        subtitle: 'Enter your credentials to access your account',
        children: (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Alerts */}
            <Alert
              type="success"
              message={alertMessage}
              show={showSuccessAlert}
              onClose={() => setShowSuccessAlert(false)}
              autoClose={true}
              autoCloseDelay={3000}
            />
            
            <Alert
              type="error"
              message={alertMessage}
              show={showErrorAlert}
              onClose={() => setShowErrorAlert(false)}
              autoClose={true}
              autoCloseDelay={5000}
            />

            {/* Email Field */}
            <Box marginBottom="lg">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                error={!!errors.email}
                helperText={errors.email?.message}
                required
                fullWidth
                size="md"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </Box>

            {/* Password Field */}
            <PasswordField
              label="Password"
              placeholder="Enter your password"
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
              inputSize="md"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />

            {/* Remember Me and Forgot Password */}
            <Flex justify="space-between" align="center" marginBottom="1.25rem">
              <Checkbox
                label="Remember me"
                {...register('rememberMe')}
              />
              <Link as={RouterLink} to="/forgot-password" color="primary.500">
                Forgot password?
              </Link>
            </Flex>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              marginBottom="1.25rem"
            >
              Sign In
            </Button>

            {/* Divider */}
            <Flex align="center" marginBottom="1.25rem">
              <Box flex="1" height="1px" backgroundColor="gray.200" />
              <Text marginX="1rem" color="gray.500" size="sm">Or sign in with</Text>
              <Box flex="1" height="1px" backgroundColor="gray.200" />
            </Flex>

            {/* Social Login Buttons */}
            <Box marginBottom="1.25rem">
              <SocialLoginButtons
                onGoogleLogin={() => handleSocialLogin('google')}
                onMicrosoftLogin={() => handleSocialLogin('microsoft')}
                onAppleLogin={() => handleSocialLogin('apple')}
                disabled={isLoading}
                loading={isLoading}
                providers={availableProviders.map(provider => ({
                  name: provider.name,
                  icon: provider.name === 'google' ? <FaGoogle color="#4285F4" /> : 
                        provider.name === 'microsoft' ? <FaMicrosoft color="#00BCF2" /> : 
                        <FaApple color="#000000" />,
                  onClick: () => handleSocialLogin(provider.name)
                }))}
              />
            </Box>

            {/* Two-factor authentication alert */}
            <Box marginBottom="0.75rem">
              <Alert
                type="success"
                title="Two-factor authentication is available for enhanced security"
                message="Enable 2FA in your account settings for additional security."
                show={true}
                icon={<CheckCircle size={16} color="#22c55e" />}
              />
            </Box>

            {/* Browser detection alert */}
            <Box marginBottom="1.25rem">
              <Alert
                type="info"
                title="You are signing in from Chrome on Windows. If this is not you, please contact support immediately."
                message="This helps protect your account from unauthorized access."
                show={true}
                icon={<Info size={16} color="#6b7280" />}
              />
            </Box>

            {/* Sign up link */}
            <Flex justify="center" align="center" marginBottom="1.5rem">
              <Text color="gray.600">
                Don't have an account? <Link as={RouterLink} to="/register" color="primary.500">Sign Up</Link>
              </Text>
            </Flex>

            {/* Footer links */}
            <Flex justify="flex-end" align="center">
              <Text color="gray.500" size="sm">
                <Link as={RouterLink} to="/terms-of-service" color="gray.500">Terms of Service</Link>
                {' | '}
                <Link as={RouterLink} to="/privacy-policy" color="gray.500">Privacy Policy</Link>
                {' | '}
                <Link as={RouterLink} to="/help" color="gray.500">Contact Support</Link>
              </Text>
            </Flex>
          </form>
        )
      }}
    />
  );
};

export default Login;