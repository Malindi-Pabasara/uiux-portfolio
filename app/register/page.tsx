'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    setLoading(false);
    
    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Registration failed.');
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
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Create an Account</h1>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0', fontSize: '.9rem' }}>Join to interact with the portfolio</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            autoComplete="name"
          />
          <label>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <label>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
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
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '.9rem', color: 'var(--muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--purple)' }}>Login</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '.8rem', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--muted)' }}>← Back to Portfolio</Link>
        </p>
      </div>
    </div>
  );
}
