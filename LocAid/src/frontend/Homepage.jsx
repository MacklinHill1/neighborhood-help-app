import React, { useState } from "react";
import "./Homepage.css";
import { supabase } from './supabaseClient';

export default function Homepage() {
  const [view, setView] = useState(null); // null | 'login' | 'signup'
     // login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
    // signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupZip, setSignupZip] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
   // message state
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle login form submission
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Logged in successfully!');
    }

    setLoading(false);
  }

  // Handle signup form submission
  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: signupName,
      zip_code: signupZip,
    });

    setMessage('Account created! Check your email to confirm.');
    setLoading(false);
  }

  return (
    <>
      <div className="homepage">

        {/* Background shapes */}
        <div className="bg-shape bg-shape-1" />
        <div className="bg-shape bg-shape-2" />
        <div className="bg-shape bg-shape-3" />

        {/* Nav */}
        <nav className="nav">
          <div className="nav-brand">Loc<span>Aid</span> 📍</div>
          <div className="nav-buttons">
            <button className="btn-login" onClick={() => { setView('login'); setMessage(''); }}>Log In</button>
            <button className="btn-signup" onClick={() => { setView('signup'); setMessage(''); }}>Sign Up</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            🏘️ Your Neighborhood. Your Network.
          </div>

          <h1 className="hero-title">
            LocAid<span className="dot">.</span>
          </h1>
          <span className="hero-title-accent">Hyperlocal Help Exchange</span>

          <div className="hero-divider">
            <div className="hero-divider-line" />
            <span style={{fontSize:"1.4rem"}}>🤝</span>
            <div className="hero-divider-line right" />
          </div>

          <p className="hero-bio">
            LocAid is a hyperlocal community platform where neighbors connect to trade skills and lend a hand. Whether you're offering a talent or seeking assistance, LocAid turns your neighborhood into a supportive network of mutual aid.
          </p>

          <div className="hero-cta-row">
            <button className="btn-primary-hero" onClick={() => { setView('signup'); setMessage(''); }}>
              🏡 Join Your Community
            </button>
            <button className="btn-secondary-hero" onClick={() => { setView('login'); setMessage(''); }}>
              Sign In →
            </button>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📍</span>
              <h3>Area Code Connect</h3>
              <p>Find neighbors in your exact area and build real community bonds with the people right around you.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛠️</span>
              <h3>Share Your Skills</h3>
              <p>Offer what you know — cooking, repairs, tutoring — and discover talents in your neighborhood.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌿</span>
              <h3>Mutual Aid</h3>
              <p>A giving economy built on trust and reciprocity. Help a neighbor today, get help tomorrow.</p>
            </div>
          </div>
        </section>

        {/* Auth Forms via State */}
        {view && (
          <div className="modal-overlay" onClick={() => setView(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setView(null)}>✕</button>

              {view === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="modal-icon">🏡</div>
                  <h2 className="modal-title">Welcome Back</h2>
                  <p className="modal-subtitle">Log in to connect with your neighbors</p>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  {message && <p className="modal-message">{message}</p>}

                  <button className="btn-form-submit" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : '📍 Log In'}
                  </button>
                  <p className="modal-switch">
                    New here?{" "}
                    <button type="button" onClick={() => { setView('signup'); setMessage(''); }}>
                      Create an account
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignUp}>
                  <div className="modal-icon">🏘️</div>
                  <h2 className="modal-title">Join LocAid</h2>
                  <p className="modal-subtitle">Start connecting with your neighborhood</p>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Area / Zip Code 📍</label>
                    <input
                      type="text"
                      placeholder="e.g. 90210"
                      value={signupZip}
                      onChange={e => setSignupZip(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  {message && <p className="modal-message">{message}</p>}

                  <button className="btn-form-submit" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : '🌿 Create Account'}
                  </button>
                  <p className="modal-switch">
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setView('login'); setMessage(''); }}>
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
