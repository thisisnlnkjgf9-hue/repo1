import { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function LabPage() {
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [uploadedReports, setUploadedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      if (!userId || userId === 'u1') {
        setLoading(false);
        return;
      }
      const reportsRes = await api.getUserReports(userId);
      setUploadedReports(reportsRes.uploadedReports || []);
    } catch {
      toast.error('Could not load your medical reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [userId]);

  const handleUpload = async () => {
    if (!name.trim() || !email.trim() || !file) {
      toast.warning('Please enter name, email, and choose one report file.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('userId', userId);
      fd.append('name', name.trim());
      fd.append('email', email.trim());
      fd.append('reportFileType', file.type);
      fd.append('reportFileSize', String(file.size));
      fd.append('file', file);

      await api.uploadMedicalReport(fd);

      toast.success('Report uploaded successfully. Our team will review it soon.');
      setFile(null);
      await fetchReports();
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="page lab-page">
      <h1>Labs & Reports</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Upload previous medical documents for doctor review, and view your uploaded files.
      </p>

      <section style={{ background: 'var(--panel)', padding: 24, borderRadius: 12, marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Upload New Report</h2>
        <input
          className="search-input"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <input
          className="search-input"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <input
          className="search-input"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          type="button"
          className="next-btn wide"
          onClick={handleUpload}
          style={{ marginTop: 14 }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Report'}
        </button>
      </section>

      <section>
        <h2>Your Uploaded Reports</h2>
        {loading ? (
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>Loading reports...</p>
        ) : uploadedReports.length === 0 ? (
          <p style={{ marginTop: 12, color: 'var(--muted)' }}>No medical reports uploaded yet.</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 16, 
            marginTop: 16 
          }}>
            {uploadedReports.map((report) => {
              const reportUrl = report.reportFileName || '';
              return (
                <div key={report.id || report._id} style={{ 
                  background: 'var(--panel)', 
                  padding: 16, 
                  borderRadius: 12, 
                  border: '1px solid var(--border)' 
                }}>
                  <h3 style={{ marginBottom: 8, fontSize: 18 }}>🧾 Medical Report</h3>
                  <p style={{ color: 'var(--text)', marginBottom: 4 }}>{report.name || 'Unknown name'}</p>
                  <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>
                    Type: {report.reportFileType || 'application/pdf'}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>
                    Size: {report.reportFileSize ? `${Math.max(1, Math.round(report.reportFileSize / 1024))} KB` : '-'}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
                    Uploaded: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {reportUrl && (
                    <a className="wm-link-btn" href={reportUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600 }}>
                      View / Download PDF →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
