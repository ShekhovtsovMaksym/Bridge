import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function ShipmentsNewPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const preselectedPartnerId = query.get('partnerId');

  const [partners, setPartners] = useState([]);
  const [partnerId, setPartnerId] = useState(preselectedPartnerId || '');
  const [description, setDescription] = useState('');
  const [kg, setKg] = useState('');
  const [boxPcs, setBoxPcs] = useState('');
  const [volume, setVolume] = useState('');
  const [costOfGoods, setCostOfGoods] = useState('');
  const [packingType, setPackingType] = useState('Not specified');
  const [productLocation, setProductLocation] = useState('');
  const [receiptCity, setReceiptCity] = useState('Moscow');
  const [receiptDetails, setReceiptDetails] = useState('');
  const [attachments, setAttachments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Received quotations (read-only for USER)
  const [myRequests, setMyRequests] = useState([]);
  const latestQuoted = useMemo(() => {
    const arr = (myRequests || []).filter(r => r.status === 'QUOTED');
    arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return arr[0] || null;
  }, [myRequests]);

  const hasPartners = partners.length > 0;
  const partnerLocked = !!preselectedPartnerId;

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/partners', { headers: { Authorization: `Bearer ${token}` } });
        const list = Array.isArray(res.data) ? res.data : [];
        setPartners(list);
        // ensure preselected is valid; otherwise clear
        if (preselectedPartnerId && !list.find(p => String(p.id) === String(preselectedPartnerId))) {
          setPartnerId('');
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadPartners();
  }, [preselectedPartnerId]);

  useEffect(() => {
    const loadMyRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get('/api/shipment-requests', { headers: { Authorization: `Bearer ${token}` } });
        setMyRequests(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        // ignore
      }
    };
    loadMyRequests();
  }, []);

  const validate = () => {
    const errs = {};
    if (!partnerId) errs.partnerId = 'Сначала выберите партнёра';
    if (!description || description.trim().length < 3 || description.trim().length > 500) {
      errs.description = 'Описание: 3–500 символов';
    }
    const kgNum = Number(kg);
    if (!kg || isNaN(kgNum) || kgNum <= 0) errs.kg = 'Вес должен быть числом > 0';
    const boxNum = boxPcs ? Number(boxPcs) : 1;
    if (boxPcs && (isNaN(boxNum) || !Number.isInteger(boxNum) || boxNum < 1)) errs.boxPcs = 'Места — целое число ≥ 1';
    const volNum = volume ? Number(volume) : 0;
    if (volume && (isNaN(volNum) || volNum < 0)) errs.volume = 'Объём — число ≥ 0';
    const cogNum = Number(costOfGoods);
    if (!costOfGoods || isNaN(cogNum) || cogNum <= 0) errs.costOfGoods = 'Стоимость товара должна быть > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setAttachments(files.map(f => f.name)); // mock: store filenames only
  };

  const submit = async () => {
    setMessage('');
    if (!validate()) return;
    try {
      const token = localStorage.getItem('token');
      const body = {
        partnerAdminId: Number(partnerId),
        description: description.trim(),
        kg: Number(kg),
        boxPcs: boxPcs ? Number(boxPcs) : null,
        volume: volume ? Number(volume) : null,
        costOfGoods: Number(costOfGoods),
        packingType: packingType === 'Not specified' ? null : packingType,
        productLocation: productLocation || null,
        receiptCity: receiptCity || null,
        receiptDetails: receiptDetails || null,
        attachments
      };
      const res = await axios.post('/api/shipment-requests', body, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 201) {
        setMessage('Запрос отправлен партнёру на просчёт');
        // Clear form except partner
        setDescription(''); setKg(''); setBoxPcs(''); setVolume(''); setCostOfGoods(''); setPackingType('Not specified'); setProductLocation(''); setReceiptCity('Moscow'); setReceiptDetails(''); setAttachments([]);
      } else {
        setMessage('Не удалось отправить запрос');
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Ошибка отправки';
      setMessage(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>Shipments → Add New Request</h1>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <>
            {!hasPartners && (
              <div style={styles.ctaBox}>
                <div>Сначала добавьте партнёра на странице Partners.</div>
                <button onClick={() => navigate('/partners')} style={styles.linkBtn}>Перейти к Partners</button>
              </div>
            )}

            {latestQuoted && latestQuoted.quotation && (
              <div style={styles.quoteBox}>
                <h3 style={{marginTop:0}}>Просчёт от партнёра</h3>
                <div style={{textAlign:'left', lineHeight:'1.8'}}>
                  <div><strong>Request:</strong> {latestQuoted.code}</div>
                  <div><strong>Insurance:</strong> {latestQuoted.quotation.insuranceAmount}</div>
                  <div><strong>Delivery price:</strong> {latestQuoted.quotation.deliveryPrice}</div>
                  <div><strong>Packing price:</strong> {latestQuoted.quotation.packingPrice}</div>
                  <div><strong>Delivery time:</strong> {latestQuoted.quotation.deliveryTimeOption}</div>
                  <div style={{marginTop:'6px'}}><strong>Shipping cost total ~ </strong> {Number(latestQuoted.quotation.insuranceAmount) + Number(latestQuoted.quotation.deliveryPrice) + Number(latestQuoted.quotation.packingPrice)}$</div>
                </div>
                <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                  <button disabled style={styles.grayBtn}>Not accepted</button>
                  <button disabled style={styles.grayBtn}>Create shipment</button>
                </div>
              </div>
            )}

            <div style={styles.formRow}>
              <label style={styles.label}>Partner *</label>
              <select
                disabled={!hasPartners || partnerLocked}
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                style={styles.input}
              >
                <option value="">-- Select partner --</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>
                    {(p.fullName || p.username)} — {p.email}
                  </option>
                ))}
              </select>
              {errors.partnerId && <div style={styles.error}>{errors.partnerId}</div>}
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textarea} rows={3} placeholder="Что отправляем?" />
              {errors.description && <div style={styles.error}>{errors.description}</div>}
            </div>

            <div style={styles.gridRow}>
              <div style={styles.formRow}>
                <label style={styles.label}>Kg *</label>
                <input value={kg} onChange={(e) => setKg(e.target.value)} type="number" min="0.001" step="0.001" style={styles.input} />
                {errors.kg && <div style={styles.error}>{errors.kg}</div>}
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Box Pcs</label>
                <input value={boxPcs} onChange={(e) => setBoxPcs(e.target.value)} type="number" min="1" step="1" style={styles.input} placeholder="1" />
                {errors.boxPcs && <div style={styles.error}>{errors.boxPcs}</div>}
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Volume</label>
                <input value={volume} onChange={(e) => setVolume(e.target.value)} type="number" min="0" step="0.001" style={styles.input} placeholder="0" />
                {errors.volume && <div style={styles.error}>{errors.volume}</div>}
              </div>
            </div>

            <div style={styles.gridRow}>
              <div style={styles.formRow}>
                <label style={styles.label}>Cost of goods *</label>
                <input value={costOfGoods} onChange={(e) => setCostOfGoods(e.target.value)} type="number" min="0.01" step="0.01" style={styles.input} />
                {errors.costOfGoods && <div style={styles.error}>{errors.costOfGoods}</div>}
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Type of packing</label>
                <select value={packingType} onChange={(e) => setPackingType(e.target.value)} style={styles.input}>
                  <option>Carton</option>
                  <option>Bubble wrap</option>
                  <option>Wooden crate</option>
                  <option>Pallet</option>
                  <option>Not specified</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>Product location</label>
              <input value={productLocation} onChange={(e) => setProductLocation(e.target.value)} type="text" style={styles.input} />
            </div>

            <div style={styles.gridRow}>
              <div style={styles.formRow}>
                <label style={styles.label}>Receipt city</label>
                <select value={receiptCity} onChange={(e) => setReceiptCity(e.target.value)} style={styles.input}>
                  <option>Moscow</option>
                </select>
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Detailed location of receipt</label>
                <input value={receiptDetails} onChange={(e) => setReceiptDetails(e.target.value)} type="text" style={styles.input} />
              </div>
            </div>

            <div style={styles.formRow}>
              <label style={styles.label}>Add Image (mock)</label>
              <input type="file" multiple onChange={onFiles} />
              {attachments.length > 0 && (
                <div style={{fontSize:'12px', color:'#666'}}>Файлы: {attachments.join(', ')}</div>
              )}
            </div>

            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'10px'}}>
              <button disabled={!hasPartners} onClick={submit} style={styles.primaryBtn}>Request</button>
              <button onClick={() => navigate('/home')} style={styles.button}>Back to Home</button>
            </div>

            {message && <div style={styles.info}>{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5'
  },
  content: {
    backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '95%', maxWidth: '800px', textAlign: 'center'
  },
  formRow: { textAlign:'left', marginBottom: '12px' },
  label: { display:'block', fontWeight: 600, marginBottom: '6px' },
  input: { width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'4px' },
  textarea: { width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'4px' },
  gridRow: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' },
  error: { color:'#b71c1c', fontSize:'12px', marginTop:'4px' },
  ctaBox: { border:'1px dashed #ddd', background:'#fafafa', padding:'12px', borderRadius:'6px', marginBottom:'12px' },
  linkBtn: { padding:'8px 12px', background:'#2196F3', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', marginTop:'8px' },
  primaryBtn: { padding:'10px 16px', background:'#4CAF50', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' },
  button: { padding:'10px 16px', background:'#9e9e9e', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' },
  info: { marginTop:'12px', color:'#555' }
};

export default ShipmentsNewPage;
