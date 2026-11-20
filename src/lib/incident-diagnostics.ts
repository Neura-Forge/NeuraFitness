import { randomUUID } from 'node:crypto';

/** Never log error messages, raw queries, request bodies, tokens or customer identifiers. */
export function reportIncident(event: string, error: unknown): string {
  const reference = randomUUID();
  const candidate = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const code = /^(?:P\d{4}|[0-9A-Z]{5}|ECONNREFUSED|ETIMEDOUT|ENOTFOUND)$/.test(candidate) ? candidate : 'UNCLASSIFIED';
  console.error(JSON.stringify({event, reference, code}));
  return reference;
}
