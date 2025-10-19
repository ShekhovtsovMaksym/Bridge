import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAddresses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setMessage('Error loading addresses');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/addresses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setMessage('Error deleting address');
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentBox}>
        <h2>My Addresses</h2>

        <button onClick={() => navigate('/addresses/new')} style={styles.buttonAdd}>
          + Add New Address
        </button>

        {message && <p style={styles.message}>{message}</p>}

        {addresses.length === 0 ? (
          <p style={styles.emptyMessage}>No addresses found. Add your first address!</p>
        ) : (
          <div style={styles.addressList}>
            {addresses.map((address) => (
              <div key={address.id} style={styles.addressCard}>
                <div style={styles.addressHeader}>
                  <h3>{address.addressName}</h3>
                  <span style={styles.uid}>UID: {address.uid}</span>
                </div>
                <div style={styles.addressBody}>
                  <p><strong>Country:</strong> {address.country}</p>
                  <p><strong>City:</strong> {address.city}</p>
                  <p><strong>Zip Code:</strong> {address.zipCode}</p>
                  <p><strong>Address:</strong> {address.address}</p>
                  {address.addressDetails && (
                    <p><strong>Details:</strong> {address.addressDetails}</p>
                  )}
                  <p><strong>Phone:</strong> {address.phoneNumber}</p>
                  <p><strong>Contact Person:</strong> {address.contactPerson}</p>
                </div>
                <div style={styles.addressActions}>
                  <button 
                    onClick={() => navigate(`/addresses/${address.id}/edit`)} 
                    style={styles.buttonEdit}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)} 
                    style={styles.buttonDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/profile')} style={styles.buttonSecondary}>
            Back to Profile
          </button>
          <button onClick={() => navigate('/home')} style={styles.buttonSecondary}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  contentBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '900px'
  },
  buttonAdd: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px'
  },
  message: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '15px'
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontSize: '16px'
  },
  addressList: {
    display: 'grid',
    gap: '20px',
    marginTop: '20px'
  },
  addressCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  addressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px'
  },
  uid: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#e0e0e0',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  addressBody: {
    marginBottom: '15px'
  },
  addressActions: {
    display: 'flex',
    gap: '10px'
  },
  buttonEdit: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonDelete: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px'
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default AddressesPage;
