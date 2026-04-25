import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginRequiredModal({
  open,
  onClose,
  onLoggedIn,
  title = 'Login required',
  message = 'Please sign in with Google to continue.'
}) {
  const { login, isLoggedIn } = useAuth();
  const btnRef = useRef(null);
  const initialized = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setError('');

    if (isLoggedIn) {
      onClose?.();
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setError('Google sign-in is not configured. Please contact support.');
      return;
    }

    if (!window.google?.accounts?.id || !btnRef.current) {
      setError('Google sign-in is still loading. Please wait a moment and try again.');
      return;
    }

    btnRef.current.innerHTML = '';

    if (!initialized.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await login(response.credential);
            onClose?.();
            if (onLoggedIn) {
              onLoggedIn();
            }
          } catch {
            setError('Login failed. Please try again.');
          }
        }
      });
      initialized.current = true;
    }

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      width: Math.min(320, Math.max(220, window.innerWidth - 96)),
      text: 'signin_with',
      shape: 'pill'
    });
  }, [open, isLoggedIn, login, onClose, onLoggedIn]);

  if (!open) return null;

  return (
    <div className="login-required-overlay" onClick={onClose}>
      <section className="login-required-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="login-required-close" onClick={onClose} aria-label="Close">
          x
        </button>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="login-required-btn" ref={btnRef} />
        {error && <p className="caution-text">{error}</p>}
      </section>
    </div>
  );
}
