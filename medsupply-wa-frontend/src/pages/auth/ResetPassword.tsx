import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FiLock, FiArrowRight, FiCheckCircle, FiFileText, FiHelpCircle } from 'react-icons/fi';

// Import new component system
import {
  AuthLayout,
  PasswordField,
  Button,
  Text,
  Flex,
  Box,
  Link
} from '../../components';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box
          style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}
        >
          <Flex direction="column" gap="6" align="center">
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#38a169',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <FiCheckCircle size={40} />
            </Box>
            
            <Box>
              <Text size="2xl" weight="bold" color="#1a202c">
                Password Reset Successfully
              </Text>
              <Text color="#718096" style={{ marginTop: '0.5rem' }}>
                Your password has been updated. You can now sign in with your new password.
              </Text>
            </Box>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Flex>
        </Box>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box
          style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center'
          }}
        >
          <Flex direction="column" gap="6" align="center">
            <Box>
              <Text size="2xl" weight="bold" color="#e53e3e">
                Invalid Reset Link
              </Text>
              <Text color="#718096" style={{ marginTop: '0.5rem' }}>
                This password reset link is invalid or has expired.
              </Text>
            </Box>

            <Link
              variant="primary"
              as={RouterLink}
              to="/forgot-password"
            >
              Request New Reset Link
            </Link>
          </Flex>
        </Box>
      </div>
    );
  }

  return (
    <AuthLayout
      leftPanel={{
        title: "Reset Your Password",
        subtitle: "Create a strong, unique password to protect your MedSupply-WA account. A secure password helps safeguard your pharmacy's sensitive information and transaction data.",
        description: "Your account security is our priority. We use industry-standard encryption to protect your information.",
        features: [
          "Secure password reset process",
          "Strong password requirements",
          "Industry-standard encryption",
          "24/7 support available"
        ],
        icons: [
          <FiFileText size={26} />,
          <FiLock size={60} />
        ],
        gradient: "linear-gradient(135deg, #3182ce 0%, #805ad5 100%)"
      }}
      rightPanel={{
        title: "Reset Your Password",
        subtitle: "Enter your new password below.",
        children: (
          <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" gap="4">
                <PasswordField
                  label="New Password"
                  placeholder="Enter new password"
                  leftIcon={<FiLock />}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  required
                  fullWidth
                  inputSize="md"
                  showStrength={true}
                  showRequirements={true}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                      message: 'Password must contain uppercase, lowercase, number, and special character',
                    },
                  })}
                />

                <PasswordField
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  leftIcon={<FiLock />}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  required
                  fullWidth
                  inputSize="md"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  style={{ marginTop: '0.75rem' }}
                >
                  {isLoading ? 'Resetting Password...' : (
                    <>
                      Reset Password
                      <FiArrowRight size={18} />
                    </>
                  )}
                </Button>
              </Flex>
            </form>

            <Flex justify="space-between" align="center" style={{ marginTop: '2rem' }}>
              <Link
                variant="primary"
                as={RouterLink}
                to="/login"
                style={{ 
                  color: '#3182ce',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Back to Login
              </Link>
              
              <Link
                variant="primary"
                style={{ 
                  color: '#3182ce',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                <FiHelpCircle size={14} />
                Need help?
              </Link>
            </Flex>

            {/* Footer Links */}
            <Flex justify="center" gap="3" wrap style={{ marginTop: '1.5rem' }}>
              <Link 
                variant="ghost" 
                size="sm" 
                color="#718096"
              >
                Terms of Service
              </Link>
              <Link 
                variant="ghost" 
                size="sm" 
                color="#718096"
              >
                Privacy Policy
              </Link>
              <Link 
                variant="ghost" 
                size="sm" 
                color="#718096"
              >
                Contact Support
              </Link>
            </Flex>
          </Box>
        )
      }}
    />
  );
};

export default ResetPassword;