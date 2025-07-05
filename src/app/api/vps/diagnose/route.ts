import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const vpsUrl = process.env.VPS_API_URL;
  const vpsKey = process.env.VPS_API_KEY;
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      VPS_API_URL: vpsUrl || 'NOT_SET',
      VPS_API_KEY: vpsKey ? 'SET' : 'NOT_SET',
      VPS_API_SECRET: process.env.VPS_API_SECRET ? 'SET' : 'NOT_SET',
    },
    issues: [] as string[]
  };

  // Check if VPS URL is HTTP while we're on HTTPS
  if (vpsUrl && vpsUrl.startsWith('http://') && request.url.startsWith('https://')) {
    diagnostics.issues.push('Mixed Content: HTTPS site trying to connect to HTTP VPS server');
  }

  // Check if credentials are missing
  if (!vpsKey) {
    diagnostics.issues.push('VPS_API_KEY environment variable not set');
  }
  
  if (!process.env.VPS_API_SECRET) {
    diagnostics.issues.push('VPS_API_SECRET environment variable not set');
  }

  // Try to ping the VPS health endpoint
  if (vpsUrl) {
    try {
      const healthUrl = `${vpsUrl}/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(healthUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Vercel-VPS-Diagnostic'
        }
      });
      
      clearTimeout(timeoutId);
      
      diagnostics.vpsHealth = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        text: await healthResponse.text()
      };
    } catch (error) {
      diagnostics.vpsHealth = {
        error: error instanceof Error ? error.message : 'Unknown error',
        note: 'This is expected if VPS is HTTP and Vercel is HTTPS'
      };
    }
  }

  return NextResponse.json(diagnostics, { 
    status: diagnostics.issues.length > 0 ? 400 : 200 
  });
}