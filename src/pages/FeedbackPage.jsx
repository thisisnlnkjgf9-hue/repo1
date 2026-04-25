import { useEffect, useState, useRef } from 'react';
import NavTabs from '../components/NavTabs';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

const SUPABASE = 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/nouryum/site/glimpses';

const GLIMPSES = [
  { src: `${SUPABASE}/glimpse1.png`, alt: 'Customer feedback — hair became very soft and smooth' },
  { src: `${SUPABASE}/glimpse2.png`, alt: 'Customer — hair texture and feel improved a lot' },
  { src: `${SUPABASE}/glimpse3.png`, alt: 'Herbal shampoo is a lifesaver for hair fall' },
  { src: `${SUPABASE}/glimpse4.png`, alt: 'Visible hair difference within just 3 uses' },
  { src: `${SUPABASE}/glimpse5.png`, alt: 'Hair fall controlled — satisfied customer' },
];

function GlimpsesGallery() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="glimpses-section">
      <div className="glimpses-header">
        <div className="glimpses-badge">❤️ Real Stories</div>
        <h2 className="glimpses-title">Feedback Glimpses</h2>
        <p className="glimpses-sub">Words from our customers — unfiltered, unedited, straight from the heart.</p>
      </div>

      {/* Masonry Grid */}
      <div className="glimpses-grid">
        {GLIMPSES.map((g, i) => (
          <div
            key={i}
            className={`glimpse-card glimpse-card--${i + 1} ${hovered === i ? 'glimpse-card--hovered' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setActive(g)}
          >
            <div className="glimpse-img-wrap">
              <img src={g.src} alt={g.alt} className="glimpse-img" loading="lazy" />
              <div className="glimpse-overlay">
                <span className="glimpse-zoom">🔍 View</span>
              </div>
            </div>
            <div className="glimpse-shine" />
          </div>
        ))}
      </div>

      {/* Floating scroll ticker */}
      <div
        className="glimpses-ticker"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`ticker-track ${isPaused ? 'paused' : ''}`} ref={trackRef}>
          {[...GLIMPSES, ...GLIMPSES].map((g, i) => (
            <div key={i} className="ticker-thumb" onClick={() => setActive(g)}>
              <img src={g.src} alt={g.alt} />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div className="glimpse-lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-backdrop" />
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActive(null)}>✕</button>
            <img src={active.src} alt={active.alt} className="lightbox-img" />
            <p className="lightbox-caption">💬 Real customer message — Nouryum</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default function FeedbackPage() {
  const toast = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getFeedbacks().then((res) => setFeedbacks(res.feedbacks)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !rating) {
      toast.warning('Please enter your name and rating.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitFeedback({ name, rating, comment });
      toast.success('Thank you for your feedback! ✓');
      setName('');
      setRating(0);
      setComment('');
      const res = await api.getFeedbacks();
      setFeedbacks(res.feedbacks);
    } catch {
      toast.error('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NavTabs />
      <main className="page feedback-page">

        {/* ── Glimpses Gallery ── */}
        <GlimpsesGallery />

        {/* ── Feedback Form ── */}
        <section className="feedback-form-section">
          <div className="feedback-form-inner">
            <div className="feedback-form-label">Share Your Experience</div>
            <h2 className="feedback-form-title">How did we do?</h2>

            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fb-name">Your Name</label>
                <input
                  id="fb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= (hoveredStar || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="rating-label">
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fb-comment">Your Message</label>
                <textarea
                  id="fb-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience with Nouryum..."
                  rows={4}
                />
              </div>

              <button type="submit" className="next-btn feedback-submit-btn" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit Feedback ✨'}
              </button>
            </form>
          </div>
        </section>

        {/* ── Submitted Feedbacks ── */}
        {feedbacks.length > 0 && (
          <section className="feedback-list-section">
            <div className="feedback-list-header">
              <h2>What People Say</h2>
              <span className="feedback-count">{feedbacks.length} reviews</span>
            </div>
            <div className="feedback-list">
              {feedbacks.map((fb) => (
                <article key={fb.id || fb._id} className="feedback-card">
                  <div className="feedback-card-header">
                    <div className="feedback-avatar">
                      {fb.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3>{fb.name}</h3>
                      <span className="feedback-stars">
                        {'★'.repeat(fb.rating)}
                        <span className="empty-stars">{'★'.repeat(5 - fb.rating)}</span>
                      </span>
                    </div>
                  </div>
                  {fb.comment && <p className="feedback-comment">"{fb.comment}"</p>}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
