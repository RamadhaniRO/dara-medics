import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { Input } from '../../components/atoms/Input';
import { PasswordField } from '../../components/molecules/PasswordField';
import { SocialLoginButtons } from '../../components/molecules/SocialLoginButtons';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Flex } from '../../components/atoms/Flex';
import { Box } from '../../components/atoms/Box';
import { Link } from '../../components/atoms/Link';
import { Alert } from '../../components/atoms/Alert/Alert';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormData {
  pharmacyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, socialLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onSubmit', // Only validate on submit to avoid typing errors
    reValidateMode: 'onChange',
    defaultValues: {
      pharmacyName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    console.log('=== FORM SUBMISSION ===');
    console.log('Data:', data);
    console.log('Errors:', errors);

    setIsLoading(true);
    try {
      console.log('Attempting to register user...');
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.pharmacyName, // Map pharmacyName to full_name for Supabase
        pharmacy_name: data.pharmacyName,
      });
      
      console.log('Registration successful');
      
      // Show success message for email verification
      setAlertMessage('Account created successfully! Please check your email to verify your account before logging in.');
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      toast.success('Account created! Please check your email to verify your account.');
      
      // Navigate to login page with verification message
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: data.email,
            message: 'Account created! Please check your email to verify your account before logging in.'
          } 
        });
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
      setShowSuccessAlert(false);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Join DARA Medics',
        subtitle: 'WhatsApp-powered pharmacy wholesale management',
        description: 'Join thousands of pharmacies already using DARA Medics to streamline their operations and grow their business.',
        features: [
          'Order medicines and supplies via WhatsApp',
          'Track deliveries in real-time',
          'Access exclusive wholesale pricing',
          'Manage inventory with smart alerts'
        ],
        icons: [
          <div key="logo">💊</div>,
          <div key="whatsapp">💬</div>,
          <div key="truck">🚚</div>
        ],
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
      }}
      rightPanel={{
        title: 'Create Account',
        subtitle: 'Enter your details to get started',
        children: (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Alerts */}
            <Alert
              type="success"
              message={alertMessage}
              show={showSuccessAlert}
              onClose={() => setShowSuccessAlert(false)}
              autoClose={true}
              autoCloseDelay={5000}
            />
            
            <Alert
              type="error"
              message={alertMessage}
              show={showErrorAlert}
              onClose={() => setShowErrorAlert(false)}
              autoClose={true}
              autoCloseDelay={5000}
            />

            {/* Pharmacy Name Field */}
            <Box marginBottom="lg">
              <Input
                label="Pharmacy Name"
                type="text"
                placeholder="Enter your pharmacy name"
                error={!!errors.pharmacyName}
                helperText={errors.pharmacyName?.message}
                required
                fullWidth
                size="md"
                {...register('pharmacyName', {
                  required: 'Pharmacy name is required',
                  minLength: {
                    value: 2,
                    message: 'Pharmacy name must be at least 2 characters'
                  }
                })}
              />
            </Box>


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
            <Box marginBottom="lg">
              <PasswordField
                label="Password"
                placeholder="Create a strong password"
                error={!!errors.password}
                helperText={errors.password?.message}
                showStrength={true}
                showRequirements={true}
                required
                fullWidth
                inputSize="md"
                {...register('password', {
                  required: 'Password is required',
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

            {/* Confirm Password Field */}
            <Box marginBottom="lg">
              <PasswordField
                label="Confirm Password"
                placeholder="Confirm your password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                fullWidth
                inputSize="md"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match'
                })}
              />
            </Box>


            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              marginBottom="lg"
            >
              Create Account
            </Button>

            {/* Divider */}
            <Flex align="center" marginBottom="lg">
              <Box flex="1" height="1px" backgroundColor="gray.200" />
              <Text marginX="1rem" color="gray.500" size="sm">Or sign up with</Text>
              <Box flex="1" height="1px" backgroundColor="gray.200" />
            </Flex>

            {/* Social Login Buttons */}
            <Box marginBottom="lg">
              <SocialLoginButtons
                onGoogleLogin={() => handleSocialLogin('google')}
                onMicrosoftLogin={() => handleSocialLogin('microsoft')}
                onAppleLogin={() => handleSocialLogin('apple')}
                disabled={isLoading}
                loading={isLoading}
              />
            </Box>

            {/* Navigation Links */}
            <Flex justify="center" align="center" marginBottom="lg">
              <Text color="gray.600">
                Already have an account? <Link as={RouterLink} to="/login">Sign In</Link>
              </Text>
            </Flex>

            <Flex justify="center" align="center" marginBottom="lg">
              <Text color="gray.600">
                Need help? <Link>Contact Support</Link>
              </Text>
            </Flex>

            <Flex justify="center" align="center" marginBottom="lg">
              <Flex align="center" gap="sm">
                <Text color="success.500">✓</Text>
                <Text color="gray.600" size="sm">
                  Your data is encrypted and securely stored
                </Text>
              </Flex>
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

export default Register;