import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import "./Homepage.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/signin`,
  }
});
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await supabase.from('profiles').insert({ id: data.user.id, full_name: name, zip_code: zip });

    setMessage('Account created! Check your email to confirm.');
    setLoading(false);
    navigate('/signin');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Join LocAid</h2>
        <p className="modal-subtitle">Start connecting with your neighborhood</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Area / Zip Code 📍</label>
            <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="e.g. 90210" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {message && <p className="modal-message">{message}</p>}

          <button className="btn-form-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : '🌿 Create Account'}
          </button>
          <p className="modal-switch">Already have an account?{" "}
            <button type="button" onClick={() => navigate('/signin')}>Log in</button>
            </p>
        </form>
      </div>
    </div>
  );
}