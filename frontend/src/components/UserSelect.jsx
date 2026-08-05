import React, { useState, useRef, useEffect } from 'react';

// Generates consistent avatar color from a name string
const getAvatarColor = (name = '') => {
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

/**
 * Custom searchable user-select dropdown.
 *
 * Props:
 *   users        – array of { id, name, email, experience }
 *   value        – currently selected user id
 *   onChange     – called with selected user id
 *   placeholder  – placeholder text shown when nothing selected
 */
const UserSelect = ({ users = [], value, onChange, placeholder = '— Choose a user —' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selected = users.find(u => u.id === value) || null;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user) => {
    onChange(user.id);
    setOpen(false);
    setSearch('');
  };

  const color = selected ? getAvatarColor(selected.name) : '#6366f1';

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${open ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
          borderRadius: 10,
          color: '#e2e8f0',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Avatar / placeholder icon */}
        {selected ? (
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: `${color}22`,
            border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color,
          }}>
            {getInitials(selected.name)}
          </div>
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(99,102,241,0.1)',
            border: '2px dashed rgba(99,102,241,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            👤
          </div>
        )}

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.name}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.email}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>{placeholder}</p>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2}
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 1000,
          background: 'rgba(10, 15, 30, 0.98)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 12,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Search box */}
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ position: 'relative' }}>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search ${users.length} users...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 8, color: '#e2e8f0', fontSize: 13,
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '20px 16px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
                No users match "{search}"
              </p>
            ) : (
              filtered.map(user => {
                const col = getAvatarColor(user.name);
                const isSelected = user.id === value;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', cursor: 'pointer',
                      background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: `${col}22`,
                      border: `2px solid ${col}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: col,
                    }}>
                      {getInitials(user.name)}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#a5b4fc' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Experience badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 999, flexShrink: 0,
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      color: '#fbbf24',
                    }}>
                      {user.experience}yr
                    </span>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(99,102,241,0.1)',
            fontSize: 11, color: '#334155', textAlign: 'right'
          }}>
            {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;
