import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export const STATIC_PODCASTS = [
  { id: 'p1', title: 'The Path to Wellness', host: 'Dr. Arjun Patel', duration: '45 min', mediaClass: 'podcast-1' },
  { id: 'p2', title: 'Healthy Living with Pathya', host: 'Nutritionist Aditi', duration: '30 min', mediaClass: 'podcast-2' },
  { id: 'p3', title: 'Mindful Movement', host: 'Yoga Expert Neha', duration: '60 min', mediaClass: 'podcast-3' }
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.getBlogs();
        setBlogs(res.blogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <NavTabs />
      <main className="page blogs-page">
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>Blog Posts</h2>
        {loading && <p>Loading blogs...</p>}
        {!loading && blogs.length === 0 && <p>No blogs found.</p>}
        {!loading && blogs.map((blog) => (
          <article className="blog-list-item" key={blog._id || blog.id} style={{ display: 'flex', gap: 24, marginBottom: 24, padding: 20, background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{blog.date}</p>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--ink)' }}>{blog.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>{blog.excerpt}</p>
              <Link to={`/blogs/${blog._id || blog.id}`} style={{ fontWeight: 600, color: 'var(--gold)', textDecoration: 'none' }}>Read More →</Link>
            </div>
            {blog.image && <img src={blog.image} alt={blog.title} loading="lazy" style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 8 }} />}
          </article>
        ))}

        <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 40, marginBottom: 20 }}>Podcasts</h2>
        <div className="card-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {STATIC_PODCASTS.map((pod) => (
            <article className="mini-card" key={pod.id} style={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-white)', overflow: 'hidden' }}>
              <div className={`podcast-media ${pod.mediaClass}`} aria-hidden="true" style={{ height: 160, backgroundSize: 'cover' }} />
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>{pod.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>Host: {pod.host} · {pod.duration}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
