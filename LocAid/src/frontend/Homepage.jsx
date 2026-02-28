import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import React from "react";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <main className="homepage">
      <div className="button-container">
        <button 
          className="auth-btn" 
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>

        <button 
          className="auth-btn" 
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>

        <button 
          className="auth-btn" 
          onClick={() => navigate("/UserProfile")}
        >
          User Profile
        </button>
        
      </div>
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
            <button className="btn-login" onClick={() => navigate('/signin')}>Log In</button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
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
            <button className="btn-primary-hero" onClick={() => navigate('/signup')}>
              🏡 Join Your Community
            </button>
            <button className="btn-secondary-hero" onClick={() => navigate('/signin')}>
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

        {/* Auth moved to dedicated pages: /signin and /signup */}

      </div>
    </>
  );
}
