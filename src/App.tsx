import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { PhasePage } from './pages/PhasePage';
import { CourseOverview } from './pages/CourseOverview';
import { DsaProblems } from './pages/DsaProblems';

function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg text-text-primary flex overflow-hidden antialiased">
          {/* Persistent Left Sidebar Navigation */}
          <Sidebar />

          {/* Right Side Content Container */}
          <div className="flex-grow flex flex-col h-screen overflow-hidden">
            {/* Top Navigation Bar */}
            <Header />

            {/* Main Content Pane */}
            <main className="flex-grow overflow-hidden min-h-0 bg-bg flex flex-col">
              <div className="flex-grow h-full overflow-hidden">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/python-course" element={<CourseOverview courseType="python" />} />
                  <Route path="/dsa-course" element={<CourseOverview courseType="dsa" />} />
                  <Route path="/dsa-problems" element={<DsaProblems />} />
                  <Route path="/phase/:phaseId/:topicId" element={<PhasePage />} />
                  <Route path="/dsa/:topicId" element={<PhasePage />} />
                  {/* Fallback route */}
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ProgressProvider>
  );
}

export default App;
