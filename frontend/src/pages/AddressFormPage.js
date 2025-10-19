import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function AddressFormPage() {
  const [formData, setFormData] = useState({
    addressName: '',
    country: '',
    city: '',
    zipCode: '',
    address: '',
    addressDetails: '',
    phoneNumber: '',
    contactPerson: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchAddress();
    }
  }, [id]);

  const fetchAddress = async () => {
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

      const address = response.data.find(addr => addr.id === parseInt(id));
      if (address) {
        setFormData({
          addressName: address.addressName,
          country: address.country,
          city: address.city,
          zipCode: address.zipCode,
          address: address.address,
          addressDetails: address.addressDetails || '',
          phoneNumber: address.phoneNumber,
          contactPerson: address.contactPerson
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setMessage('Error loading address');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (isEditMode) {
        await axios.put(`/api/addresses/${id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessage('Address updated successfully');
      } else {
        await axios.post('/api/addresses', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMessage('Address created successfully');
      }

      setTimeout(() => {
        navigate('/addresses');
      }, 1500);
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage('Error saving address');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2>{isEditMode ? 'Edit Address' : 'Add New Address'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Address Name *</label>
            <input
              type="text"
              name="addressName"
              value={formData.addressName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="e.g., Home, Office"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Country *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter country"
            />
          </div>

          <div style={styles.formGroup}>
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter city"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Zip Code *</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter zip code"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter street address"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Address Details (optional)</label>
            <input
              type="text"
              name="addressDetails"
              value={formData.addressDetails}
              onChange={handleChange}
              style={styles.input}
              placeholder="Apartment, suite, unit, etc."
            />
          </div>

          <div style={styles.formGroup}>
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter phone number"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter contact person name"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Address' : 'Create Address')}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/addresses')} style={styles.buttonSecondary}>
            Back to Addresses
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
  formBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px'
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
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  message: {
    marginTop: '15px',
    textAlign: 'center',
    color: '#333'
  }
};

export default AddressFormPage;
