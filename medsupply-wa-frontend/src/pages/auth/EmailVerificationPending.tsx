import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Box } from '../../components/atoms/Box';
import { Alert } from '../../components/atoms/Alert';

const EmailVerificationPending: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || 'your email';

  const handleResendEmail = async () => {
    // TODO: Implement resend verification email
    console.log('Resend verification email for:', email);
  };

  const handleBackToLogin = () => {
    navigate('/login', { 
      state: { 
        email,
        message: 'Please check your email to verify your account before logging in.'
      } 
    });
  };

  return (
    <AuthLayout
      leftPanel={
        <Box padding="4" style={{ textAlign: 'center' }}>
          <Mail size={64} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
          <Text size="xl" weight="bold" style={{ color: 'white', marginBottom: '1rem' }}>
            Check Your Email
          </Text>
          <Text size="lg" style={{ color: 'white', opacity: 0.9 }}>
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </Text>
        </Box>
      }
      rightPanel={
        <Box padding="4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Box style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Mail size={48} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
            <Text size="xl" weight="bold" style={{ marginBottom: '0.5rem' }}>
              Verify Your Email
            </Text>
            <Text size="md" style={{ color: '#6b7280' }}>
              We've sent a verification link to:
            </Text>
            <Text size="md" weight="medium" style={{ color: '#1f2937', marginTop: '0.5rem' }}>
              {email}
            </Text>
          </Box>

          <Alert
            type="info"
            message="Please check your email inbox and spam folder. Click the verification link to activate your account."
            show={true}
            autoClose={false}
          />

          <Box style={{ marginTop: '2rem' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleResendEmail}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              Resend Verification Email
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBackToLogin}
              style={{ width: '100%' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Back to Login
            </Button>
          </Box>

          <Box style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Text size="sm" style={{ color: '#6b7280' }}>
              Didn't receive the email? Check your spam folder or try resending.
            </Text>
          </Box>
        </Box>
      }
    />
  );
};

export default EmailVerificationPending;
