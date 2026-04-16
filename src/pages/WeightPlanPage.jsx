import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export default function WeightPlanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?.userId;
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.getWeightAssessments(userId)
      .then(res => {
        if (res.assessments?.length > 0) setAssessment(res.assessments[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const report = assessment?.aiReport;

  if (loading) return <main className="page"><p>Loading plan...</p></main>;

  if (!assessment) {
    return (
      <>
        <NavTabs />
        <main className="page wm-page">
          <section className="wm-empty-state">
            <h1>📋 Your Personalized Plan</h1>
            <p>Complete the assessment first to get your tailored Ayurvedic plan.</p>
            <button className="wm-primary-btn" onClick={() => navigate('/weight/assessment')}>
              🔬 Start Assessment
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <NavTabs />
      <main className="page wm-page">
        <div className="wm-plan-header">
          <h1>📋 Your Ayurvedic Plan</h1>
          <p>Prakriti: <strong>{assessment.prakriti?.toUpperCase()}</strong> | Overall Score: <strong>{assessment.scores?.overall}%</strong></p>
        </div>

        {/* Diet Section */}
        <section className="wm-plan-section">
          <h2>🍽️ Diet (Ahara)</h2>
          {report?.dietPlan ? (
            <div className="wm-plan-diet-cards">
              {Object.entries(report.dietPlan).map(([meal, food]) => (
                <div key={meal} className="wm-plan-card">
                  <h4>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h4>
                  <p>{food}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="wm-empty">No diet plan available</p>
          )}
        </section>

        {/* Therapy Section */}
        <section className="wm-plan-section">
          <h2>🧘 Therapy (Chikitsa)</h2>
          {report?.herbalSupport?.length > 0 ? (
            <div className="wm-plan-diet-cards">
              {report.herbalSupport.map((h, i) => (
                <div key={i} className="wm-plan-card">
                  <h4>🌿 {h.name}</h4>
                  <p><strong>When:</strong> {h.timing}</p>
                  <p><strong>Why:</strong> {h.purpose}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="wm-empty">No herbal therapy recommendations</p>
          )}
          <button className="wm-link-btn" onClick={() => navigate('/panchakarma')}>
            Explore Panchakarma Therapies →
          </button>
        </section>

        {/* Routine Section */}
        <section className="wm-plan-section">
          <h2>☀️ Daily Routine (Dinacharya)</h2>
          {report?.dinacharyaTips?.length > 0 ? (
            <div className="wm-plan-diet-cards">
              {report.dinacharyaTips.map((tip, i) => (
                <div key={i} className="wm-plan-card wm-plan-tip">
                  <span className="wm-tip-num">{i + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="wm-empty">No routine tips available</p>
          )}
        </section>

        {/* Lifestyle */}
        <section className="wm-plan-section">
          <h2>🏃 Lifestyle Recommendations</h2>
          {report?.lifestyleRecommendations?.length > 0 ? (
            <ul className="wm-reco-list wm-plan-list-styled">
              {report.lifestyleRecommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          ) : (
            <p className="wm-empty">No lifestyle recommendations</p>
          )}
        </section>

        {/* Weight Trackers */}
        <section className="wm-plan-section">
          <h2>📊 Reduce Weight Trackers</h2>
          <div className="wm-tracker-cta">
            <p>Log your daily weight, measurements, diet adherence, and more to track your transformation.</p>
            <button className="wm-primary-btn" onClick={() => navigate('/weight/progress')}>
              Open Progress Tracker →
            </button>
          </div>
        </section>

        {report?.cautionNote && (
          <p className="wm-caution">⚠️ {report.cautionNote}</p>
        )}
      </main>
    </>
  );
}
