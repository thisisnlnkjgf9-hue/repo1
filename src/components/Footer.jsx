import { useState } from 'react';

export default function Footer() {
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-main-row">
        <span>© Copyright Nouryum. All rights reserved.</span>
        <span className="footer-links">
          <a href="#terms">T&Cs*</a>
          <button
            type="button"
            className="footer-contact-toggle"
            onClick={() => setShowContact((prev) => !prev)}
            aria-expanded={showContact}
            aria-controls="footer-contact"
          >
            Contact Us
          </button>
        </span>
      </div>

      {showContact && (
        <section className="footer-contact" id="footer-contact" aria-label="Contact information">
          <h3>Contact Us</h3>
          <div className="footer-contact-grid">
            <a className="footer-contact-item" href="https://www.instagram.com/nouryum" target="_blank" rel="noreferrer">
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <span>Instagram: @nouryum</span>
            </a>

            <a className="footer-contact-item" href="https://nouryum.in" target="_blank" rel="noreferrer">
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4 12h16M12 4c2 2.2 3 5 3 8s-1 5.8-3 8c-2-2.2-3-5-3-8s1-5.8 3-8z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span>Website: nouryum.in</span>
            </a>

            <a className="footer-contact-item" href="mailto:nouryumhealth@gmail.com">
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <span>Email: nouryumhealth@gmail.com</span>
            </a>

            <p className="footer-contact-item">
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 21c4.5-4.6 6.8-8 6.8-10.7A6.8 6.8 0 1 0 5.2 10.3C5.2 13 7.5 16.4 12 21z" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="10.2" r="2.3" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <span>Address: H.no 116, Krishnapuram Colony, Sanjeev Nagar, Airport Road, Bhopal, M.P. 462038</span>
            </p>
          </div>
        </section>
      )}
    </footer>
  );
}
