/**
 * Supabase Configuration API - Provides client-side config
 * GET /api/config/supabase - Returns Supabase configuration for client-side use
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.AVA_NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.AVA_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        configured: false,
        error: 'Missing Supabase environment variables'
      }, { status: 500 });
    }

    return NextResponse.json({
      configured: true,
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: error.message
    }, { status: 500 });
  }
}