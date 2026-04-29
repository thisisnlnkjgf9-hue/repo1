import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);

  useEffect(() => {
    api.getBlogs()
      .then(res => setBlogs(res.blogs || []))
      .catch(console.error)
      .finally(() => setLoadingBlogs(false));

    api.getPodcasts()
      .then(res => setPodcasts(res.podcasts || []))
      .catch(console.error)
      .finally(() => setLoadingPodcasts(false));
  }, []);

  return (
    <>
      <NavTabs />
      <main className="page blogs-page">
        {/* ── Blog Posts ── */}
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>Blog Posts</h2>
        {loadingBlogs && <p>Loading blogs...</p>}
        {!loadingBlogs && blogs.length === 0 && <p>No blogs found.</p>}
        {!loadingBlogs && blogs.map((blog) => (
          <article
            className="blog-list-item"
            key={blog._id || blog.id}
            style={{ display: 'flex', gap: 24, marginBottom: 24, padding: 20, background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--line)' }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{blog.date}</p>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--ink)' }}>{blog.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>{blog.excerpt}</p>
              <Link to={`/blogs/${blog._id || blog.id}`} style={{ fontWeight: 600, color: 'var(--gold)', textDecoration: 'none' }}>
                Read More →
              </Link>
            </div>
            {blog.image && (
              <img
                src={blog.image}
                alt={blog.title}
                loading="lazy"
                style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8 }}
              />
            )}
          </article>
        ))}

        {/* ── Podcasts ── */}
        <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 48, marginBottom: 8 }}>🎙️ Podcasts</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
          Watch our latest episodes on Ayurveda, wellness, and holistic health.
        </p>

        {loadingPodcasts && <p>Loading podcasts...</p>}
        {!loadingPodcasts && podcasts.length === 0 && (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No podcasts published yet. Check back soon!</p>
        )}
        {!loadingPodcasts && podcasts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
            {podcasts.map((pod) => (
              <article
                key={pod._id || pod.id}
                style={{
                  background: 'var(--bg-white)',
                  borderRadius: 16,
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                {/* YouTube embed */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                  <iframe
                    src={`${pod.youtubeUrl}?rel=0&modestbranding=1`}
                    title={pod.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '100%', height: '100%',
                      border: 'none',
                    }}
                  />
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: 'var(--ink)', lineHeight: 1.4 }}>
                    {pod.title}
                  </h3>
                  {pod.description && (
                    <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {pod.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
