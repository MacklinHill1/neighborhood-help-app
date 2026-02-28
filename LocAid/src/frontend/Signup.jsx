import React, { useState } from "react";
import "./SignUp.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    address: "",
    zipCode: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <main>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit} className="signup-form">
        
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Create Username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="zipCode"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Create Account</button>
      </form>
    </main>
  );
}