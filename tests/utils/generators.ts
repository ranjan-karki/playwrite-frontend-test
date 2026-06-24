import { LIMITS } from '../data/testData';

/**
 * Generates a valid title string.
 * Default length produces a readable label; pass a specific length for boundary tests.
 */
export function generateTitle(length = 14): string {
  const prefix = 'Test-Title-';
  if (length <= prefix.length) return prefix.slice(0, length);
  return prefix + 'a'.repeat(length - prefix.length);
}

/**
 * Generates a valid slug string (lowercase letters and hyphens, starts with a letter).
 * Default length produces a short readable slug.
 */
export function generateSlug(length = 10): string {
  const prefix = 'test-slug-';
  if (length <= prefix.length) return prefix.slice(0, length);
  return prefix + 'a'.repeat(length - prefix.length);
}

/**
 * Generates a unique slug by appending a millisecond timestamp.
 * Use for creation tests where slug must not already exist.
 */
export function generateUniqueSlug(prefix = 'test'): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Returns a title string of exactly LIMITS.title.max + offset characters.
 * offset=0  → at the maximum (valid)
 * offset=1  → one over the maximum (invalid)
 */
export function generateBoundaryTitle(offset = 0): string {
  return 'a'.repeat(LIMITS.title.max + offset);
}

/**
 * Returns a slug string of exactly LIMITS.slug.max + offset characters.
 * Always starts with a letter to satisfy slug format rules.
 * offset=0  → at the maximum (valid)
 * offset=1  → one over the maximum (invalid)
 */
export function generateBoundarySlug(offset = 0): string {
  const length = LIMITS.slug.max + offset;
  return 'a' + 'b'.repeat(length - 1);
}

/** Returns the smallest valid title (1 character). */
export function generateMinTitle(): string {
  return 'a';
}

/** Returns the smallest valid slug (1 letter). */
export function generateMinSlug(): string {
  return 'a';
}
