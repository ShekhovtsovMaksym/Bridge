import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../store/UserStore';

function PartnersPage() {
  const navigate = useNavigate();
  const { data: me } = useUser();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadList = async () => {
      try {
        const token = localStorage.getItem('token');
        if (me?.role === 'SUPER_ADMIN') {
          const res = await axios.get('/api/admin/partners', { headers: { Authorization: `Bearer ${token}` } });
          setList(Array.isArray(res.data) ? res.data : []);
        } else {
          const res = await axios.get('/api/partners', { headers: { Authorization: `Bearer ${token}` } });
          setList(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [me]);

  const doSearch = async () => {
    setMessage('');
    setSearchResult(null);
    const q = (query || '').trim();
    if (!q) return;
    try {
      const token = localStorage.getItem('token');
      const params = q.includes('@') ? { email: q } : { partnerCode: q };
      const res = await axios.get('/api/partners/find', { params, headers: { Authorization: `Bearer ${token}` } });
      setSearchResult({ query: q, mini: res.data });
    } catch (e) {
      setMessage('Not found');
    }
  };

  const doAdd = async () => {
    if (!searchResult) return;
    try {
      const token = localStorage.getItem('token');
      const q = searchResult.query;
      const body = q.includes('@') ? { email: q } : { partnerCode: q };
      const res = await axios.post('/api/partners/link', body, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(res.data && res.data.message ? res.data.message : 'Partner added');
      // refresh list
      const lst = await axios.get('/api/partners', { headers: { Authorization: `Bearer ${token}` } });
      setList(Array.isArray(lst.data) ? lst.data : []);
      setSearchResult(null);
      setQuery('');
    } catch (e) {
      const status = e.response && e.response.status;
      const msg = e.response && e.response.data && e.response.data.message;
      if (status === 404) setMessage('Not found');
      else if (status === 409) setMessage('Already added');
      else setMessage(msg || 'Failed to add');
    }
  };

  const codeOf = (customerCode, id) => {
    if (!customerCode) return String(id);
    return customerCode.startsWith('CUST-') ? customerCode.substring(5) : customerCode;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>{me?.role === 'SUPER_ADMIN' ? 'Партнёры' : 'Partners'}</h1>

        {me?.role === 'SUPER_ADMIN' ? (
          <>
            {loading ? (
              <div>Загрузка…</div>
            ) : (
              <div style={styles.list}>
                {list.length === 0 && <div style={styles.empty}>Нет клиентов</div>}
                {list.map(c => (
                  <div key={c.userId} style={styles.item} onClick={() => navigate(`/partners/${c.userId}`, { state: { client: c } })}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={styles.itemTitle}>Partner_{codeOf(c.customerCode, c.userId)}</div>
                        <div style={styles.itemSub}>{c.fullName || '—'} — {c.email || '—'}</div>
                      </div>
                      {c.unreadCount > 0 && (
                        <div
                          title="Новые заявки"
                          style={styles.badge}
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/quotation?userId=${c.userId}`); }}
                        >{c.unreadCount}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/home')} style={styles.button}>
              Назад
            </button>
          </>
        ) : (
          <>
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="Email or partner key (e.g., adm1)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.input}
              />
              <button onClick={doSearch} style={styles.searchBtn}>Search</button>
              {searchResult && (
                <button onClick={doAdd} title="Add partner" style={styles.addBtn}>＋</button>
              )}
            </div>
            {message && <div style={styles.info}>{message}</div>}

            {searchResult && (
              <div style={styles.foundCard}>
                <div style={styles.foundTitle}>Result:</div>
                <div style={styles.foundText}>{searchResult.query}</div>
                <div style={styles.foundHint}>Press Add to link; if not found, you will see a message.</div>
              </div>
            )}

            <h3 style={{textAlign:'left'}}>My partners</h3>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <div style={styles.list}>
                {list.length === 0 && <div style={styles.empty}>No partners yet</div>}
                {list.map(p => (
                  <div key={p.id} style={styles.item} onClick={() => navigate(`/partners/${p.id}`)}>
                    <div style={styles.itemTitle}>Partner_{codeOf(p.customerCode, p.id)}</div>
                    <div style={styles.itemSub}>{p.fullName || p.username} — {p.email}</div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate('/home')} style={styles.button}>
              Back to Home
            </button>
          </>
        )}
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
    width: '90%',
    maxWidth: '700px',
    textAlign: 'center'
  },
  searchRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  input: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
  searchBtn: { padding: '10px 16px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  addBtn: { padding: '10px 14px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  info: { marginBottom: '10px', color: '#555' },
  foundCard: { border: '1px solid #e0e0e0', padding: '10px', borderRadius: '6px', marginBottom: '10px', textAlign:'left' },
  foundTitle: { fontWeight: 600 },
  foundText: { },
  foundHint: { fontSize: '12px', color: '#777' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', marginBottom: '16px' },
  empty: { color: '#888' },
  item: { border: '1px solid #eee', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', background:'#fafafa' },
  itemTitle: { fontWeight: 700 },
  itemSub: { color: '#666', fontSize: '14px' },
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

export default PartnersPage;
