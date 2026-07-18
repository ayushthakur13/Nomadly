import { Types } from "mongoose";
import Trip from "../trips/core/trip.model";
import TripLike from "./like.model";
import SavedTrip from "./save.model";
import tripUtils from "../trips/core/trip.utils";

export const EXPLORE_ERRORS = {
  TRIP_NOT_FOUND: "TRIP_NOT_FOUND",
  TRIP_NOT_ACCESSIBLE: "TRIP_NOT_ACCESSIBLE",
  ALREADY_LIKED: "ALREADY_LIKED",
  NOT_LIKED: "NOT_LIKED",
  ALREADY_SAVED: "ALREADY_SAVED",
  NOT_SAVED: "NOT_SAVED",
  INVALID_INPUT: "INVALID_INPUT"
} as const;

export type ExploreErrorCode = (typeof EXPLORE_ERRORS)[keyof typeof EXPLORE_ERRORS];

export class ExploreError extends Error {
  code: ExploreErrorCode;
  statusCode: number;

  constructor(code: ExploreErrorCode, message?: string) {
    super(message || code);
    this.name = "ExploreError";
    this.code = code;
    if (code === "TRIP_NOT_FOUND") {
      this.statusCode = 404;
    } else if (code === "TRIP_NOT_ACCESSIBLE") {
      this.statusCode = 403;
    } else if (code === "ALREADY_LIKED" || code === "ALREADY_SAVED") {
      this.statusCode = 409;
    } else if (code === "INVALID_INPUT" || code === "NOT_LIKED" || code === "NOT_SAVED") {
      this.statusCode = 400;
    } else {
      this.statusCode = 500;
    }
  }
}

class ExploreService {
  /**
   * Cursor-based paginated public Explore feed
   */
  async getExploreFeed(filters: {
    limit?: number | undefined;
    nextCursor?: string | undefined;
    sortBy?: "recent" | "most-liked" | undefined;
    category?: string | undefined;
    destination?: string | undefined;
  }) {
    const limit = filters.limit ? Number(filters.limit) : 12;
    const sortBy = filters.sortBy || "recent";
    const { nextCursor, category, destination } = filters;

    const query: any = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (destination) {
      query["destinationLocation.name"] = { $regex: destination, $options: "i" };
    }

    // Apply cursor pagination
    if (nextCursor) {
      if (sortBy === "recent") {
        if (Types.ObjectId.isValid(nextCursor)) {
          query._id = { $lt: new Types.ObjectId(nextCursor) };
        }
      } else if (sortBy === "most-liked") {
        const [cursorLikesStr, cursorIdStr] = nextCursor.split("_");
        if (cursorLikesStr && cursorIdStr && Types.ObjectId.isValid(cursorIdStr)) {
          const cursorLikes = Number(cursorLikesStr);
          const cursorId = new Types.ObjectId(cursorIdStr);
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { likeCount: { $lt: cursorLikes } },
              { likeCount: cursorLikes, _id: { $lt: cursorId } }
            ]
          });
        }
      }
    }

    const sortOption: any = {};
    if (sortBy === "recent") {
      sortOption._id = -1;
    } else if (sortBy === "most-liked") {
      sortOption.likeCount = -1;
      sortOption._id = -1;
    }

    // Fetch limit + 1 to check if there is a next page
    const trips = await Trip.find(query)
      .populate("createdBy", "username name profilePicUrl")
      .sort(sortOption)
      .limit(limit + 1)
      .lean();

    const hasNextPage = trips.length > limit;
    if (hasNextPage) {
      trips.pop();
    }

    // Generate next cursor from the last item
    let nextCursorToken = "";
    if (trips.length > 0) {
      const lastTrip = trips[trips.length - 1];
      if (lastTrip) {
        if (sortBy === "recent") {
          nextCursorToken = lastTrip._id.toString();
        } else if (sortBy === "most-liked") {
          nextCursorToken = `${lastTrip.likeCount || 0}_${lastTrip._id.toString()}`;
        }
      }
    }

    return {
      trips,
      pagination: {
        nextCursor: hasNextPage ? nextCursorToken : null,
        hasNextPage
      }
    };
  }

  /**
   * Like a trip
   */
  async likeTrip(tripId: string, userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(tripId) || !Types.ObjectId.isValid(userId)) {
      throw new ExploreError(EXPLORE_ERRORS.INVALID_INPUT, "Invalid ID");
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_FOUND, "Trip not found");
    }

    const hasAccess = tripUtils.canAccessTrip(trip, userId);
    if (!hasAccess || !trip.isPublic) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_ACCESSIBLE, "Trip is not accessible");
    }

    const existingLike = await TripLike.findOne({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });

    if (existingLike) {
      throw new ExploreError(EXPLORE_ERRORS.ALREADY_LIKED, "You have already liked this trip");
    }

    await TripLike.create({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });

    await this.syncTripLikeCount(tripId);

    const updatedTrip = await Trip.findById(tripId).select("likeCount").lean();
    return updatedTrip?.likeCount || 0;
  }

  /**
   * Unlike a trip
   */
  async unlikeTrip(tripId: string, userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(tripId) || !Types.ObjectId.isValid(userId)) {
      throw new ExploreError(EXPLORE_ERRORS.INVALID_INPUT, "Invalid ID");
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_FOUND, "Trip not found");
    }

    const existingLike = await TripLike.findOne({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });

    if (!existingLike) {
      throw new ExploreError(EXPLORE_ERRORS.NOT_LIKED, "You have not liked this trip");
    }

    await TripLike.deleteOne({ _id: existingLike._id });

    await this.syncTripLikeCount(tripId);

    const updatedTrip = await Trip.findById(tripId).select("likeCount").lean();
    return updatedTrip?.likeCount || 0;
  }

  /**
   * Save (bookmark) a trip
   */
  async saveTrip(tripId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(tripId) || !Types.ObjectId.isValid(userId)) {
      throw new ExploreError(EXPLORE_ERRORS.INVALID_INPUT, "Invalid ID");
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_FOUND, "Trip not found");
    }

    const hasAccess = tripUtils.canAccessTrip(trip, userId);
    if (!hasAccess) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_ACCESSIBLE, "Trip is not accessible");
    }

    const existingSave = await SavedTrip.findOne({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });

    if (existingSave) {
      throw new ExploreError(EXPLORE_ERRORS.ALREADY_SAVED, "You have already saved this trip");
    }

    await SavedTrip.create({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });
  }

  /**
   * Unsave (remove bookmark) a trip
   */
  async unsaveTrip(tripId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(tripId) || !Types.ObjectId.isValid(userId)) {
      throw new ExploreError(EXPLORE_ERRORS.INVALID_INPUT, "Invalid ID");
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new ExploreError(EXPLORE_ERRORS.TRIP_NOT_FOUND, "Trip not found");
    }

    const existingSave = await SavedTrip.findOne({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });

    if (!existingSave) {
      throw new ExploreError(EXPLORE_ERRORS.NOT_SAVED, "You have not saved this trip");
    }

    await SavedTrip.deleteOne({ _id: existingSave._id });
  }

  /**
   * Get user's saved trips
   */
  async getSavedTrips(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ExploreError(EXPLORE_ERRORS.INVALID_INPUT, "Invalid user ID");
    }

    const saves = await SavedTrip.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate({
        path: "tripId",
        populate: {
          path: "createdBy",
          select: "username name profilePicUrl"
        }
      })
      .lean();

    // Filter out saves where trip might have been deleted or is private and user is no longer a member
    const activeSavedTrips = saves
      .map((s: any) => s.tripId)
      .filter((trip: any) => {
        if (!trip) return false;
        return tripUtils.canAccessTrip(trip, userId);
      });

    return activeSavedTrips;
  }

  /**
   * Get whether a trip is liked and saved by a specific user
   */
  async getTripSocialStatus(tripId: string, userId?: string) {
    if (!Types.ObjectId.isValid(tripId) || !userId || !Types.ObjectId.isValid(userId)) {
      return { liked: false, saved: false };
    }

    const [like, save] = await Promise.all([
      TripLike.findOne({ tripId: new Types.ObjectId(tripId), userId: new Types.ObjectId(userId) }),
      SavedTrip.findOne({ tripId: new Types.ObjectId(tripId), userId: new Types.ObjectId(userId) })
    ]);

    return {
      liked: !!like,
      saved: !!save
    };
  }

  /**
   * Re-computes and persists Trip.likeCount from the live DB state.
   */
  private async syncTripLikeCount(tripId: string): Promise<void> {
    const count = await TripLike.countDocuments({ tripId: new Types.ObjectId(tripId) });
    await Trip.findByIdAndUpdate(tripId, { likeCount: count });
  }
}

export default new ExploreService();
