import { Schema, model, Document, Types } from "mongoose";

export interface IDestination extends Document {
  tripId: Types.ObjectId;
  name: string;
  locationString?: string;
  arrivalDate?: Date;
  departureDate?: Date;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
  imageUrl?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const destinationSchema = new Schema<IDestination>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: { type: String, required: true },
    locationString: { type: String },
    arrivalDate: Date,
    departureDate: Date,
    notes: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    placeId: String,
    imageUrl: String,
    order: Number,
  },
  { timestamps: true }
);

// optionally add geospatial index if needed
destinationSchema.index({ "coordinates": "2dsphere" });

export default model<IDestination>("Destination", destinationSchema);
