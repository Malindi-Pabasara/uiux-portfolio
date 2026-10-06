'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid email or password.');
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
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0', fontSize: '.9rem' }}>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Password</label>
            <Link href="/forgot-password" style={{ fontSize: '.8rem', color: 'var(--purple)', textDecoration: 'none', marginBottom: '8px' }}>Forgot Password?</Link>
          </div>
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
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '.9rem', color: 'var(--muted)' }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--purple)' }}>Register</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: '.8rem', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--muted)' }}>← Back to Portfolio</Link>
        </p>
      </div>
    </div>
  );
}
