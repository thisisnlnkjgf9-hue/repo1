import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import NavTabs from '../components/NavTabs';

export default function WeightProgressPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const userId = user?.id || user?.userId;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today,
    weight: '',
    waist: '',
    energy: 5,
    digestionScore: 50,
    sleepHours: 7,
    waterGlasses: 8,
    exerciseMinutes: 0,
    mealFollowed: false,
    notes: ''
  });

  useEffect(() => {
    if (!userId) return;
    api.getWeightProgress(userId)
      .then(res => setEntries(res.progress || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.logWeightProgress({
        ...form,
        weight: Number(form.weight) || 0,
        waist: Number(form.waist) || 0,
        energy: Number(form.energy),
        digestionScore: Number(form.digestionScore),
        sleepHours: Number(form.sleepHours),
        waterGlasses: Number(form.waterGlasses),
        exerciseMinutes: Number(form.exerciseMinutes)
      });
      toast.success('Progress logged!');
      setEntries(prev => [res.progress, ...prev.filter(e => e.date !== form.date)]);
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
  };

  const todayEntry = entries.find(e => e.date === today);

  /* Simple chart: last 14 days of weight */
  const chartData = [...entries].reverse().slice(-14);
  const maxWeight = Math.max(...chartData.map(e => e.weight || 0), 1);
  const minWeight = Math.min(...chartData.filter(e => e.weight > 0).map(e => e.weight), maxWeight);
  const range = maxWeight - minWeight || 1;

  return (
    <>
      <NavTabs />
      <main className="page wm-page">
        <div className="wm-progress-header">
          <div>
            <h1>📊 Track My Progress</h1>
            <p style={{ color: 'var(--muted)' }}>Log daily and watch your transformation</p>
          </div>
          <div className="wm-progress-header-actions">
            <button className="wm-primary-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Close' : '+ Log Today'}
            </button>
            <button className="wm-secondary-btn" onClick={() => navigate('/weight')}>← Dashboard</button>
          </div>
        </div>

        {/* Log Form */}
        {showForm && (
          <form className="wm-log-form" onSubmit={handleSubmit}>
            <h3>📝 Log for {form.date}</h3>
            <div className="wm-form-grid">
              <label>
                <span>Date</span>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </label>
              <label>
                <span>Weight (kg)</span>
                <input type="number" step="0.1" placeholder="e.g. 68.5" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />
              </label>
              <label>
                <span>Waist (inches)</span>
                <input type="number" step="0.1" placeholder="e.g. 32" value={form.waist} onChange={e => setForm(p => ({ ...p, waist: e.target.value }))} />
              </label>
              <label>
                <span>Energy Level (1–10)</span>
                <input type="range" min="1" max="10" value={form.energy} onChange={e => setForm(p => ({ ...p, energy: e.target.value }))} />
                <span className="wm-range-val">{form.energy}/10</span>
              </label>
              <label>
                <span>Digestion Score (%)</span>
                <input type="range" min="0" max="100" value={form.digestionScore} onChange={e => setForm(p => ({ ...p, digestionScore: e.target.value }))} />
                <span className="wm-range-val">{form.digestionScore}%</span>
              </label>
              <label>
                <span>Sleep (hours)</span>
                <input type="number" step="0.5" min="0" max="16" value={form.sleepHours} onChange={e => setForm(p => ({ ...p, sleepHours: e.target.value }))} />
              </label>
              <label>
                <span>Water (glasses)</span>
                <input type="number" min="0" value={form.waterGlasses} onChange={e => setForm(p => ({ ...p, waterGlasses: e.target.value }))} />
              </label>
              <label>
                <span>Exercise (min)</span>
                <input type="number" min="0" value={form.exerciseMinutes} onChange={e => setForm(p => ({ ...p, exerciseMinutes: e.target.value }))} />
              </label>
              <label className="wm-checkbox-label">
                <input type="checkbox" checked={form.mealFollowed} onChange={e => setForm(p => ({ ...p, mealFollowed: e.target.checked }))} />
                <span>Followed meal plan today</span>
              </label>
            </div>
            <label style={{ display: 'block', marginTop: 12 }}>
              <span>Notes</span>
              <textarea rows="2" placeholder="How do you feel today?" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </label>
            <button type="submit" className="wm-primary-btn" style={{ marginTop: 16 }}>Save Progress</button>
          </form>
        )}

        {/* Today's Summary */}
        {todayEntry && !showForm && (
          <div className="wm-today-summary">
            <h3>🌟 Today's Snapshot</h3>
            <div className="wm-today-grid">
              <div className="wm-today-stat"><span>⚖️</span><strong>{todayEntry.weight || '—'}</strong><small>kg</small></div>
              <div className="wm-today-stat"><span>📏</span><strong>{todayEntry.waist || '—'}</strong><small>inches</small></div>
              <div className="wm-today-stat"><span>⚡</span><strong>{todayEntry.energy}/10</strong><small>energy</small></div>
              <div className="wm-today-stat"><span>🔥</span><strong>{todayEntry.digestionScore}%</strong><small>digestion</small></div>
              <div className="wm-today-stat"><span>😴</span><strong>{todayEntry.sleepHours}h</strong><small>sleep</small></div>
              <div className="wm-today-stat"><span>💧</span><strong>{todayEntry.waterGlasses}</strong><small>glasses</small></div>
            </div>
          </div>
        )}

        {/* Simple Weight Chart */}
        {chartData.length > 1 && (
          <div className="wm-chart-section">
            <h3>📈 Weight Trend</h3>
            <div className="wm-chart">
              {chartData.map((e, i) => {
                const pct = e.weight > 0 ? ((e.weight - minWeight) / range) * 80 + 10 : 5;
                return (
                  <div key={e.date} className="wm-chart-bar-wrap" title={`${e.date}: ${e.weight} kg`}>
                    <div className="wm-chart-bar" style={{ height: `${pct}%` }}>
                      <span className="wm-chart-val">{e.weight}</span>
                    </div>
                    <span className="wm-chart-label">{e.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="wm-history">
          <h3>📋 History</h3>
          {entries.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No entries yet. Start logging today!</p>
          ) : (
            <div className="wm-table-wrap">
              <table className="wm-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Weight</th><th>Waist</th><th>Energy</th><th>Digestion</th><th>Sleep</th><th>Meal Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 30).map(e => (
                    <tr key={e.date}>
                      <td>{e.date}</td>
                      <td>{e.weight || '—'} kg</td>
                      <td>{e.waist || '—'}"</td>
                      <td>{e.energy}/10</td>
                      <td>{e.digestionScore}%</td>
                      <td>{e.sleepHours}h</td>
                      <td>{e.mealFollowed ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
