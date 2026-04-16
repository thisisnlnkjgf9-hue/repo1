import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import NavTabs from '../components/NavTabs';

export default function ProfilePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [uploadedReports, setUploadedReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [therapyBookings, setTherapyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical-reports');
  const [reportName, setReportName] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

  const fetchProfileData = async () => {
    try {
      const userRes = await api.getMe();
      setProfile(userRes.user);

      if (userRes.user?.id || userRes.user?.userId) {
        const userId = userRes.user.id || userRes.user.userId;
        const [ordersRes, bookingsRes, reportsRes] = await Promise.all([
          api.getOrders(userId).catch(() => ({ orders: [] })),
          api.getBookings(userId).catch(() => ({ bookings: [] })),
          api.getUserReports(userId).catch(() => ({ reports: [], uploadedReports: [], assessments: [], therapyBookings: [] }))
        ]);

        setOrders(ordersRes.orders || []);
        setBookings(bookingsRes.bookings || []);
        setReports(reportsRes.reports || []);
        setUploadedReports(reportsRes.uploadedReports || []);
        setAssessments(reportsRes.assessments || []);
        setTherapyBookings(reportsRes.therapyBookings || []);

        setReportName(userRes.user.name || '');
        setReportEmail(userRes.user.email || '');
      }
    } catch {
      toast.error('Could not load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [toast]);

  const handleReportUpload = async () => {
    if (!reportName.trim() || !reportEmail.trim() || !reportFile) {
      toast.warning('Please enter name, email and select a PDF report.');
      return;
    }

    if (reportFile.type !== 'application/pdf') {
      toast.error('Only PDF reports are allowed.');
      return;
    }

    setUploadingReport(true);
    try {
      const formData = new FormData();
      formData.append('userId', profile?.id || profile?.userId || '');
      formData.append('name', reportName.trim());
      formData.append('email', reportEmail.trim());
      formData.append('reportFileType', reportFile.type);
      formData.append('reportFileSize', String(reportFile.size));
      formData.append('file', reportFile);

      await api.uploadMedicalReport(formData);
      toast.success('Medical report uploaded successfully.');
      setReportFile(null);
      await fetchProfileData();
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingReport(false);
    }
  };

  if (loading) return <main className="page"><p>Loading profile...</p></main>;

  const tabs = [
    { key: 'medical-reports', label: '📄 Manage Reports', count: uploadedReports.length },
    { key: 'reports', label: '📊 Assessment Reports', count: assessments.length },
    { key: 'therapy', label: '🌿 Therapy Bookings', count: therapyBookings.length },
    { key: 'doctor', label: '🩺 Doctor Bookings', count: bookings.length },
    { key: 'orders', label: '📦 Product Orders', count: orders.length }
  ];

  return (
    <>
      <NavTabs />
      <main className="page profile-page-v2">
        {/* Profile Header */}
        <section className="pf-header">
          <div className="pf-avatar-lg">
            {(profile?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="pf-info">
            <h1>{profile?.name || 'Guest User'}</h1>
            <p className="pf-email">{profile?.email || 'No email'}</p>
            <div className="pf-tags">
              <span className="pf-tag pf-prakriti-tag">
                Prakriti: {profile?.prakriti?.toUpperCase() || 'Unknown'}
              </span>
              {profile?.gender && <span className="pf-tag">{profile.gender}</span>}
              {profile?.age > 0 && <span className="pf-tag">Age: {profile.age}</span>}
            </div>
          </div>
          <div className="pf-quick-actions">
            <button className="wm-secondary-btn" onClick={() => navigate('/weight/assessment')}>
              🔬 New Assessment
            </button>
            <button className="wm-secondary-btn" onClick={() => navigate('/panchakarma')}>
              🌿 Book Therapy
            </button>
          </div>
        </section>

        {/* Profile Tabs */}
        <div className="pf-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pf-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.count > 0 && <span className="pf-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Medical Reports */}
        {activeTab === 'medical-reports' && (
          <section className="pf-section">
            <h2>📄 Upload Previous Report / Manage Reports</h2>

            <div className="pf-report-upload-panel">
              <input
                className="search-input"
                placeholder="Your full name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
              <input
                className="search-input"
                placeholder="Your email"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
              />
              <input
                className="search-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setReportFile(e.target.files?.[0] || null)}
              />
              <div className="pf-report-upload-meta">
                <span>
                  {reportFile ? `${reportFile.name} (${Math.max(1, Math.round(reportFile.size / 1024))} KB)` : 'Choose a PDF report file (max 15MB).'}
                </span>
                <button
                  className="wm-primary-btn"
                  type="button"
                  onClick={handleReportUpload}
                  disabled={uploadingReport}
                >
                  {uploadingReport ? 'Uploading...' : 'Upload PDF Report'}
                </button>
              </div>
            </div>

            {uploadedReports.length === 0 ? (
              <div className="pf-empty" style={{ marginTop: 16 }}>
                <p>No medical reports uploaded yet.</p>
              </div>
            ) : (
              <div className="pf-card-grid" style={{ marginTop: 16 }}>
                {uploadedReports.map((report) => {
                  const reportUrl = report.reportFileName || '';
                  return (
                    <div key={report.id || report._id} className="pf-booking-card">
                      <h3>🧾 Medical Report</h3>
                      <p>{report.name || 'Unknown name'}</p>
                      <p>{report.email || 'No email'}</p>
                      <p>Type: {report.reportFileType || 'application/pdf'}</p>
                      <p>Size: {report.reportFileSize ? `${Math.max(1, Math.round(report.reportFileSize / 1024))} KB` : '-'}</p>
                      <p className="pf-booking-date">Uploaded: {new Date(report.createdAt).toLocaleDateString()}</p>
                      {reportUrl && (
                        <a className="wm-link-btn" href={reportUrl} target="_blank" rel="noreferrer">
                          View / Download PDF →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Assessment Reports */}
        {activeTab === 'reports' && (
          <section className="pf-section">
            <h2>📊 Assessment Reports</h2>
            {assessments.length === 0 ? (
              <div className="pf-empty">
                <p>No assessments found. Take your first comprehensive assessment!</p>
                <button className="wm-primary-btn" onClick={() => navigate('/weight/assessment')}>
                  Start Assessment →
                </button>
              </div>
            ) : (
              <div className="pf-card-grid">
                {assessments.map(a => (
                  <div key={a.id} className="pf-report-card">
                    <div className="pf-report-header">
                      <h3>🧬 {a.prakriti?.toUpperCase() || 'Unknown'} Prakriti</h3>
                      <span className="pf-report-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="pf-scores">
                      <div className="pf-score">
                        <span className="pf-score-val">{a.scores?.digestion || 0}%</span>
                        <span className="pf-score-label">Digestion</span>
                      </div>
                      <div className="pf-score">
                        <span className="pf-score-val">{a.scores?.lifestyle || 0}%</span>
                        <span className="pf-score-label">Lifestyle</span>
                      </div>
                      <div className="pf-score">
                        <span className="pf-score-val">{a.scores?.sleep || 0}%</span>
                        <span className="pf-score-label">Sleep</span>
                      </div>
                      <div className="pf-score pf-score-overall">
                        <span className="pf-score-val">{a.scores?.overall || 0}%</span>
                        <span className="pf-score-label">Overall</span>
                      </div>
                    </div>
                    {a.aiReport?.agniStatus && (
                      <p className="pf-agni">🔥 {a.aiReport.agniStatus}</p>
                    )}
                    <button className="wm-link-btn" onClick={() => navigate('/weight/plan')}>
                      View Full Report →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Therapy Bookings */}
        {activeTab === 'therapy' && (
          <section className="pf-section">
            <h2>🌿 Therapy Bookings</h2>
            {therapyBookings.length === 0 ? (
              <div className="pf-empty">
                <p>No therapy bookings yet. Explore our Panchakarma packages!</p>
                <button className="wm-primary-btn" onClick={() => navigate('/panchakarma')}>
                  View Therapies →
                </button>
              </div>
            ) : (
              <div className="pf-card-grid">
                {therapyBookings.map(b => (
                  <div key={b.id} className="pf-booking-card">
                    <h3>{b.packageName || b.therapyName}</h3>
                    <p>₹{b.totalPriceInr?.toLocaleString()}</p>
                    <p>Status: <span className="pf-status">{b.status}</span></p>
                    {b.preferredDate && <p>Date: {b.preferredDate}</p>}
                    <p className="pf-booking-date">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Doctor Bookings */}
        {activeTab === 'doctor' && (
          <section className="pf-section">
            <h2>🩺 Doctor Bookings</h2>
            {bookings.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No doctor bookings found.</p>
            ) : (
              <div className="pf-card-grid">
                {bookings.map(b => (
                  <div key={b.id || b._id} className="pf-booking-card">
                    <h3>{b.doctorName}</h3>
                    <p>Slot: {b.slot}</p>
                    <p>Fee: ₹{b.fee}</p>
                    <p>Status: <span className="pf-status">{b.status}</span></p>
                    <p className="pf-booking-date">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Product Orders */}
        {activeTab === 'orders' && (
          <section className="pf-section">
            <h2>📦 Product Orders</h2>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No orders found.</p>
            ) : (
              <div className="pf-card-grid">
                {orders.map(o => (
                  <div key={o.id || o._id} className="pf-booking-card">
                    <h3>Order {String(o.id || o._id).substring(0,8)}...</h3>
                    <p>Status: <span className="pf-status">{o.status}</span> ({o.shipmentStatus})</p>
                    <p>Total: ₹{o.totalInr}</p>
                    <div style={{ marginTop: 8, padding: 8, background: 'var(--panel)', borderRadius: 4, fontSize: 13 }}>
                      <p style={{ fontWeight: 600 }}>Shipping Details:</p>
                      <p>{o.customerName} ({o.contactNumber})</p>
                      <p>{o.address}</p>
                      <p>PIN: {o.pincode}</p>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {o.lineItems.map((item, i) => (
                        <p key={i} style={{ fontSize: 14 }}>- {item.name} x{item.quantity}</p>
                      ))}
                    </div>
                    <p className="pf-booking-date">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
