import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Shared() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.publicTrips().then(setTrips).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Shared trips</h1>
          <div className="sub">Itineraries other travelers have made public.</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-dots">Loading…</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing shared yet</h3>
          <p>When someone makes a trip public, it'll show up here.</p>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)} style={{ cursor: 'pointer' }}>
              <div className="cover" style={{ background: trip.cover_color || '#E8794A' }} />
              <div className="body">
                <h3>{trip.title}</h3>
                <div className="meta">by {trip.owner_name}</div>
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
