import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug: React.FC = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug:</strong></div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Session: {session ? 'exists' : 'null'}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};

export default AuthDebug;
