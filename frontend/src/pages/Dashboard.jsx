import React, { useEffect, useState } from 'react';
import api from '../services/api';

// ── Animated counter ───────────────────────────────────────────────────────
const AnimatedNumber = ({ target }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = Math.ceil(target / 30);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{value}</span>;
};

// ── Skeleton loader ────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div style={{ height: 12, width: '60%', background: 'rgba(99,102,241,0.15)', borderRadius: 6, marginBottom: 16 }} />
    <div style={{ height: 36, width: '40%', background: 'rgba(99,102,241,0.1)', borderRadius: 6 }} />
  </div>
);

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, borderClass, description }) => (
  <div className={`glass-card hover-card p-6 ${borderClass}`} style={{ position: 'relative', overflow: 'hidden' }}>
    {/* Subtle glow blob behind */}
    <div style={{
      position: 'absolute', top: -30, right: -30,
      width: 100, height: 100,
      background: 'rgba(99,102,241,0.08)',
      borderRadius: '50%', filter: 'blur(20px)'
    }} />
    <div className="flex items-start justify-between mb-4">
      <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
        {title}
      </p>
      <div style={{ fontSize: 24 }}>{icon}</div>
    </div>
    <p style={{ fontSize: 38, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
      <AnimatedNumber target={value} />
    </p>
    <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{description}</p>
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, companies: 0, jobs: 0, skills: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, companiesRes, jobsRes, skillsRes] = await Promise.all([
          api.get('/users'),
          api.get('/companies'),
          api.get('/jobs'),
          api.get('/skills'),
        ]);
        setStats({
          users: usersRes.data.length,
          companies: companiesRes.data.length,
          jobs: jobsRes.data.length,
          skills: skillsRes.data.length,
        });
      } catch {
        setError('Could not connect to the database. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Users', key: 'users', icon: '👤', borderClass: 'stat-blue', description: 'Professionals in the network' },
    { title: 'Companies', key: 'companies', icon: '🏢', borderClass: 'stat-purple', description: 'Hiring organisations' },
    { title: 'Open Jobs', key: 'jobs', icon: '💼', borderClass: 'stat-pink', description: 'Active job listings' },
    { title: 'Skills Tracked', key: 'skills', icon: '⚡', borderClass: 'stat-cyan', description: 'Unique skill nodes' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Overview
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
          Network <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>
          Live stats powered by your CognoDB graph database
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 28, borderColor: 'rgba(239,68,68,0.3)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : cards.map(c => (
              <StatCard key={c.key} title={c.title} value={stats[c.key]} icon={c.icon} borderClass={c.borderClass} description={c.description} />
            ))
        }
      </div>

      {/* Info section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#c4b5fd', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ Why Graph Database?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { emoji: '🔗', text: 'Relationships are first-class citizens, stored natively in the graph.' },
              { emoji: '🚀', text: 'Multi-hop queries (friends of friends) run in milliseconds without JOIN tables.' },
              { emoji: '🧩', text: 'Schema-agile — adding new node types requires no migrations.' },
              { emoji: '🎯', text: 'Contextual recommendations impossible to express cleanly in SQL.' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#c4b5fd', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Graph Model
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { rel: '(User)', arr: '─[:KNOWS]→', target: '(User)', color: '#6366f1' },
              { rel: '(User)', arr: '─[:WORKS_AT]→', target: '(Company)', color: '#a855f7' },
              { rel: '(User)', arr: '─[:HAS_SKILL]→', target: '(Skill)', color: '#ec4899' },
              { rel: '(Company)', arr: '─[:HIRING_FOR]→', target: '(Job)', color: '#06b6d4' },
              { rel: '(Job)', arr: '─[:REQUIRES]→', target: '(Skill)', color: '#10b981' },
            ].map(({ rel, arr, target, color }) => (
              <div key={rel + arr} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>{rel}</span>
                <span style={{ color }}>{arr}</span>
                <span style={{ color: '#94a3b8' }}>{target}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
