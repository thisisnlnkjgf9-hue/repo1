import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

const SECTIONS = [
  { key: 'prakriti', label: 'Prakriti', icon: '🧬', desc: 'Body constitution' },
  { key: 'digestion', label: 'Digestion (Agni)', icon: '🔥', desc: 'Digestive health' },
  { key: 'lifestyle', label: 'Lifestyle (Dinacharya)', icon: '🏃', desc: 'Daily routine' },
  { key: 'sleep', label: 'Sleep (Nidra)', icon: '🌙', desc: 'Sleep quality' }
];

export default function WeightAssessmentPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState(null);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [prakritiAnswers, setPrakritiAnswers] = useState({});
  const [digestionAnswers, setDigestionAnswers] = useState({});
  const [lifestyleAnswers, setLifestyleAnswers] = useState({});
  const [sleepAnswers, setSleepAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getWeightQuestions().then(setAllQuestions).catch(() => toast.error('Failed to load questions'));
  }, []);

  const currentSection = SECTIONS[sectionIdx];

  const sectionQuestions = useMemo(() => {
    if (!allQuestions) return [];
    switch (currentSection.key) {
      case 'prakriti': return allQuestions.prakritiQuestions || [];
      case 'digestion': return allQuestions.digestionQuestions || [];
      case 'lifestyle': return allQuestions.lifestyleQuestions || [];
      case 'sleep': return allQuestions.sleepQuestions || [];
      default: return [];
    }
  }, [allQuestions, sectionIdx]);

  const currentAnswers = useMemo(() => {
    switch (currentSection.key) {
      case 'prakriti': return prakritiAnswers;
      case 'digestion': return digestionAnswers;
      case 'lifestyle': return lifestyleAnswers;
      case 'sleep': return sleepAnswers;
      default: return {};
    }
  }, [currentSection.key, prakritiAnswers, digestionAnswers, lifestyleAnswers, sleepAnswers]);

  const setCurrentAnswer = (qId, value) => {
    const setter = {
      prakriti: setPrakritiAnswers,
      digestion: setDigestionAnswers,
      lifestyle: setLifestyleAnswers,
      sleep: setSleepAnswers
    }[currentSection.key];
    setter(prev => ({ ...prev, [qId]: value }));
  };

  const question = sectionQuestions[questionIdx];
  const totalQuestions = allQuestions
    ? (allQuestions.prakritiQuestions?.length || 0) +
      (allQuestions.digestionQuestions?.length || 0) +
      (allQuestions.lifestyleQuestions?.length || 0) +
      (allQuestions.sleepQuestions?.length || 0)
    : 0;

  const answeredCount = Object.keys(prakritiAnswers).length +
    Object.keys(digestionAnswers).length +
    Object.keys(lifestyleAnswers).length +
    Object.keys(sleepAnswers).length;

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const goNext = () => {
    if (questionIdx < sectionQuestions.length - 1) {
      setQuestionIdx(prev => prev + 1);
    } else if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(prev => prev + 1);
      setQuestionIdx(0);
    }
  };

  const goPrev = () => {
    if (questionIdx > 0) {
      setQuestionIdx(prev => prev - 1);
    } else if (sectionIdx > 0) {
      const prevSection = SECTIONS[sectionIdx - 1];
      const prevQs = {
        prakriti: allQuestions.prakritiQuestions,
        digestion: allQuestions.digestionQuestions,
        lifestyle: allQuestions.lifestyleQuestions,
        sleep: allQuestions.sleepQuestions
      }[prevSection.key] || [];
      setSectionIdx(prev => prev - 1);
      setQuestionIdx(prevQs.length - 1);
    }
  };

  const isLastQuestion = sectionIdx === SECTIONS.length - 1 && questionIdx === sectionQuestions.length - 1;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        prakritiAnswers: Object.entries(prakritiAnswers).map(([questionId, optionValue]) => ({
          questionId,
          optionValue
        })),
        digestionAnswers,
        lifestyleAnswers,
        sleepAnswers
      };
      const res = await api.submitWeightAssessment(payload);
      setResult(res.assessment);

      if (res.assessment.prakriti && setUser) {
        setUser(prev => prev ? { ...prev, prakriti: res.assessment.prakriti } : prev);
      }

      toast.success('Assessment completed! Your report is ready.');
    } catch (err) {
      toast.error(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Result View ── */
  if (result) {
    const { scores, prakriti, aiReport } = result;
    return (
      <>
        <NavTabs />
        <main className="page wm-page">
          <section className="wm-report">
            <div className="wm-report-header">
              <h1>🌿 {aiReport?.title || 'Your Ayurvedic Body Report'}</h1>
              <p className="wm-report-prakriti">Prakriti: <strong>{prakriti?.toUpperCase()}</strong></p>
            </div>

            {/* Score Rings */}
            <div className="wm-score-grid">
              {[
                { label: 'Digestion', value: scores.digestion, color: '#f59e0b' },
                { label: 'Lifestyle', value: scores.lifestyle, color: '#10b981' },
                { label: 'Sleep', value: scores.sleep, color: '#6366f1' },
                { label: 'Overall', value: scores.overall, color: '#ef4444' }
              ].map(s => (
                <div key={s.label} className="wm-score-ring-card">
                  <svg viewBox="0 0 100 100" className="wm-score-ring">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={s.color} strokeWidth="6"
                      strokeDasharray={`${(s.value / 100) * 264} 264`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dasharray 1s ease' }} />
                  </svg>
                  <span className="wm-score-value">{s.value}%</span>
                  <span className="wm-score-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Agni & Dosha */}
            <div className="wm-report-cards-row">
              <div className="wm-report-info-card">
                <h3>🔥 Agni Status</h3>
                <p>{aiReport?.agniStatus || '—'}</p>
              </div>
              <div className="wm-report-info-card">
                <h3>⚖️ Dosha Imbalance</h3>
                <p>{aiReport?.doshaImbalance || '—'}</p>
              </div>
              <div className="wm-report-info-card">
                <h3>💚 Overall Health</h3>
                <p>{aiReport?.overallHealth || '—'}</p>
              </div>
            </div>

            {/* Diet Plan */}
            {aiReport?.dietPlan && (
              <div className="wm-report-section">
                <h3>🍽️ Recommended Diet Plan</h3>
                <div className="wm-diet-grid">
                  {Object.entries(aiReport.dietPlan).map(([meal, food]) => (
                    <div key={meal} className="wm-diet-item">
                      <span className="wm-diet-meal">{meal}</span>
                      <span>{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Herbal Support */}
            {aiReport?.herbalSupport?.length > 0 && (
              <div className="wm-report-section">
                <h3>🌿 Herbal Support</h3>
                <div className="wm-herbal-grid">
                  {aiReport.herbalSupport.map((h, i) => (
                    <div key={i} className="wm-herbal-card">
                      <strong>{h.name}</strong>
                      <span className="wm-herbal-timing">{h.timing}</span>
                      <span className="wm-herbal-purpose">{h.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {aiReport?.lifestyleRecommendations?.length > 0 && (
              <div className="wm-report-section">
                <h3>🏃 Lifestyle Recommendations</h3>
                <ul className="wm-reco-list">
                  {aiReport.lifestyleRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Dinacharya */}
            {aiReport?.dinacharyaTips?.length > 0 && (
              <div className="wm-report-section">
                <h3>☀️ Dinacharya (Daily Ritual)</h3>
                <ul className="wm-reco-list">
                  {aiReport.dinacharyaTips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            {aiReport?.cautionNote && (
              <p className="wm-caution">⚠️ {aiReport.cautionNote}</p>
            )}

            <div className="wm-report-actions">
              <button className="wm-primary-btn" onClick={() => navigate('/weight')}>← Back to Dashboard</button>
              <button className="wm-secondary-btn" onClick={() => navigate('/weight/progress')}>Track Progress →</button>
              <button className="wm-secondary-btn" onClick={() => navigate('/panchakarma')}>Explore Therapies →</button>
            </div>
          </section>
        </main>
      </>
    );
  }

  /* ── Quiz View ── */
  if (!allQuestions) {
    return <main className="page"><p>Loading assessment...</p></main>;
  }

  return (
    <>
      <NavTabs />
      <main className="page wm-page">
        <section className="wm-assessment">
          {/* Section tabs */}
          <div className="wm-section-tabs">
            {SECTIONS.map((sec, i) => (
              <button
                key={sec.key}
                className={`wm-section-tab ${i === sectionIdx ? 'active' : ''} ${i < sectionIdx ? 'done' : ''}`}
                onClick={() => { setSectionIdx(i); setQuestionIdx(0); }}
              >
                <span className="wm-tab-icon">{sec.icon}</span>
                <span className="wm-tab-label">{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="wm-progress-bar">
            <div className="wm-progress-fill" style={{ width: `${progressPct}%` }} />
            <span className="wm-progress-text">{answeredCount} / {totalQuestions} answered ({progressPct}%)</span>
          </div>

          {/* Question card */}
          {question && (
            <div className="wm-question-card">
              <p className="wm-q-section">{currentSection.icon} {currentSection.label}</p>
              <h2 className="wm-q-prompt">
                Q{questionIdx + 1}. {question.prompt}
              </h2>

              <div className="wm-options">
                {question.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`wm-option ${currentAnswers[question.id] === opt.value ? 'selected' : ''}`}
                    onClick={() => setCurrentAnswer(question.id, opt.value)}
                  >
                    <span className="wm-option-radio">
                      {currentAnswers[question.id] === opt.value ? '●' : '○'}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="wm-q-nav">
                <button className="wm-secondary-btn" onClick={goPrev} disabled={sectionIdx === 0 && questionIdx === 0}>
                  ← Back
                </button>
                {isLastQuestion ? (
                  <button className="wm-primary-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Generating Report...' : '🔬 Generate Report'}
                  </button>
                ) : (
                  <button className="wm-primary-btn" onClick={goNext} disabled={!currentAnswers[question.id]}>
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
