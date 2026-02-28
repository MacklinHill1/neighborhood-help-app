import { useNavigate } from "react-router-dom";
import "./Homepage.css";

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

      <div className="hero">
        <h1 className="title">LocAid</h1>
        <p className="bio">LocAid is a hyperlocal community platform where neighbors connect to trade skills and lend a hand. Whether you're offering a talent or seeking assistance, LocAid turns your neighborhood into a supportive network of mutual aid.</p>
      </div>

      
    </main>
  );
}