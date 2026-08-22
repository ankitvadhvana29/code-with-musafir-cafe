import React, { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleNameSave = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      const updated = await api.updateProfile({ name });
      const token = localStorage.getItem('gt_token');
      login(token, updated);
      setStatus('Naam update thai gayu!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setStatus('Password change thai gayu!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile & Settings</h1>
          <div className="sub">Manage your account details.</div>
        </div>
      </div>

      {status && <div className="sub" style={{ color: 'var(--sea)', marginBottom: 10 }}>{status}</div>}
      {error && <div className="form-error">{error}</div>}

      <form className="card" onSubmit={handleNameSave} style={{ maxWidth: 420, marginBottom: 20 }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 10, display: 'block' }}>Profile info</label>
        <label style={{ fontSize: '0.85rem' }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
        <label style={{ fontSize: '0.85rem' }}>Email</label>
        <input value={user?.email || ''} disabled style={{ marginBottom: 14, opacity: 0.6 }} />
        <button className="btn btn-primary" type="submit">Save name</button>
      </form>

      <form className="card" onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 10, display: 'block' }}>Change password</label>
        <label style={{ fontSize: '0.85rem' }}>Current password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ marginBottom: 10 }} />
        <label style={{ fontSize: '0.85rem' }}>New password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginBottom: 14 }} />
        <button className="btn btn-primary" type="submit">Update password</button>
      </form>
    </div>
  );
}