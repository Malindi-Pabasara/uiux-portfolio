'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/admin');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div className="glow glow-1" /><div className="glow glow-2" />
      <div style={{
        background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 20,
        padding: '48px 40px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="brand-mark" style={{ margin: '0 auto 16px', width: 48, height: 48, fontSize: '1.3rem' }}>M</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Login</h1>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0', fontSize: '.9rem' }}>Sign in to manage your portfolio</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            autoComplete="username"
          />
          <label>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          {error && (
            <p style={{ color: '#f87171', fontSize: '.88rem', marginBottom: 12 }}>{error}</p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
