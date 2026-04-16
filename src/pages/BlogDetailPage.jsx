import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.getBlogById(id);
        setBlog(res.blog);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <main className="page"><p>Loading blog...</p></main>;
  if (!blog) return <main className="page"><p>Blog not found.</p></main>;

  return (
    <>
      <NavTabs />
      <main className="page blog-detail-page" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <article className="blog-detail-card" style={{ background: 'var(--bg-white)', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {blog.image && (
            <img 
              src={blog.image} 
              alt={blog.title} 
              loading="lazy" 
              style={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }} 
            />
          )}
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>{blog.title}</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 500, marginBottom: 24 }}>{blog.date}</p>
          <div style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--ink)' }}>
            <p style={{ fontWeight: 600, marginBottom: 16 }}>{blog.excerpt}</p>
            <p>{blog.body}</p>
          </div>
        </article>
      </main>
    </>
  );
}
