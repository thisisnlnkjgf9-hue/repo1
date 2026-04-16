import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export default function WeightManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = (user?.name || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, progRes] = await Promise.all([
          api.getWeightRecommendations().catch(() => null),
          api.getWeightProgress(user?.id || user?.userId).catch(() => ({ progress: [] }))
        ]);
        if (recRes) setRecommendations(recRes);
        setProgress(progRes?.progress || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const latest = progress[0];
  const report = recommendations?.assessment?.aiReport;
  const hasAssessment = !!recommendations?.assessment;

  return (
    <>
      <NavTabs />
      <main className="page wm-page">
        {/* ── Hero Section ── */}
        <section className="wm-hero">
          <div className="wm-hero-content">
            <span className="wm-hero-badge">🌿 Ayurvedic Weight Management</span>
            <h1>Balance your body, not just your weight</h1>
            <p className="wm-hero-sub">
              Discover your unique body constitution, get a personalized Ayurvedic plan,
              and track your transformation journey — all powered by ancient wisdom & modern AI.
            </p>
            <div className="wm-hero-actions">
              <button className="wm-primary-btn" onClick={() => navigate('/weight/assessment')}>
                🔬 Start Assessment
              </button>
              <button className="wm-secondary-btn" onClick={() => navigate('/weight/plan')}>
                📋 Explore Plan
              </button>
              <button className="wm-secondary-btn" onClick={() => navigate('/weight/progress')}>
                📊 Track My Progress
              </button>
            </div>
          </div>
          <div className="wm-hero-visual">
            <div className="wm-hero-circle">⚖️</div>
          </div>
        </section>

        {/* ── Dashboard Cards (if user has data) ── */}
        <section className="wm-dashboard">
          {/* Greeting Card */}
          <div className="wm-dash-card wm-greeting-card">
            <h2>{greeting}, {firstName} 🌸</h2>
            {hasAssessment && <p className="wm-prakriti-tag">Prakriti: <strong>{recommendations.assessment.scores ? recommendations.prakriti?.toUpperCase() : '—'}</strong></p>}
          </div>

          {/* Today's Plan */}
          <div className="wm-dash-card">
            <h3>🍽️ Today's Plan</h3>
            {report?.dietPlan ? (
              <div className="wm-plan-list">
                <p><span className="wm-meal-label">Breakfast:</span> {report.dietPlan.breakfast}</p>
                <p><span className="wm-meal-label">Lunch:</span> {report.dietPlan.lunch}</p>
                <p><span className="wm-meal-label">Dinner:</span> {report.dietPlan.dinner}</p>
                {report.dietPlan.snacks && <p><span className="wm-meal-label">Snacks:</span> {report.dietPlan.snacks}</p>}
              </div>
            ) : (
              <p className="wm-empty">Complete your assessment to get a personalized diet plan</p>
            )}
            <button className="wm-link-btn" onClick={() => navigate('/weight/plan')}>View Full Diet Plan →</button>
          </div>

          {/* Agni Tracker  */}
          <div className="wm-dash-card">
            <h3>🔥 Agni Tracker</h3>
            {hasAssessment ? (
              <>
                <div className="wm-agni-circle">
                  <svg viewBox="0 0 100 100" className="wm-progress-ring">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gold)" strokeWidth="8"
                      strokeDasharray={`${(recommendations.assessment.scores.digestion / 100) * 264} 264`}
                      strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                  <span className="wm-agni-pct">{recommendations.assessment.scores.digestion}%</span>
                </div>
                <p className="wm-agni-status">{report?.agniStatus || 'Digestion Score'}</p>
              </>
            ) : (
              <p className="wm-empty">Take assessment to check your Agni</p>
            )}
            <button className="wm-link-btn" onClick={() => navigate('/weight/progress')}>Log Digestion →</button>
          </div>

          {/* Herbal Support */}
          <div className="wm-dash-card">
            <h3>🌿 Herbal Support</h3>
            {report?.herbalSupport?.length > 0 ? (
              <div className="wm-herbal-list">
                {report.herbalSupport.slice(0, 3).map((h, i) => (
                  <div key={i} className="wm-herbal-item">
                    <strong>{h.name}</strong>
                    <span>{h.timing}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="wm-empty">Complete assessment for herbal recommendations</p>
            )}
            <button className="wm-link-btn" onClick={() => navigate('/weight/plan')}>View Details →</button>
          </div>

          {/* Progress */}
          <div className="wm-dash-card wm-progress-card">
            <h3>📊 Progress</h3>
            {progress.length >= 2 ? (
              <div className="wm-progress-indicators">
                <div className="wm-indicator">
                  <span className="wm-ind-icon">{progress[0].weight <= progress[1].weight ? '↓' : '↑'}</span>
                  <span>Weight</span>
                </div>
                <div className="wm-indicator">
                  <span className="wm-ind-icon">{progress[0].waist <= progress[1].waist ? '↓' : '↑'}</span>
                  <span>Inches</span>
                </div>
                <div className="wm-indicator">
                  <span className="wm-ind-icon">{progress[0].energy >= progress[1].energy ? '↑' : '↓'}</span>
                  <span>Energy</span>
                </div>
              </div>
            ) : (
              <p className="wm-empty">Start tracking to see your progress</p>
            )}
            <button className="wm-link-btn" onClick={() => navigate('/weight/progress')}>View Graph →</button>
          </div>
        </section>

        {/* ── Recommendations ── */}
        {recommendations && (
          <section className="wm-recs">
            {recommendations.packages?.length > 0 && (
              <div className="wm-rec-section">
                <h3>🏷️ Recommended Packages</h3>
                <div className="wm-rec-row">
                  {recommendations.packages.map(pkg => (
                    <div key={pkg.id} className="wm-rec-card" onClick={() => navigate('/panchakarma')}>
                      {pkg.badge && <span className="wm-rec-badge">{pkg.badge}</span>}
                      <h4>{pkg.name}</h4>
                      <p className="wm-rec-price">
                        <s>₹{pkg.actualPriceInr}</s> <strong>₹{pkg.offerPriceInr}</strong>
                      </p>
                      <p className="wm-rec-promise">{pkg.resultPromise}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.doctors?.length > 0 && (
              <div className="wm-rec-section">
                <h3>🩺 Recommended Doctors</h3>
                <div className="wm-rec-row">
                  {recommendations.doctors.map(doc => (
                    <div key={doc.id} className="wm-rec-card" onClick={() => navigate('/doctors')}>
                      <h4>{doc.name}</h4>
                      <p>{doc.specialization}</p>
                      <p className="wm-rec-price">₹{doc.consultationFee} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>consultation</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.products?.length > 0 && (
              <div className="wm-rec-section">
                <h3>✦ Recommended Products</h3>
                <div className="wm-rec-row">
                  {recommendations.products.map(prod => (
                    <div key={prod.id} className="wm-rec-card" onClick={() => navigate('/products')}>
                      <h4>{prod.name}</h4>
                      <p className="wm-rec-price">₹{prod.priceInr}</p>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>{prod.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
