import React from 'react';
import { useNavigate } from 'react-router-dom';

function NewPage() {
  const navigate = useNavigate();

  const goPartners = () => navigate('/partners');
  const goHome = () => navigate('/home');

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>What’s New</h1>

        <div style={styles.card}>
          <div style={styles.badge}>NEW</div>
          <h2 style={styles.cardTitle}>Partners for USER</h2>
          <ul style={styles.list}>
            <li>Search SUPER_ADMIN partners by email or partner key (e.g., adm1).</li>
            <li>Add a partner to your list; duplicates are prevented with a clear message.</li>
            <li>Open partner details with mini-profile and a stub shipping history.</li>
          </ul>
          <button onClick={goPartners} style={styles.primaryBtn}>Open Partners</button>
        </div>

        <div style={styles.cardMuted}>
          <h3 style={{marginTop:0}}>More updates coming soon…</h3>
          <div style={{color:'#666'}}>We’ll post release notes here as new features roll out.</div>
        </div>

        <button onClick={goHome} style={styles.button}>
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
    width: '90%',
    maxWidth: '700px',
    textAlign: 'center'
  },
  card: {
    border: '1px solid #e0e0e0',
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '16px',
    position: 'relative'
  },
  cardMuted: {
    border: '1px dashed #ddd',
    background: '#fafafa',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '16px'
  },
  badge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    background: '#4CAF50',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '8px'
  },
  list: {
    marginTop: 0,
    marginBottom: '12px'
  },
  primaryBtn: {
    padding: '10px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  button: {
    padding: '12px 30px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  }
};

export default NewPage;
