import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import UserSelect from '../components/UserSelect';

// ── Pulse loader ───────────────────────────────────────────────────────────
const Loader = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '60px 0' }}>
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
  <div style={{ textAlign: 'center', padding: '70px 0' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
    <p style={{ color: '#475569', fontSize: 14 }}>{message}</p>
  </div>
);

// ── Toast notification ─────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
  const border = type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)';
  const color = type === 'success' ? '#34d399' : '#f87171';
  const icon = type === 'success' ? '✓' : '✕';

  return (
    <div className="toast glass-card" style={{ border: `1px solid ${border}`, background: bg, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 280 }}>
      <span style={{ fontWeight: 700, color, fontSize: 16 }}>{icon}</span>
      <p style={{ color, fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  );
};

// ── Recommendation card ────────────────────────────────────────────────────
const RecCard = ({ rec, index }) => {
  const [expanded, setExpanded] = useState(false);
  const hasContacts = rec.contacts && rec.contacts.length > 0;
  const matchCount = rec.matchedSkills?.length || 0;

  const matchColor = matchCount >= 4 ? '#10b981' : matchCount >= 2 ? '#f59e0b' : '#6366f1';
  const matchLabel = matchCount >= 4 ? 'Strong Match' : matchCount >= 2 ? 'Good Match' : 'Potential';

  return (
    <div
      className="glass-card hover-card"
      style={{
        padding: '22px 24px',
        borderLeft: hasContacts ? '3px solid #10b981' : '3px solid #6366f1',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{rec.job.title}</h3>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
              background: `${matchColor}22`, border: `1px solid ${matchColor}55`, color: matchColor
            }}>
              {matchLabel}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            🏢 {rec.company.name} &nbsp;·&nbsp; 📍 {rec.job.location}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981', margin: 0 }}>
            ${rec.job.salary?.toLocaleString()}<span style={{ fontSize: 11, color: '#475569' }}>/yr</span>
          </p>
        </div>
      </div>

      {/* Insider badge */}
      {hasContacts && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 8, padding: '8px 12px'
        }}>
          <span style={{ fontSize: 14 }}>🔗</span>
          <p style={{ fontSize: 12, color: '#34d399', margin: 0, fontWeight: 500 }}>
            You know <strong>{rec.contacts.map(c => c.name).join(', ')}</strong> — an insider at this company!
          </p>
        </div>
      )}

      {/* Matched skills */}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Matched Skills ({matchCount})
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {rec.matchedSkills?.map(skill => (
            <span key={skill.id} className="skill-tag">{skill.name}</span>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            This job was discovered through a multi-hop Cypher graph query that matched your skills to required skills,
            then traced back through the hiring company's relationships.
            {hasContacts && ' Your insider connection makes this a high-priority lead.'}
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#334155', marginTop: 14, textAlign: 'right', margin: '14px 0 0' }}>
        {expanded ? '▲ Collapse' : '▼ More details'}
      </p>
    </div>
  );
};

// ── Recommendations ────────────────────────────────────────────────────────
const Recommendations = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterInsider, setFilterInsider] = useState(false);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const fetchRecommendations = async (userId) => {
    if (!userId) return;
    setSelectedUser(userId);
    setLoading(true);
    setRecommendations([]);
    setFilterInsider(false);
    try {
      const res = await api.get(`/graph/recommendations/${userId}`);
      setRecommendations(res.data);
      const insider = res.data.filter(r => r.contacts?.length > 0).length;
      if (res.data.length > 0) {
        setToast({ message: `Found ${res.data.length} job matches — ${insider} with insider contacts!`, type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to fetch recommendations. Please retry.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const displayed = filterInsider
    ? recommendations.filter(r => r.contacts?.length > 0)
    : recommendations;

  const insiderCount = recommendations.filter(r => r.contacts?.length > 0).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Graph-Powered
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
          Job <span className="gradient-text">Recommendations</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>
          Multi-hop graph traversal across skills, companies, and your professional network
        </p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
          Select a Professional
        </label>
        <UserSelect
          users={users}
          value={selectedUser}
          onChange={fetchRecommendations}
          placeholder="— Choose a user to see personalised recommendations —"
        />
      </div>

      {/* Filter bar */}
      {!loading && recommendations.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {displayed.length} job{displayed.length !== 1 ? 's' : ''} shown
          </span>
          {insiderCount > 0 && (
            <button
              onClick={() => setFilterInsider(f => !f)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filterInsider ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.4)',
                color: '#34d399', transition: 'all 0.2s'
              }}
            >
              🔗 Insider contacts only ({insiderCount})
            </button>
          )}
          {filterInsider && (
            <button
              onClick={() => setFilterInsider(false)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(99,102,241,0.3)', color: '#6366f1'
              }}
            >
              Show all
            </button>
          )}
        </div>
      )}

      {/* States */}
      {!selectedUser && <EmptyState message="Select a user above to run the graph recommendation engine." />}
      {loading && <Loader label="Running multi-hop Cypher query across the graph..." />}
      {!loading && selectedUser && recommendations.length === 0 && (
        <EmptyState message="No recommendations found. This user may not have skills or connections in the graph." />
      )}

      {/* Cards */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map((rec, idx) => (
            <RecCard key={idx} rec={rec} index={idx} />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default Recommendations;
