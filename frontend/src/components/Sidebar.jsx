import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../App.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">Global<span>Trotters</span></div>
      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Discover
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Analytics
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Profile
                </NavLink>
        <NavLink to="/shared" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Shared trips
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div style={{ marginBottom: 8 }}>Signed in as<br /><b style={{ color: '#fff' }}>{user?.name}</b></div>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
