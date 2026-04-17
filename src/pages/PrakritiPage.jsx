import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PrakritiPage() {
  const { user, setUser } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState('');
  const [details, setDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getPrakritiQuestions()
      .then((data) => setQuestions(data.questions || []))
      .catch(() => setLoadError('Unable to load assessment questions. Please try again.'))
      .finally(() => setLoadingQuestions(false));
  }, []);

  const question = questions[index];
  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((index + 1) / questions.length) * 100;
  }, [index, questions.length]);

  const selectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const onNext = async () => {
    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, optionValue]) => ({
        questionId,
        optionValue
      }));
      const res = await api.submitPrakriti(userId, payload);
      const prakriti = res.prakriti;
      const pd = res.prakritiDetails;

      // Update user context so profile page shows new prakriti immediately
      if (setUser) {
        setUser((prev) => prev ? { ...prev, prakriti } : prev);
      }

      setResult(`Your dominant prakriti is ${prakriti.toUpperCase()}`);
      if (pd) setDetails(pd);
    } catch (err) {
      setResult('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return <main className="page loading-text">Loading assessment...</main>;
  }

  if (loadError) {
    return (
      <main className="page">
        <section className="quiz-panel">
          <h1>Prakriti Assessment</h1>
          <p className="caution-text">{loadError}</p>
        </section>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="page">
        <section className="quiz-panel">
          <h1>Prakriti Assessment</h1>
          <p>No questions available right now. Please try again later.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page prakriti-page">
      <section className="quiz-panel">
        <h1>Prakriti Assessment</h1>
        <p>
          Prakriti is your unique Ayurvedic body type, set at birth and constant for life.
          It's identified through a questionnaire on your lifestyle, physical traits, and
          bodily functions.
        </p>

        <p>Complete the following questionnaire to understand your Prakriti:</p>
        <progress max="100" value={progress} />

        <h2>
          Question {index + 1} of {questions.length}: {question.prompt}
        </h2>
        <div className="option-row">
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={answers[question.id] === option.value ? 'selected' : ''}
              onClick={() => selectOption(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="quiz-actions">
          <button
            type="button"
            onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
            disabled={index === 0}
          >
            ← Back
          </button>
          <button
            type="button"
            className="next-btn"
            onClick={onNext}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : index < questions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>

        {result && <h3 className="success-text" style={{ marginTop: 24, textAlign: 'center' }}>{result}</h3>}
        {details && (
          <div style={{ marginTop: 20, padding: 20, background: 'var(--panel)', borderRadius: 12 }}>
            <h4 style={{ marginBottom: 16 }}>Prakriti Breakdown</h4>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Dominant ({details.dominant.toUpperCase()})</span>
                <span>{details.dominantScore}%</span>
              </div>
              <div style={{ width: '100%', height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${details.dominantScore}%`, height: '100%', background: 'var(--primary)', borderRadius: 6 }} />
              </div>
            </div>
            
            {details.second && details.secondScore > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Secondary ({details.second.toUpperCase()})</span>
                  <span>{details.secondScore}%</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${details.secondScore}%`, height: '100%', background: '#ff9800', borderRadius: 5 }} />
                </div>
              </div>
            )}
            
            {details.third && details.thirdScore > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--muted)' }}>Tertiary ({details.third.toUpperCase()})</span>
                  <span style={{ color: 'var(--muted)' }}>{details.thirdScore}%</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${details.thirdScore}%`, height: '100%', background: 'var(--muted)', borderRadius: 4 }} />
                </div>
              </div>
            )}
            <p style={{ marginTop: 16, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Based on your answers, your constitution leans heavily towards <b>{details.dominant.toUpperCase()}</b>{details.secondScore >= 20 ? `, with a strong secondary influence from ${details.second.toUpperCase()}` : ''}. This means you should follow a primarily {details.dominant.toUpperCase()}-pacifying lifestyle and diet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
