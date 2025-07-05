import { NextRequest, NextResponse } from 'next/server';
import { VpsClient } from '@/lib/vps';

export async function POST(request: NextRequest) {
  try {
    const client = new VpsClient();
    
    // Get auth token from VPS
    const token = await client.getAuthToken();
    
    return NextResponse.json({ 
      token,
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('VPS auth error:', error);
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}