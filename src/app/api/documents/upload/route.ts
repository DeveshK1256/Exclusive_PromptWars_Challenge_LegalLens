import { NextRequest, NextResponse } from 'next/server';
import { validateFileMetadata, sanitizeFilename } from '@/lib/config';
import { calculateFileHash } from '@/lib/crypto';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { extractDocument } from '@/lib/extraction/extractor';
import { DocumentType, ContextRole } from '@/types/database';

import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: authData } = await supabase.auth.getUser();
    const authenticatedUser = authData?.user;
    const userId = authenticatedUser?.id || request.headers.get('x-user-id') || 'demo_user_id';

    // 0. Rate Limiting Check (Upload cap per hour)
    const rateLimit = await checkRateLimit(userId, 'upload');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Limit is 10 uploads per hour.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

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

    const safeFilename = sanitizeFilename(file.name);
    const storagePath = `documents/${userId}/${Date.now()}_${safeFilename}`;

    // 2. Text Extraction Execution
    let rawText = '';
    let sections: any[] = [];
    let extractionStatus: 'completed' | 'uploaded' = 'uploaded';

    try {
      const extractionResult = await extractDocument(buffer, file.type || 'application/pdf', safeFilename);
      if (extractionResult.status === 'completed') {
        rawText = extractionResult.rawText || '';
        sections = extractionResult.sections || [];
        extractionStatus = 'completed';
      }
    } catch {
      // Fallback to text string if binary buffer extraction fails
      rawText = buffer.toString('utf-8');
    }

    const docUuid = crypto.randomUUID();
    const verUuid = crypto.randomUUID();

    // 3. Document Record Construction matching Section 9.1
    const documentRecord = {
      id: docUuid,
      user_id: userId,
      title: safeFilename.replace(/\.[^/.]+$/, ''),
      original_filename: safeFilename,
      mime_type: file.type || 'application/pdf',
      file_size: file.size,
      file_hash: fileHash,
      storage_path: storagePath,
      document_type: documentType,
      jurisdiction: jurisdiction, // optional, user-supplied, never inferred
      status: extractionStatus,
      raw_text: rawText,
      sections: sections,
      deleted_at: null,
      retention_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const initialVersion = {
      id: verUuid,
      document_id: docUuid,
      version_number: 1,
      storage_path: storagePath,
      created_at: new Date().toISOString(),
    };

    // 4. Server-Side PostgreSQL Database Insertion into documents & document_versions tables
    if (userId && userId !== 'demo_user_id') {
      try {
        const dbClient = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
        const { error: docErr } = await dbClient.from('documents').insert({
          id: documentRecord.id,
          user_id: userId,
          title: documentRecord.title,
          original_filename: documentRecord.original_filename,
          mime_type: documentRecord.mime_type,
          file_size: documentRecord.file_size,
          file_hash: documentRecord.file_hash,
          storage_path: documentRecord.storage_path,
          document_type: documentRecord.document_type,
          jurisdiction: documentRecord.jurisdiction,
          status: documentRecord.status,
          created_at: documentRecord.created_at,
          updated_at: documentRecord.updated_at,
        });

        if (docErr) {
          console.error('[Upload API] Document DB insert error:', docErr);
        }

        const { error: verErr } = await dbClient.from('document_versions').insert({
          id: initialVersion.id,
          document_id: documentRecord.id,
          version_number: 1,
          storage_path: storagePath,
          created_at: initialVersion.created_at,
        });

        if (verErr) {
          console.error('[Upload API] Document version DB insert error:', verErr);
        }
      } catch (dbErr) {
        console.error('[Upload API] Server-side DB insertion exception:', dbErr);
      }
    }

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
