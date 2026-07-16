import { describe, it, expect, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import exploreService, { ExploreError, EXPLORE_ERRORS } from "./explore.service";
import Trip from "../trips/core/trip.model";
import TripLike from "./like.model";
import SavedTrip from "./save.model";
import tripUtils from "../trips/core/trip.utils";

vi.mock("../trips/core/trip.model");
vi.mock("./like.model");
vi.mock("./save.model");
vi.mock("../trips/core/trip.utils", () => ({
  default: {
    canAccessTrip: vi.fn()
  }
}));

describe("ExploreService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("likeTrip", () => {
    it("should throw TRIP_NOT_FOUND if the trip does not exist", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();

      vi.mocked(Trip.findById).mockResolvedValue(null as any);

      await expect(exploreService.likeTrip(tripId, userId)).rejects.toThrow(
        new ExploreError(EXPLORE_ERRORS.TRIP_NOT_FOUND, "Trip not found")
      );
    });

    it("should throw TRIP_NOT_ACCESSIBLE if the trip is private", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId, isPublic: false };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(tripUtils.canAccessTrip).mockReturnValue(false);

      await expect(exploreService.likeTrip(tripId, userId)).rejects.toThrow(
        new ExploreError(EXPLORE_ERRORS.TRIP_NOT_ACCESSIBLE, "Trip is not accessible")
      );
    });

    it("should throw ALREADY_LIKED if the user has already liked the trip", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId, isPublic: true };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(tripUtils.canAccessTrip).mockReturnValue(true);
      vi.mocked(TripLike.findOne).mockResolvedValue({ _id: "some-like-id" } as any);

      await expect(exploreService.likeTrip(tripId, userId)).rejects.toThrow(
        new ExploreError(EXPLORE_ERRORS.ALREADY_LIKED, "You have already liked this trip")
      );
    });

    it("should successfully like the trip and increment likeCount", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId, isPublic: true };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(tripUtils.canAccessTrip).mockReturnValue(true);
      vi.mocked(TripLike.findOne).mockResolvedValue(null);
      vi.mocked(TripLike.create).mockResolvedValue({} as any);
      vi.mocked(TripLike.countDocuments).mockResolvedValue(5);
      vi.mocked(Trip.findByIdAndUpdate).mockResolvedValue({} as any);

      // Final count retrieval mock
      const mockFindByIdLean = {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue({ likeCount: 5 })
      };
      vi.mocked(Trip.findById).mockReturnValueOnce(mockTrip as any).mockReturnValueOnce(mockFindByIdLean as any);

      const count = await exploreService.likeTrip(tripId, userId);
      expect(count).toBe(5);
      expect(TripLike.create).toHaveBeenCalled();
      expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(tripId, { likeCount: 5 });
    });
  });

  describe("unlikeTrip", () => {
    it("should throw NOT_LIKED if the user has not liked the trip", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(TripLike.findOne).mockResolvedValue(null);

      await expect(exploreService.unlikeTrip(tripId, userId)).rejects.toThrow(
        new ExploreError(EXPLORE_ERRORS.NOT_LIKED, "You have not liked this trip")
      );
    });

    it("should delete the like record and decrement likeCount", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId };
      const mockLike = { _id: "like-id" };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(TripLike.findOne).mockResolvedValue(mockLike as any);
      vi.mocked(TripLike.deleteOne).mockResolvedValue({} as any);
      vi.mocked(TripLike.countDocuments).mockResolvedValue(4);

      const mockFindByIdLean = {
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue({ likeCount: 4 })
      };
      vi.mocked(Trip.findById).mockReturnValueOnce(mockTrip as any).mockReturnValueOnce(mockFindByIdLean as any);

      const count = await exploreService.unlikeTrip(tripId, userId);
      expect(count).toBe(4);
      expect(TripLike.deleteOne).toHaveBeenCalledWith({ _id: "like-id" });
      expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(tripId, { likeCount: 4 });
    });
  });

  describe("saveTrip", () => {
    it("should throw ALREADY_SAVED if the user has already saved the trip", async () => {
      const tripId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockTrip = { _id: tripId, isPublic: true };

      vi.mocked(Trip.findById).mockResolvedValue(mockTrip as any);
      vi.mocked(tripUtils.canAccessTrip).mockReturnValue(true);
      vi.mocked(SavedTrip.findOne).mockResolvedValue({ _id: "some-save-id" } as any);

      await expect(exploreService.saveTrip(tripId, userId)).rejects.toThrow(
        new ExploreError(EXPLORE_ERRORS.ALREADY_SAVED, "You have already saved this trip")
      );
    });
  });
});
