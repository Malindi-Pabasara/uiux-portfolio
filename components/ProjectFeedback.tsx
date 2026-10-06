'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Project {
  _id: string;
  title: string;
}

interface ProjectFeedbackProps {
  projects: Project[];
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ProjectFeedback({ projects }: ProjectFeedbackProps) {
  const { data: session, status } = useSession();

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Completely hide the section for unauthenticated users
  if (status !== 'authenticated' || !session) return null;

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = e.target.selectedOptions[0];
    setSelectedProject(e.target.value);
    setSelectedTitle(opt?.text || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || rating === 0 || !message.trim()) {
      setError('Please select a project, choose a rating, and write your feedback.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          projectTitle: selectedTitle,
          rating,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to submit feedback.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="feedback" style={{ padding: '80px 0' }}>
      <div className="wrap">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        <p className="eyebrow">feedback</p>
        <h2 className="sec-title">Share Your Thoughts</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>
          Have you explored one of my projects? I&apos;d love to hear your thoughts. Your feedback helps me grow.
        </p>

        {submitted ? (
          // Success state
          <div className="w-full" style={{
            background: 'linear-gradient(135deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02))',
            border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: 16,
            padding: '40px 32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#4ade80' }}>Thank you!</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 24 }}>
              Your feedback has been submitted. It&apos;s been sent securely to the admin.
            </p>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '.9rem' }}
              onClick={() => { setSubmitted(false); setRating(0); setMessage(''); setSelectedProject(''); }}
            >
              Submit Another
            </button>
          </div>
        ) : (
          // Feedback form
          <form onSubmit={handleSubmit} className="w-full">
            <div style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}>
              {/* Project Select */}
              <div>
                <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--muted)' }}>
                  Select Project
                </label>
                <select
                  id="feedback-project"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: 'var(--fg)',
                    fontSize: '.92rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">— Choose a project —</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div>
                <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: 10, color: 'var(--muted)' }}>
                  Rating {(hoverRating || rating) > 0 && (
                    <span style={{ color: 'var(--purple)', fontWeight: 400, marginLeft: 8 }}>
                      — {STAR_LABELS[hoverRating || rating]}
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.8rem',
                        padding: 2,
                        transition: 'transform .15s',
                        transform: (hoverRating || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                        color: (hoverRating || rating) >= star ? '#f59e0b' : 'var(--border)',
                        lineHeight: 1,
                      }}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--muted)' }}>
                  Your Feedback
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share what you liked, what could be improved, or any general thoughts..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: 'var(--fg)',
                    fontSize: '.92rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '.88rem', margin: 0 }}>{error}</p>
              )}

              <button
                id="feedback-submit-btn"
                type="submit"
                className="btn btn-primary"
                style={{ justifyContent: 'center', fontSize: '.95rem' }}
                disabled={loading}
              >
                {loading ? 'Submitting…' : '📨 Submit Feedback'}
              </button>

              <p style={{ fontSize: '.78rem', color: 'var(--muted)', margin: 0, textAlign: 'center' }}>
                🔒 Your feedback is private and visible only to the site admin.
              </p>
            </div>
          </form>
        )}
        </div>
      </div>
    </section>
  );
}
