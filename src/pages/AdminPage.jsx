import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function api(path, options = {}, token = '') {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  return fetch(`${API}/admin${path}`, { headers, ...options }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || 'Request failed');
    return data;
  });
}

/* ────── Reusable Table ────── */
function DataTable({ columns, rows, onEdit, onDelete, idKey = '_id' }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[idKey] || row.id}>
              {columns.map(c => (
                <td key={c.key}>
                  {c.key === 'image' && row[c.key] ? <img src={row[c.key]} alt="" className="admin-thumb" /> : c.key === 'lineItems' && Array.isArray(row[c.key]) ? row[c.key].map(i => `${i.name} (x${i.quantity})`).join(', ') : String(row[c.key] ?? '')}
                </td>
              ))}
              <td className="admin-actions-cell">
                {onEdit && <button className="admin-btn-sm edit" onClick={() => onEdit(row)}>✏️</button>}
                {onDelete && <button className="admin-btn-sm del" onClick={() => onDelete(row[idKey] || row.id)}>🗑️</button>}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="admin-empty">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ────── Form Modal ────── */
function FormModal({ title, fields, initial, onSubmit, onClose }) {
  const [values, setValues] = useState(initial || {});
  // Track one File object per file-type field, keyed by field name
  const [files, setFiles] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (k !== 'image' && k !== 'image2' && k !== 'image3' && k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt')
        fd.append(k, v);
    });
    // Append each uploaded file under its own field name
    Object.entries(files).forEach(([fieldName, file]) => { if (file) fd.append(fieldName, file); });
    onSubmit(fd);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <form className="admin-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{title}</h3>
        {fields.map(f => (
          <div key={f.key} className="admin-field">
            <label>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea value={values[f.key] || ''} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))} rows={3} />
            ) : f.type === 'file' ? (
              <input type="file" accept="image/*" onChange={e => setFiles(p => ({ ...p, [f.key]: e.target.files[0] }))} />
            ) : f.type === 'select' ? (
              <select value={values[f.key] || ''} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))} required={f.required}>
                <option value="">Select...</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type || 'text'} value={values[f.key] || ''} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))} required={f.required} />
            )}
          </div>
        ))}
        <div className="admin-modal-actions">
          <button type="submit" className="admin-btn primary">Save</button>
          <button type="button" className="admin-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* ────── Bookings with Doctor Filter ────── */
function BookingsWithFilter({ rows, columns, onEdit, token }) {
  const [filter, setFilter] = React.useState('');
  const [allDoctors, setAllDoctors] = React.useState([]);

  // Fetch all doctors so the filter shows every doctor even with no bookings
  React.useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        const names = (res.doctors || []).map(d => d.name).filter(Boolean);
        // Also include any doctor names found in bookings that may no longer be in the list
        const fromBookings = rows.map(r => r.doctorName).filter(Boolean);
        const merged = [...new Set([...names, ...fromBookings])].sort();
        setAllDoctors(merged);
      })
      .catch(() => {
        // Fallback: derive from bookings only
        setAllDoctors([...new Set(rows.map(r => r.doctorName).filter(Boolean))].sort());
      });
  }, [token, rows]);

  const filtered = filter ? rows.filter(r => r.doctorName === filter) : rows;

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Filter by Doctor:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 14, minWidth: 200 }}
        >
          <option value="">All Doctors ({rows.length} bookings)</option>
          {allDoctors.map(d => {
            const count = rows.filter(r => r.doctorName === d).length;
            return <option key={d} value={d}>{d} ({count})</option>;
          })}
        </select>
        {filter && <button className="admin-btn" onClick={() => setFilter('')} style={{ fontSize: 12 }}>✕ Clear</button>}
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{filtered.length} booking(s) shown</span>
      </div>
      <DataTable columns={columns} rows={filtered} onEdit={onEdit} />
    </div>
  );
}


/* ────── Site Pages Editor ────── */
function SitePagesEditor({ token, onError }) {
  const SLUGS = [
    { slug: 'about', label: '🌿 About Us' },
    { slug: 'contact', label: '📞 Contact Us' },
    { slug: 'tnc', label: '📋 Terms & Conditions' },
  ];
  const [pages, setPages] = React.useState({});
  const [saving, setSaving] = React.useState('');

  React.useEffect(() => {
    SLUGS.forEach(({ slug }) => {
      api(`/sitePages/${slug}`, {}, token)
        .then(res => setPages(p => ({ ...p, [slug]: res.sitePage })))
        .catch(onError);
    });
  }, [token]);

  const save = async (slug) => {
    setSaving(slug);
    try {
      await api(
        `/sitePages/${slug}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: pages[slug]?.title || '',
            content: pages[slug]?.content || '',
          }),
        },
        token
      );
      alert(`"${pages[slug]?.title || slug}" page saved successfully!`);
    } catch (err) { onError(err); }
    finally { setSaving(''); }
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {SLUGS.map(({ slug, label }) => (
        <div key={slug} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 24, background: '#fff' }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>{label}</h3>
          <div className="admin-field">
            <label>Page Title</label>
            <input
              value={pages[slug]?.title || ''}
              onChange={e => setPages(p => ({ ...p, [slug]: { ...p[slug], title: e.target.value } }))}
            />
          </div>
          <div className="admin-field">
            <label>Content (plain text / line breaks supported)</label>
            <textarea
              rows={10}
              value={pages[slug]?.content || ''}
              onChange={e => setPages(p => ({ ...p, [slug]: { ...p[slug], content: e.target.value } }))}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <button
            className="admin-btn primary"
            onClick={() => save(slug)}
            disabled={saving === slug}
            style={{ marginTop: 8 }}
          >
            {saving === slug ? 'Saving…' : 'Save Page'}
          </button>
        </div>
      ))}
    </div>
  );
}

const TABS = ['dashboard', 'blogs', 'products', 'podcasts', 'doctors', 'productSlides', 'therapies', 'therapyPackages', 'orders', 'bookings', 'therapyBookings', 'users', 'feedbacks', 'sitePages'];


export default function AdminPage() {
  const toast = useToast();
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'create'|'edit', entity, initial }
  const [stats, setStats] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setToken(res.token);
      localStorage.setItem('admin_token', res.token);
      toast.success('Admin login successful');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const logout = useCallback(() => {
    setToken('');
    localStorage.removeItem('admin_token');
  }, []);

  const handleError = useCallback((err) => {
    if (err.message.toLowerCase().includes('token')) {
      logout();
      toast.error('Session expired. Please log in again.');
    } else {
      toast.error(err.message);
    }
  }, [logout, toast]);

  /* Map frontend entity name → API path (productSlides is a view of heroSlides) */
  const entityToApi = (entity) => entity === 'productSlides' ? 'heroSlides' : entity;

  const load = useCallback(async (entity) => {
    const apiEntity = entityToApi(entity);
    setLoading(true);
    try {
      const res = await api(`/${apiEntity}`, {}, token);
      setData(p => ({ ...p, [apiEntity]: res[apiEntity] || [], [entity]: res[apiEntity] || [] }));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [token, handleError]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api('/dashboard', {}, token);
      setStats(res);
    } catch (err) { handleError(err); }
  }, [token, handleError]);

  useEffect(() => {
    if (!token) return;
    if (tab === 'dashboard') { loadStats(); return; }
    load(tab);
  }, [tab, token, load, loadStats]);

  const handleCreate = async (entity, formData) => {
    const apiEntity = entityToApi(entity);
    try {
      await api(`/${apiEntity}`, { method: 'POST', body: formData }, token);
      toast.success(`${entity.replace(/([A-Z])/g, ' $1').toLowerCase()} created`);
      setModal(null);
      load(apiEntity);
    } catch (err) { handleError(err); }
  };

  const handleUpdate = async (entity, id, formData) => {
    const apiEntity = entityToApi(entity);
    try {
      await api(`/${apiEntity}/${id}`, { method: 'PUT', body: formData }, token);
      toast.success(`${entity.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`);
      setModal(null);
      load(apiEntity);
    } catch (err) { handleError(err); }
  };

  const handleDelete = async (entity, id) => {
    const apiEntity = entityToApi(entity);
    if (!confirm('Delete this item?')) return;
    try {
      await api(`/${apiEntity}/${id}`, { method: 'DELETE' }, token);
      toast.success(`Deleted`);
      load(apiEntity);
    } catch (err) { handleError(err); }
  };

  /* ── LOGIN SCREEN ── */
  if (!token) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-login-icon">🔐</div>
          <h1>Admin Panel</h1>
          <p>Nouryum Administration</p>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="admin-btn primary full">Login</button>
        </form>
      </main>
    );
  }

  /* ── Field configs ── */
  const blogFields = [
    { key: 'title', label: 'Title', required: true },
    { key: 'excerpt', label: 'Excerpt' },
    { key: 'body', label: 'Body', type: 'textarea' },
    { key: 'date', label: 'Date' },
    { key: 'tags', label: 'Tags (comma-separated)' },
    { key: 'image', label: 'Thumbnail', type: 'file' },
  ];
  const productFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'category', label: 'Category' },
    { key: 'priceInr', label: 'Selling Price (₹)', type: 'number', required: true },
    { key: 'originalPrice', label: 'MRP / Original Price (₹)', type: 'number' },
    { key: 'discountPercent', label: 'Discount %', type: 'number' },
    { key: 'stock', label: 'Stock', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)' },
    { key: 'packOffers', label: 'Pack Offers (JSON: [{quantity,price,label}])', type: 'textarea' },
    { key: 'image', label: 'Primary Image', type: 'file' },
    { key: 'image2', label: 'Image 2', type: 'file' },
    { key: 'image3', label: 'Image 3', type: 'file' },
  ];
  const doctorFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'qualifications', label: 'Qualifications', required: true },
    { key: 'specialization', label: 'Specialization' },
    { key: 'yearsExperience', label: 'Years Experience', type: 'number' },
    { key: 'consultationFee', label: 'Fee (₹)', type: 'number' },
    { key: 'image', label: 'Photo', type: 'file' },
  ];
  const therapyFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'durationMinutes', label: 'Duration (Mins)', type: 'number' },
    { key: 'priceInr', label: 'Price (₹)', type: 'number' },
    { key: 'bestFor', label: 'Best For (comma-separated)' },
  ];
  const therapyPackageFields = [
    { key: 'pkgId', label: 'Package ID', required: true },
    { key: 'title', label: 'Title', required: true },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'durationDays', label: 'Duration (Days)', type: 'number' },
    { key: 'priceInr', label: 'Price (₹)', type: 'number' },
    { key: 'theme', label: 'Theme (e.g. pcos, detox)' },
    { key: 'includes', label: 'Includes (JSON Array String)', type: 'textarea' },
    { key: 'extras', label: 'Extras (comma-separated)', type: 'textarea' },
  ];
  const heroSlideFields = [
    { key: 'type', label: 'Type', type: 'select', options: ['hero', 'product'] },
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'label', label: 'Product Label (shown on slide)' },
    { key: 'order', label: 'Display Order', type: 'number' },
    { key: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
    { key: 'image', label: 'Slide Image', type: 'file', required: true },
  ];
  const orderEditFields = [
    { key: 'status', label: 'Order Status', type: 'select', options: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
    { key: 'shipmentStatus', label: 'Shipment Tracking', type: 'textarea' }
  ];
  const bookingEditFields = [
    { key: 'status', label: 'Booking Status', type: 'select', options: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] }
  ];
  const therapyBookingEditFields = [
    { key: 'status', label: 'Booking Status', type: 'select', options: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] }
  ];

  const blogCols = [
    { key: 'title', label: 'Title' }, { key: 'date', label: 'Date' }, { key: 'image', label: 'Image' }
  ];
  const productCols = [
    { key: 'name', label: 'Name' }, { key: 'category', label: 'Category' },
    { key: 'priceInr', label: 'Price' }, { key: 'stock', label: 'Stock' }, { key: 'image', label: 'Image' }
  ];
  const doctorCols = [
    { key: 'name', label: 'Name' }, { key: 'specialization', label: 'Specialization' },
    { key: 'consultationFee', label: 'Fee' }, { key: 'image', label: 'Photo' }
  ];
  const heroSlideCols = [
    { key: 'type', label: 'Type' },
    { key: 'title', label: 'Title' },
    { key: 'label', label: 'Label' },
    { key: 'order', label: 'Order' },
    { key: 'isActive', label: 'Active' },
    { key: 'image', label: 'Image' }
  ];
  const therapyCols = [
    { key: 'name', label: 'Name' }, { key: 'durationMinutes', label: 'Duration (m)' },
    { key: 'priceInr', label: 'Price' }
  ];
  const therapyPackageCols = [
    { key: 'title', label: 'Title' }, { key: 'theme', label: 'Theme' },
    { key: 'durationDays', label: 'Days' }, { key: 'priceInr', label: 'Price' }
  ];
  const orderCols = [
    { key: '_id', label: 'ID' }, { key: 'customerName', label: 'Customer' }, { key: 'contactNumber', label: 'Phone' },
    { key: 'lineItems', label: 'Products' },
    { key: 'address', label: 'Address' }, { key: 'pincode', label: 'Pincode' },
    { key: 'totalInr', label: 'Total' }, { key: 'status', label: 'Status' }
  ];
  const userCols = [
    { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
    { key: 'prakriti', label: 'Prakriti' }, { key: 'weightGoal', label: 'Goal' }, { key: 'authProvider', label: 'Auth' }
  ];
  const bookingCols = [
    { key: 'customerName', label: 'Customer' }, { key: 'customerPhone', label: 'Phone' },
    { key: 'customerEmail', label: 'Email' }, { key: 'doctorName', label: 'Doctor' },
    { key: 'date', label: 'Date' }, { key: 'slot', label: 'Slot' }, { key: 'status', label: 'Status' }
  ];
  const therapyBookingCols = [
    { key: 'customerName', label: 'Customer' }, { key: 'customerEmail', label: 'Email' },
    { key: 'customerPhone', label: 'Phone' }, { key: 'address', label: 'Address' }, { key: 'packageName', label: 'Package' },
    { key: 'therapyName', label: 'Therapy' }, { key: 'preferredDate', label: 'Date' },
    { key: 'status', label: 'Status' }
  ];
  const podcastFields = [
    { key: 'title', label: 'Title', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'youtubeUrl', label: 'YouTube URL (watch, short, or embed)', required: true },
    { key: 'order', label: 'Display Order', type: 'number' },
    { key: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
  ];
  const podcastCols = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'youtubeUrl', label: 'YouTube Embed URL' },
    { key: 'order', label: 'Order' },
    { key: 'isActive', label: 'Active' },
  ];
  const feedbackCols = [
    { key: 'name', label: 'Name' }, { key: 'rating', label: 'Rating' }, { key: 'comment', label: 'Comment' }
  ];

  return (
    <main className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>⚙️</span>
          <h2>Nouryum Admin</h2>
        </div>
        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t} className={`admin-nav-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'dashboard' && '📊'} {t === 'blogs' && '📝'} {t === 'products' && '🛒'}
              {t === 'heroSlides' && '🎞️'}
              {t === 'doctors' && '👨‍⚕️'} {t === 'therapies' && '🧘'} {t === 'therapyPackages' && '🏷️'}
              {t === 'orders' && '📦'} {t === 'users' && '👥'}
              {t === 'bookings' && '📅'} {t === 'therapyBookings' && '📆'} {t === 'feedbacks' && '💬'}
              {t === 'podcasts' && '🎙️'}
              {t === 'productSlides' && '🖼️'}
              <span>{t === 'productSlides' ? 'Product Slides' : t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1')}</span>
            </button>
          ))}
        </nav>
        <button className="admin-btn logout" onClick={logout}>Logout</button>
      </aside>

      {/* Content */}
      <section className="admin-content">
        <header className="admin-header">
          <h1>{tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}</h1>
          {['blogs', 'products', 'podcasts', 'doctors', 'heroSlides', 'productSlides', 'therapies', 'therapyPackages'].includes(tab) && (
            <button className="admin-btn primary" onClick={() => setModal({ type: 'create', entity: tab })}>
              + Add {tab}
            </button>
          )}
        </header>

        {loading && <p className="admin-loading">Loading...</p>}

        {/* Dashboard */}
        {tab === 'dashboard' && stats && (
          <div className="admin-stats-grid">
            {[
              { label: 'Blogs', value: stats.blogCount, icon: '📝' },
              { label: 'Products', value: stats.productCount, icon: '🛒' },
              { label: 'Doctors', value: stats.doctorCount, icon: '👨‍⚕️' },
              { label: 'Orders', value: stats.orderCount, icon: '📦' },
              { label: 'Users', value: stats.userCount, icon: '👥' },
              { label: 'Bookings', value: stats.bookingCount, icon: '📅' },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <span className="admin-stat-icon">{s.icon}</span>
                <div>
                  <h3>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        {tab === 'blogs' && <DataTable columns={blogCols} rows={data.blogs || []}
          onEdit={r => setModal({ type: 'edit', entity: 'blogs', initial: r })}
          onDelete={id => handleDelete('blogs', id)} />}

        {tab === 'products' && <DataTable columns={productCols} rows={data.products || []}
          onEdit={r => setModal({ type: 'edit', entity: 'products', initial: r })}
          onDelete={id => handleDelete('products', id)} />}

        {tab === 'doctors' && <DataTable columns={doctorCols} rows={data.doctors || []}
          onEdit={r => setModal({ type: 'edit', entity: 'doctors', initial: r })}
          onDelete={id => handleDelete('doctors', id)} />}

        {tab === 'heroSlides' && <DataTable columns={heroSlideCols} rows={data.heroSlides || []}
          onEdit={r => setModal({ type: 'edit', entity: 'heroSlides', initial: { ...r, isActive: String(r.isActive ?? true) } })}
          onDelete={id => handleDelete('heroSlides', id)} />}

        {tab === 'productSlides' && <DataTable columns={heroSlideCols} rows={(data.heroSlides || []).filter(s => s.type === 'product')}
          onEdit={r => setModal({ type: 'edit', entity: 'productSlides', initial: { ...r, isActive: String(r.isActive ?? true) } })}
          onDelete={id => handleDelete('heroSlides', id)} />}
          
        {tab === 'therapies' && <DataTable columns={therapyCols} rows={data.therapies || []}
          onEdit={r => setModal({ type: 'edit', entity: 'therapies', initial: r })}
          onDelete={id => handleDelete('therapies', id)} />}

        {tab === 'therapyPackages' && <DataTable columns={therapyPackageCols} rows={data.therapyPackages || []}
          onEdit={r => setModal({ type: 'edit', entity: 'therapyPackages', initial: r })}
          onDelete={id => handleDelete('therapyPackages', id)} />}

        {tab === 'orders' && <DataTable columns={orderCols} rows={data.orders || []}
          onEdit={r => setModal({ type: 'edit', entity: 'orders', initial: r })} />}
          
        {tab === 'bookings' && (
          <BookingsWithFilter
            rows={data.bookings || []}
            columns={bookingCols}
            token={token}
            onEdit={r => setModal({ type: 'edit', entity: 'bookings', initial: r })}
          />
        )}
          
        {tab === 'therapyBookings' && <DataTable columns={therapyBookingCols} rows={data.therapyBookings || []}
          onEdit={r => setModal({ type: 'edit', entity: 'therapyBookings', initial: r })} />}

        {tab === 'users' && <DataTable columns={userCols} rows={data.users || []} />}
        {tab === 'feedbacks' && <DataTable columns={feedbackCols} rows={data.feedbacks || []} />}
        {tab === 'sitePages' && <SitePagesEditor token={token} onError={handleError} />}
        {tab === 'podcasts' && <DataTable columns={podcastCols} rows={data.podcasts || []}
          onEdit={r => setModal({ type: 'edit', entity: 'podcasts', initial: { ...r, isActive: String(r.isActive ?? true) } })}
          onDelete={id => handleDelete('podcasts', id)} />}
      </section>

      {/* MODAL */}
      {modal && modal.type === 'create' && modal.entity === 'podcasts' && (
        <FormModal title="New Podcast" fields={podcastFields} initial={{ isActive: 'true', order: 0 }} onClose={() => setModal(null)}
          onSubmit={fd => {
            const body = Object.fromEntries(fd.entries());
            api('/podcasts', { method: 'POST', body: JSON.stringify(body) }, token)
              .then(() => { toast.success('podcast created'); setModal(null); load('podcasts'); })
              .catch(handleError);
          }} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'podcasts' && (
        <FormModal title="Edit Podcast" fields={podcastFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => {
            const body = Object.fromEntries(fd.entries());
            api(`/podcasts/${modal.initial._id || modal.initial.id}`, { method: 'PUT', body: JSON.stringify(body) }, token)
              .then(() => { toast.success('podcast updated'); setModal(null); load('podcasts'); })
              .catch(handleError);
          }} />
      )}
      {modal && modal.type === 'create' && modal.entity === 'blogs' && (
        <FormModal title="New Blog" fields={blogFields} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('blogs', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'blogs' && (
        <FormModal title="Edit Blog" fields={blogFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('blogs', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'create' && modal.entity === 'products' && (
        <FormModal title="New Product" fields={productFields} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('products', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'products' && (
        <FormModal title="Edit Product" fields={productFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('products', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'create' && modal.entity === 'doctors' && (
        <FormModal title="New Doctor" fields={doctorFields} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('doctors', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'doctors' && (
        <FormModal title="Edit Doctor" fields={doctorFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('doctors', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'create' && modal.entity === 'heroSlides' && (
        <FormModal title="New Hero Slide" fields={heroSlideFields} initial={{ isActive: 'true', order: 0 }} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('heroSlides', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'heroSlides' && (
        <FormModal title="Edit Hero Slide" fields={heroSlideFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('heroSlides', modal.initial._id || modal.initial.id, fd)} />
      )}
      {/* Product Slides (type=product) — uses heroSlides API but always sets type=product */}
      {modal && modal.type === 'create' && modal.entity === 'productSlides' && (
        <FormModal
          title="🖼️ New Product Slide"
          fields={[
            { key: 'label', label: 'Product Label (shown on slide, e.g. "Natural Oils")', required: true },
            { key: 'order', label: 'Display Order', type: 'number' },
            { key: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
            { key: 'image', label: 'Slide Image', type: 'file', required: true },
          ]}
          initial={{ isActive: 'true', order: 0 }}
          onClose={() => setModal(null)}
          onSubmit={fd => { fd.append('type', 'product'); handleCreate('heroSlides', fd); }}
        />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'productSlides' && (
        <FormModal
          title="🖼️ Edit Product Slide"
          fields={[
            { key: 'label', label: 'Product Label (shown on slide)', required: true },
            { key: 'order', label: 'Display Order', type: 'number' },
            { key: 'isActive', label: 'Active', type: 'select', options: ['true', 'false'] },
            { key: 'image', label: 'Slide Image (leave blank to keep existing)', type: 'file' },
          ]}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSubmit={fd => { fd.append('type', 'product'); handleUpdate('heroSlides', modal.initial._id || modal.initial.id, fd); }}
        />
      )}
      {modal && modal.type === 'create' && modal.entity === 'therapies' && (
        <FormModal title="New Therapy" fields={therapyFields} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('therapies', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'therapies' && (
        <FormModal title="Edit Therapy" fields={therapyFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('therapies', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'create' && modal.entity === 'therapyPackages' && (
        <FormModal title="New Therapy Package" fields={therapyPackageFields} onClose={() => setModal(null)}
          onSubmit={fd => handleCreate('therapyPackages', fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'therapyPackages' && (
        <FormModal title="Edit Therapy Package" fields={therapyPackageFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('therapyPackages', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'orders' && (
        <FormModal title="Edit Order Status" fields={orderEditFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('orders', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'bookings' && (
        <FormModal title="Edit Booking Status" fields={bookingEditFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('bookings', modal.initial._id || modal.initial.id, fd)} />
      )}
      {modal && modal.type === 'edit' && modal.entity === 'therapyBookings' && (
        <FormModal title="Edit Therapy Booking Status" fields={therapyBookingEditFields} initial={modal.initial} onClose={() => setModal(null)}
          onSubmit={fd => handleUpdate('therapyBookings', modal.initial._id || modal.initial.id, fd)} />
      )}
    </main>
  );
}
