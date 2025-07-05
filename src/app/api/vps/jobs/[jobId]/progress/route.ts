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
  const { jobId } = params;
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  try {
    const client = new VpsClient();
    
    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Track progress using the VPS client
        const stopTracking = client.trackProgress(jobId, (progress) => {
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          
          // Close stream when job is complete
          if (progress.status === 'COMPLETED' || progress.status === 'FAILED') {
            controller.close();
            stopTracking();
          }
        });
        
        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          stopTracking();
          controller.close();
        });
      },
      cancel() {
        // Clean up when stream is cancelled
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  } catch (error) {
    console.error('VPS SSE error:', error);
    
    return NextResponse.json(
      { error: 'Unable to establish progress stream' },
      { status: 503 }
    );
  }
}