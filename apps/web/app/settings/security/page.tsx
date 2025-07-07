'use client';

import { useState } from 'react';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in production, this would come from the server
  const mockSessions: Session[] = [
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'New York, USA',
      ipAddress: '192.168.1.1',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      browser: 'Safari',
      location: 'New York, USA',
      ipAddress: '192.168.1.2',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: '3',
      device: 'Windows Desktop',
      browser: 'Firefox 121',
      location: 'Boston, USA',
      ipAddress: '192.168.1.3',
      lastActive: '3 days ago',
      current: false,
    },
  ];

  const handleRevokeSession = async (sessionId: string) => {
    // In production, make API call to revoke session
    console.log('Revoking session:', sessionId);
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTwoFactorEnabled(false);
      setShowDisable2FAModal(false);
      setVerificationCode('');
    } catch (err) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Security Settings
        </h1>
        <p className="mt-2 text-text-secondary">
          Manage your account security and active sessions
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-background-secondary rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Two-Factor Authentication
            </h2>
            <p className="mt-1 text-text-secondary">
              Add an extra layer of security to your account
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              twoFactorEnabled
                ? 'bg-accent-secondary/20 text-accent-secondary'
                : 'bg-text-tertiary/20 text-text-tertiary'
            }`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-background-tertiary rounded-xl">
              <p className="text-sm text-text-secondary">
                Your account is protected with two-factor authentication. You'll need your authenticator app to sign in.
              </p>
            </div>
            <button
              onClick={() => setShowDisable2FAModal(true)}
              className="px-4 py-2 bg-accent-danger/10 text-accent-danger rounded-xl hover:bg-accent-danger/20 transition-colors text-sm font-medium"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        ) : (
          <button className="px-4 py-2 bg-gradient-primary text-background-primary rounded-xl hover:opacity-90 transition-opacity text-sm font-medium">
            Enable Two-Factor Authentication
          </button>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-background-secondary rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Active Sessions
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage devices that have access to your account
          </p>
        </div>

        <div className="space-y-3">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-xl transition-colors ${
                session.current
                  ? 'bg-accent-primary/10 border border-accent-primary/20'
                  : 'bg-background-tertiary hover:bg-background-elevated'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">
                      {session.device}
                    </h3>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs rounded-full">
                        Current session
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    IP: {session.ipAddress} • {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="px-3 py-1 text-sm text-accent-danger hover:bg-accent-danger/10 rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-2 text-accent-danger hover:bg-accent-danger/10 rounded-xl transition-colors text-sm font-medium">
          Revoke All Other Sessions
        </button>
      </div>

      {/* Security Recommendations */}
      <div className="bg-background-secondary rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">
          Security Recommendations
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-xl">
            <svg className="w-5 h-5 text-accent-secondary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-text-primary">Strong Password</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Your password meets our security requirements
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-xl">
            <svg className="w-5 h-5 text-accent-secondary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-text-primary">Two-Factor Authentication</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Your account is protected with 2FA
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-background-tertiary rounded-xl">
            <svg className="w-5 h-5 text-accent-warning mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-text-primary">Review API Access</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Regularly review and rotate your API keys
              </p>
              <button className="mt-2 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors">
                Manage API Keys →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background-secondary rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              Disable Two-Factor Authentication
            </h3>
            
            <div className="p-4 bg-accent-warning/10 border border-accent-warning/20 rounded-xl mb-6">
              <p className="text-sm text-accent-warning">
                <strong>Warning:</strong> Disabling 2FA will make your account less secure. We strongly recommend keeping it enabled.
              </p>
            </div>

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Enter your 2FA code to confirm
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-background-primary border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-center font-mono text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisable2FAModal(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 py-2 px-4 bg-background-tertiary text-text-primary rounded-xl hover:bg-background-elevated transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 py-2 px-4 bg-accent-danger text-white rounded-xl hover:bg-accent-danger/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
