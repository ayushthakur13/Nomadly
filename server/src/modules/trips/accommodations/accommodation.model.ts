import { Schema, model, Document, Types } from "mongoose";

export interface IAccommodation extends Document {
  tripId: Types.ObjectId;
  name?: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: Date;
  checkOut?: Date;
  pricePerNight?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accommodationSchema = new Schema<IAccommodation>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: String,
    address: String,
    bookingUrl: String,
    checkIn: Date,
    checkOut: Date,
    pricePerNight: Number,
    notes: String,
  },
  { timestamps: true }
);

export default model<IAccommodation>("Accommodation", accommodationSchema);
