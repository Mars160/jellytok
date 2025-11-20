import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Settings } from './pages/Settings';
import { Home } from './pages/Home';
import { useStore } from './store/useStore';

function App() {
  const { user, selectedLibraryId } = useStore();
  const isConfigured = !!(user && selectedLibraryId);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route 
          path="/" 
          element={isConfigured ? <Home /> : <Navigate to="/settings" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
