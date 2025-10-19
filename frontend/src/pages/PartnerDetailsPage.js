import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function PartnerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/partners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
      } catch (e) {
        setError((e.response && e.response.data && e.response.data.message) || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div style={styles.container}>Loading…</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1>Partner</h1>
          <div style={styles.error}>{error}</div>
          <button onClick={() => navigate('/partners')} style={styles.button}>Back to Partners</button>
        </div>
      </div>
    );
  }

  const p = data && data.partner;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>{data?.headerCode || 'Partner'}</h1>
        {p && (
          <div style={styles.card}>
            <div><strong>Name:</strong> {p.fullName || p.username || '—'}</div>
            <div><strong>Email:</strong> {p.email || '—'}</div>
            <div><strong>Phone:</strong> {p.phone || '—'}</div>
          </div>
        )}
        <div style={{textAlign:'left', marginTop:'16px'}}>
          <h3>Shipping history</h3>
          {Array.isArray(data?.shippingHistory) && data.shippingHistory.length > 0 ? (
            <ul>
              {data.shippingHistory.map((h, idx) => <li key={idx}>{h}</li>)}
            </ul>
          ) : (
            <div style={{color:'#666'}}>No data</div>
          )}
        </div>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginTop:'12px' }}>
          <button onClick={() => navigate(`/shipments/new?partnerId=${id}`)} style={styles.primaryBtn}>Add New</button>
          <button onClick={() => navigate('/partners')} style={styles.button}>Back to Partners</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  content: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '90%', maxWidth: '700px', textAlign:'center' },
  button: { padding: '12px 30px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '20px' },
  primaryBtn: { padding: '12px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '20px' },
  card: { border: '1px solid #eee', background:'#fafafa', borderRadius: '6px', padding: '12px', textAlign:'left' },
  error: { color: '#b71c1c', marginBottom: '12px' }
};

export default PartnerDetailsPage;
