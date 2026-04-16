import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuth } from '../context/AuthContext';

export default function RemediesPage() {
  const { user } = useAuth();
  const userId = user?.id || user?.userId || 'u1';
  const { state } = useLocation();
  const navigate = useNavigate();
  const { pay } = useRazorpay();
  const disease = state?.disease || state?.symptom || 'Sleep disorder';
  const answers = useMemo(() => state?.answers || [], [state]);
  const [payload, setPayload] = useState(null);

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

  const buyProduct = (product) => {
    pay({
      amount: product.priceInr,
      description: product.name,
      onSuccess: () => {
        navigate('/products');
      }
    });
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

        {Array.isArray(payload.productRecommendations) && payload.productRecommendations.length > 0 && (
          <article className="remedy-item">
            <h3>• Suggested Products</h3>
            <div className="recommendation-grid">
              {payload.productRecommendations.map((product) => (
                <div key={product.id} className="rec-item">
                  <strong>{product.name}</strong>
                  <p>₹{product.priceInr}</p>
                  <button type="button" onClick={() => buyProduct(product)}>
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
