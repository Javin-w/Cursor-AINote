import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import NotePage from './pages/NotePage';
import Knowledge from './pages/Knowledge';
import KnowledgePage from './pages/KnowledgePage';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 受保护的路由 */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notes/:id" element={<NotePage />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/knowledge/:id" element={<KnowledgePage />} />
                </Routes>
              </main>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;