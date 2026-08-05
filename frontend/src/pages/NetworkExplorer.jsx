import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NetworkExplorer = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const fetchNetwork = async (userId) => {
    setSelectedUser(userId);
    setLoading(true);
    try {
      const res = await api.get(`/graph/connections/${userId}`);
      setConnections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">Network Explorer</h1>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select a User to view their 1st-degree connections:</label>
        <select 
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          value={selectedUser}
          onChange={(e) => fetchNetwork(e.target.value)}
        >
          <option value="">-- Select a User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading connections...</p>}
      
      {!loading && selectedUser && connections.length === 0 && (
        <p className="text-gray-500 italic">This user has no connections.</p>
      )}

      {!loading && connections.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Connections ({connections.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map(conn => (
              <div key={conn.id} className="border p-4 rounded bg-gray-50">
                <p className="font-bold">{conn.name}</p>
                <p className="text-sm text-gray-600">{conn.email}</p>
                <p className="text-sm text-gray-500">Exp: {conn.experience} years</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkExplorer;
