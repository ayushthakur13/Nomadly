import { Request, Response, NextFunction } from 'express';
import memoryService from './memory.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
  file?: Express.Multer.File & {
    secure_url?: string;
    path?: string;
    public_id?: string;
    filename?: string;
  };
}

class MemoryController {
  /**
   * GET /api/trips/:tripId/memories
   */
  async getMemories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const memories = await memoryService.getMemoriesByTripId(tripId, userId);

      res.status(200).json({
        success: true,
        data: { memories }
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to view memories') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/trips/:tripId/memories
   */
  async uploadMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      const { caption } = req.body;

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

      const file: any = req.file;
      const imageUrl = file.secure_url || file.path;
      const publicId = file.public_id || file.filename;

      if (!imageUrl || !publicId) {
        res.status(500).json({
          success: false,
          message: 'Image upload failed (missing Cloudinary reference)'
        });
        return;
      }

      const memory = await memoryService.createMemory(
        tripId,
        userId,
        imageUrl,
        publicId,
        caption
      );

      res.status(201).json({
        success: true,
        message: 'Memory uploaded successfully',
        data: { memory }
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to upload memories') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PATCH /api/memories/:memoryId
   */
  async updateCaption(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { memoryId } = req.params;
      const userId = req.user?.id;
      const { caption } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!memoryId) {
        res.status(400).json({ success: false, message: 'Memory ID is required' });
        return;
      }

      if (caption === undefined || typeof caption !== 'string') {
        res.status(400).json({ success: false, message: 'Caption string is required' });
        return;
      }

      const memory = await memoryService.updateMemoryCaption(memoryId, userId, caption);

      res.status(200).json({
        success: true,
        message: 'Caption updated successfully',
        data: { memory }
      });
    } catch (error: any) {
      if (error.message === 'Memory not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to update memory caption') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/memories/:memoryId
   */
  async deleteMemory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { memoryId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!memoryId) {
        res.status(400).json({ success: false, message: 'Memory ID is required' });
        return;
      }

      await memoryService.deleteMemory(memoryId, userId);

      res.status(200).json({
        success: true,
        message: 'Memory deleted successfully'
      });
    } catch (error: any) {
      if (error.message === 'Memory not found' || error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to delete memory') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new MemoryController();
