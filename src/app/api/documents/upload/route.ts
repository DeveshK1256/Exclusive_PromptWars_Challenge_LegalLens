import { NextRequest, NextResponse } from 'next/server';
import { validateFileMetadata, sanitizeFilename } from '@/lib/config';
import { calculateFileHash } from '@/lib/crypto';
import { DocumentType, ContextRole } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('document_type') as DocumentType) || 'other';
    const jurisdiction = (formData.get('jurisdiction') as string) || null;
    const contextRole = (formData.get('context_role') as ContextRole) || null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in request.' },
        { status: 400 }
      );
    }

    // 1. File Validation
    const validation = validateFileMetadata(file.name, file.type, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to Buffer & calculate SHA-256 hash for duplicate detection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileHash = calculateFileHash(buffer);

    // Mock/Simulated User ID for local dev/demo API handling
    const userId = request.headers.get('x-user-id') || 'demo_user_id';

    const safeFilename = sanitizeFilename(file.name);
    const storagePath = `documents/${userId}/${Date.now()}_${safeFilename}`;

    // 3. Document Record Construction matching Section 9.1
    const documentRecord = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title: safeFilename.replace(/\.[^/.]+$/, ''),
      original_filename: safeFilename,
      mime_type: file.type || 'application/pdf',
      file_size: file.size,
      file_hash: fileHash,
      storage_path: storagePath,
      document_type: documentType,
      jurisdiction: jurisdiction, // optional, user-supplied, never inferred
      status: 'uploaded' as const,
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const initialVersion = {
      id: `ver_1_${Date.now()}`,
      document_id: documentRecord.id,
      version_number: 1,
      storage_path: storagePath,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: 'Document uploaded and validated successfully',
        document: documentRecord,
        version: initialVersion,
        context_role: contextRole,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json(
      { error: `Document upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
