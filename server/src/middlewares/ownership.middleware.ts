import { Request, Response, NextFunction } from 'express';
import Trip from '../models/trip.model';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to verify trip ownership
 * Checks if the authenticated user owns the trip
 */
export async function verifyTripOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const tripId = req.params.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: 'Trip ID is required' });
      return;
    }

    if (!Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    // Find trip and check ownership
    const trip = await Trip.findById(tripId).select('createdBy');

    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    // Check if user is the owner or admin
    const isOwner = trip.createdBy.toString() === userId;
    const isAdmin = req.user?.isAdmin;

    if (!isOwner && !isAdmin) {
      res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to modify this trip' 
      });
      return;
    }

    // Attach trip to request for use in controller
    (req as any).trip = trip;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to verify trip access (for viewing)
 * Allows public trips or owner access
 */
export async function verifyTripAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const tripId = req.params.id;

    if (!tripId) {
      res.status(400).json({ success: false, message: 'Trip ID is required' });
      return;
    }

    if (!Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    const trip = await Trip.findById(tripId).select('createdBy isPublic');

    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    // Allow if trip is public
    if (trip.isPublic) {
      next();
      return;
    }

    // Allow if user is authenticated and is the owner
    const isOwner = userId && trip.createdBy.toString() === userId;
    const isAdmin = req.user?.isAdmin;

    if (isOwner || isAdmin) {
      next();
      return;
    }

    // Otherwise, deny access
    res.status(403).json({ 
      success: false, 
      message: 'This trip is private' 
    });
  } catch (error) {
    next(error);
  }
}

export default {
  verifyTripOwnership,
  verifyTripAccess
};