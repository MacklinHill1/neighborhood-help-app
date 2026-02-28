import React, { useEffect, useState } from "react";
import { supabase } from './supabaseClient';

export default function HelpBoard({ userId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("need"); // default

  // Fetch requests from Supabase
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("Error fetching requests:", error);
    else setRequests(data);

    setLoading(false);
  };

  useEffect(() => {
  // define async function inside effect
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchRequests();
}, []);
  // Submit a new request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !type) {
      alert("Please fill in all required fields.");
      return;
    }

    const { error } = await supabase.from("requests").insert([
      {
        title,
        description,
        category,
        type,
        user_id: userId, // passed from your auth/session
      },
    ]);

    if (error) {
      console.error("Error adding request:", error);
      alert("Failed to post request!");
    } else {
      alert("Request posted!");
      setTitle("");
      setDescription("");
      setCategory("");
      setType("need");
      fetchRequests(); // refresh list
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <main style={{ padding: "20px" }}>
      <h2>Help Board</h2>

      {/* Post Request Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <h3>Post a New Request</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Mow Lawn"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description: </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about the favor..."
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Category: </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Errands, Tech, Labor..."
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Type: </label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="need">Need Help</option>
            <option value="offer">Offer Help</option>
          </select>
        </div>

        <button type="submit">Post Request</button>
      </form>

      {/* Display Requests */}
      <div>
        {requests.length === 0 && <p>No requests yet!</p>}
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "10px",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>{req.title}</h3>
            <p>{req.description}</p>
            <p>
              <strong>Category:</strong> {req.category} | <strong>Type:</strong>{" "}
              {req.type}
            </p>
            <p>
              <em>Posted by: {req.user_id}</em>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}