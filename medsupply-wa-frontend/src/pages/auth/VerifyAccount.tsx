import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/organisms/AuthLayout';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { Box } from '../../components/atoms/Box';
import { Alert } from '../../components/atoms/Alert/Alert';
import { toast } from 'react-hot-toast';

const VerifyAccount: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Get email and pharmacy name from navigation state
  const email = location.state?.email || '';
  const pharmacyName = location.state?.pharmacyName || '';

  useEffect(() => {
    // If no email provided, redirect to register
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      // Simulate checking if user is verified
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAlertMessage('Account verified successfully! You can now log in.');
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      toast.success('Account verified successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setAlertMessage('Account not yet verified. Please check your email and click the verification link.');
      setShowErrorAlert(true);
      setShowSuccessAlert(false);
      toast.error('Please check your email for the verification link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // Simulate resending verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification email sent to your inbox');
    } catch (error) {
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      leftPanel={{
        title: 'Verify Your Account',
        subtitle: 'Complete your registration',
        description: `We've sent a verification email to ${email}. Please check your inbox and click the verification link to complete your registration.`,
        features: [
          'Secure email verification',
          'Click the link in your email',
          'Access to all features after verification'
        ],
        icons: [
          <div key="verify">✓</div>,
          <div key="email">📧</div>,
          <div key="security">🔒</div>
        ],
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }}
      rightPanel={{
        title: 'Check Your Email',
        subtitle: `Verify ${pharmacyName}`,
        children: (
          <Box>
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

            {/* Email Display */}
            <Box marginBottom="lg">
              <Text color="gray.600" size="sm">
                Verification email sent to:
              </Text>
              <Text color="primary.600" weight="medium">
                {email}
              </Text>
            </Box>

            {/* Instructions */}
            <Box marginBottom="lg" padding="md" backgroundColor="blue.50" borderRadius="md">
              <Text color="blue.800" size="sm" weight="medium" marginBottom="sm">
                📧 What to do next:
              </Text>
              <Text color="blue.700" size="sm" marginBottom="xs">
                1. Check your email inbox (and spam folder)
              </Text>
              <Text color="blue.700" size="sm" marginBottom="xs">
                2. Look for an email from DARA Medics
              </Text>
              <Text color="blue.700" size="sm" marginBottom="xs">
                3. Click the verification link in the email
              </Text>
              <Text color="blue.700" size="sm">
                4. Come back here and click "I've Verified My Email"
              </Text>
            </Box>

            {/* Check Verification Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleCheckVerification}
              marginBottom="lg"
            >
              I've Verified My Email
            </Button>

            {/* Resend Email */}
            <Box marginBottom="lg">
              <Text color="gray.600" size="sm" align="center">
                Didn't receive the email?{' '}
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                >
                  Resend Email
                </Button>
              </Text>
            </Box>

            {/* Back to Register */}
            <Box marginBottom="lg">
              <Text color="gray.600" size="sm" align="center">
                Wrong email?{' '}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Go Back
                </Button>
              </Text>
            </Box>

            {/* Security Note */}
            <Box marginBottom="lg">
              <Text color="gray.500" size="xs" align="center">
                🔒 Your account is secure and encrypted
              </Text>
            </Box>
          </Box>
        )
      }}
    />
  );
};

export default VerifyAccount;