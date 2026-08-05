import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Recommendations = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const fetchRecommendations = async (userId) => {
    setSelectedUser(userId);
    setLoading(true);
    try {
      const res = await api.get(`/graph/recommendations/${userId}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Job Recommendations</h1>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select a User to get AI-driven Graph Recommendations:</label>
        <select 
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          value={selectedUser}
          onChange={(e) => fetchRecommendations(e.target.value)}
        >
          <option value="">-- Select a User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Analyzing Graph...</p>}
      
      {!loading && selectedUser && recommendations.length === 0 && (
        <p className="text-gray-500 italic">No recommendations found based on current skills and network.</p>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="border p-5 rounded-lg border-l-4 border-blue-500 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{rec.job.title}</h3>
                  <p className="text-gray-600 font-semibold">{rec.company.name} - {rec.job.location}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">${rec.job.salary.toLocaleString()}/yr</span>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-500 font-semibold mb-1">Matched Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {rec.matchedSkills.map(skill => (
                    <span key={skill.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">{skill.name}</span>
                  ))}
                </div>
              </div>

              {rec.contacts.length > 0 && (
                <div className="mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-semibold">
                    <span role="img" aria-label="network">🔗</span> Network Advantage! 
                    You know {rec.contacts.map(c => c.name).join(', ')} who work here.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
