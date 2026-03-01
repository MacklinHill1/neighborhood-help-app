import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./Homepage.css";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const { id: paramUserId } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  // --- Helper functions ---

  function getDisplayName(profile) {
    if (!profile) return 'LocAid Member';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.full_name || 'LocAid Member';
  }

  // Returns data, does NOT call setState
  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    return data || null;
  }

  // Returns data, does NOT call setState
  async function fetchConversations(user, paramId) {
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (error) { console.error(error); return []; }

    const userIds = new Set();
    (data || []).forEach(msg => {
      if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
      if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
    });

    if (paramId && paramId !== user.id) userIds.add(paramId);

    const ids = [...userIds];
    if (ids.length === 0) return [];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, full_name, avatar_url')
      .in('id', ids);

    if (profilesError) { console.error(profilesError); return []; }
    return profiles || [];
  }

  // Returns data, does NOT call setState
  async function fetchMessages(currentUserId, otherUserId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    if (error) { console.error(error); return []; }
    return data || [];
  }

  function handleSelectUser(profile) {
    setMessages([]);
    setSelectedUser(profile.id);
    setSelectedProfile(profile);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const { error } = await supabase.from("messages").insert([{
      sender_id: currentUser.id,
      receiver_id: selectedUser,
      content: newMessage.trim(),
    }]);

    if (error) { console.error(error); return; }
    setNewMessage("");

    // Refresh sidebar
    const convos = await fetchConversations(currentUser, paramUserId);
    setConversations(convos);
  }

  // --- Effects ---

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user || null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load conversations + auto-select from URL param
  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function load() {
      const convos = await fetchConversations(currentUser, paramUserId);
      if (!cancelled) setConversations(convos);

      if (paramUserId && paramUserId !== currentUser.id) {
        const profile = await fetchProfile(paramUserId);
        if (!cancelled) {
          setSelectedUser(paramUserId);
          setSelectedProfile(profile);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  // Load messages when selected user changes
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    let cancelled = false;

    async function load() {
      const msgs = await fetchMessages(currentUser.id, selectedUser);
      if (!cancelled) setMessages(msgs);
    }

    load();
    return () => { cancelled = true; };
  }, [currentUser, selectedUser]);

  // Real-time new messages
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const channel = supabase
      .channel(`chat_${currentUser.id}_${selectedUser}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
        const msg = payload.new;
        const isRelated =
          (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser) ||
          (msg.sender_id === selectedUser && msg.receiver_id === currentUser.id);
        if (isRelated) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Render ---

  if (authLoading) return null;

  if (!currentUser) {
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
          <p style={{ fontFamily: 'Lato, sans-serif', color: 'var(--text-mid)' }}>Please log in to chat.</p>
          <button
            className="btn-form-submit"
            style={{ marginTop: '16px', width: 'auto', padding: '10px 28px' }}
            onClick={() => navigate('/signin')}
          >
            Log In
          </button>
        </div>
      </div>
    );
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

      <div className="chat-page">

        <div className="profile-page-header">
          <div className="hero-badge">💬 Private Messages</div>
          <h1 className="profile-page-title">Messages</h1>
        </div>

        <div className="chat-layout">

          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <span className="profile-section-icon">💬</span>
              <h3>Conversations</h3>
            </div>
            {conversations.length === 0 && (
              <p className="chat-empty-sidebar">No conversations yet.</p>
            )}
            {conversations.map(profile => (
              <div
                key={profile.id}
                className={`chat-convo-item ${selectedUser === profile.id ? 'chat-convo-active' : ''}`}
                onClick={() => handleSelectUser(profile)}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="chat-convo-avatar" />
                ) : (
                  <div className="chat-convo-avatar-placeholder">👤</div>
                )}
                <span className="chat-convo-name">{getDisplayName(profile)}</span>
              </div>
            ))}
          </div>

          {/* Main chat area */}
          <div className="chat-main">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  {selectedProfile?.avatar_url ? (
                    <img src={selectedProfile.avatar_url} alt="avatar" className="chat-convo-avatar" />
                  ) : (
                    <div className="chat-convo-avatar-placeholder">👤</div>
                  )}
                  <span className="chat-header-name" onClick={() => navigate(`/user/${selectedUser}`)}>
                    {getDisplayName(selectedProfile)}
                  </span>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 && (
                    <p className="chat-empty">No messages yet — say hello! 👋</p>
                  )}
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`chat-bubble-wrap ${msg.sender_id === currentUser.id ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}
                    >
                      <div className={`chat-bubble ${msg.sender_id === currentUser.id ? 'bubble-mine' : 'bubble-theirs'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>

                <form className="chat-input-row" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <button className="chat-send-btn" type="submit">Send →</button>
                </form>
              </>
            ) : (
              <div className="chat-no-selection">
                <span style={{ fontSize: '2.5rem' }}>💬</span>
                <p>Select a conversation or message someone from their profile</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
