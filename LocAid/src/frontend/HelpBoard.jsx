import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from './supabaseClient';
import "./Homepage.css";
import "./HelpBoard.css";

export default function HelpBoard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [saved, setSaved] = useState(false);

  // Zip code state
  const [activeZip, setActiveZip] = useState(null);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("need");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);

      // Check if zip was previously set in sessionStorage
      const savedZip = sessionStorage.getItem('helpboard_zip');
      if (savedZip) {
        setActiveZip(savedZip);
        await fetchRequests(savedZip);
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  const fetchRequests = async (zip) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            full_name,
            avatar_url
          )
        `)
        .eq("zip_code", zip)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    const zip = zipInput.trim();
    if (!/^\d{5}$/.test(zip)) {
      setZipError("Please enter a valid 5-digit zip code.");
      return;
    }
    setZipError("");
    setActiveZip(zip);
    sessionStorage.setItem('helpboard_zip', zip);
    await fetchRequests(zip);
  };

  const handleChangeZip = () => {
    setActiveZip(null);
    setZipInput("");
    setRequests([]);
    sessionStorage.removeItem('helpboard_zip');
  };

  const handleDelete = async (requestId) => {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId)
      .eq('user_id', userId);

    if (error) {
      console.error(error.message);
    } else {
      setRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) { navigate('/signin'); return; }
    setSubmitting(true);

    const { error } = await supabase.from("requests").insert([{
      title,
      description,
      category,
      type,
      user_id: userId,
      zip_code: activeZip,
    }]);

    if (error) {
      console.error("Error adding request:", error);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setType("need");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchRequests(activeZip);
    }

    setSubmitting(false);
  };

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z');
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getDisplayName(profile) {
    if (!profile) return 'LocAid Member';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.full_name || 'LocAid Member';
  }

  return (
    <div className="homepage">

      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-shape bg-shape-3" />

      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Loc<span>Aid</span> 📍
        </div>
        <div className="nav-buttons">
          <button className="btn-login" onClick={() => navigate('/')}>← Back Home</button>
        </div>
      </nav>

      <div className="profile-page">

        <div className="profile-page-header">
          <div className="hero-badge">🤝 Community Help Board</div>
          <h1 className="profile-page-title">Help Board</h1>
          <p className="profile-page-subtitle">
            {activeZip
              ? <>Showing requests for zip code <strong>{activeZip}</strong> — <button className="zip-change-btn" onClick={handleChangeZip}>Change</button></>
              : 'Enter your zip code to see your neighborhood board'
            }
          </p>
        </div>

        {/* Zip code prompt */}
        {!activeZip && (
          <div className="zip-prompt-wrap">
            <div className="profile-section-card zip-prompt-card">
              <div className="modal-icon">📍</div>
              <h2 className="modal-title">Find Your Board</h2>
              <p className="modal-subtitle">Enter a zip code to view and post requests in that neighborhood</p>
              <form onSubmit={handleZipSubmit}>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 19711"
                    value={zipInput}
                    onChange={e => setZipInput(e.target.value)}
                    maxLength={5}
                    required
                  />
                  {zipError && <span className="zip-error">{zipError}</span>}
                </div>
                <button className="btn-form-submit" type="submit">
                  🔍 View Board
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Board content */}
        {activeZip && (
          <div className="profile-sections-wrap">

            {/* Post form */}
            {userId ? (
              <div className="profile-section-card">
                <div className="profile-section-heading">
                  <span className="profile-section-icon">📋</span>
                  <h3>Post a Request</h3>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="helpboard-form-grid">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Need help mowing lawn"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        placeholder="e.g. Errands, Tech, Labor"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select className="helpboard-select" value={type} onChange={e => setType(e.target.value)} required>
                        <option value="need">🙋 Need Help</option>
                        <option value="offer">🤲 Offer Help</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '4px' }}>
                    <label>Description</label>
                    <textarea
                      className="profile-textarea"
                      rows="3"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Add details about what you need or offer..."
                    />
                  </div>
                  <div className="profile-save-row" style={{ marginTop: '8px' }}>
                    <button className="btn-form-submit profile-save-btn" type="submit" disabled={submitting}>
                      {submitting ? 'Posting...' : '📌 Post Request'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="profile-section-card" style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Lato, sans-serif', color: 'var(--text-mid)', marginBottom: '16px' }}>
                  🔒 Sign in to post a request
                </p>
                <button className="btn-form-submit" style={{ width: 'auto', padding: '10px 28px' }} onClick={() => navigate('/signin')}>
                  Log In
                </button>
              </div>
            )}

            {/* Requests list */}
            <div className="profile-section-card">
              <div className="profile-section-heading">
                <span className="profile-section-icon">📌</span>
                <h3>Active Requests</h3>
              </div>

              {loading && <p className="helpboard-empty">Loading...</p>}
              {!loading && requests.length === 0 && (
                <p className="helpboard-empty">No requests yet for {activeZip} — be the first to post!</p>
              )}

              <div className="helpboard-list">
                {requests.map(req => (
                  <div key={req.id} className={`helpboard-card ${req.type === 'offer' ? 'helpboard-offer' : 'helpboard-need'}`}>
                    <div className="helpboard-poster" onClick={() => navigate(`/user/${req.user_id}`)}>
                      {req.profiles?.avatar_url ? (
                        <img src={req.profiles.avatar_url} alt="avatar" className="helpboard-avatar" />
                      ) : (
                        <div className="helpboard-avatar-placeholder">👤</div>
                      )}
                      <div className="helpboard-poster-info">
                        <span className="helpboard-poster-name">{getDisplayName(req.profiles)}</span>
                        <span className="helpboard-time">{formatTime(req.created_at)}</span>
                      </div>
                    </div>
                    <div className="helpboard-card-top">
                      <span className={`helpboard-badge ${req.type === 'offer' ? 'badge-offer' : 'badge-need'}`}>
                        {req.type === 'offer' ? '🤲 Offering' : '🙋 Needs Help'}
                      </span>
                      <span className="helpboard-category">{req.category}</span>
                    </div>
                    <h3 className="helpboard-title">{req.title}</h3>
                    {req.description && <p className="helpboard-desc">{req.description}</p>}
                    {req.user_id === userId && (
                      <button className="helpboard-delete-btn" onClick={() => handleDelete(req.id)}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {saved && (
        <div className="save-toast">
          📌 Request posted successfully!
        </div>
      )}

    </div>
  );
}
