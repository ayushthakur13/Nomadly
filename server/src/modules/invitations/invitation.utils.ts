import crypto from 'crypto';

/**
 * Generate a unique secure token for email-based invitations
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date based on days from now
 */
export function calculateExpirationDate(daysFromNow: number = 7): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysFromNow);
  return expiresAt;
}

/**
 * Validate invitation recipient (either userId or email must be provided)
 */
export function validateInvitationRecipient(
  invitedUserId?: string,
  invitedEmail?: string
): { valid: boolean; error?: string } {
  if (!invitedUserId && !invitedEmail) {
    return { valid: false, error: 'Either invitedUserId or invitedEmail must be provided' };
  }
  
  if (invitedUserId && invitedEmail) {
    return { valid: false, error: 'Cannot provide both invitedUserId and invitedEmail' };
  }
  
  if (invitedEmail && !isValidEmail(invitedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
