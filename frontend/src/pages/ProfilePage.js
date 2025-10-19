import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../store/UserStore';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [defaultAddressId, setDefaultAddressId] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFirstRun = new URLSearchParams(location.search).get('firstRun') === 'true';
  const { refresh } = useUser();

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfile(response.data);
      setPhone(response.data.phone || '');
      setFullName(response.data.fullName || '');
      setDefaultAddressId(response.data.defaultAddressId || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error loading profile');
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/me', 
        { 
          phone,
          fullName,
          defaultAddressId: defaultAddressId ? parseInt(defaultAddressId) : null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);
      try { if (refresh && typeof refresh === 'function') refresh(); } catch (_) {}
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || 'Error updating profile');
      } else {
        setMessage('Error updating profile');
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/me', 
        { password: newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);
      try { if (refresh && typeof refresh === 'function') refresh(); } catch (_) {}
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('Error updating password');
    }
  };

  const handlePartnerRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/partner/request', {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);
      fetchProfile();
    } catch (error) {
      console.error('Error creating partner request:', error);
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error creating partner request');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!profile) {
    return <div style={styles.container}>Error loading profile</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2>User Profile</h2>
        
        {isFirstRun && (
          <div style={styles.hint}>
            Please review and complete your profile information before continuing.
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Avatar/Username:</label>
          <input
            type="text"
            value={profile.customerCode ? `User_${profile.customerCode.replace('CUST-', '')}` : 'User'}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Email (read-only):</label>
          <input
            type="email"
            value={profile.email}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Phone:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            placeholder="+1234567890"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
            placeholder="Ivanov Ivan"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Password:</label>
          <button onClick={() => setShowPasswordModal(true)} style={styles.buttonSmall}>
            Change Password
          </button>
        </div>

        <div style={styles.formGroup}>
          <label>Customer Code (read-only):</label>
          <input
            type="text"
            value={profile.customerCode || ''}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Index Code (read-only):</label>
          <input
            type="text"
            value={profile.indexCode || 'Not assigned'}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Receipt Address:</label>
          <select
            value={defaultAddressId}
            onChange={(e) => setDefaultAddressId(e.target.value)}
            style={styles.input}
          >
            <option value="">-- Select Address --</option>
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.addressName} - {addr.city}
              </option>
            ))}
          </select>
          <button onClick={() => navigate('/addresses')} style={styles.buttonLink}>
            Manage Addresses
          </button>
        </div>

        {profile.allowedToRequestPartner && (
          <div style={styles.formGroup}>
            <button 
              onClick={handlePartnerRequest} 
              style={profile.partnerStatus === 'NONE' ? styles.button : styles.buttonDisabled}
              disabled={profile.partnerStatus !== 'NONE'}
            >
              {profile.partnerStatus === 'PENDING' ? 'Request Pending' : 
               profile.partnerStatus === 'APPROVED' ? 'Approved Partner' : 
               'To be a partner'}
            </button>
          </div>
        )}

        <button onClick={handleSave} style={styles.buttonPrimary}>
          Save
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.buttonGroup}>
          <button onClick={handleLogout} style={styles.buttonDanger}>
            Logout
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalButtons}>
              <button onClick={handleUpdatePassword} style={styles.button}>Update</button>
              <button onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
              }} style={styles.buttonSecondary}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  formBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px'
  },
  hint: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #1976d2'
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
  inputDisabled: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: '#f5f5f5',
    color: '#666'
  },
  buttonPrimary: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
    fontWeight: 'bold'
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
  buttonDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px',
    marginTop: '10px'
  },
  buttonSmall: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '5px'
  },
  buttonLink: {
    padding: '6px 12px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '5px',
    marginLeft: '10px',
    fontSize: '12px'
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '5px'
  },
  buttonDanger: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '5px'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px'
  },
  message: {
    marginTop: '15px',
    textAlign: 'center',
    color: '#333'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  }
};

export default ProfilePage;
