'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Check your email
          </h2>
          <p className="text-text-secondary">
            We've sent a password reset link to:
          </p>
          <p className="text-text-primary font-medium mt-2">{email}</p>
        </div>

        <div className="p-4 bg-background-tertiary rounded-xl">
          <p className="text-sm text-text-secondary">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              try again
            </button>
            .
          </p>
        </div>

        <Link
          href="/auth/login"
          className="w-full py-3 px-4 bg-background-tertiary text-text-primary font-semibold rounded-xl hover:bg-background-elevated transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Forgot your password?
        </h2>
        <p className="text-text-secondary">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-background-primary border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
          placeholder="you@example.com"
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-primary text-background-primary font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Sending reset link...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-text-secondary hover:text-text-primary transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
