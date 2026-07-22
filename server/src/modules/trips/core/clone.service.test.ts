import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import destinationService from '../destinations/destination.service';
import Destination from '../destinations/destination.model';
import accommodationService from '../accommodations/accommodation.service';
import Accommodation from '../accommodations/accommodation.model';
import taskService from '../tasks/task.service';
import Task from '../tasks/task.model';
import budgetService from '../budget/budget.service';
import TripBudget from '../budget/budget.model';
import Expense from '../budget/expense.model';
import Trip from './trip.model';

vi.mock('../destinations/destination.model', () => {
  const MockDest = vi.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(true);
    (MockDest as any).mockSave = this.save;
  });
  (MockDest as any).find = vi.fn();
  return { default: MockDest };
});

vi.mock('../accommodations/accommodation.model', () => {
  const MockAcc = vi.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(true);
    (MockAcc as any).mockSave = this.save;
  });
  (MockAcc as any).find = vi.fn();
  return { default: MockAcc };
});

vi.mock('../tasks/task.model', () => {
  const MockTask = vi.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(true);
    (MockTask as any).mockSave = this.save;
  });
  (MockTask as any).find = vi.fn();
  return { default: MockTask };
});

vi.mock('../budget/budget.model', () => {
  const MockTripBudget = vi.fn().mockImplementation(function (this: any, data: any) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(true);
    (MockTripBudget as any).mockSave = this.save;
  });
  (MockTripBudget as any).findOne = vi.fn();
  return { default: MockTripBudget };
});

vi.mock('../budget/expense.model', () => {
  return {
    default: {
      find: vi.fn(),
      aggregate: vi.fn()
    }
  };
});

vi.mock('./trip.model', () => {
  return {
    default: {
      findById: vi.fn()
    }
  };
});

describe('Nomadly Travel Services - Individual Cloning Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('destinationService.cloneDestinations', () => {
    it('should query original stops, generate new documents with null public ID, and return remapped IDs', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const origDestId = new Types.ObjectId();

      const mockOriginalDests = [
        {
          _id: origDestId,
          tripId: origTripId,
          name: 'Paris stop',
          order: 0,
          imagePublicId: 'cloudinary_public_id_123',
          imageUrl: 'http://cloudinary.com/paris.jpg'
        }
      ];

      (Destination.find as any).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockOriginalDests)
      });

      const mapping = await destinationService.cloneDestinations(
        origTripId.toString(),
        newTripId.toString()
      );

      expect(Destination.find).toHaveBeenCalled();
      expect(mapping.has(origDestId.toString())).toBe(true);
      expect(Destination).toHaveBeenCalled();
      expect((Destination as any).mockSave).toHaveBeenCalled();

      // Ensure imagePublicId was neutralized to null to avoid asset deletion
      const constructorArg = (Destination as any).mock.calls[0][0];
      expect(constructorArg.imagePublicId).toBeNull();
      expect(constructorArg.imageUrl).toBe('http://cloudinary.com/paris.jpg');
      expect(constructorArg.tripId.toString()).toBe(newTripId.toString());
    });

    it('should shift arrivalDate and departureDate if dateOffsetMs is provided', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const origDestId = new Types.ObjectId();

      const baseArrival = new Date('2025-12-01T10:00:00.000Z');
      const baseDeparture = new Date('2025-12-03T10:00:00.000Z');

      const mockOriginalDests = [
        {
          _id: origDestId,
          tripId: origTripId,
          name: 'Paris stop',
          order: 0,
          arrivalDate: baseArrival,
          departureDate: baseDeparture
        }
      ];

      (Destination.find as any).mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockOriginalDests)
      });

      const offsetMs = 24 * 60 * 60 * 1000 * 10; // +10 days

      await destinationService.cloneDestinations(
        origTripId.toString(),
        newTripId.toString(),
        offsetMs
      );

      const constructorArg = (Destination as any).mock.calls[(Destination as any).mock.calls.length - 1][0];
      expect(new Date(constructorArg.arrivalDate).toISOString()).toBe(new Date(baseArrival.getTime() + offsetMs).toISOString());
      expect(new Date(constructorArg.departureDate).toISOString()).toBe(new Date(baseDeparture.getTime() + offsetMs).toISOString());
    });
  });

  describe('accommodationService.cloneAccommodations', () => {
    it('should clone stays and map them to newly cloned destination IDs', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const origDestId = new Types.ObjectId();
      const newDestId = new Types.ObjectId();
      const clonerId = new Types.ObjectId();

      const mockOriginalAccommodations = [
        {
          _id: new Types.ObjectId(),
          tripId: origTripId,
          name: 'Hilton Hotel',
          destinationId: origDestId,
          bookingUrl: 'http://booking.com/hilton'
        }
      ];

      (Accommodation.find as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOriginalAccommodations)
      });

      const destinationIdMap = new Map<string, Types.ObjectId>();
      destinationIdMap.set(origDestId.toString(), newDestId);

      await accommodationService.cloneAccommodations(
        origTripId.toString(),
        newTripId.toString(),
        clonerId.toString(),
        destinationIdMap
      );

      expect(Accommodation.find).toHaveBeenCalled();
      expect(Accommodation).toHaveBeenCalled();
      expect((Accommodation as any).mockSave).toHaveBeenCalled();

      // Verify remapping of destinationId
      const constructorArg = (Accommodation as any).mock.calls[0][0];
      expect(constructorArg.destinationId.toString()).toBe(newDestId.toString());
      expect(constructorArg.tripId.toString()).toBe(newTripId.toString());
      expect(constructorArg.createdBy.toString()).toBe(clonerId.toString());
    });

    it('should shift checkIn and checkOut if dateOffsetMs is provided', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const clonerId = new Types.ObjectId();

      const baseCheckIn = new Date('2025-12-01T14:00:00.000Z');
      const baseCheckOut = new Date('2025-12-05T11:00:00.000Z');

      const mockOriginalAccommodations = [
        {
          _id: new Types.ObjectId(),
          tripId: origTripId,
          name: 'Hilton Hotel',
          checkIn: baseCheckIn,
          checkOut: baseCheckOut
        }
      ];

      (Accommodation.find as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOriginalAccommodations)
      });

      const offsetMs = 24 * 60 * 60 * 1000 * 10; // +10 days

      await accommodationService.cloneAccommodations(
        origTripId.toString(),
        newTripId.toString(),
        clonerId.toString(),
        new Map(),
        offsetMs
      );

      const constructorArg = (Accommodation as any).mock.calls[(Accommodation as any).mock.calls.length - 1][0];
      expect(new Date(constructorArg.checkIn).toISOString()).toBe(new Date(baseCheckIn.getTime() + offsetMs).toISOString());
      expect(new Date(constructorArg.checkOut).toISOString()).toBe(new Date(baseCheckOut.getTime() + offsetMs).toISOString());
    });
  });

  describe('taskService.cloneTasks', () => {
    it('should duplicate task lists while resetting assignments and completions', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const clonerId = new Types.ObjectId();

      const mockOriginalTasks = [
        {
          _id: new Types.ObjectId(),
          tripId: origTripId,
          title: 'Book flights',
          assignedTo: [new Types.ObjectId()],
          completions: [{ userId: new Types.ObjectId(), completedAt: new Date() }],
          isArchived: false
        }
      ];

      (Task.find as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOriginalTasks)
      });

      await taskService.cloneTasks(
        origTripId.toString(),
        newTripId.toString(),
        clonerId.toString()
      );

      expect(Task.find).toHaveBeenCalled();
      expect(Task).toHaveBeenCalled();
      expect((Task as any).mockSave).toHaveBeenCalled();

      const constructorArg = (Task as any).mock.calls[0][0];
      expect(constructorArg.assignedTo).toEqual([]);
      expect(constructorArg.completions).toEqual([]);
      expect(constructorArg.isArchived).toBe(false);
      expect(constructorArg.tripId.toString()).toBe(newTripId.toString());
    });

    it('should shift task dueDate if dateOffsetMs is provided', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const clonerId = new Types.ObjectId();

      const baseDueDate = new Date('2025-12-01T23:59:59.000Z');

      const mockOriginalTasks = [
        {
          _id: new Types.ObjectId(),
          tripId: origTripId,
          title: 'Book flights',
          dueDate: baseDueDate,
          assignedTo: [],
          completions: [],
          isArchived: false
        }
      ];

      (Task.find as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockOriginalTasks)
      });

      const offsetMs = 24 * 60 * 60 * 1000 * 10; // +10 days

      await taskService.cloneTasks(
        origTripId.toString(),
        newTripId.toString(),
        clonerId.toString(),
        offsetMs
      );

      const constructorArg = (Task as any).mock.calls[(Task as any).mock.calls.length - 1][0];
      expect(new Date(constructorArg.dueDate).toISOString()).toBe(new Date(baseDueDate.getTime() + offsetMs).toISOString());
    });
  });

  describe('budgetService.cloneBudget', () => {
    it('should clone budget, keep only active members of new trip, and auto-insert cloner as creator', async () => {
      const origTripId = new Types.ObjectId();
      const newTripId = new Types.ObjectId();
      const clonerId = new Types.ObjectId();
      const friendId = new Types.ObjectId();

      const mockOriginalBudget = {
        _id: new Types.ObjectId(),
        tripId: origTripId,
        baseCurrency: 'USD',
        baseBudgetAmount: 5000,
        members: [
          { userId: friendId, plannedContribution: 2000, role: 'creator', isPastMember: false },
          { userId: clonerId, plannedContribution: 3000, role: 'member', isPastMember: false }
        ],
        rules: { allowMemberExpenseCreation: true }
      };

      (TripBudget.findOne as any)
        .mockResolvedValueOnce(mockOriginalBudget)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockOriginalBudget);

      const mockTripDoc = {
        _id: newTripId,
        members: [{ userId: clonerId, role: 'creator' }],
        save: vi.fn().mockResolvedValue(true)
      };

      const mockQuery = Object.assign(
        Promise.resolve(mockTripDoc),
        {
          lean: vi.fn().mockResolvedValue(mockTripDoc)
        }
      );
      (Trip.findById as any).mockReturnValue(mockQuery);

      (Expense.aggregate as any).mockResolvedValue([]);

      await budgetService.cloneBudget(
        origTripId.toString(),
        newTripId.toString(),
        clonerId.toString(),
        'PLANNING'
      );

      expect(TripBudget.findOne).toHaveBeenCalledTimes(3);
      expect(Trip.findById).toHaveBeenCalled();
      expect(TripBudget).toHaveBeenCalled();
      expect((TripBudget as any).mockSave).toHaveBeenCalled();

      const budgetCreateArg = (TripBudget as any).mock.calls[0][0];
      expect(budgetCreateArg.tripId.toString()).toBe(newTripId.toString());
      expect(budgetCreateArg.baseCurrency).toBe('USD');
      expect(budgetCreateArg.baseBudgetAmount).toBe(5000);
      expect(budgetCreateArg.members.length).toBe(1);
      expect(budgetCreateArg.members[0].userId.toString()).toBe(clonerId.toString());
      expect(budgetCreateArg.members[0].role).toBe('creator');
      expect(budgetCreateArg.members[0].plannedContribution).toBe(0);
    });
  });
});
