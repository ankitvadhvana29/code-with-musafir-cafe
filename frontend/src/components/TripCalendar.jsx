import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function TripCalendar() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTrip(id).then(setTrip).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="form-error">{error}</div>;
  if (!trip) return <div className="loading-dots">Loading calendar…</div>;

  const dayMap = {};
  trip.cities.forEach((city) => {
    city.activities.forEach((a) => {
      const day = a.date || 'No date';
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({ ...a, cityName: city.city_name });
    });
  });

  const sortedDays = Object.keys(dayMap).sort((a, b) => {
    if (a === 'No date') return 1;
    if (b === 'No date') return -1;
    return new Date(a) - new Date(b);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{trip.title} — Timeline</h1>
          <div className="sub">Day-by-day view of your itinerary.</div>
        </div>
        <Link to={`/trips/${id}`} className="btn btn-ghost">← Back to trip</Link>
      </div>

      {sortedDays.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing scheduled yet</h3>
          <p>Add activities with dates to see them here.</p>
        </div>
      ) : (
        <div style={{ borderLeft: '3px solid #E8794A', paddingLeft: 24, marginLeft: 8 }}>
          {sortedDays.map((day) => {
            const items = dayMap[day];
            const dayTotal = items.reduce((s, a) => s + (a.cost || 0), 0);
            return (
              <div key={day} style={{ marginBottom: 28, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -32, top: 4,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#E8794A', border: '3px solid white', boxShadow: '0 0 0 2px #E8794A',
                }} />
                <h3 style={{ marginBottom: 4 }}>
                  {day === 'No date' ? 'No date set' : new Date(day).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div className="sub" style={{ marginBottom: 10 }}>₹{dayTotal.toLocaleString()} total</div>
                <div className="card">
                  {items.map((a) => (
                    <div className="activity-row" key={a.id}>
                      <span>
                        <span className="name">{a.name}</span>
                        <span className="category">{a.cityName} · {a.category}</span>
                      </span>
                      <span className="cost">₹{a.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}