import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

export default function Chat({ currentUser }) {
  const [conversations, setConversations] = useState([]); // list of users you've talked to
  const [selectedUser, setSelectedUser] = useState(null); // user we're chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  // Fetch all users you have messaged with
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
    if (error) {
      console.error(error);
      return;
    }

    // Get unique conversation user IDs
    const userIds = new Set();
    data.forEach((msg) => {
      if (msg.sender_id !== currentUser.id) userIds.add(msg.sender_id);
      if (msg.receiver_id !== currentUser.id) userIds.add(msg.receiver_id);
    });
    setConversations([...userIds]);
  };

  // Fetch messages between currentUser and selectedUser

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !selectedUser) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: currentUser.id,
        receiver_id: selectedUser,
        content: newMessage,
      },
    ]);

    if (error) console.error(error);
    else setNewMessage("");
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for incoming messages
  useEffect(() => {
    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          // Only add messages for this conversation
          if (
            (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser) ||
            (msg.sender_id === selectedUser && msg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [currentUser.id, selectedUser]);

  // Fetch conversations on mount
  useEffect(() => {
  // define async function inside effect
  const fetch = async () => {
    await fetchConversations();
  };

  fetch();
}, []);

  // Fetch messages when selectedUser changes
  useEffect(() => {
  if (!selectedUser) return;

  // define async function inside the effect
  const fetch = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data); // state update happens AFTER async completes
    } catch (err) {
      console.error("Failed to fetch messages:", err.message);
    }
  };

  fetch();
}, [selectedUser, currentUser.id]); // include dependencies
  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc" }}>
      {/* Conversations List */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Chats</h3>
        {conversations.length === 0 && <p>No conversations yet.</p>}
        {conversations.map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUser(userId)}
            style={{
              padding: "8px",
              cursor: "pointer",
              background: selectedUser === userId ? "#eee" : "transparent",
            }}
          >
            {userId}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            padding: "10px",
            overflowY: "auto",
            background: "#f9f9f9",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign: msg.sender_id === currentUser.id ? "right" : "left",
                margin: "5px 0",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "15px",
                  background: msg.sender_id === currentUser.id ? "#6c63ff" : "#eee",
                  color: msg.sender_id === currentUser.id ? "#fff" : "#000",
                }}
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* Input Box */}
        {selectedUser && (
          <form
            onSubmit={sendMessage}
            style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                borderRadius: "5px",
                border: "none",
                background: "#6c63ff",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}