import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file   : the file to upload
 *   - folder : (optional) Cloudinary folder, defaults to 'portfolio'
 *
 * Admin-only. Returns { url: string }.
 *
 * resource_type mapping:
 *   image/*     → 'image'
 *   video/*     → 'video'
 *   application/pdf, zip, doc*, etc. → 'raw'
 *   everything else → 'auto'
 */

const RAW_MIME_TYPES = new Set([
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
]);

function resolveResourceType(mimeType: string): 'image' | 'video' | 'raw' | 'auto' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  // PDFs and all document types must use 'raw'. Cloudinary rejects PDFs
  // uploaded as 'image', which causes the upload to fail and the UI button
  // to get stuck on "Uploading…".
  if (RAW_MIME_TYPES.has(mimeType)) return 'raw';
  return 'auto';
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      console.error('[upload POST] Unauthorized — session:', JSON.stringify(session?.user));
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

    console.log(`[upload POST] file="${file.name}" mime="${mimeType}" resource_type="${resourceType}" folder="${folder}"`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Do NOT set a fixed public_id — let Cloudinary generate a unique one.
    // A fixed public_id with unique_filename:false causes conflicts when the
    // same filename is re-uploaded and can make the upload silently fail.
    const url = await uploadToCloudinary(buffer, folder, {
      resource_type: resourceType,
      // unique_filename defaults to true — Cloudinary appends a random suffix
      // so concurrent or repeated uploads of the same file never conflict.
    });

    console.log(`[upload POST] success url="${url}"`);
    return NextResponse.json({ url, resource_type: resourceType }, { status: 200 });

  } catch (error) {
    console.error('[upload POST] error:', error);
    return NextResponse.json(
      { message: `Upload failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
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
    if (uploadIndex === -1) return NextResponse.json({ message: 'Invalid Cloudinary URL' }, { status: 400 });

    const resourceType = parts[uploadIndex - 1] as 'image' | 'video' | 'raw';

    let afterUpload = parts.slice(uploadIndex + 1);
    // Strip version segment (e.g. /v1234567890/)
    if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) {
      afterUpload = afterUpload.slice(1);
    }
    let publicId = afterUpload.join('/');

    // For image/video, Cloudinary destroy() requires the public_id WITHOUT extension
    if (resourceType === 'image' || resourceType === 'video') {
      publicId = publicId.replace(/\.[^/.]+$/, '');
    }

    console.log(`[upload DELETE] publicId="${publicId}" resource_type="${resourceType}"`);
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId, resourceType);
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('[upload DELETE] error:', error);
    return NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
  }
}
