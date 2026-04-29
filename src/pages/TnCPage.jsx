import { useEffect, useState } from 'react';
import NavTabs from '../components/NavTabs';
import { api } from '../api';

export default function TnCPage() {
  const [page, setPage] = useState({ title: 'Terms & Conditions', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSitePage('tnc')
      .then(res => setPage(res.sitePage || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <NavTabs />
      <main className="page site-page">
        <section className="about-card">
          <h1>{page.title || 'Terms & Conditions'}</h1>
          {loading ? (
            <p className="loading-text">Loading…</p>
          ) : (
            <div className="site-page-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {page.content || 'Terms and conditions coming soon.'}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
