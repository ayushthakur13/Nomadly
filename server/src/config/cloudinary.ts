import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force IPv4 to avoid IPv6 connection issues
dns.setDefaultResultOrder("ipv4first");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  timeout: 60000,
  upload_timeout: 60000,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nomadly/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  } as any,
});

const tripCoverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nomadly/trip_covers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 600, crop: "fill" }],
  } as any,
});

const memoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nomadly/memories",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov"],
  } as any,
});

export { cloudinary, profileStorage, tripCoverStorage, memoryStorage };
