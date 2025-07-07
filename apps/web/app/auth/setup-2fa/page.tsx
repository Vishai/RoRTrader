'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<'display' | 'verify' | 'backup'>('display');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mock data - in production, this would come from the server
  const mockSecret = 'JBSWY3DPEHPK3PXP';
  const mockBackupCodes = [
    'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2',
    'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4',
    'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6',
    'K7L8-M9N0',
  ];

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, verify the code server-side
      if (verificationCode.length === 6) {
        setStep('backup');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In production, show a toast notification
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          {step === 'display' && 'Set up two-factor authentication'}
          {step === 'verify' && 'Verify your authenticator'}
          {step === 'backup' && 'Save your backup codes'}
        </h2>
        <p className="text-text-secondary">
          {step === 'display' && 'Scan the QR code with your authenticator app'}
          {step === 'verify' && 'Enter the 6-digit code from your authenticator'}
          {step === 'backup' && 'Keep these codes safe - you\'ll need them if you lose your device'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm">
          {error}
        </div>
      )}

      {step === 'display' && (
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-xl">
              {/* In production, use a real QR code library */}
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">QR Code</span>
              </div>
            </div>
          </div>

          {/* Manual entry option */}
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-2">
              Can't scan? Enter this code manually:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="px-3 py-2 bg-background-elevated rounded-lg text-text-primary font-mono text-sm">
                {mockSecret}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(mockSecret)}
                className="p-2 text-text-tertiary hover:text-text-secondary transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recommended apps */}
          <div className="p-4 bg-background-secondary rounded-xl">
            <h3 className="text-sm font-medium text-text-primary mb-2">
              Recommended authenticator apps:
            </h3>
            <ul className="space-y-1 text-sm text-text-secondary">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
              <li>• 1Password</li>
            </ul>
          </div>

          <button
            onClick={() => setStep('verify')}
            className="w-full py-3 px-4 bg-gradient-primary text-background-primary font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            I've Added the Account
          </button>
        </div>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Verification code
            </label>
            <input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 bg-background-primary border border-border rounded-xl text-text-primary placeholder-text-tertiary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-center font-mono text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('display')}
            className="w-full py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            Back to QR code
          </button>
        </form>
      )}

      {step === 'backup' && (
        <div className="space-y-6">
          {/* Success message */}
          <div className="p-4 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Two-factor authentication enabled!</span>
            </div>
          </div>

          {/* Backup codes */}
          <div className="p-4 bg-background-secondary rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">
                Backup codes
              </h3>
              <button
                onClick={() => copyToClipboard(mockBackupCodes.join('\n'))}
                className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mockBackupCodes.map((code, index) => (
                <code
                  key={index}
                  className="px-3 py-2 bg-background-elevated rounded-lg text-text-primary font-mono text-sm text-center"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-accent-warning/10 border border-accent-warning/20 rounded-xl">
            <p className="text-sm text-accent-warning">
              <strong>Important:</strong> Each backup code can only be used once. Store them securely - you'll need them if you lose access to your authenticator app.
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 px-4 bg-gradient-primary text-background-primary font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            I've Saved My Codes
          </button>
        </div>
      )}
    </div>
  );
}
