import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: StrengthRequirement[] = useMemo(() => {
    return [
      {
        label: 'At least 8 characters',
        regex: /.{8,}/,
        met: /.{8,}/.test(password),
      },
      {
        label: 'Contains uppercase letter',
        regex: /[A-Z]/,
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        regex: /[a-z]/,
        met: /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        regex: /\d/,
        met: /\d/.test(password),
      },
      {
        label: 'Contains special character',
        regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((req) => req.met).length;
    if (password.length === 0) return { level: 0, label: '', color: '' };
    if (metCount <= 2) return { level: 1, label: 'Weak', color: 'bg-accent-danger' };
    if (metCount <= 3) return { level: 2, label: 'Fair', color: 'bg-accent-warning' };
    if (metCount <= 4) return { level: 3, label: 'Good', color: 'bg-accent-primary' };
    return { level: 4, label: 'Strong', color: 'bg-accent-secondary' };
  }, [requirements, password]);

  if (password.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-tertiary">Password strength</span>
          {strength.label && (
            <span className={`text-xs font-medium ${
              strength.level === 1 ? 'text-accent-danger' :
              strength.level === 2 ? 'text-accent-warning' :
              strength.level === 3 ? 'text-accent-primary' :
              'text-accent-secondary'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-1 bg-background-elevated rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.level / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? 'text-accent-secondary' : 'text-text-tertiary'
            }`}
          >
            {req.met ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
