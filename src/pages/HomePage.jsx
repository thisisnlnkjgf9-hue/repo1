import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavTabs from '../components/NavTabs';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';

const SUPABASE_PRODUCTS = 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/nouryum/site/products';

const FALLBACK_PRODUCT_IMAGES = [
  { src: `${SUPABASE_PRODUCTS}/product1.jpeg`, label: 'Herbal Hair Care' },
  { src: `${SUPABASE_PRODUCTS}/product2.jpeg`, label: 'Ayurvedic Shampoo' },
  { src: `${SUPABASE_PRODUCTS}/product3.jpeg`, label: 'Natural Oils' },
  { src: `${SUPABASE_PRODUCTS}/product4.jpeg`, label: 'Root Strengthener' },
  { src: `${SUPABASE_PRODUCTS}/product5.jpeg`, label: 'Scalp Therapy' },
  { src: `${SUPABASE_PRODUCTS}/product6.jpeg`, label: 'Herbal Blend' },
  { src: `${SUPABASE_PRODUCTS}/product7.jpeg`, label: 'Pure Botanicals' },
];

function ProductShowcase({ slides }) {
  const PRODUCT_IMAGES = slides && slides.length ? slides : FALLBACK_PRODUCT_IMAGES;
  const [active, setActive] = useState(0);
  const [prev, setPrev]     = useState(null);
  const [fading, setFading] = useState(false);
  const timerRef            = useRef(null);
  const navigate            = useNavigate();

  const goTo = (idx) => {
    if (idx === active || fading) return;
    setPrev(active);
    setFading(true);
    setActive(idx);
    setTimeout(() => { setPrev(null); setFading(false); }, 700);
  };

  const next = () => goTo((active + 1) % PRODUCT_IMAGES.length);
  const prev_ = () => goTo((active - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 3800);
    return () => clearInterval(timerRef.current);
  }, [active, fading]);

  return (
    <section className="product-showcase" id="product-showcase">
      {/* Header row */}
      <div className="product-showcase-head">
        <div className="product-showcase-label">🌿 Our Products</div>
        <h2 className="product-showcase-title">Crafted by Nature, Proven by Science</h2>
        <button className="ghost-btn product-showcase-cta" onClick={() => navigate('/products')}>
          Shop All Products →
        </button>
      </div>

      {/* Slideshow */}
      <div
        className="product-slideshow"
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={() => { timerRef.current = setInterval(next, 3800); }}
      >
        {/* Previous slide (fading out) */}
        {prev !== null && (
          <div
            className="product-slide product-slide--out"
            style={{ backgroundImage: `url('${PRODUCT_IMAGES[prev].src}')` }}
          />
        )}

        {/* Active slide (fading in) */}
        {PRODUCT_IMAGES.map((img, i) => (
          <div
            key={img.src}
            className={`product-slide ${i === active ? 'product-slide--in' : 'product-slide--hidden'}`}
            style={{ backgroundImage: `url('${img.src}')` }}
          >
            <div className="product-slide-overlay" />
            <div className="product-slide-content">
              <span className="product-slide-tag">Nouryum Essentials</span>
              <p className="product-slide-label">{img.label}</p>
              <button className="product-slide-btn" onClick={() => navigate('/products')}>
                Shop Now ↗
              </button>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button className="slideshow-arrow slideshow-arrow--left" onClick={prev_} aria-label="Previous">‹</button>
        <button className="slideshow-arrow slideshow-arrow--right" onClick={next} aria-label="Next">›</button>

        {/* Dot indicators */}
        <div className="slideshow-dots">
          {PRODUCT_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`slideshow-dot ${i === active ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="slideshow-thumbs">
          {PRODUCT_IMAGES.map((img, i) => (
            <button
              key={img.src}
              className={`slideshow-thumb ${i === active ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={img.label}
            >
              <img src={img.src} alt={img.label} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileProductSlider({ slides }) {
  const PRODUCT_IMAGES = slides && slides.length ? slides : FALLBACK_PRODUCT_IMAGES;
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % PRODUCT_IMAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mobile-only mobile-hero-slider mobile-product-slider" aria-label="Nouryum product showcase">
      {PRODUCT_IMAGES.map((img, index) => (
        <div
          key={img.src}
          className={`mobile-hero-card${index === active ? ' active' : ''}`}
          role="img"
          aria-label={img.label}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,16,10,0.10) 0%, rgba(10,16,10,0.60) 100%), url('${img.src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="mobile-hero-copy mobile-product-copy">
            <span className="mobile-product-tag">🌿 Nouryum Essentials</span>
            <h3>{img.label}</h3>
            <button
              className="mobile-product-shop-btn"
              onClick={() => navigate('/products')}
            >
              Shop Now ↗
            </button>
          </div>
        </div>
      ))}

      <div className="mobile-hero-dots" role="tablist" aria-label="Product slides">
        {PRODUCT_IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`mobile-hero-dot${index === active ? ' active' : ''}`}
            onClick={() => setActive(index)}
            aria-label={`Go to product ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}


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

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroSlides, setHeroSlides] = useState([]);
  const [productSlides, setProductSlides] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSearch = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

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
  const displaySlides = heroSlides.length
    ? heroSlides
    : [{
        id: 'fallback-slide',
        title: 'Best Assessments',
        subtitle: 'Recommended by Doctors',
        image: 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/nouryum/site/hero_bg.png'
      }];
  const safeActiveSlide = Math.min(activeSlide, displaySlides.length - 1);

  useEffect(() => {
    let mounted = true;

    api
      .getHeroSlides()
      .then((res) => {
        if (!mounted) return;
        const all = Array.isArray(res.heroSlides) ? res.heroSlides : [];
        setHeroSlides(all.filter(s => s.type !== 'product'));
        const prodSlides = all.filter(s => s.type === 'product' && s.isActive !== false);
        setProductSlides(prodSlides.map(s => ({ src: s.image, label: s.label || s.title || '' })));
      })
      .catch(() => {
        if (!mounted) return;
        setHeroSlides([]);
      });

    api
      .getBlogs()
      .then((res) => {
        if (!mounted) return;
        setLatestBlogs((res.blogs || []).slice(0, 3));
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [heroSlides]);

  useEffect(() => {
    if (safeActiveSlide !== activeSlide) {
      setActiveSlide(safeActiveSlide);
    }
  }, [activeSlide, safeActiveSlide]);

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

          <MobileProductSlider slides={productSlides} />

          <div className="mobile-only mobile-home-highlights">
            <div className="mobile-highlight-chip">Personalized Wellness Plans</div>
            <div className="mobile-highlight-chip">Expert Guided Care</div>
            <div className="mobile-highlight-chip">Natural Remedies</div>
          </div>

          {/* Glassmorphism badge below the search bar */}
          <div className="hero-badge">
            <strong>Best Assessments, </strong>
            <span>Recommended by Doctors</span>
          </div>
        </section>
      </main>

      <div className="desktop-only-block">
        <ProductShowcase slides={productSlides} />
      </div>

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
          {latestBlogs.map((blog) => (
            <article className="mini-card" key={blog._id || blog.id} id={`blog-card-${blog._id || blog.id}`}>
              <div
                className="mini-media"
                style={{
                  backgroundImage: `url('${blog.image || 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/nouryum/site/blog_acne.png'}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                role="img"
                aria-label={blog.title}
              />
              <div className="mini-card-body">
                <span className="mini-date">{blog.date}</span>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt || blog.text}</p>
              </div>
              <div className="mini-card-footer">
                <Link to={`/blogs/${blog._id || blog.id}`} className="read-more-btn">Read More</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoggedIn={() => {
          if (searchQuery.trim()) {
            navigate('/symptoms', { state: { initialQuery: searchQuery } });
            return;
          }
          navigate('/symptoms');
        }}
        title="Login required for disease search"
        message="Please sign in with Google to search symptoms and get personalized disease insights."
      />
    </>
  );
}
