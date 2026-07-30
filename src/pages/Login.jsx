import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import logo from '../assets/linecartlogo.png';

export default function Login() {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e, overrideEmail = null, overridePassword = null) {
    if (e) e.preventDefault();
    setError('');
    setBusy(true);

    const loginEmail = overrideEmail || email.trim();
    const loginPass = overridePassword || password.trim();

    try {
      if (!loginPass) {
        throw new Error('Password is required');
      }

      const logged = await login(loginEmail, loginPass);

      if (logged && (logged.role === 'admin' || logged.role === 'Admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  function quickDemoLogin(role) {
    if (role === 'admin') {
      setEmail('admin@linecart.com');
      setPassword('admin123');
      handleLogin(null, 'admin@linecart.com', 'admin123');
    } else {
      setEmail('user@linecart.com');
      setPassword('user123');
      handleLogin(null, 'user@linecart.com', 'user123');
    }
  }

  return (
    <div className="container" style={{ padding: '28px 20px', maxWidth: 1000 }}>
      <div className="auth-panel">
        <div className="auth-left" aria-hidden="true">
          <div className="auth-left-inner">
            <img src={logo} alt="LineCart" className="auth-left-logo" />
            <h3>Welcome back</h3>
            <p style={{ marginTop: '12px', opacity: 0.9, fontSize: '0.9rem' }}>
              Experience LineCart — your premium marketplace for Dates, Nuts, Chocolates & Delicacies.
            </p>
          </div>
        </div>

        <div className="auth-right" role="region" aria-labelledby="signin-heading">
          <div className="auth-header">
            <h2 id="signin-heading" className="auth-title">Sign in to LineCart</h2>
            <p className="auth-sub">Use your email to sign in or try one-click demo login below.</p>
          </div>

          {/* Demo Login Quick Buttons */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>
              ⚡ Quick Demo Sign-In
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => quickDemoLogin('user')}
                disabled={busy}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #d97706', color: '#92400e' }}
              >
                👤 Customer Demo
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => quickDemoLogin('admin')}
                disabled={busy}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', background: '#d97706', color: '#fff' }}
              >
                👑 Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="auth-form" aria-describedby="auth-error" noValidate>
            <label className="auth-field">
              <span className="field-label">Email</span>
              <input
                autoFocus
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                aria-label="Email"
              />
            </label>

            <label className="auth-field">
              <span className="field-label">Password</span>
              <div className="password-row">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="auth-input"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && (
              <div id="auth-error" className="auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>

              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>

            <div className="auth-footer">
              <div className="register-cta">
                <span>New here?</span>
                <Link to="/register" className="link-register">Create an account</Link>
              </div>
              <div className="small-muted">
                By signing in you agree to our terms and privacy policy.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}