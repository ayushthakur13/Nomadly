import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Trip from './trip.model';

interface AuthRequest extends Request {
  user?: { id: string; username: string; email: string; isAdmin: boolean };
}

export async function verifyTripOwnership(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const tripId = req.params.tripId || req.params.id;
    if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    if (!tripId) { res.status(400).json({ success: false, message: 'Trip ID is required' }); return; }
    if (!Types.ObjectId.isValid(tripId)) { res.status(400).json({ success: false, message: 'Invalid trip ID' }); return; }
    const trip = await Trip.findById(tripId).select('createdBy');
    if (!trip) { res.status(404).json({ success: false, message: 'Trip not found' }); return; }
    const isOwner = (trip.createdBy as any).toString() === userId;
    const isAdmin = req.user?.isAdmin;
    if (!isOwner && !isAdmin) { res.status(403).json({ success: false, message: 'You do not have permission to modify this trip' }); return; }
    (req as any).trip = trip;
    next();
  } catch (error) { next(error); }
}

export async function verifyTripAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    const tripId = req.params.tripId || req.params.id;
    if (!tripId) { res.status(400).json({ success: false, message: 'Trip ID is required' }); return; }
    if (!Types.ObjectId.isValid(tripId)) { res.status(400).json({ success: false, message: 'Invalid trip ID' }); return; }
    const trip = await Trip.findById(tripId).select('createdBy isPublic');
    if (!trip) { res.status(404).json({ success: false, message: 'Trip not found' }); return; }
    if ((trip as any).isPublic) { next(); return; }
    const isOwner = userId && (trip.createdBy as any).toString() === userId;
    const isAdmin = req.user?.isAdmin;
    if (isOwner || isAdmin) { next(); return; }
    res.status(403).json({ success: false, message: 'This trip is private' });
  } catch (error) { next(error); }
}

export default { verifyTripOwnership, verifyTripAccess };