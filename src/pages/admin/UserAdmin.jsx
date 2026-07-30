import React, { useEffect, useState } from 'react';
import { getAllUsers, setUserBlockState, updateUser } from '../../api';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBlock(user) {
    const ok = window.confirm(`${user.isBlock ? 'Unblock' : 'Block'} user ${user.email}?`);
    if (!ok) return;
    try {
      setBusyId(user.id);
      const updated = await setUserBlockState(user.id, !user.isBlock);
      setUsers(prev => prev.map(u => (String(u.id) === String(user.id) ? updated : u)));
    } catch (err) {
      console.error(err);
      alert('Unable to change block state.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={{ background: 'white', padding: 12, borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>👥 Users</h2>
        <div>
          <button className="btn btn-ghost" onClick={load}>🔄 Refresh</button>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{ padding: 12, borderRadius: 8, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.name} <small style={{ color: '#6b7280' }}>({u.email})</small></div>
                <div style={{ color: '#6b7280' }}>Role: {u.role || 'user'} {u.isBlock ? <span style={{ color: '#9a1f1f' }}> - Blocked</span> : null}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => toggleBlock(u)} disabled={busyId === u.id}>{busyId === u.id ? 'Working…' : u.isBlock ? 'Unblock' : 'Block'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}