import { Schema, model, Document, Types } from "mongoose";

export interface IAccommodation extends Document {
  tripId: Types.ObjectId;
  createdBy: Types.ObjectId;
  destinationId?: Types.ObjectId;
  name?: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: Date;
  checkOut?: Date;
  pricePerNight?: number;
  notes?: string;
  checkInInstructions?: string;
  hostContactName?: string;
  hostContactPhone?: string;
  hostContactWhatsApp?: string;
  handoffNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accommodationSchema = new Schema<IAccommodation>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destinationId: { type: Schema.Types.ObjectId, ref: "Destination" },
    name: String,
    address: String,
    bookingUrl: String,
    checkIn: Date,
    checkOut: Date,
    pricePerNight: Number,
    notes: String,
    checkInInstructions: String,
    hostContactName: String,
    hostContactPhone: String,
    hostContactWhatsApp: String,
    handoffNotes: String,
  },
  { timestamps: true }
);

export default model<IAccommodation>("Accommodation", accommodationSchema);
