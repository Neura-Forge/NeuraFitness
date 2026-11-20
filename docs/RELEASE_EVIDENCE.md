# Incident diagnostics candidate

This candidate adds redacted error codes and support references, plus an explicit read-only release readiness command. It does not repair production configuration or replace the insecure legacy member login. Do not promote it as a completed security release.

Run `node scripts/check-deployment-readiness.cjs` only in an approved controlled environment. It checks required configuration, known Supabase database/Auth project identity, and presence of Gym, Member and User tables. Unknown database hostname formats fail closed and need manual identity verification. It never prints DSNs, keys, customer rows or raw database errors.

Local regression tests cover secret/PII redaction, correlation references, missing configuration, mixed project refs and unverifiable DB identities. Existing tests still describe legacy login behavior; their passing status is not evidence that the login is secure.

Staging E2E, role login, backup restore, production smoke and Android timing: NOT TESTED. Production release: BLOCKED pending incident diagnosis, isolated staging and owner approval. Private audit/configuration evidence is excluded from Git and Vercel uploads.
