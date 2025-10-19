import React from 'react';
import { useUser } from '../store/UserStore';

function CopyText({ text }) {
  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text || '');
    } catch (_) {
      // ignore copy errors
    }
  };
  return (
    <button onClick={copy} title="Копировать" style={styles.copyBtn} aria-label="Копировать">
      📋
    </button>
  );
}

function InfoBar() {
  const { data, loading, error } = useUser();

  const role = data?.role ? String(data.role) : '';
  const id = data?.id;
  const username = data?.username;
  const email = data?.email;
  const customerCode = data?.customerCode;

  const numberDisplay = customerCode && customerCode.trim() !== ''
    ? customerCode
    : (id != null ? `User-${id}` : '—');

  const loginDisplay = (username && username.trim() !== '') ? username : (email || '—');

  return (
    <div style={styles.wrapper}>
      {loading ? (
        <div style={styles.skeleton}>
          <div style={styles.skelBlock} />
          <div style={styles.dot}>·</div>
          <div style={styles.skelBlock} />
          <div style={styles.dot}>·</div>
          <div style={styles.skelBlock} />
        </div>
      ) : (
        <div style={styles.inner}>
          <div style={styles.item}><span style={styles.label}>Роль:</span> <span style={styles.value}>{role || '—'}</span></div>
          <div style={styles.dot}>·</div>
          <div style={styles.item}><span style={styles.label}>№:</span> <span style={styles.value}>{numberDisplay}</span>{numberDisplay !== '—' && <CopyText text={numberDisplay} />}</div>
          <div style={styles.dot}>·</div>
          <div style={styles.item}><span style={styles.label}>Логин:</span> <span style={styles.value}>{loginDisplay}</span>{loginDisplay !== '—' && <CopyText text={loginDisplay} />}</div>
          {error && <div style={styles.errorNote} title={error}>Не удалось обновить данные, пробуем снова…</div>}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderBottom: '1px solid #e6e6ef',
    padding: '6px 10px',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    color: '#333'
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px'
  },
  label: { color: '#666' },
  value: { fontWeight: 600 },
  dot: { color: '#aaa' },
  copyBtn: {
    marginLeft: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },
  skeleton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  skelBlock: {
    width: '120px',
    height: '12px',
    background: 'linear-gradient(90deg, #eee, #f5f5f5, #eee)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'pulse 1.6s infinite'
  },
  errorNote: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#a67c00'
  }
};

export default InfoBar;
