import React from 'react';
import { useNavigate } from 'react-router-dom';

function AccountPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>Account</h1>
        <p style={styles.message}>Coming soon...</p>
        <button onClick={() => navigate('/home')} style={styles.button}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5'
  },
  content: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '500px',
    textAlign: 'center'
  },
  message: {
    fontSize: '18px',
    color: '#666',
    margin: '20px 0'
  },
  button: {
    padding: '12px 30px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px'
  }
};

export default AccountPage;
