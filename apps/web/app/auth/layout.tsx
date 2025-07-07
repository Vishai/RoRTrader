import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-primary/5 via-transparent to-transparent" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-accent-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            RoR Trader
          </h1>
          <p className="mt-2 text-text-secondary">
            Multi-Asset Trading Bot Platform
          </p>
        </div>
        
        {/* Auth card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
        
        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Bank-grade security with 2FA</span>
        </div>
      </div>
    </div>
  );
}
