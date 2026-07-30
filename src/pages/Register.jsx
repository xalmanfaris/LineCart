import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import logo from '../assets/linecartlogo.png';

export default function Register() {
  const { register } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: '28px 20px', maxWidth: 1000 }}>
      <div className="auth-panel">
        <div className="auth-left" aria-hidden="true">
          <div className="auth-left-inner">
            <img src={logo} alt="LineCart" className="auth-left-logo" />
            <h3>Create your account</h3>
            <p className="auth-left-sub">Join LineCart for fast checkout and exclusive offers.</p>
          </div>
        </div>

        <div className="auth-right" role="region" aria-labelledby="register-heading">
          <div className="auth-header">
            <h2 id="register-heading" className="auth-title">Create an account</h2>
            <p className="auth-sub">Enter your details to get started.</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form" aria-describedby="auth-error" noValidate>
            <label className="auth-field">
              <span className="field-label">Full name</span>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="auth-input"
                aria-label="Full name"
              />
            </label>

            <label className="auth-field">
              <span className="field-label">Email</span>
              <input
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
                  placeholder="Choose a strong password"
                  className="auth-input"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                {busy ? 'Creating…' : 'Create account'}
              </button>

              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>

            <div className="auth-footer">
              <div className="register-cta">
                <span>Already have an account?</span>
                <Link to="/login" className="link-register">Sign in</Link>
              </div>
              <div className="small-muted">By creating an account you agree to our terms and privacy policy.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}