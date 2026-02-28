import React, { useState } from "react";
import "./Homepage.css";

export default function Homepage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <main className="homepage">
      <div className="button-container">
        <button className="auth-btn" onClick={() => setShowSignUp(false)}>Sign In</button>
        <button className="auth-btn" onClick={() => setShowSignUp(true)}>Sign Up</button>
      </div>

      <div className="hero">
        <h1 className="title">LocAid</h1>
        <p className="bio">LocAid is a hyperlocal community platform where neighbors connect to trade skills and lend a hand. Whether you're offering a talent or seeking assistance, LocAid turns your neighborhood into a supportive network of mutual aid.</p>
      </div>

      {showSignUp ? (
        <div>Sign Up Form Here</div>
      ) : (
        <div>Sign In Form Here</div>
      )}
    </main>
  );
}