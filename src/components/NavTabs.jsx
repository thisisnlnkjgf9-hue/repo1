import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/about', label: 'About Us' },
  { to: '/blogs', label: 'Podcasts & Blogs' },
  { to: '/feedback', label: 'Feedbacks' }
];

export default function NavTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="tabs" aria-label="Primary sections">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`tab-link ${pathname === tab.to ? 'active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
