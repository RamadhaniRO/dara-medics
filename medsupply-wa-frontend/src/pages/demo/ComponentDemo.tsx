import React, { useState } from 'react';
import { 
  Alert, 
  AnimatedButton, 
  Modal, 
  Progress, 
  CircularProgress, 
  Loading, 
  PasswordStrengthIndicator,
  Card,
  Text,
  Box,
  Flex,
  Button
} from '../../components/atoms';

const ComponentDemo: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [password, setPassword] = useState('');
  const [loadingVariant, setLoadingVariant] = useState<'spinner' | 'dots' | 'pulse' | 'bars'>('spinner');

  const handleShowAlert = (type: 'success' | 'error' | 'warning' | 'info') => {
    setAlertType(type);
    setShowAlert(true);
  };

  const handleProgressChange = () => {
    setProgress(prev => (prev >= 100 ? 0 : prev + 10));
  };

  return (
    <Box padding="2rem" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Text size="2xl" style={{ fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
        DARA Medics - Functional Components Demo
      </Text>

      {/* Alert Component Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Alert Component</Text>
        <Flex gap="1rem" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Button onClick={() => handleShowAlert('success')} variant="primary" size="sm">
            Success Alert
          </Button>
          <Button onClick={() => handleShowAlert('error')} variant="secondary" size="sm">
            Error Alert
          </Button>
          <Button onClick={() => handleShowAlert('warning')} variant="outline" size="sm">
            Warning Alert
          </Button>
          <Button onClick={() => handleShowAlert('info')} variant="ghost" size="sm">
            Info Alert
          </Button>
        </Flex>
        
        <Alert
          type={alertType}
          message={`This is a ${alertType} alert message!`}
          show={showAlert}
          onClose={() => setShowAlert(false)}
          autoClose={true}
          autoCloseDelay={5000}
        />
      </Card>

      {/* Animated Button Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Animated Button Component</Text>
        <Flex gap="1rem" style={{ flexWrap: 'wrap' }}>
          <AnimatedButton variant="primary" animation="pulse">
            Pulse Animation
          </AnimatedButton>
          <AnimatedButton variant="secondary" animation="bounce">
            Bounce Animation
          </AnimatedButton>
          <AnimatedButton variant="outline" animation="shake">
            Shake Animation
          </AnimatedButton>
          <AnimatedButton variant="ghost" loading>
            Loading State
          </AnimatedButton>
        </Flex>
      </Card>

      {/* Modal Component Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Modal Component</Text>
        <Button onClick={() => setShowModal(true)} variant="primary">
          Open Modal
        </Button>
        
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="DARA Medics Modal"
          size="md"
        >
          <Text style={{ marginBottom: '1rem' }}>
            This is a functional modal component with animations and proper state management.
          </Text>
          <Text style={{ marginBottom: '1rem' }}>
            Features:
          </Text>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Animated open/close transitions</li>
            <li>Backdrop blur effect</li>
            <li>Escape key to close</li>
            <li>Click outside to close</li>
            <li>Proper focus management</li>
          </ul>
        </Modal>
      </Card>

      {/* Progress Component Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Progress Component</Text>
        <Flex gap="2rem" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Box style={{ flex: '1', minWidth: '200px' }}>
            <Progress
              value={progress}
              max={100}
              showLabel
              label="Loading Progress"
              animated
              striped
            />
            <Button onClick={handleProgressChange} variant="outline" size="sm" style={{ marginTop: '1rem' }}>
              Update Progress
            </Button>
          </Box>
          <Box>
            <CircularProgress
              value={progress}
              max={100}
              size="lg"
              variant="success"
              showValue
            />
          </Box>
        </Flex>
      </Card>

      {/* Password Strength Indicator Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Password Strength Indicator</Text>
        <Box style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to see strength indicator"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </Box>
        <PasswordStrengthIndicator password={password} show={!!password} />
      </Card>

      {/* Loading Component Demo */}
      <Card padding="lg" marginBottom="2rem" hover>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Loading Component</Text>
        <Flex gap="1rem" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Button onClick={() => setLoadingVariant('spinner')} variant="outline" size="sm">
            Spinner
          </Button>
          <Button onClick={() => setLoadingVariant('dots')} variant="outline" size="sm">
            Dots
          </Button>
          <Button onClick={() => setLoadingVariant('pulse')} variant="outline" size="sm">
            Pulse
          </Button>
          <Button onClick={() => setLoadingVariant('bars')} variant="outline" size="sm">
            Bars
          </Button>
        </Flex>
        <Flex gap="2rem" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Loading variant={loadingVariant} size="sm" text="Small" />
          <Loading variant={loadingVariant} size="md" text="Medium" />
          <Loading variant={loadingVariant} size="lg" text="Large" />
        </Flex>
      </Card>

      {/* Card Component Demo */}
      <Card padding="lg" marginBottom="2rem" hover clickable>
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem' }}>Animated Card Component</Text>
        <Text color="gray.600">
          This card has hover animations, click effects, and smooth transitions. 
          All components are fully functional with proper state management and animations.
        </Text>
      </Card>

      {/* Summary */}
      <Card padding="lg" backgroundColor="#f0f9ff" border="1px solid #0ea5e9">
        <Text size="lg" style={{ fontWeight: '600', marginBottom: '1rem', color: '#0c4a6e' }}>
          ✅ All Components Are Now Functional!
        </Text>
        <Text style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
          • Alerts appear conditionally after actions
        </Text>
        <Text style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
          • Password strength indicator shows real-time validation
        </Text>
        <Text style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
          • All components have smooth animations
        </Text>
        <Text style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
          • Proper state management throughout
        </Text>
        <Text style={{ color: '#0c4a6e', marginBottom: '0.5rem' }}>
          • All branding updated to "DARA Medics"
        </Text>
        <Text style={{ color: '#0c4a6e' }}>
          • Enhanced user experience with interactive elements
        </Text>
      </Card>
    </Box>
  );
};

export default ComponentDemo;
