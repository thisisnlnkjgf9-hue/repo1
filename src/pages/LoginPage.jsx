import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!window.google?.accounts?.id) return;

    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          await login(response.credential);
          navigate('/', { replace: true });
        } catch (err) {
          console.error('Login failed:', err);
        }
      }
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'signin_with',
      shape: 'pill'
    });
  }, [login, navigate]);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-dot" />
          <h1>Nouryum</h1>
        </div>
        <p className="login-tagline">
          Your Ayurvedic wellness companion — personalized assessments, AI-powered remedies,
          curated products, and expert doctor consultations.
        </p>

        <div className="login-divider" />

        <h2>Welcome Back</h2>
        <p className="login-sub">Sign in to access your personalized wellness journey</p>

        <div className="google-btn-wrap" ref={btnRef} />

        {!GOOGLE_CLIENT_ID && (
          <p className="login-dev-note">
            ⚠ Google Client ID not configured. Add <code>VITE_GOOGLE_CLIENT_ID</code> to your{' '}
            <code>.env</code> file.
          </p>
        )}

        <div className="login-features">
          <div className="login-feature">
            <span>🧘</span>
            <div>
              <strong>Prakriti Assessment</strong>
              <p>Discover your Ayurvedic body type</p>
            </div>
          </div>
          <div className="login-feature">
            <span>🔬</span>
            <div>
              <strong>AI Symptom Analysis</strong>
              <p>Get personalized natural remedies</p>
            </div>
          </div>
          <div className="login-feature">
            <span>🛍</span>
            <div>
              <strong>Curated Products</strong>
              <p>Shop verified Ayurvedic supplements</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
