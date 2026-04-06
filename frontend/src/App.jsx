import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Booking from './pages/Booking';
import { Bus, User, LogOut } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bus size={32} color="var(--primary)" />
        <h1 className="text-gradient">BEdatxe Premium</h1>
      </Link>
      <div className="nav-links">
        {token ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={18} /> Xin chào, {user?.fullName || user?.username}
            </span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <LogOut size={18} /> Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', display: 'inline-block', width: 'auto' }}>Đăng nhập</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/trips/:id" element={<Booking />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
