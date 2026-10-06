import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const project = await Project.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (project.imageUrl) {
      // Simulate DELETE request to the upload API to avoid duplicating complex public_id extraction
      const parts = project.imageUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        const resourceType = parts[uploadIndex - 1] as 'image' | 'video' | 'raw';
        let afterUpload = parts.slice(uploadIndex + 1);
        if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) afterUpload = afterUpload.slice(1);
        let publicId = afterUpload.join('/');
        if (resourceType === 'image' || resourceType === 'video') publicId = publicId.replace(/\.[^/.]+$/, ""); 
        
        const { deleteFromCloudinary } = await import('@/lib/cloudinary');
        await deleteFromCloudinary(publicId, resourceType).catch(() => {});
      }
    }

    await Project.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
