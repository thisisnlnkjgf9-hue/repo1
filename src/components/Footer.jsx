import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main-row">
        <span>© Copyright Nouryum. All rights reserved.</span>
        <span className="footer-links">
          <Link to="/tnc">T&Cs*</Link>
          <Link to="/contact" className="footer-contact-toggle">Contact Us</Link>
        </span>
      </div>
    </footer>
  );
}
