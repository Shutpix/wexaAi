import React, { useState, useEffect } from 'react';
import api from '../services/api';
import UserSelect from '../components/UserSelect';

// ── Pulse loader ───────────────────────────────────────────────────────────
const Loader = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 0' }}>
    <div className="pulse-loader">
      <div className="pulse-dot" />
      <div className="pulse-dot" />
      <div className="pulse-dot" />
    </div>
    <p style={{ fontSize: 13, color: '#475569' }}>{label}</p>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '60px 0' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🕸️</div>
    <p style={{ color: '#475569', fontSize: 14 }}>{message}</p>
  </div>
);

// ── Connection card ────────────────────────────────────────────────────────
const ConnectionCard = ({ conn, index }) => {
  const initials = conn.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
  const color = colors[index % colors.length];

  return (
    <div
      className="glass-card hover-card"
      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${color}33, ${color}55)`,
        border: `2px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {conn.name}
        </p>
        <p style={{ fontSize: 12, color: '#475569', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {conn.email}
        </p>
      </div>
      <span className="badge-warning" style={{ flexShrink: 0 }}>
        {conn.experience}yr
      </span>
    </div>
  );
};

// ── NetworkExplorer ────────────────────────────────────────────────────────
const NetworkExplorer = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const fetchNetwork = async (userId) => {
    if (!userId) return;
    setSelectedUser(userId);
    setLoading(true);
    setConnections([]);
    setSearch('');
    try {
      const res = await api.get(`/graph/connections/${userId}`);
      setConnections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = connections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUserObj = users.find(u => u.id === selectedUser);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Graph Traversal
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
          Network <span className="gradient-text">Explorer</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>
          Explore first-degree connections using graph traversal
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
          Select a Professional
        </label>
        <UserSelect
          users={users}
          value={selectedUser}
          onChange={fetchNetwork}
          placeholder={`— Choose from ${users.length} users in the network —`}
        />

        {selectedUserObj && !loading && connections.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="Search connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 10, color: '#e2e8f0', fontSize: 13,
                outline: 'none', fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      {selectedUserObj && !loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <div>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Selected</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{selectedUserObj.name}</p>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>🔗</span>
            <div>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Connections</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6366f1', margin: 0 }}>{connections.length}</p>
            </div>
          </div>
          {search && (
            <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14 }}>🔍</span>
              <div>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Showing</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981', margin: 0 }}>{filtered.length}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {!selectedUser && (
        <EmptyState message="Select a user from the dropdown to explore their professional network." />
      )}

      {loading && <Loader label="Traversing graph connections..." />}

      {!loading && selectedUser && connections.length === 0 && (
        <EmptyState message="This user has no 1st-degree connections in the network." />
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((conn, i) => (
            <ConnectionCard key={conn.id} conn={conn} index={i} />
          ))}
        </div>
      )}

      {!loading && connections.length > 0 && filtered.length === 0 && search && (
        <EmptyState message={`No connections match "${search}".`} />
      )}
    </div>
  );
};

export default NetworkExplorer;
