import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRazorpay } from '../hooks/useRazorpay';
import NavTabs from '../components/NavTabs';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const toast = useToast();
  const { pay } = useRazorpay();
  const userId = user?.id || user?.userId || 'u1';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPack, setSelectedPack] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [suggested, setSuggested] = useState([]);

  // Cart drawer state (mirrors ProductsPage)
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getProductById(id)
      .then(res => { setProduct(res.product); })
      .catch(() => toast.error('Could not load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch suggested products whenever the current product changes
  useEffect(() => {
    if (!product) return;
    api.getProducts({})
      .then(res => {
        const all = res.products || [];
        const currentId = product.id || product._id?.toString();
        const currentTags = new Set(product.tags || []);
        // Score: +3 same category, +1 per shared tag
        const scored = all
          .filter(p => (p.id || p._id?.toString()) !== currentId)
          .map(p => {
            let score = 0;
            if (p.category === product.category) score += 3;
            (p.tags || []).forEach(t => { if (currentTags.has(t)) score += 1; });
            return { ...p, _score: score };
          })
          .sort((a, b) => b._score - a._score)
          .slice(0, 4);
        setSuggested(scored);
      })
      .catch(() => {});
  }, [product]);

  const loadCart = async () => {
    try {
      const res = await api.getCart(userId);
      setCart(res.cart || []);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    if (isLoggedIn) loadCart();
  }, [isLoggedIn]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.priceInr * i.quantity, 0), [cart]);

  if (loading) return (
    <>
      <NavTabs />
      <main className="page product-detail-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p className="loading-text">Loading product…</p>
      </main>
    </>
  );

  if (!product) return (
    <>
      <NavTabs />
      <main className="page product-detail-page">
        <p>Product not found. <button className="ghost-btn" onClick={() => navigate('/products')}>← Back to Products</button></p>
      </main>
    </>
  );

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const hasDiscount = product.originalPrice && product.originalPrice > product.priceInr;
  const discountPct = product.discountPercent ||
    (hasDiscount ? Math.round(((product.originalPrice - product.priceInr) / product.originalPrice) * 100) : 0);

  const effectivePrice = selectedPack ? selectedPack.price : product.priceInr;

  // Add to cart and open drawer
  const handleAddToCart = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    try {
      await api.addToCart({ userId, productId: product.id || product._id, quantity: 1 });
      await loadCart();
      toast.success('Added to cart ✓');
    } catch {
      toast.error('Could not add to cart.');
    }
  };

  // Buy Now: add to cart then open cart drawer (same as ProductsPage)
  const handleBuyNow = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    try {
      await api.addToCart({ userId, productId: product.id || product._id, quantity: 1 });
      await loadCart();
      setCartOpen(true);
      toast.success('Added to cart. Complete checkout below.');
    } catch {
      toast.error('Could not start checkout. Please try again.');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    await api.removeFromCart({ userId, productId });
    await loadCart();
  };

  // Full checkout flow identical to ProductsPage
  const handleCheckout = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    if (!cart.length || processing) return;
    if (!customerName.trim() || !contactNumber.trim() || !address.trim() || !pincode.trim()) {
      toast.warning('Please fill in all delivery details before checkout.');
      return;
    }

    setProcessing(true);
    pay({
      amount: cartTotal,
      description: `Nouryum Cart Checkout (${cartCount} items)`,
      onSuccess: async (paymentData) => {
        try {
          await api.checkout({
            userId,
            customerName,
            contactNumber,
            address,
            pincode,
            paymentMethod: 'razorpay',
            razorpayOrderId: paymentData.razorpay_order_id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpaySignature: paymentData.razorpay_signature
          });
          toast.success('Order placed successfully!');
          setCartOpen(false);
          await loadCart();
        } catch (error) {
          toast.error(error.message || 'Checkout failed. Please try again.');
        } finally {
          setProcessing(false);
        }
      },
      onDismiss: () => setProcessing(false),
      onError: (error) => {
        toast.error(error?.message || 'Payment failed. No order was placed.');
        setProcessing(false);
      }
    });
  };

  return (
    <>
      <NavTabs />
      <main className="page product-detail-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button className="ghost-btn product-back-btn" onClick={() => navigate('/products')}>
            ← Back to Products
          </button>
          {isLoggedIn && (
            <span
              onClick={() => { setCartOpen(true); loadCart(); }}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
            >
              🛒 Cart ({cartCount})
            </span>
          )}
        </div>

        <div className="product-detail-layout">
          {/* ── Image Gallery ── */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              <img
                src={allImages[activeImg] || '/placeholder.png'}
                alt={product.name}
                className="product-gallery-main-img"
              />
              {discountPct > 0 && (
                <span className="product-discount-badge">{discountPct}% OFF</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="product-gallery-thumbs">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`product-gallery-thumb${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="product-detail-info">
            {product.category && (
              <span className="product-detail-category">{product.category}</span>
            )}
            <h1 className="product-detail-name">{product.name}</h1>

            {/* Price */}
            <div className="product-detail-price-row">
              {hasDiscount && (
                <span className="product-detail-original-price">₹{product.originalPrice}</span>
              )}
              <span className="product-detail-price">₹{effectivePrice}</span>
              {discountPct > 0 && !selectedPack && (
                <span className="product-detail-discount-chip">{discountPct}% OFF</span>
              )}
            </div>

            {product.description && (
              <p className="product-detail-description">{product.description}</p>
            )}

            {/* Pack Offers */}
            {product.packOffers && product.packOffers.length > 0 && (
              <div className="product-pack-offers">
                <p className="product-pack-label">📦 Pack Offers</p>
                <div className="product-pack-list">
                  <button
                    className={`product-pack-btn${!selectedPack ? ' active' : ''}`}
                    onClick={() => setSelectedPack(null)}
                  >
                    <span>Single</span>
                    <span className="pack-price">₹{product.priceInr}</span>
                  </button>
                  {product.packOffers.map((offer, i) => {
                    const save = product.priceInr * offer.quantity - offer.price;
                    const savePct = Math.round((save / (product.priceInr * offer.quantity)) * 100);
                    return (
                      <button
                        key={i}
                        className={`product-pack-btn${selectedPack === offer ? ' active' : ''}`}
                        onClick={() => setSelectedPack(offer)}
                      >
                        <span>{offer.label || `Pack of ${offer.quantity}`}</span>
                        <span className="pack-price">₹{offer.price}</span>
                        {save > 0 && <span className="pack-save">Save {savePct}%</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.stock !== undefined && (
              <p className="product-detail-stock" style={{ color: product.stock > 0 ? 'var(--olive)' : '#e53e3e' }}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} units)` : '✕ Out of Stock'}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="product-detail-tags">
                {product.tags.map(tag => (
                  <span key={tag} className="product-detail-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="product-detail-actions">
              <button
                className="add-btn product-detail-action-btn"
                type="button"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="buy-btn product-detail-action-btn"
                type="button"
                disabled={product.stock === 0 || processing}
                onClick={handleBuyNow}
              >
                {processing ? 'Processing…' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Suggested Products ── */}
        {suggested.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>You May Also Like</h2>
              <button className="ghost-btn" onClick={() => navigate('/products')} style={{ fontSize: 14 }}>
                Shop All →
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 20,
            }}>
              {suggested.map(p => {
                const pid = p.id || p._id?.toString();
                const hasDis = p.originalPrice && p.originalPrice > p.priceInr;
                const disPct = p.discountPercent ||
                  (hasDis ? Math.round(((p.originalPrice - p.priceInr) / p.originalPrice) * 100) : 0);
                return (
                  <article
                    key={pid}
                    style={{
                      background: 'var(--bg-white)',
                      border: '1px solid var(--line)',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.18s, box-shadow 0.18s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    onClick={() => navigate(`/products/${pid}`)}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: 180, background: '#f5f5f0', overflow: 'hidden' }}>
                      {p.image
                        ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🌿</div>
                      }
                      {disPct > 0 && (
                        <span style={{
                          position: 'absolute', top: 10, left: 10,
                          background: 'var(--gold)', color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 20,
                        }}>{disPct}% OFF</span>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {p.category && <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</span>}
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, margin: 0 }}>{p.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        {hasDis && <span style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>₹{p.originalPrice}</span>}
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>₹{p.priceInr}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                      <button
                        className="add-btn"
                        style={{ flex: 1, fontSize: 13, padding: '8px 0' }}
                        disabled={p.stock === 0}
                        onClick={async () => {
                          if (!isLoggedIn) { setShowLoginModal(true); return; }
                          try {
                            await api.addToCart({ userId, productId: pid, quantity: 1 });
                            await loadCart();
                            toast.success('Added to cart ✓');
                          } catch { toast.error('Could not add to cart.'); }
                        }}
                      >
                        {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── Cart Drawer (identical to ProductsPage) ── */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <aside className="cart-drawer">
            <div className="cart-header">
              <h2>Your Cart ({cartCount})</h2>
              <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="cart-items">
              {cart.length === 0 && <p className="loading-text">Cart is empty</p>}
              {cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × ₹{item.priceInr}</p>
                  </div>
                  <button className="cart-item-remove" onClick={() => handleRemoveFromCart(item.productId)}>✕</button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-delivery-form" style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: 16, marginBottom: 8, marginTop: 16 }}>Delivery Details</h4>
                <input placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100%' }} />
                <input placeholder="Phone Number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100%' }} />
                <textarea placeholder="Full Shipping Address" value={address} onChange={e => setAddress(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100%', resize: 'vertical', minHeight: '60px' }} />
                <input placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100%' }} />
              </div>
            )}
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <button
                className="checkout-btn full-width-btn"
                type="button"
                disabled={cart.length === 0 || processing}
                onClick={handleCheckout}
              >
                {processing ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </aside>
        </>
      )}

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoggedIn={() => { loadCart(); }}
        title="Login required for purchase"
        message="Please sign in with Google to add products to cart and complete checkout."
      />
    </>
  );
}
