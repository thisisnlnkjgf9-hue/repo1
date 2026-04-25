import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import { useRazorpay } from '../hooks/useRazorpay';
import LoginRequiredModal from '../components/LoginRequiredModal';
import NavTabs from '../components/NavTabs';

export default function PanchakarmaPage() {
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const userId = user?.id || user?.userId;
  const { pay } = useRazorpay();

  const [therapies, setTherapies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeTab, setActiveTab] = useState('packages');
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    address: '',
    preferredDate: ''
  });

  useEffect(() => {
    Promise.all([
      api.getTherapies().catch(() => ({ therapies: [] })),
      api.getTherapyPackages().catch(() => ({ packages: [] }))
    ]).then(([tRes, pRes]) => {
      setTherapies(tRes.therapies || []);
      setPackages(pRes.packages || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (processingPayment) return;

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      toast.error('Please fill all fields');
      return;
    }

    setProcessingPayment(true);

    pay({
      amount: Number(bookingModal?.price || 0),
      description: `Therapy Booking - ${bookingModal?.packageName || bookingModal?.therapyName || 'Nouryum'}`,
      onSuccess: async (paymentData) => {
        try {
          await api.bookTherapy({
            ...form,
            userId,
            packageId: bookingModal.packageId || '',
            packageName: bookingModal.packageName || '',
            therapyId: bookingModal.therapyId || '',
            therapyName: bookingModal.therapyName || '',
            totalPriceInr: bookingModal.price,
            paymentMethod: 'razorpay',
            razorpayOrderId: paymentData.razorpay_order_id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpaySignature: paymentData.razorpay_signature
          });
          toast.success('Booking confirmed!');
          setBookingModal(null);
        } catch (err) {
          toast.error(err.message || 'Booking failed after payment verification.');
        } finally {
          setProcessingPayment(false);
        }
      },
      onDismiss: () => {
        setProcessingPayment(false);
      },
      onError: (error) => {
        toast.error(error?.message || 'Payment failed. Booking not created.');
        setProcessingPayment(false);
      }
    });
  };

  const resultPromises = [
    { text: 'Feel lighter in 3 days', icon: '✨' },
    { text: 'Better sleep in 2 sessions', icon: '🌙' },
    { text: 'Visible inch loss in 1 week', icon: '📏' }
  ];

  if (loading) return <main className="page"><p>Loading therapies...</p></main>;

  return (
    <>
      <NavTabs />
      <main className="page pk-page">
        {/* ── Hero Banner ── */}
        <section className="pk-hero">
          <div className="pk-hero-content">
            <span className="pk-badge">🌿 Authentic Panchakarma</span>
            <h1>Detox. Heal. Transform.</h1>
            <p>Ancient 5-step detoxification therapy — personalised for your Prakriti & modern lifestyle.</p>
            <div className="pk-result-tags">
              {resultPromises.map((rp, i) => (
                <span key={i} className="pk-result-tag">{rp.icon} {rp.text}</span>
              ))}
            </div>
            <button className="pk-book-btn" onClick={() => {
              const featured = packages.find(p => p.badge === 'Most Popular') || packages[0];
              if (featured) setBookingModal({ packageId: featured.id, packageName: featured.name, price: featured.offerPriceInr });
            }}>
              Book Now →
            </button>
          </div>
        </section>

        {/* ── Tab Switcher ── */}
        <div className="pk-tabs">
          <button className={`pk-tab ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
            📦 Packages
          </button>
          <button className={`pk-tab ${activeTab === 'therapies' ? 'active' : ''}`} onClick={() => setActiveTab('therapies')}>
            🫳 Individual Therapies
          </button>
        </div>

        {/* ── Packages Grid ── */}
        {activeTab === 'packages' && (
          <section className="pk-packages">
            <div className="pk-package-grid">
              {packages.map(pkg => (
                <div key={pkg.id} className={`pk-package-card ${pkg.featured ? 'featured' : ''}`}>
                  {pkg.badge && <span className="pk-card-badge">{pkg.badge}</span>}
                  <h3>{pkg.name}</h3>
                  <p className="pk-tagline">{pkg.tagline}</p>

                  <div className="pk-includes">
                    <strong>Includes:</strong>
                    {pkg.includes.map((inc, i) => (
                      <p key={i}>• <em>{inc.day}:</em> {inc.therapies.join(', ')}</p>
                    ))}
                  </div>

                  <div className="pk-pricing">
                    <span className="pk-actual">₹{pkg.actualPriceInr.toLocaleString()}</span>
                    <span className="pk-offer">₹{pkg.offerPriceInr.toLocaleString()}</span>
                    <span className="pk-save">Save ₹{(pkg.actualPriceInr - pkg.offerPriceInr).toLocaleString()}</span>
                  </div>

                  <p className="pk-duration">{pkg.durationDays} day{pkg.durationDays > 1 ? 's' : ''} | {pkg.totalSessions} sessions</p>

                  {pkg.resultPromise && <p className="pk-promise">🏆 {pkg.resultPromise}</p>}

                  {pkg.extras?.length > 0 && (
                    <div className="pk-extras">
                      {pkg.extras.map((ex, i) => <span key={i} className="pk-extra-tag">✓ {ex}</span>)}
                    </div>
                  )}

                  <button className="pk-card-book-btn" onClick={() => setBookingModal({
                    packageId: pkg.id,
                    packageName: pkg.name,
                    price: pkg.offerPriceInr
                  })}>
                    Book Package — ₹{pkg.offerPriceInr.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Individual Therapies ── */}
        {activeTab === 'therapies' && (
          <section className="pk-therapies">
            <div className="pk-therapy-grid">
              {therapies.map(th => (
                <div key={th.id} className={`pk-therapy-card ${selectedTherapy === th.id ? 'expanded' : ''}`}
                     onClick={() => setSelectedTherapy(selectedTherapy === th.id ? null : th.id)}>
                  <div className="pk-therapy-header">
                    <span className="pk-therapy-icon">{th.icon}</span>
                    <div>
                      <h3>{th.name}</h3>
                      <p className="pk-therapy-dur">{th.duration}</p>
                    </div>
                    <span className="pk-therapy-price">₹{th.priceInr}</span>
                  </div>

                  {selectedTherapy === th.id && (
                    <div className="pk-therapy-details">
                      <p>{th.description}</p>
                      <div className="pk-best-for">
                        <strong>Best For:</strong>
                        <div className="pk-best-tags">
                          {th.bestFor.map((bf, i) => <span key={i} className="pk-bf-tag">{bf}</span>)}
                        </div>
                      </div>
                      <button className="pk-card-book-btn" onClick={(e) => {
                        e.stopPropagation();
                        setBookingModal({ therapyId: th.id, therapyName: th.name, price: th.priceInr });
                      }}>
                        Book — ₹{th.priceInr}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Doctor Consultation CTA ── */}
        <section className="pk-cta-section">
          <div className="pk-cta-card">
            <h3>🩺 Need Guidance?</h3>
            <p>Book a consultation with our certified Ayurvedic doctors to customize your Panchakarma plan.</p>
            <button className="wm-primary-btn" onClick={() => navigate('/doctors')}>
              Consult a Doctor →
            </button>
          </div>
          <div className="pk-cta-card">
            <h3>⚖️ Weight Management</h3>
            <p>Take our comprehensive assessment to get a personalized Ayurvedic weight management plan.</p>
            <button className="wm-secondary-btn" onClick={() => navigate('/weight')}>
              Start Assessment →
            </button>
          </div>
        </section>

        {/* ── Booking Modal ── */}
        {bookingModal && (
          <div className="pk-modal-overlay" onClick={() => setBookingModal(null)}>
            <form className="pk-modal" onClick={e => e.stopPropagation()} onSubmit={handleBook}>
              <button type="button" className="pk-modal-close" onClick={() => setBookingModal(null)}>✕</button>
              <h2>Book {bookingModal.packageName || bookingModal.therapyName}</h2>
              <p className="pk-modal-price">Total: <strong>₹{bookingModal.price?.toLocaleString()}</strong></p>

              <label>
                <span>Full Name</span>
                <input required value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input type="email" required value={form.customerEmail} onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))} />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" required value={form.customerPhone} onChange={e => setForm(p => ({ ...p, customerPhone: e.target.value }))} />
              </label>
              <label>
                <span>Address</span>
                <input type="text" required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </label>
              <label>
                <span>Preferred Date</span>
                <input type="date" value={form.preferredDate} onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))} />
              </label>

              <button type="submit" className="pk-book-btn" style={{ width: '100%', marginTop: 16 }}>
                {processingPayment ? 'Processing Payment...' : 'Pay & Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        <LoginRequiredModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login required for therapy booking"
          message="Please sign in with Google to pay and confirm your therapy booking."
        />
      </main>
    </>
  );
}
