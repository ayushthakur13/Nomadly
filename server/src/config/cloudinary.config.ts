import { v2 as cloudinary } from "cloudinary";
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

export { cloudinary };
