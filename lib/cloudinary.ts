import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 *
 * IMPORTANT: Uses cloudinary.uploader.upload() with a base64 data URI instead
 * of upload_stream(). upload_stream() silently hangs in Next.js App Router
 * serverless functions because the underlying Node.js writable stream stalls
 * and the callback never fires — leaving the UI button stuck on "Uploading…"
 * indefinitely with no error surfaced.
 *
 * @param buffer   - Raw file bytes
 * @param folder   - Cloudinary folder (e.g. 'portfolio/cv')
 * @param options  - Extra Cloudinary upload options (e.g. resource_type, public_id)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: UploadApiOptions = {}
): Promise<string> {
  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: 'auto', // overridden by options below if caller specifies one
    ...options,
  };

  // Build a base64 data URI. Cloudinary accepts this directly without streaming.
  // The MIME prefix must be syntactically valid; Cloudinary ignores it for 'raw'.
  const mimeType =
    options.resource_type === 'raw'   ? 'application/octet-stream' :
    options.resource_type === 'video' ? 'video/mp4'                :
                                        'image/jpeg';

  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  console.log('[cloudinary] uploading to folder:', folder, '| resource_type:', uploadOptions.resource_type);
  const result = await cloudinary.uploader.upload(dataUri, uploadOptions);
  console.log('[cloudinary] upload success, url:', result.secure_url);
  return result.secure_url;
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  console.log('[cloudinary] deleting:', publicId, '| resource_type:', resourceType);
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
