import { Request, Response, NextFunction } from "express";
import accommodationService from "./accommodation.service";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../../../../../shared/types";

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class AccommodationController {
  async getAccommodations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: "Trip ID is required" });
        return;
      }

      const accommodations = await accommodationService.getAccommodationsByTripId(tripId, userId);

      res.status(200).json({
        success: true,
        data: { accommodations },
      });
    } catch (error: any) {
      if (error.message === "Trip not found" || error.message === "Accommodation not found") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Unauthorized to view accommodations") {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Invalid trip ID") {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async createAccommodation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!tripId) {
        res.status(400).json({ success: false, message: "Trip ID is required" });
        return;
      }

      const { name, address, bookingUrl, checkIn, checkOut, pricePerNight, notes } =
        req.body as Partial<CreateAccommodationDTO>;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: "Accommodation name is required" });
        return;
      }

      const payload: CreateAccommodationDTO = { name: name.trim() };
      if (address !== undefined) payload.address = address;
      if (bookingUrl !== undefined) payload.bookingUrl = bookingUrl;
      if (checkIn !== undefined) payload.checkIn = checkIn;
      if (checkOut !== undefined) payload.checkOut = checkOut;
      if (pricePerNight !== undefined) payload.pricePerNight = pricePerNight;
      if (notes !== undefined) payload.notes = notes;

      const accommodation = await accommodationService.createAccommodation(tripId, userId, payload);

      res.status(201).json({
        success: true,
        message: "Accommodation created successfully",
        data: { accommodation },
      });
    } catch (error: any) {
      if (error.message === "Trip not found" || error.message === "Accommodation not found") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Unauthorized to create accommodations in this trip") {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === "Invalid trip ID" ||
        error.message === "Check-out date must be after check-in date" ||
        error.message === "Price per night cannot be negative" ||
        error.message === "Invalid booking URL" ||
        error.message === "Accommodation name is required"
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async updateAccommodation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accommodationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!accommodationId) {
        res.status(400).json({ success: false, message: "Accommodation ID is required" });
        return;
      }

      const { name, address, bookingUrl, checkIn, checkOut, pricePerNight, notes } =
        req.body as Partial<UpdateAccommodationDTO>;

      const payload: UpdateAccommodationDTO = {};
      if (name !== undefined) payload.name = name;
      if (address !== undefined) payload.address = address;
      if (bookingUrl !== undefined) payload.bookingUrl = bookingUrl;
      if (checkIn !== undefined) payload.checkIn = checkIn;
      if (checkOut !== undefined) payload.checkOut = checkOut;
      if (pricePerNight !== undefined) payload.pricePerNight = pricePerNight;
      if (notes !== undefined) payload.notes = notes;

      const accommodation = await accommodationService.updateAccommodation(accommodationId, userId, payload);

      res.status(200).json({
        success: true,
        message: "Accommodation updated successfully",
        data: { accommodation },
      });
    } catch (error: any) {
      if (error.message === "Trip not found" || error.message === "Accommodation not found") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Unauthorized to update this accommodation") {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message === "Invalid accommodation ID" ||
        error.message === "Check-out date must be after check-in date" ||
        error.message === "Price per night cannot be negative" ||
        error.message === "Invalid booking URL" ||
        error.message === "Accommodation name is required"
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async deleteAccommodation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accommodationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!accommodationId) {
        res.status(400).json({ success: false, message: "Accommodation ID is required" });
        return;
      }

      await accommodationService.deleteAccommodation(accommodationId, userId);

      res.status(200).json({
        success: true,
        message: "Accommodation deleted successfully",
      });
    } catch (error: any) {
      if (error.message === "Trip not found" || error.message === "Accommodation not found") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Unauthorized to delete this accommodation") {
        res.status(403).json({ success: false, message: error.message });
        return;
      }
      if (error.message === "Invalid accommodation ID") {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new AccommodationController();
