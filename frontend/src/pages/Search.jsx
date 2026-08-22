import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [status, setStatus] = useState('');
  const [addingItem, setAddingItem] = useState(null);
  const [cityStartDate, setCityStartDate] = useState('');
  const [cityEndDate, setCityEndDate] = useState('');

  const runSearch = (q) => {
    setLoading(true);
    api.search(q).then(setResults).finally(() => setLoading(false));
  };

  useEffect(() => { runSearch(''); }, []);
  useEffect(() => {
    api.listTrips().then((data) => {
      setTrips(data);
      if (data.length > 0) setSelectedTrip(data[0].id);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const openAddForm = (item) => {
    if (!selectedTrip) {
      setStatus('Pahela ek trip select karo');
      return;
    }
    if (item.type !== 'city') {
      setStatus('Activities fakt trip ni andar city add karya pachi umeri shakay chhe.');
      return;
    }
    setAddingItem(item);
    setCityStartDate('');
    setCityEndDate('');
    setStatus('');
  };

  const confirmAdd = async () => {
    try {
      await api.addCity(selectedTrip, {
        city_name: addingItem.name,
        country: addingItem.country,
        start_date: cityStartDate,
        end_date: cityEndDate,
      });
      setStatus(`${addingItem.name} trip ma add thai gayu!`);
      setAddingItem(null);
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Discover</h1>
          <div className="sub">Search destinations and activities to add to your itineraries.</div>
        </div>
      </div>

      {trips.length > 0 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem' }}>Add to trip:</label>
          <select value={selectedTrip} onChange={(e) => setSelectedTrip(e.target.value)}>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}
      {trips.length === 0 && (
        <div className="sub" style={{ marginBottom: 16 }}>Pahela ek trip banаvo, pachi ahiya thi cities add kari shakso.</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 480 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'beach', 'Tokyo', or 'food'…"
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {status && <div className="sub" style={{ marginTop: 10 }}>{status}</div>}

      {loading ? (
        <div className="loading-dots" style={{ marginTop: 20 }}>Searching…</div>
      ) : results.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <h3>No matches</h3>
          <p>Try a different city, country, or interest.</p>
        </div>
      ) : (
        <div className="search-grid">
          {results.map((item, i) => (
            <div className="result-card" key={i} onClick={() => openAddForm(item)} style={{ cursor: 'pointer' }}>
              <span className="tag">{item.type}</span>
              <h3>{item.name}</h3>
              <div className="meta">
                {item.type === 'city' ? item.country : `${item.city} · ~₹${item.avg_cost}`}
              </div>
              {item.type === 'city' && <div className="sub" style={{ marginTop: 6 }}>+ Add to Trip</div>}
            </div>
          ))}
        </div>
      )}

      {addingItem && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }} onClick={() => setAddingItem(null)}>
          <div className="card" style={{ maxWidth: 360, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 12 }}>Add {addingItem.name} to trip</h3>
            <label style={{ fontSize: '0.85rem' }}>Start date</label>
            <input type="date" value={cityStartDate} onChange={(e) => setCityStartDate(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
            <label style={{ fontSize: '0.85rem' }}>End date</label>
            <input type="date" value={cityEndDate} onChange={(e) => setCityEndDate(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={confirmAdd}>Add</button>
              <button className="btn btn-ghost" onClick={() => setAddingItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}