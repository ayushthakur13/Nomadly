/**
 * User domain types - API contract between client and server
 */

/**
 * User statistics
 */
export interface UserStats {
  tripsCount: number;
  likesCount: number;
  followersCount: number;
}

/**
 * Core User domain model
 * Represents the API contract for a user resource
 */
export interface User {
  _id: string;
  username: string;
  email?: string | null;
  name?: string;
  bio?: string;
  profilePicUrl?: string | null;
  profilePicPublicId?: string | null;
  isPublic: boolean;
  isAdmin?: boolean;
  roles: string[];
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public user profile (subset of User)
 */
export interface PublicUserProfile {
  _id: string;
  username: string;
  name?: string;
  bio?: string;
  profilePicUrl?: string | null;
  isPublic: boolean;
  stats?: UserStats;
}
