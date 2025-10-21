import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function AdminQuotationPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const initialRequestId = query.get('requestId');
  const initialUserId = query.get('userId');

  const [requestId, setRequestId] = useState(initialRequestId || null);
  const [userId, setUserId] = useState(initialUserId || null);
  const [pendingIds, setPendingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [client, setClient] = useState(null);
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);

  // form fields
  const [insuranceAmount, setInsuranceAmount] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [packingPrice, setPackingPrice] = useState('');
  const [deliveryTimeOption, setDeliveryTimeOption] = useState('');
  const [comment, setComment] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const deliveryOptions = ['7 days', '10–12 days', '12 days', '15 days'];

  useEffect(() => {
    const init = async () => {
      setError(''); setMessage(''); setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // If no requestId but userId provided, get first pending id
        if (!requestId && userId) {
          const list = await axios.get(`/api/admin/partners/${userId}/requests`, { params: { markSeen: false }, headers: { Authorization: `Bearer ${token}` } });
          const pendings = (list.data || []).filter(r => r.status === 'PENDING_QUOTATION').map(r => r.requestId);
          setPendingIds(pendings);
          if (pendings.length > 0) {
            setRequestId(String(pendings[0]));
          } else {
            setError('Нет новых заявок');
          }
        }

        // If we have requestId, load its details
        const rid = requestId || (userId ? null : initialRequestId);
        if (rid) {
          const res = await axios.get(`/api/admin/requests/${rid}`, { headers: { Authorization: `Bearer ${token}` } });
          setRequest(res.data.request);
          setClient(res.data.client);
          setQuotation(res.data.quotation || null);
          if (res.data.client) setUserId(String(res.data.client.userId));

          // also load all pending for selector
          const list2 = await axios.get(`/api/admin/partners/${res.data.client.userId}/requests`, { params: { markSeen: false }, headers: { Authorization: `Bearer ${token}` } });
          const pend = (list2.data || []).filter(r => r.status === 'PENDING_QUOTATION').map(r => r.requestId);
          setPendingIds(pend);
        }
      } catch (e) {
        const msg = e.response?.data?.message || 'Не удалось загрузить данные';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRequestId, initialUserId, requestId]);

  const validate = () => {
    const errs = {};
    const f = (v) => (v === '' || v === null) ? NaN : Number(v);
    const ins = f(insuranceAmount);
    const del = f(deliveryPrice);
    const pack = f(packingPrice);
    if (isNaN(ins) || ins < 0) errs.insuranceAmount = 'Введите число ≥ 0';
    if (isNaN(del) || del < 0) errs.deliveryPrice = 'Введите число ≥ 0';
    if (isNaN(pack) || pack < 0) errs.packingPrice = 'Введите число ≥ 0';
    if (!deliveryTimeOption) errs.deliveryTimeOption = 'Выберите срок доставки';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onCreate = async () => {
    setMessage('');
    if (!validate()) return;
    try {
      const token = localStorage.getItem('token');
      const body = {
        requestId: Number(requestId),
        insuranceAmount: Number(insuranceAmount),
        deliveryPrice: Number(deliveryPrice),
        packingPrice: Number(packingPrice),
        deliveryTimeOption,
        comment: comment || null
      };
      const res = await axios.post('/api/admin/quotations', body, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 201) {
        setMessage('Просчёт отправлен пользователю');
        // reload pending list and switch to next
        const lst = await axios.get(`/api/admin/partners/${userId}/requests`, { params: { markSeen: false }, headers: { Authorization: `Bearer ${token}` } });
        const pend = (lst.data || []).filter(r => r.status === 'PENDING_QUOTATION').map(r => r.requestId);
        setPendingIds(pend);
        if (pend.length > 0) {
          setRequestId(String(pend[0]));
          // reset form
          setInsuranceAmount(''); setDeliveryPrice(''); setPackingPrice(''); setDeliveryTimeOption(''); setComment('');
        } else {
          // no more pending -> back to list
          navigate('/partners');
        }
      } else {
        setMessage('Не удалось отправить просчёт');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Ошибка отправки';
      setMessage(msg);
    }
  };

  const codeOf = (customerCode, uid) => {
    if (!customerCode) return String(uid);
    return customerCode.startsWith('CUST-') ? customerCode.substring(5) : customerCode;
  };

  if (loading) return <div style={styles.container}>Загрузка…</div>;

  if (error) return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.error}>{error}</div>
        <button style={styles.button} onClick={() => navigate('/partners')}>Назад</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>{client ? `Partner_${codeOf(client.customerCode, client.userId)}` : 'Просчёт заявки'}</h1>

        {pendingIds.length > 0 && (
          <div style={{ marginBottom: '12px', textAlign: 'left' }}>
            <label style={{ marginRight: '8px' }}>New request:</label>
            <select value={requestId || ''} onChange={(e) => setRequestId(e.target.value)}>
              {pendingIds.map((id) => (
                <option key={id} value={id}>SR-{id}</option>
              ))}
            </select>
          </div>
        )}

        {request && (
          <div style={styles.card}>
            <div><strong>Code:</strong> {request.code}</div>
            <div><strong>Description:</strong> {request.description}</div>
            <div><strong>Cost of goods:</strong> {request.costOfGoods}</div>
            <div><strong>Box:</strong> {request.boxPcs || '—'}</div>
            <div><strong>Volume:</strong> {request.volume || '—'}</div>
            <div><strong>Weight:</strong> {request.kg || '—'}</div>
            <div><strong>Packing type:</strong> {request.packingType || '—'}</div>
            <div><strong>Receipt city:</strong> {request.receiptCity || '—'}</div>
            <div><strong>Detailed location:</strong> {request.receiptDetails || '—'}</div>
            <div><strong>Product location:</strong> {request.productLocation || '—'}</div>
            <div><strong>Attachments:</strong> {Array.isArray(request.attachments) && request.attachments.length > 0 ? request.attachments.join(', ') : '—'}</div>
          </div>
        )}

        <div style={styles.form}>
          <div style={styles.row}>
            <label>Insurance amount</label>
            <input value={insuranceAmount} onChange={(e) => setInsuranceAmount(e.target.value)} placeholder="0" />
            {formErrors.insuranceAmount && <div style={styles.err}>{formErrors.insuranceAmount}</div>}
          </div>
          <div style={styles.row}>
            <label>Delivery price</label>
            <input value={deliveryPrice} onChange={(e) => setDeliveryPrice(e.target.value)} placeholder="0" />
            {formErrors.deliveryPrice && <div style={styles.err}>{formErrors.deliveryPrice}</div>}
          </div>
          <div style={styles.row}>
            <label>Packing price</label>
            <input value={packingPrice} onChange={(e) => setPackingPrice(e.target.value)} placeholder="0" />
            {formErrors.packingPrice && <div style={styles.err}>{formErrors.packingPrice}</div>}
          </div>
          <div style={styles.row}>
            <label>Delivery time</label>
            <select value={deliveryTimeOption} onChange={(e) => setDeliveryTimeOption(e.target.value)}>
              <option value="">Select…</option>
              {deliveryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {formErrors.deliveryTimeOption && <div style={styles.err}>{formErrors.deliveryTimeOption}</div>}
          </div>
          <div style={styles.row}>
            <label>Add text</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий" />
          </div>
        </div>

        {message && <div style={{ color: '#2e7d32', marginTop: '8px' }}>{message}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
          <button style={styles.primaryBtn} onClick={onCreate}>Create</button>
          <button style={styles.button} onClick={() => navigate('/partners')}>Назад</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  content: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '90%', maxWidth: '760px', textAlign:'center' },
  button: { padding: '12px 30px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '20px' },
  primaryBtn: { padding: '12px 30px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '20px' },
  card: { border: '1px solid #eee', background:'#fafafa', borderRadius: '6px', padding: '12px', textAlign:'left', marginTop:'12px' },
  form: { marginTop: '16px', textAlign: 'left' },
  row: { display:'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' },
  err: { color: '#b71c1c', fontSize: '12px' },
  error: { color: '#b71c1c', marginBottom: '12px' }
};

export default AdminQuotationPage;
