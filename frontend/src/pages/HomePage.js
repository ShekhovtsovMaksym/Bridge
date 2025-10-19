import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  // Menu dictionary per role
  const menuDict = useMemo(() => ({
    USER: { labels: ['Account', 'Request', 'Partners', 'New'], icons: ['👤', '📝', '🤝', '🛒'] },
    SUPER_ADMIN: { labels: ['Account', 'Settings', 'Partners', 'Scan'], icons: ['👤', '⚙️', '🤝', '📷'] }
  }), []);

  useEffect(() => {
    let isMounted = true;
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          setRole('USER');
          setLoading(false);
          return;
        }
        const res = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!isMounted) return;
        const apiRole = res.data && res.data.role ? String(res.data.role).toUpperCase() : 'USER';
        setRole(apiRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER');
      } catch (e) {
        if (!isMounted) return;
        setError('Failed to load role. Showing default menu.');
        setRole('USER');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMe();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Decide labels and destinations based on role
  const labels = menuDict[role || 'USER'].labels;
  const icons = menuDict[role || 'USER'].icons;

  const destinations = role === 'SUPER_ADMIN'
    ? ['/account', '/settings', '/partners', '/scan']
    : ['/account', '/request', '/partners', '/new'];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.logo}>BRIDGE</h1>
        <h2 style={styles.title}>Home</h2>

        {loading ? (
          <div style={styles.skeletonGrid}>
            <div style={styles.skeletonTile} />
            <div style={styles.skeletonTile} />
            <div style={styles.skeletonTile} />
            <div style={styles.skeletonTile} />
          </div>
        ) : (
          <>
            {error && (
              <div style={styles.errorBanner}>{error}</div>
            )}
            <div style={styles.tilesGrid}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={styles.tile} onClick={() => handleNavigation(destinations[i])}>
                  <div style={styles.tileIcon}>{icons[i]}</div>
                  <div style={styles.tileLabel}>{labels[i]}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
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
    maxWidth: '600px',
    textAlign: 'center'
  },
  logo: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: '10px',
    letterSpacing: '4px'
  },
  title: {
    fontSize: '22px',
    color: '#333',
    marginBottom: '20px'
  },
  tilesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  tile: {
    backgroundColor: '#f5f5f5',
    padding: '40px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    ':hover': {
      backgroundColor: '#e3f2fd',
      borderColor: '#2196F3',
      transform: 'translateY(-4px)'
    }
  },
  tileIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  tileLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  skeletonTile: {
    backgroundColor: '#eee',
    height: '120px',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite'
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeeba',
    borderRadius: '4px',
    padding: '10px 12px',
    marginBottom: '16px',
    textAlign: 'left'
  },
  logoutButton: {
    padding: '12px 40px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
    fontWeight: 'bold'
  }
};

export default HomePage;
