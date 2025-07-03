/**
 * Health Check API - Simple endpoint to test deployment
 * GET /api/health - Returns deployment status and environment info
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envStatus = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set',
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
      deployment: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown'
      }
    };

    // Test basic functionality
    const testData = {
      message: 'AVA Dashboard API is running',
      status: 'healthy',
      environment: envStatus,
      availableEndpoints: [
        '/api/health',
        '/api/database/setup',
        '/api/themes',
        '/api/themes/[themeId]',
        '/api/themes/pages/[pageId]'
      ]
    };

    return NextResponse.json(testData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      message: 'Health check failed',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}