import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './frontend/Homepage';
// Import your future pages here:
import SignIn from './frontend/SignIn';
import SignUp from './frontend/Signup';

// import HelpBoard from './frontend/HelpBoard'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* The "Main" landing page */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Example of a second page (Create this file next!) */}
        {/* <Route path="/board" element={<HelpBoard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;