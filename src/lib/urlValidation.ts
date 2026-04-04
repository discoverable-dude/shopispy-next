/**
 * Comprehensive store URL validation to prevent SSRF and malicious input.
 */

const INTERNAL_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^\[::1\]$/,
];

const VALID_DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

export const validateStoreUrl = (url: string): UrlValidationResult => {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  let domain = url.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')  // Remove any path
    .replace(/\/$/, '');

  if (!domain) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Reject non-HTTP protocols
  if (url.includes('://') && !url.match(/^https?:\/\//i)) {
    return { valid: false, error: 'Only HTTP(S) URLs are allowed' };
  }

  // Reject URLs with credentials (user:pass@host)
  if (domain.includes('@')) {
    return { valid: false, error: 'URL contains invalid characters' };
  }

  // Strip port if present
  domain = domain.replace(/:\d+$/, '');

  // Reject internal/private IPs and localhost
  if (INTERNAL_PATTERNS.some(pattern => pattern.test(domain))) {
    return { valid: false, error: 'Internal or private URLs are not allowed' };
  }

  // Reject pure IP addresses (prevent bypassing domain checks)
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    return { valid: false, error: 'IP addresses are not allowed. Please use a domain name.' };
  }

  // Validate domain format
  if (!VALID_DOMAIN_REGEX.test(domain)) {
    // Allow bare names like "gymshark" which get .myshopify.com appended
    if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(domain)) {
      return { valid: true, normalized: domain };
    }
    return { valid: false, error: 'Invalid domain format' };
  }

  return { valid: true, normalized: domain };
};
