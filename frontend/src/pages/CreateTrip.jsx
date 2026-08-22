import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function CreateTrip() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name || !startDate || !endDate) {
      setError('Trip name, start date and end date jaruri chhe');
      return;
    }
    setLoading(true);
    try {
      const trip = await api.createTrip({ name, startDate, endDate, description });
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h2>Plan a New Trip</h2>
      <form onSubmit={handleSubmit}>
        <label>Trip Name</label>
        <input value={name} onChange={e => setName(e.target.value)} />

        <label>Start Date</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <label>End Date</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Trip'}
        </button>
      </form>
    </div>
  );
}