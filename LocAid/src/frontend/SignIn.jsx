import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import "./Homepage.css";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage('Logged in successfully!');
    setLoading(false);
    navigate('/');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Welcome Back</h2>
        <p className="modal-subtitle">Log in to connect with your neighbors</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {message && <p className="modal-message">{message}</p>}

          <button className="btn-form-submit" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : '📍 Log In'}
          </button>
          <p className="modal-switch">Don't have an account?{" "}
            <button type="button" onClick={() => navigate('/signup')}>Sign up</button>
            </p>
        </form>
      </div>
    </div>
  );
}