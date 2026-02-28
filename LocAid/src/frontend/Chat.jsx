import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

export default function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  // 1. Auth Listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user || null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Unique Conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id")
        // Fixed: No spaces inside the .or string
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

      if (error) return console.error(error);

      const userIds = new Set();
      data.forEach((msg) => {
        if (msg.sender_id !== currentUser.id) userIds.add(msg.sender_id);
        if (msg.receiver_id !== currentUser.id) userIds.add(msg.receiver_id);
      });
      setConversations([...userIds]);
    };

    fetchConversations();
  }, [currentUser]);

  // 3. Fetch Initial Messages
    // Fetch messages for selected conversation
  useEffect(() => {
    // 1. If we don't have users, we don't need to fetch anything
    if (!currentUser || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${currentUser.id})`)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error.message);
      }
    };

    fetchMessages();

    // 2. The "Cleanup" Function
    // This clears the chat screen ONLY when the user switches chats or logs out
    return () => setMessages([]); 
  }, [currentUser, selectedUser]);

    

  // 4. Real-time Subscription (Cleaned up)
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const channel = supabase
      .channel(`chat_${selectedUser}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          // Only add if it belongs to this specific conversation
          const isRelated = 
            (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser) ||
            (msg.sender_id === selectedUser && msg.receiver_id === currentUser.id);
          
          if (isRelated) {
            setMessages((prev) => {
              // Prevent duplicate messages in state
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, selectedUser]);

  // Scroll logic
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: currentUser.id,
        receiver_id: selectedUser,
        content: newMessage.trim(),
      },
    ]);

    if (error) console.error(error);
    else setNewMessage(""); // The subscription will handle adding the msg to the UI
  };

  if (!currentUser) return <p style={{padding: '20px'}}>Please log in to chat with neighbors.</p>;

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ccc", borderRadius: '8px', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: "250px", borderRight: "1px solid #ccc", background: "#fdfdfd" }}>
        <h3 style={{ padding: "15px", borderBottom: "1px solid #eee" }}>Chats</h3>
        {conversations.length === 0 && <p style={{padding: '15px', color: '#888'}}>No messages yet.</p>}
        {conversations.map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUser(userId)}
            style={{
              padding: "12px 15px",
              cursor: "pointer",
              borderBottom: '1px solid #f0f0f0',
              fontSize: '12px',
              background: selectedUser === userId ? "#e8e7ff" : "transparent",
            }}
          >
            👤 Neighbor: {userId.substring(0, 8)}...
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#fff" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.sender_id === currentUser.id ? "right" : "left",
                    margin: "10px 0",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 14px",
                      borderRadius: "18px",
                      maxWidth: '70%',
                      background: msg.sender_id === currentUser.id ? "#6c63ff" : "#f0f0f0",
                      color: msg.sender_id === currentUser.id ? "#fff" : "#333",
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: "flex", padding: "15px", background: '#fff', borderTop: "1px solid #eee" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ddd", outline: 'none' }}
              />
              <button
                type="submit"
                style={{ marginLeft: "10px", padding: "0 20px", borderRadius: "20px", border: "none", background: "#6c63ff", color: "#fff", fontWeight: 'bold' }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Select a neighbor to start chatting
          </div>
        )}
      </div>
    </div>
  );
}