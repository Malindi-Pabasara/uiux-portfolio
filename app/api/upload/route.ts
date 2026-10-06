import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file        : the file to upload
 *   - folder      : (optional) Cloudinary folder, defaults to 'portfolio'
 *
 * Admin-only. Returns { url: string }.
 *
 * resource_type mapping:
 *   image/*                    → 'image'
 *   video/*                    → 'video'
 *   application/pdf, zip, doc* → 'raw'  (avoids "invalid file type" errors)
 *   everything else            → 'auto' (Cloudinary auto-detect fallback)
 */

const RAW_MIME_PREFIXES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
  'application/octet-stream',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

function resolveResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
  if (mimeType === 'application/pdf') return 'image'; // Force PDF as image for inline viewing
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (RAW_MIME_PREFIXES.includes(mimeType)) return 'raw';
  return 'auto';
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied. Admins only.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'portfolio';

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File exceeds the 10 MB limit.' }, { status: 413 });
    }

    const mimeType = file.type || 'application/octet-stream';
    const resourceType = resolveResourceType(mimeType);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract original filename without extension (for image/video) or with extension (for raw)
    const originalName = file.name || 'upload';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    const publicId = resourceType === 'raw' ? originalName : nameWithoutExt;

    const url = await uploadToCloudinary(buffer, folder, {
      resource_type: resourceType,
      public_id: publicId,
      use_filename: true,
      unique_filename: false,
    });

    return NextResponse.json({ url, resource_type: resourceType }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Access denied.' }, { status: 403 });
    }

    const { url } = await req.json();
    if (!url) return NextResponse.json({ message: 'URL required' }, { status: 400 });

    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return NextResponse.json({ message: 'Invalid URL' }, { status: 400 });

    const resourceType = parts[uploadIndex - 1] as 'image' | 'video' | 'raw';
    
    let afterUpload = parts.slice(uploadIndex + 1);
    // Cloudinary URLs may or may not include a version segment (e.g., /v1234567890/)
    if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) {
      afterUpload = afterUpload.slice(1);
    }
    let publicIdWithExtension = afterUpload.join('/');
    
    // For images, we must strip the extension for destroy() to work
    let publicId = publicIdWithExtension;
    if (resourceType === 'image' || resourceType === 'video') {
      publicId = publicId.replace(/\.[^/.]+$/, ""); 
    }

    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId, resourceType);
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
  }
}
