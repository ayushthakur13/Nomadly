import { Types } from "mongoose";
import Accommodation, { IAccommodation } from "./accommodation.model";
import Trip from "../core/trip.model";
import { isTripCreator, isTripMember } from "../members/member.utils";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../../../../../shared/types";

class AccommodationService {
  async getAccommodationsByTripId(tripId: string, userId?: string): Promise<IAccommodation[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error("Invalid trip ID");
    }

    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      throw new Error("Trip not found");
    }

    const isMember = userId ? trip.members.some((member: any) => member.userId.toString() === userId.toString()) : false;
    const isOwner = userId ? isTripCreator(trip, userId) : false;

    if (!trip.isPublic && !isMember && !isOwner) {
      throw new Error("Unauthorized to view accommodations");
    }

    return Accommodation.find({ tripId: new Types.ObjectId(tripId) })
      .populate("createdBy", "username name profilePicUrl")
      .sort({ checkIn: 1, createdAt: -1 })
      .lean();
  }

  async createAccommodation(
    tripId: string,
    userId: string,
    data: CreateAccommodationDTO
  ): Promise<IAccommodation> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error("Invalid trip ID");
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (!isTripMember(trip, userId)) {
      throw new Error("Unauthorized to create accommodations in this trip");
    }

    this.validatePayload(data);

    const accommodation = new Accommodation({
      tripId: new Types.ObjectId(tripId),
      createdBy: new Types.ObjectId(userId),
      destinationId: data.destinationId && Types.ObjectId.isValid(data.destinationId)
        ? new Types.ObjectId(data.destinationId)
        : undefined,
      name: data.name.trim(),
      address: data.address?.trim(),
      bookingUrl: this.normalizeBookingUrl(data.bookingUrl),
      checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
      checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      pricePerNight: data.pricePerNight,
      notes: data.notes?.trim(),
      checkInInstructions: data.checkInInstructions?.trim(),
      hostContactName: data.hostContactName?.trim(),
      hostContactPhone: data.hostContactPhone?.trim(),
      hostContactWhatsApp: data.hostContactWhatsApp?.trim(),
      handoffNotes: data.handoffNotes?.trim(),
    });

    await accommodation.save();
    await accommodation.populate("createdBy", "username name profilePicUrl");
    return accommodation;
  }

  async updateAccommodation(
    accommodationId: string,
    userId: string,
    data: UpdateAccommodationDTO
  ): Promise<IAccommodation> {
    if (!Types.ObjectId.isValid(accommodationId)) {
      throw new Error("Invalid accommodation ID");
    }

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    const trip = await Trip.findById(accommodation.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (!this.canEditAccommodation(trip, accommodation, userId)) {
      throw new Error("Unauthorized to update this accommodation");
    }

    this.validatePayload(data, accommodation);

    if (data.name !== undefined) accommodation.name = data.name.trim();
    if (data.address !== undefined) accommodation.address = data.address.trim();
    if (data.destinationId !== undefined) {
      (accommodation as any).destinationId =
        data.destinationId && Types.ObjectId.isValid(data.destinationId)
          ? new Types.ObjectId(data.destinationId)
          : undefined;
    }
    if (data.bookingUrl !== undefined) {
      (accommodation as any).bookingUrl = this.normalizeBookingUrl(data.bookingUrl);
    }
    if (data.checkIn !== undefined) {
      (accommodation as any).checkIn = data.checkIn ? new Date(data.checkIn) : undefined;
    }
    if (data.checkOut !== undefined) {
      (accommodation as any).checkOut = data.checkOut ? new Date(data.checkOut) : undefined;
    }
    if (data.pricePerNight !== undefined) accommodation.pricePerNight = data.pricePerNight;
    if (data.notes !== undefined) accommodation.notes = data.notes.trim();
    if (data.checkInInstructions !== undefined) accommodation.checkInInstructions = data.checkInInstructions.trim();
    if (data.hostContactName !== undefined) accommodation.hostContactName = data.hostContactName.trim();
    if (data.hostContactPhone !== undefined) accommodation.hostContactPhone = data.hostContactPhone.trim();
    if (data.hostContactWhatsApp !== undefined) accommodation.hostContactWhatsApp = data.hostContactWhatsApp.trim();
    if (data.handoffNotes !== undefined) accommodation.handoffNotes = data.handoffNotes.trim();

    await accommodation.save();
    await accommodation.populate("createdBy", "username name profilePicUrl");
    return accommodation;
  }

  async deleteAccommodation(accommodationId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(accommodationId)) {
      throw new Error("Invalid accommodation ID");
    }

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    const trip = await Trip.findById(accommodation.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (!this.canEditAccommodation(trip, accommodation, userId)) {
      throw new Error("Unauthorized to delete this accommodation");
    }

    await Accommodation.findByIdAndDelete(accommodationId);
  }

  private validatePayload(payload: Partial<CreateAccommodationDTO | UpdateAccommodationDTO>, current?: IAccommodation) {
    if ("name" in payload && payload.name !== undefined && !payload.name.trim()) {
      throw new Error("Accommodation name is required");
    }

    const nextPricePerNight = payload.pricePerNight !== undefined ? payload.pricePerNight : current?.pricePerNight;
    if (nextPricePerNight !== undefined && nextPricePerNight < 0) {
      throw new Error("Price per night cannot be negative");
    }

    const nextCheckIn = payload.checkIn !== undefined ? payload.checkIn : current?.checkIn;
    const nextCheckOut = payload.checkOut !== undefined ? payload.checkOut : current?.checkOut;

    if (nextCheckIn && nextCheckOut && new Date(nextCheckOut) < new Date(nextCheckIn)) {
      throw new Error("Check-out date must be after check-in date");
    }

    const nextBookingUrlRaw = payload.bookingUrl !== undefined ? payload.bookingUrl : current?.bookingUrl;
    const nextBookingUrl = this.normalizeBookingUrl(nextBookingUrlRaw);
    if (nextBookingUrl && !this.isValidUrl(nextBookingUrl)) {
      throw new Error("Invalid booking URL");
    }

    if (payload.destinationId !== undefined && payload.destinationId && !Types.ObjectId.isValid(payload.destinationId)) {
      throw new Error("Invalid destination ID");
    }
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  private normalizeBookingUrl(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async deleteTripAccommodations(tripId: string): Promise<void> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error("Invalid trip ID");
    }
    await Accommodation.deleteMany({ tripId: new Types.ObjectId(tripId) });
  }

  private canEditAccommodation(trip: any, accommodation: IAccommodation, userId: string): boolean {
    if (isTripCreator(trip, userId)) {
      return true;
    }

    const createdById = accommodation.createdBy?.toString();
    if (createdById === userId.toString()) {
      return true;
    }

    const isMember = isTripMember(trip, userId);
    const allowMemberStayEdits = Boolean(trip?.stayPermissions?.allowMemberStayEdits);
    return isMember && allowMemberStayEdits;
  }
}

export default new AccommodationService();
