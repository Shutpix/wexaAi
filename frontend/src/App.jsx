import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NetworkExplorer from './pages/NetworkExplorer';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">Job Referral Network</Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              <Link to="/network" className="text-gray-600 hover:text-blue-600">Network Explorer</Link>
              <Link to="/recommendations" className="text-gray-600 hover:text-blue-600">Recommendations</Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/network" element={<NetworkExplorer />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
