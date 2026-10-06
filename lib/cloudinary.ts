import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 *
 * @param buffer       - Raw file bytes
 * @param folder       - Cloudinary folder to organise uploads (e.g. 'portfolio/cv')
 * @param options      - Extra Cloudinary upload options (e.g. resource_type)
 *
 * Supported resource_type values:
 *   'image' - JPG, PNG, GIF, WebP, SVG, etc.
 *   'video' - MP4, MOV, etc.
 *   'raw'   - PDF, ZIP, DOC, DOCX, XLSX, CSV, TXT, and all other binary files
 *   'auto'  - Cloudinary auto-detects (may fail for non-image types on some plans)
 *
 * Always pass resource_type explicitly to avoid "invalid file type" errors.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: UploadApiOptions = {}
): Promise<string> {
  // Default to 'auto' only when the caller has not specified a resource_type
  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: 'auto',
    ...options, // caller-supplied resource_type overrides the default above
  };

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

export default cloudinary;
