import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const [, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [employer, setEmployer] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }

      setUserId(session.user.id);

      const { data } = await supabase
        .from('profiles')
        .select('bio, skills, school, degree, employer, job_title')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data) {
        setAbout(data.bio || "");
        setSkills(data.skills || "");
        setSchool(data.school || "");
        setDegree(data.degree || "");
        setEmployer(data.employer || "");
        setJobTitle(data.job_title || "");
      }
    }

    loadProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
  .from('profiles')
  .upsert({
    id: userId,
    bio: about,
    skills: skills,
    school: school,
    degree: degree,
    employer: employer,
    job_title: jobTitle,
  }, { onConflict: 'id' });

    if (error) {
      console.error(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="homepage">

      {/* Background shapes */}
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-shape bg-shape-3" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Loc<span>Aid</span> 📍
        </div>
        <div className="nav-buttons">
          <button className="btn-login" onClick={() => navigate('/')}>← Back Home</button>
        </div>
      </nav>

      {/* Full page profile content */}
      <div className="profile-page">

        {/* Page header */}
        <div className="profile-page-header">
          <div className="hero-badge">🏡 Your LocAid Profile</div>
          <h1 className="profile-page-title">Edit Profile</h1>
          <p className="profile-page-subtitle">Help your neighbors get to know you</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-sections-wrap">

          {/* Row 1: Photo + About */}
          <div className="profile-row">

            {/* Profile Picture */}
            <div className="profile-section-card">
              <div className="profile-section-heading">
                <span className="profile-section-icon"></span>
                <h3>Photo</h3>
              </div>
              <div className="profile-pic-wrapper">
                {preview ? (
                  <img src={preview} alt="Preview" className="profile-preview" />
                ) : (
                  <div className="profile-pic-placeholder">👤</div>
                )}
                <label className="profile-pic-upload-btn" htmlFor="pic-upload">
                  📷 Choose Photo
                </label>
                <input
                  id="pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* About */}
            <div className="profile-section-card profile-section-grow">
              <div className="profile-section-heading">
                <span className="profile-section-icon"></span>
                <h3>About You</h3>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  className="profile-textarea"
                  rows="5"
                  placeholder="Tell your neighbors about yourself..."
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Skills 🛠️</label>
                <input
                  type="text"
                  placeholder="e.g. Plumbing, Tutoring, Moving Help"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                />
                <span className="form-hint">Separate each skill with a comma</span>
              </div>
            </div>

          </div>

          {/* Row 2: Education + Employment */}
          <div className="profile-row">

            {/* Education */}
            <div className="profile-section-card profile-section-grow">
              <div className="profile-section-heading">
                <span className="profile-section-icon">🎓</span>
                <h3>Education</h3>
              </div>
              <div className="form-group">
                <label>School / University</label>
                <input
                  type="text"
                  placeholder="e.g. University of Delaware"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Degree / Field of Study</label>
                <input
                  type="text"
                  placeholder="e.g. B.S. Computer Science"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                />
              </div>
            </div>

            {/* Employment */}
            <div className="profile-section-card profile-section-grow">
              <div className="profile-section-heading">
                <span className="profile-section-icon">💼</span>
                <h3>Employment</h3>
              </div>
              <div className="form-group">
                <label>Employer / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={employer}
                  onChange={e => setEmployer(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Save button */}
          <div className="profile-save-row">
            <button className="btn-form-submit profile-save-btn" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>

      {saved && (
        <div className="save-toast">
          ✅ Profile saved successfully!
        </div>
      )}

    </div>
  );
}
