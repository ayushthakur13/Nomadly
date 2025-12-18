import multer from "multer";
import { profileStorage, tripCoverStorage, memoryStorage } from "../config/cloudinary";

export const uploadProfile = multer({ storage: profileStorage });
export const uploadTripCover = multer({ storage: tripCoverStorage });
export const uploadMemory = multer({ storage: memoryStorage });
