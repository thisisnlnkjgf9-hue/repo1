import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function PrakritiPage() {
  const { user, setUser, isLoggedIn } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState('');
  const [details, setDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const doshaChart = useMemo(() => {
    if (!details) return null;

    const scoreMap = {
      vata: 0,
      pitta: 0,
      kapha: 0
    };

    if (details.dominant && scoreMap[details.dominant] !== undefined) {
      scoreMap[details.dominant] = details.dominantScore || 0;
    }
    if (details.second && scoreMap[details.second] !== undefined) {
      scoreMap[details.second] = details.secondScore || 0;
    }
    if (details.third && scoreMap[details.third] !== undefined) {
      scoreMap[details.third] = details.thirdScore || 0;
    }

    const vata = Math.max(0, Math.min(100, scoreMap.vata));
    const pitta = Math.max(0, Math.min(100 - vata, scoreMap.pitta));
    const kapha = Math.max(0, 100 - vata - pitta);

    const pittaEnd = vata + pitta;

    return {
      scoreMap,
      chartBackground: `conic-gradient(#8d6ad1 0 ${vata}%, #ef9143 ${vata}% ${pittaEnd}%, #5ca96c ${pittaEnd}% 100%)`
    };
  }, [details]);

  const selectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const onNext = async () => {
    if (index < questions.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    if (!isLoggedIn) {
      setShowLoginModal(true);
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
      setIsCompleted(true);
    } catch (err) {
      setResult('Failed to save. Please try again.');
      setIsCompleted(false);
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

        {!isCompleted && (
          <>
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
                className={index < questions.length - 1 ? 'next-btn' : 'next-btn prakriti-submit-btn'}
                onClick={onNext}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : index < questions.length - 1 ? 'Next' : 'Save My Prakriti Result'}
              </button>
            </div>
          </>
        )}

        {result && <h3 className="success-text" style={{ marginTop: 24, textAlign: 'center' }}>{result}</h3>}
        {details && (
          <div className="prakriti-result-card">
            <h4>Prakriti Breakdown</h4>

            <div className="prakriti-chart-layout">
              <div className="prakriti-donut" style={{ background: doshaChart?.chartBackground || '#ddd' }}>
                <div className="prakriti-donut-hole">
                  <span className="prakriti-donut-title">Dominant</span>
                  <strong>{details.dominant?.toUpperCase()}</strong>
                  <span className="prakriti-donut-score">{details.dominantScore}%</span>
                </div>
              </div>

              <div className="prakriti-score-grid">
                <div className="prakriti-score-row">
                  <span className="dosha-chip vata">Vata</span>
                  <strong>{doshaChart?.scoreMap?.vata || 0}%</strong>
                </div>
                <div className="prakriti-score-row">
                  <span className="dosha-chip pitta">Pitta</span>
                  <strong>{doshaChart?.scoreMap?.pitta || 0}%</strong>
                </div>
                <div className="prakriti-score-row">
                  <span className="dosha-chip kapha">Kapha</span>
                  <strong>{doshaChart?.scoreMap?.kapha || 0}%</strong>
                </div>
              </div>
            </div>

            <p className="prakriti-result-note">
              Based on your answers, your constitution leans heavily towards <b>{details.dominant.toUpperCase()}</b>{details.secondScore >= 20 ? `, with a strong secondary influence from ${details.second.toUpperCase()}` : ''}. This means you should follow a primarily {details.dominant.toUpperCase()}-pacifying lifestyle and diet.
            </p>
          </div>
        )}
      </section>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoggedIn={onNext}
        title="Login required to save assessment"
        message="You can complete the quiz as guest, but please sign in with Google to save your Prakriti result."
      />
    </main>
  );
}
