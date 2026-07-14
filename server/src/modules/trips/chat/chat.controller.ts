import { Request, Response, NextFunction } from 'express';
import chatService from './chat.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class ChatController {
  /**
   * GET /api/trips/:tripId/chat/messages
   */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      const { limit, beforeDate } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string, 10) : 50;
      const messages = await chatService.getMessages(
        tripId,
        userId,
        limitNum,
        beforeDate as string
      );

      res.status(200).json({
        success: true,
        data: { messages }
      });
    } catch (error: any) {
      if (error.message === 'Trip not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === 'Unauthorized to view trip chat') {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new ChatController();
