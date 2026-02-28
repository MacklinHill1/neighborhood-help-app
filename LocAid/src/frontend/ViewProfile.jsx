import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./ViewProfile.css";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, zip_code, bio, skills, school, degree, employer, job_title, avatar_url')
        .eq('id', id)
        .maybeSingle();

      if (error) console.error(error.message);
      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [id]);

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
        </div>
      </div>
    </div>
  );
}
