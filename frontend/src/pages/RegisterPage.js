import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [superAdminCode, setSuperAdminCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'SUPER_ADMIN' && (!superAdminCode || superAdminCode.trim() === '')) {
      setMessage('Please enter the Super Admin secret code');
      return;
    }

    try {
      // Register the user
      const registerResponse = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        phone,
        role,
        ...(role === 'SUPER_ADMIN' ? { superAdminCode } : {})
      });
      setMessage(registerResponse.data.message);
      
      // Auto-login after successful registration
      const loginResponse = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      // Store the token
      localStorage.setItem('token', loginResponse.data.token);
      
      // Redirect to profile page with firstRun flag
      setTimeout(() => {
        navigate('/profile?firstRun=true');
      }, 1000);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || 'Registration failed');
      } else {
        setMessage('Registration failed');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Role:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <label><input type="radio" name="role" value="USER" checked={role === 'USER'} onChange={() => setRole('USER')} /> User</label>
              <label><input type="radio" name="role" value="SUPER_ADMIN" checked={role === 'SUPER_ADMIN'} onChange={() => setRole('SUPER_ADMIN')} /> Super Admin</label>
            </div>
          </div>

          {role === 'SUPER_ADMIN' && (
            <div style={styles.formGroup}>
              <label>Super Admin Secret Code:</label>
              <input
                type="text"
                value={superAdminCode}
                onChange={(e) => setSuperAdminCode(e.target.value)}
                placeholder="Enter secret code"
                style={styles.input}
              />
            </div>
          )}

          <button type="submit" style={styles.button}>Register</button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
        <p style={styles.link}>
          Already have an account? <a href="/login">Login</a>
        </p>
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
  formBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '400px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  },
  message: {
    marginTop: '15px',
    textAlign: 'center',
    color: '#333'
  },
  link: {
    marginTop: '15px',
    textAlign: 'center'
  }
};

export default RegisterPage;
