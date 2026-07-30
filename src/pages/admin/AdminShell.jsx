import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getProducts, getAllUsers, setUserBlockState } from '../../api';
import ProductManager from './ProductManager';
import OrdersAdmin from './OrdersAdmin';
import DashboardAdmin from './DashboardAdmin';
import logo from '../../assets/linecartlogo.png';
import './AdminShell.css';

export default function AdminShell() {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Admin Dashboard';
    if (location.pathname === '/admin/products') return 'Products Management';
    if (location.pathname === '/admin/users') return 'Users Management';
    if (location.pathname === '/admin/orders') return 'Orders Management';
    return 'Admin Dashboard';
  };

  return (
    <div className="admin-container">
      <div className="admin-layout">

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>


        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-content">
            <div className="admin-sidebar-header">
              <div className="admin-sidebar-brand">
                <img src={logo} alt="LineCart logo" className="admin-sidebar-logo" />
                <div>
                  <h3 className="admin-sidebar-title">LineCart</h3>
                  <p className="admin-sidebar-subtitle">Admin Panel</p>
                </div>
              </div>
            </div>

            <nav className="admin-nav">
              <Link
                to="/admin"
                className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`}
              >
                <svg className="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}
              >
                <svg className="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Products
              </Link>
              <Link
                to="/admin/users"
                className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              >
                <svg className="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Users
              </Link>
              <Link
                to="/admin/orders"
                className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
              >
                <svg className="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Orders
              </Link>
            </nav>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <div className="admin-header-content">
              <h1 className="admin-page-title">{getPageTitle()}</h1>
              <div className="admin-topbar-actions">
                <button
                  className="admin-button"
                  onClick={() => navigate('/')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>

                </button>
                <button
                  className="admin-button admin-button-primary"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="admin-content-wrapper">
            <Routes>
              <Route path="/" element={<DashboardAdmin />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="product-modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} role="dialog" aria-modal="true" onClick={() => setShowLogoutModal(false)}>
          <div className="product-modal" style={{ maxWidth: '400px', padding: '24px', background: 'white', borderRadius: '12px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', color: '#111827' }}>Sign Out</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', lineHeight: 1.5 }}>Are you sure you want to sign out of the Admin Panel?</p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                  navigate('/');
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsAdmin() {
  return <ProductManager />;
}

function UsersAdmin() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [busyId, setBusyId] = React.useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function handleBlockToggle(user) {
    if (busyId === user.id) return;
    try {
      setBusyId(user.id);
      await setUserBlockState(user.id, !user.isBlock);
      await loadUsers();
    } catch (err) {
      console.error('Failed to toggle block state:', err);
      alert('Failed to update user. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="admin-fade-in">
        <div className="dashboard-section">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-fade-in">
        <div className="dashboard-section">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800">{error}</div>
            <button className="btn btn-ghost mt-2" onClick={loadUsers}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-fade-in">
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Manage Users</h3>
          <button className="admin-button" onClick={loadUsers}>Refresh</button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">👥</div>
            <div className="text-lg">No users found</div>
            <div className="text-sm text-gray-400 mt-2">Users will appear here once they register</div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{u.name}</h4>
                    <p className="text-gray-600">{u.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {u.role || 'user'}
                      </span>
                      {u.isBlock && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`admin-button ${u.isBlock ? 'admin-button-primary' : 'admin-button-danger'}`}
                      onClick={() => handleBlockToggle(u)}
                      disabled={busyId === u.id}
                    >
                      {busyId === u.id ? 'Working...' : (u.isBlock ? 'Unblock' : 'Block')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
