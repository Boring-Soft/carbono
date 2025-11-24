/**
 * Project Documents API Route
 * POST /api/projects/[id]/documents - Upload document to Supabase Storage
 * GET /api/projects/[id]/documents - List project documents with signed URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for storage');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const STORAGE_BUCKET = 'project-documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

/**
 * POST /api/projects/[id]/documents
 * Upload document to Supabase Storage
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.active) {
      return NextResponse.json(
        { error: 'Cannot upload documents to inactive project' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          message: 'Only PDF, JPG, and PNG files are allowed',
        },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading document: ${file.name} (${file.size} bytes)`);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${projectId}/${timestamp}-${file.name}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'Failed to upload file',
          message: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    console.log(`✓ File uploaded successfully: ${uploadData.path}`);

    // Save document metadata to database
    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileType: extension?.toUpperCase() || 'UNKNOWN',
        fileSize: file.size,
        uploadedBy,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading document:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to upload document',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/documents
 * List project documents with signed URLs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get documents from database
    const documents = await prisma.projectDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Generate signed URLs for each document (valid for 1 hour)
    const documentsWithSignedUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          // Extract path from public URL
          const urlParts = doc.fileUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${projectId}/${fileName}`;

          // Generate signed URL
          const { data: signedData, error: signError } = await supabaseAdmin
            .storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(filePath, 3600); // 1 hour expiry

          if (signError) {
            console.error('Error generating signed URL:', signError);
            return {
              ...doc,
              signedUrl: doc.fileUrl, // Fallback to public URL
            };
          }

          return {
            ...doc,
            signedUrl: signedData.signedUrl,
          };
        } catch (error) {
          console.error('Error processing document:', error);
          return {
            ...doc,
            signedUrl: doc.fileUrl,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: documentsWithSignedUrls,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/documents/[documentId]
 * Delete a document (to be implemented if needed)
 */
