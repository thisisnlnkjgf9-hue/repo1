import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../context/ToastContext';


/* ── Figma-matched static follow-up questions ── */
const FOLLOWUP_QUESTIONS = [
  {
    id: 'duration',
    prompt: 'How long have you been suffering from this condition?',
    type: 'scale',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8 or more'],
  },
  {
    id: 'conditions',
    prompt: 'Do you have any of the following conditions?',
    type: 'multi',
    options: [
      'High blood pressure',
      'High cholesterol',
      'Diabetes',
      'Thyroid condition',
      'Heart disease',
      'None of these',
      'Other (please specify)',
    ],
  },
  {
    id: 'weight_loss',
    prompt: 'Have you experienced unintended weight loss recently?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'tiredness',
    prompt: 'Have you been feeling more tired than usual?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'activity',
    prompt: 'What is your activity level?',
    type: 'single',
    options: ['Mostly sedentary', 'Some light exercises', 'Regular exercise', 'Athletic'],
  },
];

export default function SymptomFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const initialQuery = location.state?.initialQuery || '';

  const [disease, setDisease] = useState(initialQuery || '');
  const [diseaseSubmitted, setDiseaseSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [otherCondition, setOtherCondition] = useState('');
  const [searchInfo, setSearchInfo] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  /* Build the full answer payload for remedies page */
  const answerList = useMemo(
    () =>
      FOLLOWUP_QUESTIONS.map((q) => ({
        questionId: q.id,
        prompt: q.prompt,
        answer: q.type === 'multi'
          ? (answers[q.id] || []).join(', ')
          : answers[q.id] || '',
      })),
    [answers]
  );

  /* Step 1 — search the disease, show follow-up questions */
  const searchDisease = async () => {
    if (!disease.trim()) {
      toast.warning('Please enter a disease or health concern.');
      return;
    }

    setLoadingSearch(true);
    setDiseaseSubmitted(true);
    setAnswers({});

    try {
      const searchData = await api.aiSearch({ query: disease, prakriti: 'vata' });
      setSearchInfo(searchData);
      toast.success(`Results found for "${disease}"`);
    } catch {
      /* Still show questions even if AI search fails */
      toast.info(`Showing assessment for "${disease}"`);
    } finally {
      setLoadingSearch(false);
    }
  };

  /* Step 2 — submit answers and get remedies */
  const submitForRemedies = () => {
    const answered = Object.keys(answers).length;
    if (answered < 2) {
      toast.warning('Please answer at least a few questions for better results.');
      return;
    }

    navigate('/remedies', {
      state: {
        disease,
        answers: answerList,
        searchInfo,
      },
    });
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') searchDisease();
  };

  /* Answer helpers */
  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMulti = (questionId, value) => {
    setAnswers((prev) => {
      const arr = prev[questionId] || [];
      if (value === 'None of these') {
        return { ...prev, [questionId]: arr.includes(value) ? [] : ['None of these'] };
      }
      const filtered = arr.filter((v) => v !== 'None of these');
      return {
        ...prev,
        [questionId]: filtered.includes(value)
          ? filtered.filter((v) => v !== value)
          : [...filtered, value],
      };
    });
  };

  /* Progress bar */
  const answeredCount = FOLLOWUP_QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return q.type === 'multi' ? a && a.length > 0 : !!a;
  }).length;
  const progress = answeredCount / FOLLOWUP_QUESTIONS.length;

  return (
    <main className="page symptom-page">
      <section className="symptom-panel">
        {/* Search row */}
        <div className="search-row">
          <input
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Enter a disease or health concern..."
          />
          <button type="button" onClick={searchDisease}>
            Search
          </button>
        </div>

        {/* AI Summary */}
        {searchInfo && (
          <article className="ai-summary">
            <h3>AI Insight</h3>
            <p>{searchInfo.summary}</p>
            {searchInfo.caution && <p className="caution-text">{searchInfo.caution}</p>}
          </article>
        )}

        {/* Figma: "Answer some questions..." heading + progress bar */}
        {diseaseSubmitted && (
          <>
            <div className="questionnaire-header">
              <h2>Answer some questions so we can analyse your condition better:</h2>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="progress-label">{answeredCount} of {FOLLOWUP_QUESTIONS.length} answered</span>
            </div>

            {loadingSearch && <p className="loading-text">Preparing your assessment...</p>}

            {/* Questions list from Figma */}
            <div className="generated-questions figma-questions">
              {FOLLOWUP_QUESTIONS.map((q) => (
                <article key={q.id} className="dynamic-question" id={`question-${q.id}`}>
                  <h3>{q.prompt}</h3>

                  {/* Scale / numbered options (like duration 0-8+) */}
                  {q.type === 'scale' && (
                    <div className="scale-row figma-scale">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={answers[q.id] === opt ? 'active' : ''}
                          onClick={() => setAnswer(q.id, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Single-select options */}
                  {q.type === 'single' && (
                    <div className="scale-row">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={answers[q.id] === opt ? 'active' : ''}
                          onClick={() => setAnswer(q.id, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Multi-select with checkboxes (conditions) */}
                  {q.type === 'multi' && (
                    <div className="condition-list">
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          className={`condition-item${(answers[q.id] || []).includes(opt) ? ' active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={(answers[q.id] || []).includes(opt)}
                            onChange={() => toggleMulti(q.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                      {(answers[q.id] || []).includes('Other (please specify)') && (
                        <div className="other-input-wrap">
                          <input
                            className="other-condition-input"
                            placeholder="Other condition"
                            value={otherCondition}
                            onChange={(e) => setOtherCondition(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>


            {/* Submit "Next" button (Figma) */}
            <button
              type="button"
              className="next-btn figma-next-btn"
              onClick={submitForRemedies}
            >
              Next →
            </button>
          </>
        )}

        {/* Initial state — no disease searched yet */}
        {!diseaseSubmitted && (
          <div className="symptom-empty">
            <span className="symptom-empty-icon">🔍</span>
            <p>Search a disease or health concern above to begin your personalized assessment.</p>
          </div>
        )}
      </section>
    </main>
  );
}
