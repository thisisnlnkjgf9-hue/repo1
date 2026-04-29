import { useEffect, useState } from 'react';
import NavTabs from '../components/NavTabs';
import { api } from '../api';

export default function AboutPage() {
  const [page, setPage] = useState({ title: 'About Us', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSitePage('about')
      .then(res => setPage(res.sitePage || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <NavTabs />
      <main className="page about-page">
        <section className="about-card">
          <h1>{page.title || 'About Us'}</h1>
          {loading ? (
            <p className="loading-text">Loading…</p>
          ) : (
            <div className="site-page-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {page.content ||
`Nouryum is an innovative digital health platform built on the principles of Ayurveda, aiming to make holistic healthcare simple, personalized, and accessible to all. Founded and led by CEO Pallavi Pal, Nouryum brings together the wisdom of Ayurveda with the power of modern technology.

We focus on understanding each individual through Prakriti-based assessment and provide customized diet plans, lifestyle guidance, and herbal support tailored to their unique needs. By integrating AI-driven insights with traditional knowledge, Nouryum offers practical solutions for modern lifestyle disorders.

🌿 Promote Balance • Preserve Vitality • Prevent Imbalance • Prosper Naturally 🌺`}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
