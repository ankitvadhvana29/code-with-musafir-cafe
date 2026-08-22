import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import TripMap from '../components/TripMap.jsx';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CATEGORIES = ['General', 'Food', 'Stay', 'Transport', 'Sightseeing', 'Shopping'];
const CHART_COLORS = ['#E8794A', '#2E7D6B', '#16405C', '#C7986B', '#8A5A44', '#3E7CB1'];

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState('');
  const [cityForm, setCityForm] = useState({ city_name: '', country: '', start_date: '', end_date: '' });
  const [activityForms, setActivityForms] = useState({});

  const load = () => {
    api.getTrip(id).then(setTrip).catch((err) => setError(err.message));
    api.getBudget(id).then(setBudget).catch(() => {});
  };

  useEffect(load, [id]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.addCity(id, cityForm);
      setTrip(updated);
      setCityForm({ city_name: '', country: '', start_date: '', end_date: '' });
      api.getBudget(id).then(setBudget);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveCity = async (cityId) => {
    const updated = await api.removeCity(id, cityId);
    setTrip(updated);
    api.getBudget(id).then(setBudget);
  };

  const setActivityField = (cityId, field, value) => {
    setActivityForms((prev) => ({
      ...prev,
      [cityId]: { ...(prev[cityId] || { name: '', category: 'General', cost: '', date: '' }), [field]: value },
    }));
  };

  const handleAddActivity = async (cityId) => {
    const form = activityForms[cityId];
    if (!form?.name) return;
    try {
      const updated = await api.addActivity(cityId, { ...form, cost: parseFloat(form.cost) || 0 });
      setTrip(updated);
      setActivityForms((prev) => ({ ...prev, [cityId]: { name: '', category: 'General', cost: '', date: '' } }));
      api.getBudget(id).then(setBudget);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveActivity = async (activityId) => {
    const updated = await api.removeActivity(activityId);
    setTrip(updated);
    api.getBudget(id).then(setBudget);
  };

  const toggleShare = async () => {
    const updated = await api.updateTrip(id, { is_public: trip.is_public ? 0 : 1 });
    setTrip(updated);
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Delete this trip permanently?')) return;
    await api.deleteTrip(id);
    navigate('/');
  };

  if (error) return <div className="form-error">{error}</div>;
  if (!trip) return <div className="loading-dots">Loading trip…</div>;

  const maxCategory = budget ? Math.max(1, ...budget.by_category.map((c) => c.total)) : 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{trip.title}</h1>
          <div className="sub">
            {trip.start_date ? `${trip.start_date} → ${trip.end_date || '?'}` : 'Dates not set'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="share-toggle">
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-soft)' }}>
              {trip.is_public ? 'Public' : 'Private'}
            </span>
            <button className={`switch ${trip.is_public ? 'on' : ''}`} onClick={toggleShare} aria-label="Toggle sharing" />
          </div>
          <Link to={`/trips/${id}/calendar`} className="btn btn-ghost">Timeline view</Link>
          <button className="btn-danger" onClick={handleDeleteTrip}>Delete trip</button>
        </div>
      </div>

      {budget && (
        <div className="budget-summary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 16 }}>
          <div className="card">
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-soft)' }}>Total budget</span>
            <b className="total">₹{budget.total_budget.toLocaleString()}</b>
          </div>
          <div className="card">
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-soft)', display: 'block', marginBottom: 10 }}>By category</span>
            {budget.by_category.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--slate-soft)' }}>No expenses yet</span>}
            {budget.by_category.map((c) => (
              <div className="bar-row" key={c.category}>
                <span className="label">{c.category}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.total / maxCategory) * 100}%` }} />
                </div>
                <span className="val">₹{c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-soft)', display: 'block', marginBottom: 6 }}>Breakdown</span>
            {budget.by_category.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-soft)' }}>No expenses yet</span>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={budget.by_category} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70}>
                    {budget.by_category.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      <TripMap cities={trip.cities} />

      <h2 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Route</h2>
      <div className="sub" style={{ marginBottom: 4 }}>Add cities in the order you'll visit them, then attach activities and costs to each stop.</div>

      <div className="route-timeline">
        {trip.cities.map((city) => {
          const cityTotal = city.activities.reduce((s, a) => s + (a.cost || 0), 0);
          const form = activityForms[city.id] || { name: '', category: 'General', cost: '', date: '' };
          return (
            <div className="route-stop" key={city.id}>
              <div className="stop-card">
                <div className="stop-title">
                  <div>
                    <h3>{city.city_name}{city.country ? `, ${city.country}` : ''}</h3>
                    <div className="stop-dates">
                      {city.start_date ? `${city.start_date} → ${city.end_date || '?'}` : 'Dates not set'} · ₹{cityTotal.toLocaleString()}
                    </div>
                  </div>
                  <button className="btn-danger" onClick={() => handleRemoveCity(city.id)}>Remove</button>
                </div>

                {city.activities.map((a) => (
                  <div className="activity-row" key={a.id}>
                    <span>
                      <span className="name">{a.name}</span>
                      <span className="category">{a.category}{a.date ? ` · ${a.date}` : ''}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="cost">₹{a.cost.toLocaleString()}</span>
                      <button className="btn-danger" onClick={() => handleRemoveActivity(a.id)}>×</button>
                    </span>
                  </div>
                ))}

                <div className="add-inline">
                  <input
                    placeholder="Activity name"
                    value={form.name}
                    onChange={(e) => setActivityField(city.id, 'name', e.target.value)}
                  />
                  <select value={form.category} onChange={(e) => setActivityField(city.id, 'category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Cost ₹"
                    value={form.cost}
                    onChange={(e) => setActivityField(city.id, 'cost', e.target.value)}
                    style={{ maxWidth: 100 }}
                  />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setActivityField(city.id, 'date', e.target.value)}
                    style={{ maxWidth: 150 }}
                  />
                  <button className="btn btn-ghost" onClick={() => handleAddActivity(city.id)} type="button">Add</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="card" onSubmit={handleAddCity} style={{ marginTop: 20 }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 12, display: 'block' }}>Add a city stop</label>
        <div className="add-inline">
          <input
            placeholder="City name"
            value={cityForm.city_name}
            onChange={(e) => setCityForm({ ...cityForm, city_name: e.target.value })}
            required
          />
          <input
            placeholder="Country"
            value={cityForm.country}
            onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })}
          />
          <input type="date" value={cityForm.start_date} onChange={(e) => setCityForm({ ...cityForm, start_date: e.target.value })} />
          <input type="date" value={cityForm.end_date} onChange={(e) => setCityForm({ ...cityForm, end_date: e.target.value })} />
          <button className="btn btn-primary" type="submit">Add stop</button>
        </div>
      </form>
    </div>
  );
}