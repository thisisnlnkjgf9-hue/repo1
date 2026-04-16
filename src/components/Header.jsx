import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return;
      }

      setMenuOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const menuItems = [
    {
      label: 'Upload previous reports/Manage your report',
      to: '/labs',
      emphasized: true
    },
    { label: 'Manage your diet', to: '/diet' },
    { label: 'Previous orders', to: '/profile' },
    { label: 'Previous appointment', to: '/profile' },
    { label: 'Previous lab test reports', to: '/profile' }
  ];

  const openTarget = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="mobile-hamburger mobile-only" onClick={() => setMenuOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <Link to={isLoggedIn ? '/' : '/login'} className="brand" aria-label="Nouryum home">
        <span className="brand-dot desktop-only" />
        <span className="brand-text">Nouryum</span>
      </Link>

      <div className="topbar-right" ref={menuRef}>
        {isLoggedIn ? (
          <>
            <button className="mobile-user-icon mobile-only" onClick={() => navigate('/profile')}>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
            <button
              className="profile-pill desktop-only-flex"
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="profile-menu"
            >
              {user?.picture ? (
                <img src={user.picture} alt="" className="avatar-img" />
              ) : (
                <span className="avatar" />
              )}
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="menu-bars">≡</span>
            </button>

            {menuOpen && (
              <section id="profile-menu" className={`profile-menu ${window.innerWidth <= 768 ? 'full-mobile-menu' : ''}`} aria-label="Profile menu">
                <div className="mobile-menu-header mobile-only">
                  <button className="close-menu" onClick={() => setMenuOpen(false)}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <span className="mobile-brand">Nouryum</span>
                  <div style={{ width: 32 }}></div>
                </div>

                <div className="mobile-menu-box">
                  <div className="profile-menu-user desktop-only">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <ul>
                    {menuItems.map((item) => (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={item.emphasized ? 'menu-item emphasized' : 'menu-item'}
                          onClick={() => openTarget(item.to)}
                        >
                          • {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="desktop-only" style={{ display: 'flex', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <button 
                      type="button" 
                      onClick={handleLogout} 
                      className="logout-btn"
                    >
                      Logout from Nouryum
                    </button>
                  </div>
                  
                  <div className="mobile-only mobile-menu-footer">
                     <div className="footer-icons">
                       <button className="icon-btn">⚙</button>
                       <button className="icon-btn">?</button>
                     </div>
                     <Link to="/about" className="about-link" onClick={() => setMenuOpen(false)}>About Us</Link>
                     <div className="social-icons">
                       <span>◎</span> <span>◎</span> <span>◎</span>
                     </div>
                     <p className="copyright">© 2025 <strong>Nouryum</strong></p>
                     
                     <button type="button" onClick={handleLogout} className="logout-btn" style={{marginTop: 20}}>
                        Logout
                     </button>
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <button className="login-btn" type="button" onClick={() => navigate('/login')}>
            Login / Signup
          </button>
        )}
      </div>
    </header>
  );
}
