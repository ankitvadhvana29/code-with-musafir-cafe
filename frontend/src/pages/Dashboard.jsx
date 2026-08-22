import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

const COLORS = ['#E8794A', '#2E7D6B', '#16405C', '#C7986B'];

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api
      .listTrips()
      .then(setTrips)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const trip = await api.createTrip({
        title,
        start_date: startDate || null,
        end_date: endDate || null,
        cover_color: COLORS[trips.length % COLORS.length],
      });
      setShowForm(false);
      setTitle('');
      setStartDate('');
      setEndDate('');
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <div className="sub">Your itineraries, budgets, and shared plans in one place.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          + New trip
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 28 }} onSubmit={handleCreate}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>Trip title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer Europe Loop" required />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Create trip</button>
        </form>
      )}

      {loading ? (
        <div className="loading-dots">Loading your trips…</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <h3>No trips yet</h3>
          <p>Create your first itinerary to start adding cities and activities.</p>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)} style={{ cursor: 'pointer' }}>
              <div className="cover" style={{ background: trip.cover_color || '#E8794A' }} />
              <div className="body">
                <h3>{trip.title}</h3>
                <div className="meta">
                  {trip.start_date ? `${trip.start_date} → ${trip.end_date || '?'}` : 'Dates not set'}
                  {trip.is_public ? ' · Public' : ''}
                </div>
                <div className="stats">
                  <span><b>{trip.city_count}</b> cities</span>
                  <span><b>₹{trip.total_budget.toLocaleString()}</b> budget</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
