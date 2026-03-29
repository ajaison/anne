import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HubDashboard from './apps/hub/HubDashboard';
import BirthdayApp from './apps/birthday/BirthdayApp';
import KnowledgeApp from './apps/knowledge/KnowledgeApp';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HubDashboard />} />
        <Route path="/birthday/*" element={<BirthdayApp />} />
        <Route path="/knowledge/*" element={<KnowledgeApp />} />
      </Routes>
    </Router>
  );
};

export default App;
