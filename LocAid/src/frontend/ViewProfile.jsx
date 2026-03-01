import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./ViewProfile.css";
import "./HelpBoard.css";
import Rating from "./RatingComponent.jsx";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Helper functions ---

  function getDisplayName(p) {
    if (!p) return 'LocAid Member';
    if (p.first_name || p.last_name) {
      return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    }
    return p.full_name || 'LocAid Member';
  }

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

  async function fetchComments(profileId) {
    const { data, error } = await supabase
      .from('profile_comments')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) { console.error(error.message); return []; }
    if (!data || data.length === 0) return [];

    const authorIds = [...new Set(data.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, full_name, avatar_url')
      .in('id', authorIds);

    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    return data.map(c => ({ ...c, profiles: profileMap[c.author_id] || null }));
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('profile_comments')
      .insert({
        profile_id: id,
        author_id: currentUserId,
        content: commentText.trim(),
      });

    if (error) {
      console.error(error.message);
    } else {
      setCommentText("");
      const updated = await fetchComments(id);
      setComments(updated);
    }

    setSubmitting(false);
  }

  async function handleDeleteComment(commentId) {
    const { error } = await supabase
      .from('profile_comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', currentUserId);

    if (error) console.error(error.message);
    else setComments(prev => prev.filter(c => c.id !== commentId));
  }

  // --- Effects ---

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    async function load() {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('full_name, zip_code, bio, skills, school, degree, employer, job_title, avatar_url')
        .eq('id', id)
        .maybeSingle();

      if (error) console.error(error.message);
      setProfile(profileData);
      setLoading(false);

      const commentData = await fetchComments(id);
      setComments(commentData);
    }

    load();
  }, [id]);

  // --- Render ---

  if (loading) {
    return (
      <div className="homepage">
        <div className="bg-shape bg-shape-1" />
        <div className="bg-shape bg-shape-2" />
        <div className="bg-shape bg-shape-3" />
        <nav className="nav">
          <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Loc<span>Aid</span> 📍
          </div>
        </nav>
        <div className="profile-page" style={{ textAlign: 'center', paddingTop: '180px' }}>
          <p style={{ color: 'var(--text-mid)', fontFamily: 'Lato, sans-serif' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="homepage">
        <div className="bg-shape bg-shape-1" />
        <div className="bg-shape bg-shape-2" />
        <div className="bg-shape bg-shape-3" />
        <nav className="nav">
          <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Loc<span>Aid</span> 📍
          </div>
        </nav>
        <div className="profile-page" style={{ textAlign: 'center', paddingTop: '180px' }}>
          <p style={{ color: 'var(--text-mid)', fontFamily: 'Lato, sans-serif' }}>Profile not found.</p>
        </div>
      </div>
    );
  }

  const skillsList = profile.skills
    ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

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

        {/* Profile Header */}
        <div className="view-profile-header">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="view-avatar" />
          ) : (
            <div className="view-avatar-placeholder">👤</div>
          )}
          <h1 className="profile-page-title">{profile.full_name || 'LocAid Member'}</h1>
          {profile.zip_code && (
            <p className="view-location">📍 {profile.zip_code}</p>
          )}

          {/* Rating Component */}
          {id && (
            <Rating ratedUserId={id} />
          )}

          {/* Message button — only show if logged in and not your own profile */}
          {currentUserId && currentUserId !== id && (
            <button
              className="btn-form-submit"
              style={{ marginTop: '12px', width: 'auto', padding: '10px 32px' }}
              onClick={() => navigate(`/chat/${id}`)}
            >
              💬 Message
            </button>
          )}
        </div>

        <div className="profile-sections-wrap">
          <div className="profile-row">

            {/* About */}
            {profile.bio && (
              <div className="profile-section-card profile-section-grow">
                <div className="profile-section-heading">
                  <span className="profile-section-icon">🌿</span>
                  <h3>About</h3>
                </div>
                <p className="view-bio">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {skillsList.length > 0 && (
              <div className="profile-section-card">
                <div className="profile-section-heading">
                  <span className="profile-section-icon">🛠️</span>
                  <h3>Skills</h3>
                </div>
                <div className="view-skills-list">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="view-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="profile-row">

            {/* Education */}
            {(profile.school || profile.degree) && (
              <div className="profile-section-card profile-section-grow">
                <div className="profile-section-heading">
                  <span className="profile-section-icon">🎓</span>
                  <h3>Education</h3>
                </div>
                {profile.school && <p className="view-detail-label">School</p>}
                {profile.school && <p className="view-detail-value">{profile.school}</p>}
                {profile.degree && <p className="view-detail-label">Degree</p>}
                {profile.degree && <p className="view-detail-value">{profile.degree}</p>}
              </div>
            )}

            {/* Employment */}
            {(profile.employer || profile.job_title) && (
              <div className="profile-section-card profile-section-grow">
                <div className="profile-section-heading">
                  <span className="profile-section-icon">💼</span>
                  <h3>Employment</h3>
                </div>
                {profile.employer && <p className="view-detail-label">Employer</p>}
                {profile.employer && <p className="view-detail-value">{profile.employer}</p>}
                {profile.job_title && <p className="view-detail-label">Job Title</p>}
                {profile.job_title && <p className="view-detail-value">{profile.job_title}</p>}
              </div>
            )}

          </div>

          {/* Comments Section */}
          <div className="profile-section-card">
            <div className="profile-section-heading">
              <span className="profile-section-icon">💬</span>
              <h3>Comments</h3>
            </div>

            {currentUserId && currentUserId !== id && (
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Leave a comment</label>
                  <textarea
                    className="profile-textarea"
                    rows="3"
                    placeholder="Say something nice about your neighbor..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="btn-form-submit"
                  type="submit"
                  disabled={submitting}
                  style={{ width: 'auto', padding: '10px 28px' }}
                >
                  {submitting ? 'Posting...' : '💬 Post Comment'}
                </button>
              </form>
            )}

            {comments.length === 0 && (
              <p className="helpboard-empty">No comments yet — be the first!</p>
            )}

            <div className="helpboard-list">
              {comments.map(comment => (
                <div key={comment.id} className="helpboard-card helpboard-need">
                  <div
                    className="helpboard-poster"
                    onClick={() => navigate(`/user/${comment.author_id}`)}
                  >
                    {comment.profiles?.avatar_url ? (
                      <img src={comment.profiles.avatar_url} alt="avatar" className="helpboard-avatar" />
                    ) : (
                      <div className="helpboard-avatar-placeholder">👤</div>
                    )}
                    <div className="helpboard-poster-info">
                      <span className="helpboard-poster-name">{getDisplayName(comment.profiles)}</span>
                      <span className="helpboard-time">{formatTime(comment.created_at)}</span>
                    </div>
                  </div>
                  <p className="helpboard-desc" style={{ marginTop: '4px' }}>{comment.content}</p>
                  {comment.author_id === currentUserId && (
                    <button
                      className="helpboard-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
