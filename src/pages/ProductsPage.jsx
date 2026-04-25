import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRazorpay } from '../hooks/useRazorpay';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function ProductsPage() {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = user?.id || user?.userId || 'u1';
  const { pay } = useRazorpay();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadProducts = async (searchValue = '') => {
    try {
      const res = await api.getProducts({ search: searchValue });
      setProducts(res.products || []);
    } catch {
      toast.error('Could not load products. Server may be offline.');
    }
  };

  const loadCart = async () => {
    try {
      const res = await api.getCart(userId);
      setCart(res.cart || []);
    } catch {
      /* cart load failure is not critical */
    }
  };

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    if (location.state?.openCart) {
      setCartOpen(true);
      loadCart();
      navigate('/products', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(
    () => products,
    [products]
  );

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.priceInr * i.quantity, 0), [cart]);

  const add = async (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      await api.addToCart({ userId, productId: product.id, quantity: 1 });
      await loadCart();
      toast.success('Added to cart ✓');
    } catch {
      toast.error('Could not add to cart. Please try again.');
    }
  };

  const buyNow = async (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      await api.addToCart({ userId, productId: product.id, quantity: 1 });
      await loadCart();
      setCartOpen(true);
      toast.success('Added to cart. Complete checkout below.');
    } catch {
      toast.error('Could not start checkout. Please try again.');
    }
  };

  const remove = async (id) => {
    await api.removeFromCart({ userId, productId: id });
    await loadCart();
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

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
      onDismiss: () => {
        setProcessing(false);
      },
      onError: (error) => {
        toast.error(error?.message || 'Payment failed. No order was placed.');
        setProcessing(false);
      }
    });
  };

  return (
    <>
    <main className="page products-page">
      <div className="products-head">
        <h1>Buy Products</h1>
        <div className="shop-meta">
          <span onClick={() => setCartOpen(true)} role="button" tabIndex={0}>🛒 Cart ({cartCount})</span>
        </div>
      </div>

      <input
        className="search-input"
        placeholder="Search products…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        id="product-search"
      />

      <div className="products-grid">
        {filtered.map((product) => (
          <article className="product-card" key={product.id} id={`product-${product.id}`}>
            <img src={product.image} alt={product.name} loading="lazy" />
            <h3>{product.name}</h3>
            <p className="product-price">₹{product.priceInr}</p>
            <div className="product-card-actions">
              <button type="button" className="add-btn" onClick={() => add(product)}>Add to Cart</button>
              <button type="button" className="buy-btn" onClick={() => buyNow(product)}>Buy Now</button>
            </div>
          </article>
        ))}
      </div>

      {/* Cart Drawer */}
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
                  <button className="cart-item-remove" onClick={() => remove(item.productId)}>✕</button>
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
    </main>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoggedIn={() => {
          loadCart();
        }}
        title="Login required for purchase"
        message="Please sign in with Google to add products to cart and complete checkout."
      />
    </>
  );
}
