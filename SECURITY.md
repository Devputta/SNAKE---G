# Security Policy

## Scope

OURO is a client-side web game. Gameplay state, preferences, and records are stored locally in the user's browser.

## Security Practices

- No authentication system is used.
- No passwords or payment information are collected.
- Player records are stored using browser `localStorage`.
- Stored game data is sanitized before being used.
- Audio is generated locally through the Web Audio API.
- API keys or secrets should not be committed to the repository.
- Dependencies should be kept updated and reviewed before production releases.

## Local Storage

Browser storage should not be considered secure storage. Users should avoid treating saved game statistics or preferences as sensitive information.

## Reporting a Vulnerability

If you discover a security issue, please report it privately to the project maintainer before publicly disclosing the issue.

Include:

- Description of the issue
- Steps to reproduce
- Affected component
- Suggested mitigation, if available

## Deployment

The production site is deployed at:

https://snake-seven-zeta.vercel.app/

Security configuration provided by the hosting platform should be reviewed separately from application-level security.
