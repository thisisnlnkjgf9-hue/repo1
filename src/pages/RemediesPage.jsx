import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function RemediesPage() {
  const { user, isLoggedIn } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const disease = state?.disease || state?.symptom || 'Sleep disorder';
  const answers = useMemo(() => state?.answers || [], [state]);
  const [payload, setPayload] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (answers.length) {
        const result = await api.analyzeDiseaseSymptoms({
          userId,
          disease,
          answers,
          prakriti: 'vata'
        });
        setPayload(result);
        return;
      }

      const result = await api.analyzeSymptoms(disease);
      setPayload(result);
    };

    load();
  }, [disease, answers]);

  const buyProduct = async (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      await api.addToCart({ userId, productId: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart. Complete checkout now.`);
      navigate('/products', { state: { openCart: true } });
    } catch (error) {
      toast.error(error.message || 'Could not add product to cart.');
    }
  };

  if (!payload) {
    return <main className="page loading-text">Analyzing your symptoms...</main>;
  }

  return (
    <main className="page remedies-page">
      <section className="remedy-panel">
        <div className="search-row">
          <input value={disease} readOnly />
          <button type="button" onClick={() => navigate('/symptoms')}>Search</button>
        </div>

        <h1>{payload.title || `Natural Remedies for ${disease}`}</h1>

        {payload.ayurvedicNarrative && (
          <article className="ai-summary" style={{ marginBottom: 14 }}>
            <h3>Detailed Ayurvedic Interpretation</h3>
            <div className="ai-ayurvedic-block">
              <p>{payload.ayurvedicNarrative}</p>
            </div>
          </article>
        )}

        {payload.ayurvedicAssessment && (
          <article className="ai-summary" style={{ marginBottom: 14 }}>
            <h3>Ayurvedic Insight</h3>
            <div className="ai-ayurvedic-block">
              <p>
                <strong>Probable Dosha Imbalance:</strong> {payload.ayurvedicAssessment.probableDoshaImbalance || '-'}
              </p>
              <p>
                <strong>Agni Status:</strong> {payload.ayurvedicAssessment.agniStatus || '-'}
              </p>
              {Array.isArray(payload.ayurvedicAssessment.amaSignals) && payload.ayurvedicAssessment.amaSignals.length > 0 && (
                <div className="ai-list-block">
                  <strong>Ama Signals:</strong>
                  <ul>
                    {payload.ayurvedicAssessment.amaSignals.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        )}

        {payload.caution && <p className="caution-text">{payload.caution}</p>}

        {(payload.remedyPlan || payload.remedies || []).map((item) => (
          <article key={item.heading} className="remedy-item">
            <h3>• {item.heading}</h3>
            <p>{item.content}</p>
          </article>
        ))}

        {Array.isArray(payload.dietTips) && payload.dietTips.length > 0 && (
          <article className="remedy-item">
            <h3>• Diet Tips</h3>
            {payload.dietTips.map((tip) => (
              <p key={tip}>— {tip}</p>
            ))}
          </article>
        )}

        {Array.isArray(payload.lifestyleTips) && payload.lifestyleTips.length > 0 && (
          <article className="remedy-item">
            <h3>• Lifestyle Tips</h3>
            {payload.lifestyleTips.map((tip) => (
              <p key={tip}>— {tip}</p>
            ))}
          </article>
        )}

        {Array.isArray(payload.pathyaSuggestions) && payload.pathyaSuggestions.length > 0 && (
          <article className="remedy-item">
            <h3>• Pathya (Supportive choices)</h3>
            {payload.pathyaSuggestions.map((tip) => (
              <p key={tip}>— {tip}</p>
            ))}
          </article>
        )}

        {Array.isArray(payload.apathyaAvoid) && payload.apathyaAvoid.length > 0 && (
          <article className="remedy-item">
            <h3>• Apathya (Avoid/limit)</h3>
            {payload.apathyaAvoid.map((tip) => (
              <p key={tip}>— {tip}</p>
            ))}
          </article>
        )}

        {Array.isArray(payload.dinacharyaTips) && payload.dinacharyaTips.length > 0 && (
          <article className="remedy-item">
            <h3>• Dinacharya Tips</h3>
            {payload.dinacharyaTips.map((tip) => (
              <p key={tip}>— {tip}</p>
            ))}
          </article>
        )}

        {Array.isArray(payload.productRecommendations) && payload.productRecommendations.length > 0 && (
          <article className="remedy-item">
            <h3>• Suggested Products (Add to Cart & Checkout)</h3>
            <div className="recommendation-grid">
              {payload.productRecommendations.map((product) => (
                <div key={product.id} className="rec-item">
                  <strong>{product.name}</strong>
                  <p>₹{product.priceInr}</p>
                  <button type="button" onClick={() => buyProduct(product)}>
                    Add to Cart & Checkout
                  </button>
                </div>
              ))}
            </div>
          </article>
        )}
      </section>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login required for purchase"
        message="Please sign in with Google to add suggested products to cart and checkout."
      />
    </main>
  );
}
