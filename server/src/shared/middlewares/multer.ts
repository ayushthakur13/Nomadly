import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { UploadApiOptions } from "cloudinary";
import { cloudinary } from "@config/cloudinary.config";

type UploadOptions = UploadApiOptions & {
  folder: string;
};

const createStorage = (options: UploadOptions) =>
  new CloudinaryStorage({
    cloudinary,
    params: () => options,
  });

export const uploadProfile = multer({
  storage: createStorage({
    folder: "nomadly/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  }),
});

export const uploadTripCover = multer({
  storage: createStorage({
    folder: "nomadly/trip_covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 600, crop: "fill" }],
  }),
});

export const uploadMemory = multer({
  storage: createStorage({
    folder: "nomadly/memories",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov"],
  }),
});
