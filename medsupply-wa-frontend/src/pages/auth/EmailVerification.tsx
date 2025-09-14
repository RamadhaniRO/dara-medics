import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Box } from '../../components/atoms/Box';
import { Alert } from '../../components/atoms/Alert';
import { supabase } from '../../services/supabase';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      setVerificationStatus('loading');
      
      // Verify email with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: verificationToken,
        type: 'email'
      });
      
      if (error) {
        console.error('Email verification error:', error);
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setVerificationStatus('expired');
          setMessage('This verification link has expired or is invalid. Please request a new one.');
        } else {
          setVerificationStatus('error');
          setMessage(error.message || 'Email verification failed');
        }
        return;
      }

      if (data.user) {
        setVerificationStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage('Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setMessage('An error occurred during email verification. Please try again.');
    }
  }, [navigate]);

  useEffect(() => {
    // Get token and type from URL search params (Supabase format)
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'email') {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link');
    }
  }, [searchParams, verifyEmail]);

  const resendVerificationEmail = async () => {
    try {
      setIsResending(true);
      
      // Get email from URL params or prompt user
      const email = searchParams.get('email');
      
      if (!email) {
        setMessage('Email address is required to resend verification');
        return;
      }

      // Resend verification email with Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });
      
      if (error) {
        console.error('Resend verification error:', error);
        setMessage('Failed to resend verification email. Please try again.');
        return;
      }

      setMessage('A new verification email has been sent to your email address.');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setMessage('An error occurred while resending the verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle size={48} color="#22c55e" />;
      case 'error':
      case 'expired':
        return <XCircle size={48} color="#ef4444" />;
      default:
        return <RefreshCw size={48} color="#3b82f6" className="animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'success';
      case 'error':
      case 'expired':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Email Verification',
        subtitle: 'Verify your email address to continue',
        description: 'We need to verify your email address to ensure account security and deliver important updates about your pharmacy management system.',
        securityIcons: [
          { icon: <Mail size={24} />, label: 'Secure' },
          { icon: <CheckCircle size={24} />, label: 'Verified' },
        ],
        securityMessage: 'Email verification helps protect your account and ensures you receive important notifications.',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      }}
      rightPanel={{
        title: 'Email Verification',
        subtitle: 'Complete your account setup',
        children: (
          <Box textAlign="center">
            <Box marginBottom="lg">
              {getStatusIcon()}
            </Box>

            <Box marginBottom="lg">
              <Text size="lg" color="gray.700" marginBottom="sm">
                {verificationStatus === 'loading' && 'Verifying your email...'}
                {verificationStatus === 'success' && 'Email Verified Successfully!'}
                {verificationStatus === 'error' && 'Verification Failed'}
                {verificationStatus === 'expired' && 'Verification Link Expired'}
              </Text>
              
              <Text color="gray.600" size="sm">
                {message}
              </Text>
            </Box>

            {verificationStatus === 'success' && (
              <Alert 
                type="success" 
                message="Redirecting to login page in 3 seconds..."
                show={true}
                autoClose={false}
              />
            )}

            {(verificationStatus === 'error' || verificationStatus === 'expired') && (
              <Box marginBottom="lg">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={isResending}
                  onClick={resendVerificationEmail}
                  marginBottom="md"
                >
                  <Mail size={16} style={{ marginRight: '0.5rem' }} />
                  Resend Verification Email
                </Button>
                
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </Box>
            )}

            {verificationStatus === 'loading' && (
              <Box marginBottom="lg">
                <Text color="gray.500" size="sm">
                  Please wait while we verify your email address...
                </Text>
              </Box>
            )}

            <Box marginBottom="lg" padding="md" backgroundColor="gray.50" borderRadius="md">
              <Text size="sm" color="gray.600">
                <strong>Need help?</strong> If you're having trouble verifying your email, please contact our support team at{' '}
                <a href="mailto:support@medsupply-wa.com" style={{ color: '#3b82f6' }}>
                  support@medsupply-wa.com
                </a>
              </Text>
            </Box>
          </Box>
        )
      }}
    />
  );
};

export default EmailVerification;
