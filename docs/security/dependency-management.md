# Dependency Security Management

## Overview
This document tracks dependency warnings, vulnerabilities, and our approach to managing them.

## Current Status (January 2025)

### Known Deprecation Warnings
These are transitive dependencies that show warnings but don't pose immediate security risks:

1. **inflight@1.0.6** - Used by glob (transitive)
   - Status: Low risk, used in build tools only
   - Action: Will be resolved when dependencies update

2. **glob@7.x** - Used by various build tools
   - Status: Low risk, build-time only
   - Action: Will be resolved as dependencies migrate to glob@9+

3. **@humanwhocodes/config-array** - Used by ESLint
   - Status: No security risk
   - Action: Updated ESLint to v9 to reduce warnings

4. **superagent@8.1.2** - Used by test dependencies
   - Status: Monitor for updates
   - Action: Not directly used, waiting for supertest update

### Security Audit Policy

1. **High/Critical**: Fix immediately
2. **Moderate**: Fix within sprint
3. **Low**: Fix during regular updates

### Regular Maintenance

Run monthly:
```bash
# Check for updates
npm outdated

# Update dependencies safely
npm update

# Audit and fix
npm audit
npm audit fix

# Check for major updates
npx npm-check-updates
```

### Handling Warnings

1. **Build-time only warnings**: Generally safe to ignore
2. **Runtime warnings**: Investigate and fix
3. **Security warnings**: Always address

## Dependency Update Log

### January 2025
- Updated husky: 8.0.0 → 9.0.0
- Updated eslint: 8.0.0 → 9.0.0
- Updated TypeScript ESLint plugins to v7
- Created .npmrc to manage warning levels

## Notes

- Many warnings come from transitive dependencies we don't control
- Focus on actual security vulnerabilities over deprecation warnings
- Build-time tool warnings are lower priority than runtime dependencies
- Always test thoroughly after updates
