import { Request, Response, NextFunction } from 'express';
import tripService from '../services/trip.service';
import mapService from '../services/map.service';
import { CreateTripDTO, UpdateTripDTO, TripQueryFilters } from '../types/trip.types';
import { deleteFromCloudinary } from '../utils/cloudinary.utils';
import { TripStatus } from '../models/trip.model';

/**
 * Extended Request with authenticated user
 */

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
  file?: Express.Multer.File & {
    path?: string;
    filename?: string;
  };
}

/**
 * Trip Controller
 * Handles HTTP requests for trip management
 */
class TripController {
  /**
   * Get public trips (for explore page)
   * GET /api/trips/public
   */
  async getPublicTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, page, limit } = req.query;

      const filters: TripQueryFilters = {
        isPublic: true,
        status: TripStatus.UPCOMING,
        category: category as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const result = await tripService.getTrips(filters);

      res.status(200).json({
        success: true,
        trips: result.trips,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new trip
   * POST /api/trips
   */
  async createTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const tripData: CreateTripDTO = req.body;

      // Validate required fields
      if (!tripData.tripName) {
        res.status(400).json({ success: false, message: 'Trip name is required' });
        return;
      }

      if (!tripData.startDate || !tripData.endDate) {
        res.status(400).json({ success: false, message: 'Start and end dates are required' });
        return;
      }

      if (!tripData.mainDestination) {
        res.status(400).json({ success: false, message: 'Main destination is required' });
        return;
      }

      // Validate dates
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);

      if (end < start) {
        res.status(400).json({ 
          success: false, 
          message: 'End date must be after start date' 
        });
        return;
      }

      // Create trip
      const trip = await tripService.createTrip(userId, tripData);

      res.status(201).json({
        success: true,
        message: 'Trip created successfully',
        data: { trip }
      });
    } catch (error: any) {
      if (error.message.includes('coordinates')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Get user's trips (as creator or member)
   * GET /api/trips
   */
  async getUserTrips(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { status, category, search, sort = 'createdAt', order = 'desc', page, limit } = req.query;

      const filters: TripQueryFilters = {
        userId,
        status: status as TripStatus,
        category: category as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 100,
        sortBy: sort as 'createdAt' | 'startDate' | 'viewsCount' | 'likesCount' | 'updatedAt',
        sortOrder: order as 'asc' | 'desc'
      };

      const result = await tripService.getTrips(filters, userId);

      res.json({
        success: true,
        data: { 
          trips: result.trips, 
          count: result.trips.length,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single trip by ID or slug
   * GET /api/trips/:tripId
   */
  async getTripById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      
      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const trip = await tripService.getTripById(tripId, userId);

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      res.json({
        success: true,
        data: { trip }
      });
    } catch (error: any) {
      if (error.message === 'TRIP_PRIVATE') {
        res.status(403).json({ 
          success: false, 
          message: 'This trip is private' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Update trip
   * PUT /api/trips/:tripId
   */
  async updateTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      
      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const updates: UpdateTripDTO = req.body;

      // Validate dates if provided
      if (updates.startDate && updates.endDate) {
        const start = new Date(updates.startDate);
        const end = new Date(updates.endDate);

        if (end < start) {
          res.status(400).json({ 
            success: false, 
            message: 'End date must be after start date' 
          });
          return;
        }
      }

      const trip = await tripService.updateTrip(tripId, userId, updates);

      if (!trip) {
        res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
        return;
      }

      res.json({
        success: true,
        message: 'Trip updated successfully',
        data: { trip }
      });
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to edit this trip' 
        });
        return;
      }
      if (error.message.includes('coordinates')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete trip
   * DELETE /api/trips/:tripId
   */
  async deleteTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      // Get trip to delete cover image from Cloudinary
      const trip = await tripService.getTripById(tripId, userId);

      if (!trip) {
        res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
        return;
      }

      // Delete trip
      const deleted = await tripService.deleteTrip(tripId, userId);

      if (!deleted) {
        res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
        return;
      }

      // Delete cover image from Cloudinary if exists
      if (trip.coverImagePublicId) {
        await deleteFromCloudinary(trip.coverImagePublicId);
      }

      res.json({
        success: true,
        message: 'Trip deleted successfully'
      });
    } catch (error: any) {
      if (error.message === 'ONLY_CREATOR_CAN_DELETE') {
        res.status(403).json({ 
          success: false, 
          message: 'Only the trip creator can delete this trip' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Update trip cover image
   * POST /api/trips/:tripId/cover
   */
  async updateTripCover(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      // Cloudinary URL and public_id are added by multer-storage-cloudinary
      const file: any = req.file;
      const imageUrl = file?.secure_url || file?.path;
      const publicId = file?.public_id || file?.filename;

      if (!imageUrl || !publicId) {
        console.error('Cloudinary file properties:', file);
        res.status(500).json({ 
          success: false, 
          message: 'Image upload failed (missing url or public id)' 
        });
        return;
      }

      const { trip, oldPublicId } = await tripService.updateCoverImage(tripId, userId, imageUrl, publicId);

      // Delete old image from Cloudinary in background (don't block response)
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) => {
          console.error(`Background deletion failed for ${oldPublicId}:`, err);
        });
      }

      res.json({
        success: true,
        message: 'Cover image updated successfully',
        data: { trip }
      });
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to edit this trip' 
        });
        return;
      }
      if (error.message === 'TRIP_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete trip cover image
   * DELETE /api/trips/:tripId/cover
   */
  async deleteTripCover(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const trip = await tripService.getTripById(tripId, userId);

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      const oldPublicId = trip.coverImagePublicId;

      const updatedTrip = await tripService.deleteCoverImage(tripId, userId);

      if (!updatedTrip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      // Delete from Cloudinary
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }

      res.json({
        success: true,
        message: 'Cover image deleted successfully',
        data: { trip: updatedTrip }
      });
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to edit this trip' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Publish trip (make public)
   * PATCH /api/trips/:tripId/publish
   */
  async publishTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const trip = await tripService.publishTrip(tripId, userId);

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Trip published successfully',
        data: { trip }
      });
    } catch (error: any) {
      if (error.message === 'ONLY_CREATOR_CAN_PUBLISH') {
        res.status(403).json({ 
          success: false, 
          message: 'Only the trip creator can publish this trip' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Unpublish trip (make private)
   * PATCH /api/trips/:tripId/unpublish
   */
  async unpublishTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const trip = await tripService.unpublishTrip(tripId, userId);

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Trip unpublished successfully',
        data: { trip }
      });
    } catch (error: any) {
      if (error.message === 'ONLY_CREATOR_CAN_UNPUBLISH') {
        res.status(403).json({ 
          success: false, 
          message: 'Only the trip creator can unpublish this trip' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Clone/duplicate a trip
   * POST /api/trips/:tripId/clone
   */
  async cloneTrip(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const options = req.body || {};

      const clonedTrip = await tripService.cloneTrip(tripId, userId, options);

      res.status(201).json({
        success: true,
        message: 'Trip cloned successfully',
        data: { trip: clonedTrip }
      });
    } catch (error: any) {
      if (error.message === 'TRIP_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }
      if (error.message === 'TRIP_PRIVATE') {
        res.status(403).json({ 
          success: false, 
          message: 'This trip is private and cannot be cloned' 
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Search locations (Mapbox integration)
   * GET /api/trips/search-location
   */
  searchLocation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, limit } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ 
          success: false, 
          message: 'Search query is required' 
        });
        return;
      }

      const results = await mapService.searchLocation(query, {
        limit: limit ? parseInt(limit as string) : 5
      });

      res.json({
        success: true,
        data: { locations: results }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Location search service unavailable' 
      });
    }
  }
}

export default new TripController();