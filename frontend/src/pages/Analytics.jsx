import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#E8794A', '#2E7D6B', '#16405C', '#C7986B', '#8A5A44', '#3E7CB1'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    api.listTrips().then(async (tripList) => {
      setTrips(tripList);
      const entries = await Promise.all(
        tripList.map(async (t) => {
          try {
            const b = await api.getBudget(t.id);
            return [t.id, b];
          } catch {
            return [t.id, null];
          }
        })
      );
      setBudgets(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-dots">Crunching numbers…</div>;

  const totalSpend = Object.values(budgets).reduce((s, b) => s + (b?.total_budget || 0), 0);

  const categoryMap = {};
  Object.values(budgets).forEach((b) => {
    (b?.by_category || []).forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + c.total;
    });
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const tripBarData = trips.map((t) => ({
    name: t.title.length > 14 ? t.title.slice(0, 14) + '…' : t.title,
    spend: budgets[t.id]?.total_budget || 0,
  }));

  const cityCount = {};
  trips.forEach((t) => {
    (t.cities || []).forEach((c) => {
      cityCount[c.city_name] = (cityCount[c.city_name] || 0) + 1;
    });
  });
  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <div className="sub">A bird's-eye view across all your trips.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-soft)' }}>Total trips</span>
          <b className="total">{trips.length}</b>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-soft)' }}>Total spend</span>
          <b className="total">₹{totalSpend.toLocaleString()}</b>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-soft)' }}>Avg spend / trip</span>
          <b className="total">₹{trips.length ? Math.round(totalSpend / trips.length).toLocaleString() : 0}</b>
        </div>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-soft)' }}>Cities visited</span>
          <b className="total">{Object.keys(cityCount).length}</b>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state">
          <h3>No data yet</h3>
          <p>Create a trip and add some activities to see analytics here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Spend by category</h3>
            {categoryData.length === 0 ? (
              <div className="sub">No expenses logged yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Spend per trip</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tripBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="spend" fill="#E8794A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {topCities.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Most visited cities</h3>
          {topCities.map(([city, count]) => (
            <div className="bar-row" key={city}>
              <span className="label">{city}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(count / topCities[0][1]) * 100}%` }} />
              </div>
              <span className="val">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}