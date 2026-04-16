import { useEffect, useState } from 'react';
import { api } from '../api';

export default function DietPage() {
  const [prakriti, setPrakriti] = useState('vata');
  const [season, setSeason] = useState('summer');
  const [tips, setTips] = useState([]);
  const [seasonalTips, setSeasonalTips] = useState([]);

  useEffect(() => {
    api.getDietTips(prakriti).then((res) => setTips(res.tips || []));
  }, [prakriti]);

  useEffect(() => {
    api.getSeasonalDietTips(season).then((res) => setSeasonalTips(res.tips || []));
  }, [season]);

  return (
    <main className="page diet-page">
      <h1>Diet Tips For You</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Personalized diet recommendations based on your Prakriti body type.
      </p>

      <h3 style={{ marginBottom: 10 }}>Diet Tips For You</h3>
      <div className="filter-row">
        {['vata', 'pitta', 'kapha'].map((type) => (
          <button
            type="button"
            key={type}
            className={prakriti === type ? 'active' : ''}
            onClick={() => setPrakriti(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="tip-list">
        {tips.map((tip) => (
          <article key={tip} className="tip-item">
            {tip}
          </article>
        ))}
      </div>

      <h3 style={{ margin: '20px 0 10px' }}>Seasonal Diet Tips</h3>
      <div className="filter-row">
        {['summer', 'monsoon', 'winter', 'spring'].map((item) => (
          <button
            type="button"
            key={item}
            className={season === item ? 'active' : ''}
            onClick={() => setSeason(item)}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="tip-list">
        {seasonalTips.map((tip) => (
          <article key={tip} className="tip-item">
            {tip}
          </article>
        ))}
      </div>
    </main>
  );
}
