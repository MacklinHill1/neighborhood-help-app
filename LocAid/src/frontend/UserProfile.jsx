import React, { useState } from "react";
import "./UserProfile.css";

export default function UserProfile() {

  const [, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      skills: skills.split(",").map(skill => skill.trim()),
      about
    };

    console.log(profileData);
    alert("Profile Saved!");
  };

  return (
    <main className="profile-container">
      <h2>Your Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">

        {/* Profile Picture */}
        <div className="form-group">
          <label>Upload Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" className="profile-preview" />}
        </div>

        {/* Skills */}
        <div className="form-group">
          <label>Skills (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Plumbing, Tutoring, Moving Help"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        {/* About */}
        <div className="form-group">
          <label>About You</label>
          <textarea
            rows="4"
            placeholder="Tell your neighbors about yourself..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        <button type="submit">Save Profile</button>
      </form>
    </main>
  );
}
