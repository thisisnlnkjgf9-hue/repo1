import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavTabs from '../components/NavTabs';

const quickLinks = [
  { label: 'Buy Ayurvedic Products', to: '/products', icon: '✦' },
  { label: 'Balance your Chakras',   to: '/chakras',  icon: '☸' },
  { label: 'Seasonal Diet Tips',     to: '/diet',     icon: '🌿', highlight: true },
  { label: 'Upload Previous Report', to: '/labs',     icon: '📄' },
  { label: 'Prakriti Assessment',    to: '/prakriti', icon: '♡' },
  { label: "Doctor's Appointment",   to: '/doctors',  icon: '🩺' },
  { label: 'Panchakarma Therapy',    to: '/panchakarma', icon: '🧘' },
  { label: 'Weight Management',      to: '/weight',   icon: '⚖' },
];

const featuredBlog = {
  id: 'b1',
  date: 'June 3, 2023',
  title: "How to Get Rid of Acne: 21 Effective Methods",
  text: "Acne is a common skin condition that affects nearly everyone at some point. Here are 21 effective methods to help you get rid of acne.",
  mediaClass: 'blog-main',
};

const podcasts = [
  {
    id: 'p1',
    title: 'The Path to Wellness',
    text: 'Listen to our wellness experts discuss the latest health trends and research.',
    mediaClass: 'podcast-1',
  },
  {
    id: 'p2',
    title: 'Healthy Living with Pathya',
    text: 'Learn how to make healthier choices with our weekly nutrition tips and meal plans.',
    mediaClass: 'podcast-2',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/symptoms', { state: { initialQuery: searchQuery } });
    } else {
      navigate('/symptoms');
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const [mobileTab, setMobileTab] = useState('home');

  return (
    <>
      <NavTabs />

      {/* ── Mobile Tabs ── */}
      <div className="mobile-only-tabs">
        <button 
          className={mobileTab === 'home' ? 'active' : ''} 
          onClick={() => setMobileTab('home')}
        >
          <span className="icon">⌂</span> Home
        </button>
        <button 
          className={mobileTab === 'explore' ? 'active' : ''} 
          onClick={() => setMobileTab('explore')}
        >
          <span className="icon">⎈</span> Explore Pathya
        </button>
      </div>

      <main className={`home-grid ${mobileTab === 'explore' ? 'show-explore' : 'show-home'}`}>
        {/* ── Left sidebar: Quick Links (mobile explore tab) ── */}
        <section className="side-actions">
          <p className="panel-label desktop-only">Quick Actions</p>
          {quickLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              id={`qa-${item.label.replace(/\s+/g, '-').toLowerCase()}`}
              className={`action-btn${item.highlight ? ' highlight' : ''}`}
              onClick={() =>
                navigate(item.to, item.initialQuery ? { state: { initialQuery: item.initialQuery } } : undefined)
              }
            >
              <span className="action-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Render blog-strip elements directly inside explore tab on mobile */}
          <div className="mobile-only mobile-explore-widgets">
            <h3 className="section-title">Seasonal Diet Tips</h3>
            <div className="seasonal-card">
              <div className="seasonal-card-img" />
              <h4>Winter diet: what to eat and avoid</h4>
              <p>Latest tips for the season</p>
            </div>
            <h3 className="section-title">Blogs & Podcasts</h3>
            <div className="mobile-podcast-card">
              <h4>Yoga for PCOD/PCOS</h4>
              <p>June 8, 2025</p>
              <div className="mobile-podcast-img" />
            </div>
          </div>
        </section>

        {/* ── Right: Hero image panel with search bar (mobile home tab) ── */}
        <section className="hero-panel">
          <div className="mobile-only mobile-prakriti-text">
            Prakriti is your unique Ayurvedic body type, fixed at birth and identified through questions on lifestyle and body traits.
          </div>
          <button className="mobile-only mobile-prakriti-btn" onClick={() => navigate('/prakriti')}>
            + Prakriti Assessment
          </button>
          
          <div className="search-row-container">
            {/* Gold-border search bar (Figma) */}
            <div className="search-row" role="search">
              <span className="search-icon mobile-only">🔍</span>
              <input
                id="home-search"
                placeholder="Tell us your Health concern!  Eg: diabetes, acne, indigestion"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                aria-label="Search health concern"
              />
              <button type="button" onClick={handleSearch} aria-label="Search">
                Search
              </button>
            </div>
          </div>

          {/* Glassmorphism badge below the search bar */}
          <div className="hero-badge">
            <strong>Best Assessments, </strong>
            <span>Recommended by Doctors</span>
          </div>
        </section>
      </main>

      {/* ── Blog & Podcast strip (hidden on mobile) ── */}
      <section className="blog-strip desktop-only-flex" id="blog-strip">
        <div className="section-head">
          <h2>Explore Blogs &amp; Podcasts →</h2>
          <button
            type="button"
            className="ghost-btn"
            id="view-all-blogs-btn"
            onClick={() => navigate('/blogs')}
          >
            View all →
          </button>
        </div>

        <div className="card-row">
          <article className="mini-card" id={`blog-card-${featuredBlog.id}`}>
            <div className={`mini-media ${featuredBlog.mediaClass}`} role="img" aria-label="Blog image" />
            <div className="mini-card-body">
              <span className="mini-date">{featuredBlog.date}</span>
              <h3>{featuredBlog.title}</h3>
              <p>{featuredBlog.text}</p>
            </div>
            <div className="mini-card-footer">
              <Link to={`/blogs/${featuredBlog.id}`} className="read-more-btn">Read More</Link>
            </div>
          </article>

          <div className="podcast-col">
            {podcasts.map((pod) => (
              <article className="podcast-card" key={pod.id} id={`podcast-card-${pod.id}`}>
                <div className={`podcast-media ${pod.mediaClass}`} role="img" aria-label="Podcast image" />
                <div className="podcast-body">
                  <h3>{pod.title}</h3>
                  <p>{pod.text}</p>
                </div>
              </article>
            ))}
          </div>

          <article className="mini-card" id="blog-card-b3">
            <div className="mini-media podcast-3" role="img" aria-label="Blog image" />
            <div className="mini-card-body">
              <h3>Mindful Movement</h3>
              <p>Find your zen with guided meditations, yoga classes, and other relaxation techniques.</p>
            </div>
            <div className="mini-card-footer">
              <Link to="/blogs/b3" className="read-more-btn">Read More</Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
