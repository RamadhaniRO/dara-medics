import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthDebugControls: React.FC = () => {
  const { clearAuthData, user, session, isAuthenticated } = useAuth();
  
  const handleClearAuth = async () => {
    await clearAuthData();
    window.location.reload(); // Reload page to reset state
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Auth Debug Controls:</strong></div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Session: {session ? 'exists' : 'null'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <button 
        onClick={handleClearAuth}
        style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginTop: '5px'
        }}
      >
        Clear Auth Data
      </button>
    </div>
  );
};

export default AuthDebugControls;
