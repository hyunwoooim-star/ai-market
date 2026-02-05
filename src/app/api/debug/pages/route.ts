import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Check hosted_pages
    const { data: hostedPages, error: hostedError } = await supabase
      .from('hosted_pages')
      .select('slug, title, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Check sites
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('slug, title, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      hosted_pages: {
        data: hostedPages,
        error: hostedError?.message,
        count: hostedPages?.length || 0,
      },
      sites: {
        data: sites,
        error: sitesError?.message,
        count: sites?.length || 0,
      },
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    });
  } catch (err) {
    console.error('[debug/pages] Error:', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
