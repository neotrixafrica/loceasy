import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docUrl, docType } = await req.json();

    if (!docUrl || !docType) {
      return NextResponse.json({ error: 'Document URL and type are required' }, { status: 400 });
    }

    // Update user with verification document
    await db.user.update({
      where: { id: currentUser.id },
      data: {
        verificationDoc: docUrl,
        verificationDocType: docType,
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Identity verification submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting identity verification:', error);
    return NextResponse.json({ error: 'Failed to submit verification' }, { status: 500 });
  }
}
