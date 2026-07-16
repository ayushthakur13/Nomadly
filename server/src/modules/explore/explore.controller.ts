import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@shared/utils";
import exploreService, { ExploreError, EXPLORE_ERRORS } from "./explore.service";

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class ExploreController {
  /**
   * GET /api/explore/trips
   */
  getExploreFeed = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { limit, nextCursor, sortBy, category, destination } = req.query;

    const result = await exploreService.getExploreFeed({
      limit: limit ? Number(limit) : undefined,
      nextCursor: nextCursor as string,
      sortBy: sortBy as "recent" | "most-liked",
      category: category as string,
      destination: destination as string
    });

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * POST /api/explore/trips/:tripId/like
   */
  likeTrip = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: "Trip ID is required" });
      return;
    }

    try {
      const likeCount = await exploreService.likeTrip(tripId, userId);
      res.status(200).json({
        success: true,
        message: "Trip liked successfully",
        data: { likeCount }
      });
    } catch (error: any) {
      if (error instanceof ExploreError) {
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_FOUND) {
          res.status(404).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_ACCESSIBLE) {
          res.status(403).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.ALREADY_LIKED) {
          res.status(409).json({ success: false, message: error.message });
          return;
        }
      }
      next(error);
    }
  });

  /**
   * DELETE /api/explore/trips/:tripId/like
   */
  unlikeTrip = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: "Trip ID is required" });
      return;
    }

    try {
      const likeCount = await exploreService.unlikeTrip(tripId, userId);
      res.status(200).json({
        success: true,
        message: "Trip unliked successfully",
        data: { likeCount }
      });
    } catch (error: any) {
      if (error instanceof ExploreError) {
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_FOUND) {
          res.status(404).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.NOT_LIKED) {
          res.status(400).json({ success: false, message: error.message });
          return;
        }
      }
      next(error);
    }
  });

  /**
   * POST /api/explore/trips/:tripId/save
   */
  saveTrip = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: "Trip ID is required" });
      return;
    }

    try {
      await exploreService.saveTrip(tripId, userId);
      res.status(200).json({
        success: true,
        message: "Trip saved successfully"
      });
    } catch (error: any) {
      if (error instanceof ExploreError) {
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_FOUND) {
          res.status(404).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_ACCESSIBLE) {
          res.status(403).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.ALREADY_SAVED) {
          res.status(409).json({ success: false, message: error.message });
          return;
        }
      }
      next(error);
    }
  });

  /**
   * DELETE /api/explore/trips/:tripId/save
   */
  unsaveTrip = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!tripId) {
      res.status(400).json({ success: false, message: "Trip ID is required" });
      return;
    }

    try {
      await exploreService.unsaveTrip(tripId, userId);
      res.status(200).json({
        success: true,
        message: "Trip unsaved successfully"
      });
    } catch (error: any) {
      if (error instanceof ExploreError) {
        if (error.code === EXPLORE_ERRORS.TRIP_NOT_FOUND) {
          res.status(404).json({ success: false, message: error.message });
          return;
        }
        if (error.code === EXPLORE_ERRORS.NOT_SAVED) {
          res.status(400).json({ success: false, message: error.message });
          return;
        }
      }
      next(error);
    }
  });

  /**
   * GET /api/explore/saved
   */
  getSavedTrips = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const trips = await exploreService.getSavedTrips(userId);

    res.status(200).json({
      success: true,
      data: { trips }
    });
  });

  /**
   * GET /api/explore/trips/:tripId/status
   */
  getTripSocialStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    const { tripId } = req.params;

    if (!tripId) {
      res.status(400).json({ success: false, message: "Trip ID is required" });
      return;
    }

    const status = await exploreService.getTripSocialStatus(tripId, userId);

    res.status(200).json({
      success: true,
      data: status
    });
  });
}

export default new ExploreController();
