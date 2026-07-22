import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import tripService from './trip.service';
import Trip from './trip.model';
import User from '../../users/user.model';
import tripUtils from './trip.utils';
import destinationService from '../destinations/destination.service';
import accommodationService from '../accommodations/accommodation.service';
import budgetService from '../budget/budget.service';
import taskService from '../tasks/task.service';
import SavedTrip from '../../explore/save.model';
import { TripError, TRIP_ERRORS } from './trip.errors';

vi.mock('./trip.model', () => {
  const mockSave = vi.fn();
  const MockTrip = vi.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = { toString: () => 'mock-cloned-trip-id' };
    }
    this.destinations = [];
    this.save = mockSave.mockResolvedValue(true);
  });

  (MockTrip as any).findById = vi.fn();
  (MockTrip as any).findByIdAndUpdate = vi.fn();
  return {
    default: MockTrip
  };
});

vi.mock('../../users/user.model', () => {
  return {
    default: {
      findByIdAndUpdate: vi.fn()
    }
  };
});

vi.mock('../../explore/save.model', () => {
  return {
    default: {
      deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 })
    }
  };
});

vi.mock('./trip.utils', () => ({
  default: {
    canAccessTrip: vi.fn(),
    generateUniqueSlug: vi.fn().mockResolvedValue('cloned-trip-slug'),
    validateTripDates: vi.fn().mockReturnValue({ valid: true })
  }
}));

vi.mock('../destinations/destination.service', () => ({
  default: {
    cloneDestinations: vi.fn().mockResolvedValue(new Map())
  }
}));

vi.mock('../accommodations/accommodation.service', () => ({
  default: {
    cloneAccommodations: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('../budget/budget.service', () => ({
  default: {
    cloneBudget: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('../tasks/task.service', () => ({
  default: {
    cloneTasks: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('TripService - cloneTrip', () => {
  const tripId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const originalTrip = {
    _id: new Types.ObjectId(tripId),
    tripName: 'Original Trip',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-10'),
    isPublic: true,
    createdBy: new Types.ObjectId(),
    coverImageUrl: 'http://example.com/cover.jpg',
    coverImagePublicId: 'cover_pub_id',
    stayPermissions: { allowMemberStayEdits: true },
    budgetSummary: { total: 1000, spent: 200 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw TRIP_NOT_FOUND if original trip does not exist', async () => {
    (Trip.findById as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null)
    });

    await expect(tripService.cloneTrip(tripId, userId)).rejects.toThrow(
      new TripError(TRIP_ERRORS.TRIP_NOT_FOUND, 'Trip not found', 404)
    );
  });

  it('should throw UNAUTHORIZED if user is not allowed to access original trip', async () => {
    (Trip.findById as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(originalTrip)
    });
    (tripUtils.canAccessTrip as any).mockReturnValue(false);

    await expect(tripService.cloneTrip(tripId, userId)).rejects.toThrow(
      new TripError(TRIP_ERRORS.UNAUTHORIZED, 'This trip is private', 403)
    );
  });

  it('should successfully clone trip and coordinate child services', async () => {
    (Trip.findById as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(originalTrip)
    });
    (tripUtils.canAccessTrip as any).mockReturnValue(true);

    const destMap = new Map();
    const clonedDestId = new Types.ObjectId();
    destMap.set('orig_dest_id', clonedDestId);
    (destinationService.cloneDestinations as any).mockResolvedValue(destMap);

    const result = await tripService.cloneTrip(tripId, userId, {
      newTripName: 'My Cloned Trip',
      includeBudget: true,
      budgetCloneMode: 'PLANNING'
    });

    expect(Trip).toHaveBeenCalled();
    expect(destinationService.cloneDestinations).toHaveBeenCalledWith(tripId, result._id.toString(), expect.any(Number));
    expect(accommodationService.cloneAccommodations).toHaveBeenCalledWith(
      tripId,
      result._id.toString(),
      userId,
      destMap,
      expect.any(Number)
    );
    expect(taskService.cloneTasks).toHaveBeenCalledWith(tripId, result._id.toString(), userId, expect.any(Number));
    expect(budgetService.cloneBudget).toHaveBeenCalledWith(
      tripId,
      result._id.toString(),
      userId,
      'PLANNING'
    );
    expect(Trip.findByIdAndUpdate).toHaveBeenCalledWith(tripId, { $inc: { 'engagement.clones': 1 } });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { $inc: { 'stats.tripsCount': 1 } });
    expect(SavedTrip.deleteOne).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      tripId: new Types.ObjectId(tripId)
    });
  });
});
