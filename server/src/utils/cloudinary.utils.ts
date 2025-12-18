import { v2 as cloudinary } from 'cloudinary';

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID of the image
 * @returns Deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    if (!publicId) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️ Failed to delete from Cloudinary: ${publicId}`, result);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Cloudinary deletion error:', error.message);
    return false;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 * @returns Array of deletion results
 */
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<boolean[]> {
  const results = await Promise.all(
    publicIds.map(id => deleteFromCloudinary(id))
  );
  return results;
}

/**
 * Generate optimized Cloudinary URL
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}
): string {
  const {
    width = 800,
    height,
    crop = 'fill',
    quality = 80,
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop, quality, fetch_format: format }
    ]
  });
}

export default {
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedImageUrl
};