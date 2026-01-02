import { Request, Response, NextFunction } from 'express';
import destinationService from './destination.service';
import { uploadFromUrl } from '@shared/utils/cloudinary.utils';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class DestinationController {
  /**
   * GET /trips/:tripId/destinations
   * Get all destinations for a trip
   */
  async getDestinations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const destinations = await destinationService.getDestinationsByTripId(tripId, userId);

      res.status(200).json({
        success: true,
        data: { destinations },
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to view destinations') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /trips/:tripId/destinations
   * Create a new destination
   */
  async createDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { name, location, arrivalDate, departureDate, notes, imageUrl } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Destination name is required' });
        return;
      }

      const destination = await destinationService.createDestination(tripId, userId, {
        name,
        location,
        arrivalDate,
        departureDate,
        notes,
        imageUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Destination created successfully',
        data: { destination },
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to add destinations to this trip' ||
        error.message === 'Unauthorized to modify this destination'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Invalid coordinates' ||
        error.message === 'Departure date must be after arrival date' ||
        error.message === 'Invalid trip ID'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /destinations/:destinationId
   * Update a destination
   */
  async updateDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!destinationId) {
        res.status(400).json({ success: false, message: 'Destination ID is required' });
        return;
      }

      const { name, location, arrivalDate, departureDate, notes, imageUrl } = req.body;

      const destination = await destinationService.updateDestination(destinationId, userId, {
        name,
        location,
        arrivalDate,
        departureDate,
        notes,
        imageUrl,
      });

      res.status(200).json({
        success: true,
        message: 'Destination updated successfully',
        data: { destination },
      });
    } catch (error: any) {
      if (error.message === 'Destination not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Unauthorized to modify this destination' ||
        error.message === 'Unauthorized to add destinations to this trip'
      ) {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Invalid coordinates' ||
        error.message === 'Departure date must be after arrival date' ||
        error.message === 'Invalid destination ID'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /destinations/:destinationId
   * Delete a destination
   */
  async deleteDestination(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!destinationId) {
        res.status(400).json({ success: false, message: 'Destination ID is required' });
        return;
      }

      await destinationService.deleteDestination(destinationId, userId);

      res.status(200).json({
        success: true,
        message: 'Destination deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Destination not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to modify this destination') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid destination ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /trips/:tripId/destinations/reorder
   * Reorder destinations
   */
  async reorderDestinations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { orderedDestinationIds } = req.body;

      if (!Array.isArray(orderedDestinationIds)) {
        res.status(400).json({
          success: false,
          message: 'orderedDestinationIds must be an array',
        });
        return;
      }

      const destinations = await destinationService.reorderDestinations(
        tripId,
        userId,
        orderedDestinationIds
      );

      res.status(200).json({
        success: true,
        message: 'Destinations reordered successfully',
        data: { destinations },
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to reorder destinations') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === 'Invalid trip ID' ||
        error.message.includes('Invalid destination ID') ||
        error.message === 'Some destination IDs do not belong to this trip'
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /destinations/:destinationId/image
   * Upload destination image
   */
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!destinationId) {
        res.status(400).json({ success: false, message: 'Destination ID is required' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

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

      const destination = await destinationService.uploadDestinationImage(destinationId, userId, imageUrl, publicId);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { destination },
      });
    } catch (error: any) {
      console.error('Upload image error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }

  /**
   * DELETE /destinations/:destinationId/image
   * Delete destination image
   */
  async deleteImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!destinationId) {
        res.status(400).json({ success: false, message: 'Destination ID is required' });
        return;
      }

      const destination = await destinationService.deleteDestinationImage(destinationId, userId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: { destination },
      });
    } catch (error: any) {
      if (error.message === 'Destination not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to modify this destination') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Invalid destination ID') {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new DestinationController();
