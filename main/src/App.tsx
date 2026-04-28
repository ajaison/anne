import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HubDashboard from './apps/hub/HubDashboard';
import BirthdayApp from './apps/birthday/BirthdayApp';
import KnowledgeApp from './apps/knowledge/KnowledgeApp';
import ProjectView from './apps/knowledge/ProjectView';
import DeckView from './apps/knowledge/DeckView';
import StudySession from './apps/knowledge/StudySession';
import StatsView from './apps/knowledge/StatsView';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HubDashboard />} />

        {/* Knowledge App Routes */}
        <Route path="/knowledge" element={<KnowledgeApp />} />
        <Route path="/knowledge/project/:projectId" element={<ProjectView />} />
        <Route path="/knowledge/deck/:deckId" element={<DeckView />} />
        <Route path="/knowledge/study/:deckId" element={<StudySession />} />
        <Route path="/knowledge/stats" element={<StatsView />} />
        <Route path="/birthday/*" element={<BirthdayApp />} />
      </Routes>
    </Router>
  );
};

// Analytics integrated!
export default App;
