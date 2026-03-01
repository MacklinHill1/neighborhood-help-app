import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './frontend/Homepage';
import SignIn from './frontend/SignIn';
import SignUp from './frontend/Signup';
import UserProfile from './frontend/UserProfile.jsx';
import HelpBoard from './frontend/HelpBoard';
import ViewProfile from './frontend/ViewProfile';
import Chat from './frontend/Chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Fixed: Added leading slash */}
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/profile" element={<UserProfile />} />
        
        <Route path="/board" element={<HelpBoard />} />
        <Route path="/user/:id" element={<ViewProfile />} />
        
        {/* Fixed: Removed the crashing supabase.auth.user() call */}
        <Route path="/chat/:id" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;