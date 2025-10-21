import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../store/UserStore';

function PartnerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { data: me } = useUser();

  const [data, setData] = useState(null); // for USER flow (existing)
  const [requests, setRequests] = useState([]); // for SUPER_ADMIN flow
  const [client, setClient] = useState(location.state?.client || null); // from list page if available
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (me?.role === 'SUPER_ADMIN') {
          // Ensure client header info
          if (!client) {
            try {
              const ls = await axios.get('/api/admin/partners', { headers: { Authorization: `Bearer ${token}` } });
              if (Array.isArray(ls.data)) {
                const found = ls.data.find((x) => String(x.userId) === String(id));
                if (found) setClient(found);
              }
            } catch (_) {}
          }
          const res = await axios.get(`/api/admin/partners/${id}/requests`, { headers: { Authorization: `Bearer ${token}` } });
          setRequests(Array.isArray(res.data) ? res.data : []);
        } else {
          const res = await axios.get(`/api/partners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setData(res.data);
        }
      } catch (e) {
        setError((e.response && e.response.data && e.response.data.message) || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, me]);

  if (loading) {
    return <div style={styles.container}>Loading…</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1>{me?.role === 'SUPER_ADMIN' ? 'Партнёр' : 'Partner'}</h1>
          <div style={styles.error}>{error}</div>
          <button onClick={() => navigate('/partners')} style={styles.button}>{me?.role === 'SUPER_ADMIN' ? 'Назад' : 'Back to Partners'}</button>
        </div>
      </div>
    );
  }

  if (me?.role === 'SUPER_ADMIN') {
    const codeOf = (customerCode, uid) => {
      if (!customerCode) return String(uid);
      return customerCode.startsWith('CUST-') ? customerCode.substring(5) : customerCode;
    };
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1>{client ? `Partner_${codeOf(client.customerCode, client.userId)}` : 'Partner'}</h1>
          {client && (
            <div style={styles.card}>
              <div><strong>Имя:</strong> {client.fullName || '—'}</div>
              <div><strong>Email:</strong> {client.email || '—'}</div>
              <div><strong>Телефон:</strong> {client.phone || '—'}</div>
            </div>
          )}
          <div style={{textAlign:'left', marginTop:'16px'}}>
            <h3>Заявки</h3>
            {requests.length > 0 ? (
              <ul>
                {requests.map((r) => (
                  <li key={r.requestId}>{r.code} ({r.status})</li>
                ))}
              </ul>
            ) : (
              <div style={{color:'#666'}}>Заявок пока нет</div>
            )}
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginTop:'12px' }}>
            <button onClick={() => navigate('/partners')} style={styles.button}>Назад</button>
          </div>
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
