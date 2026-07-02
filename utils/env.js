// @ts-check

/**
 * Reads a required environment variable, throwing a clear error if it is missing.
 * @param {string} name
 */
export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Did you create a .env file from .env.example?`);
  }
  return value;
}
