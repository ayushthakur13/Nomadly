import { Schema, model, Document, Types } from "mongoose";

export interface IDestination extends Document {
  tripId: Types.ObjectId;
  name: string;
  location?: {
    name?: string;
    address?: string;
    placeId?: string;
    point: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  arrivalDate?: Date;
  departureDate?: Date;
  notes?: string;
  imageUrl?: string;
  imagePublicId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema(
  {
    name: String,
    address: String,
    placeId: String,
    point: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: any) =>
            Array.isArray(v) &&
            v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 &&
            v[1] >= -90 && v[1] <= 90,
          message: 'Invalid coordinates',
        },
      },
    },
  },
  { _id: false }
);

const destinationSchema = new Schema<IDestination>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: LocationSchema,
      required: false,
    },
    arrivalDate: Date,
    departureDate: {
      type: Date,
      validate: {
        validator: function (this: IDestination, value: Date) {
          return !this.arrivalDate || value >= this.arrivalDate;
        },
        message: 'Departure date must be after arrival date',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    imageUrl: String,
    imagePublicId: String,
    order: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// indexes
destinationSchema.index({ tripId: 1, order: 1 });
destinationSchema.index({ "location.point": "2dsphere" });

export default model<IDestination>("Destination", destinationSchema);
