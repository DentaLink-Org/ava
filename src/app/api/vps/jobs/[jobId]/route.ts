import { NextRequest, NextResponse } from 'next/server';
import { VpsClient } from '@/lib/vps';

// Handle self-signed SSL certificates for VPS server
if (process.env.NODE_ENV === 'production') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const client = new VpsClient();
    
    // Get job status from VPS
    const jobStatus = await client.getJobStatus(jobId);
    
    return NextResponse.json(jobStatus);
  } catch (error) {
    console.error('VPS job status error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Unable to fetch job status' },
      { status: 503 }
    );
  }
}