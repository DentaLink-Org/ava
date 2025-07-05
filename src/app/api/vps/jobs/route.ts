import { NextRequest, NextResponse } from 'next/server';
import { VpsClient } from '@/lib/vps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.processingType || !body.data) {
      return NextResponse.json(
        { error: 'Missing required fields: processingType, data' },
        { status: 400 }
      );
    }

    const client = new VpsClient();
    
    // Submit job to VPS
    const job = await client.submitJob(body);
    
    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      message: 'Job submitted successfully'
    }, { status: 202 });
  } catch (error) {
    console.error('VPS job submission error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      if (error.message.includes('400')) {
        return NextResponse.json(
          { error: 'Invalid job data' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Job submission failed' },
      { status: 503 }
    );
  }
}