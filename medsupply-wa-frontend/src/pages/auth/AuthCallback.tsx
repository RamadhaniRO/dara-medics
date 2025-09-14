import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Container } from '../../components/atoms/Container';
import { Text } from '../../components/atoms/Text';
import { Loading } from '../../components/atoms/Loading';
import { Alert } from '../../components/atoms/Alert/Alert';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleSocialCallback } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setLoading(false);
          return;
        }

        if (!token || !provider) {
          setError('Invalid authentication callback');
          setLoading(false);
          return;
        }

        await handleSocialCallback(token, provider);
        
        // Redirect to dashboard on success
        navigate('/dashboard');
      } catch (err) {
        console.error('Social callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, handleSocialCallback, navigate]);

  if (loading) {
    return (
      <Container maxWidth="400px" center>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loading size="lg" />
          <Text marginTop="1rem" size="lg">
            Completing authentication...
          </Text>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="400px" center>
        <div style={{ padding: '2rem' }}>
          <Alert
            type="error"
            title="Authentication Failed"
            message={error}
            show={true}
          />
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return null;
};

export default AuthCallback;
