import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const runSearch = (q) => {
    setLoading(true);
    api.search(q).then(setResults).finally(() => setLoading(false));
  };

  useEffect(() => { runSearch(''); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Discover</h1>
          <div className="sub">Search destinations and activities to add to your itineraries.</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 480 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'beach', 'Tokyo', or 'food'…"
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

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
            <div className="result-card" key={i}>
              <span className="tag">{item.type}</span>
              <h3>{item.name}</h3>
              <div className="meta">
                {item.type === 'city' ? item.country : `${item.city} · ~₹${item.avg_cost}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
