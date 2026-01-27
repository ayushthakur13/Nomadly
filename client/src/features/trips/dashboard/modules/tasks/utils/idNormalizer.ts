/**
 * Shared utilities for normalizing ID values across different formats
 * Handles backend inconsistencies where IDs might come as:
 * - Plain strings: "abc123"
 * - Objects with _id: { _id: "abc123", ...otherFields }
 * - Objects with id: { id: "abc123", ...otherFields }
 */

/**
 * Normalize any ID value to a string or null
 * @param value - Can be string, object with _id/id, or null/undefined
 * @returns Normalized string ID or null
 */
export function resolveId(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id || null;
  return null;
}

/**
 * Alias for resolveId - kept for semantic clarity when normalizing user IDs
 * @param value - Can be string, object with _id/id, or null/undefined
 * @returns Normalized string ID or null
 */
export const resolveUserId = resolveId;
