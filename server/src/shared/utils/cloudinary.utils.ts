import { v2 as cloudinary } from 'cloudinary';

export async function uploadFromUrl(imageUrl: string, folder: string = 'nomadly/profiles'): Promise<{ url: string; publicId: string } | null> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      transformation: [{ width: 500, height: 500, crop: 'fill' }],
    });

    console.log(`✅ Uploaded profile image to Cloudinary: ${result.public_id}`);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: any) {
    console.error('❌ Cloudinary upload from URL error:', error?.message || error);
    return null;
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  const maxAttempts = 3;
  const baseDelayMs = 400;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
        return true;
      }
      console.warn(`⚠️ Failed to delete from Cloudinary (attempt ${attempt}/${maxAttempts}): ${publicId}`, result);
    } catch (error: any) {
      console.error(`❌ Cloudinary deletion error for ${publicId} (attempt ${attempt}/${maxAttempts}):`, error?.message || error);
    }
    if (attempt < maxAttempts) {
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  return false;
}

export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<boolean[]> {
  const results = await Promise.all(publicIds.map(id => deleteFromCloudinary(id)));
  return results;
}

export function getOptimizedImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string; quality?: number; format?: string } = {}
): string {
  const { width = 800, height, crop = 'fill', quality = 80, format = 'auto' } = options;
  return cloudinary.url(publicId, { transformation: [{ width, height, crop, quality, fetch_format: format }] });
}

export default { uploadFromUrl, deleteFromCloudinary, deleteMultipleFromCloudinary, getOptimizedImageUrl };
