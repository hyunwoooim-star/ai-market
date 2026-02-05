import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/sites — Save a generated site
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, description, html_content, business_type, style } = body;

    if (!slug || !html_content) {
      return NextResponse.json(
        { error: 'slug and html_content are required' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric + hyphens, 2-50 chars)
    const slugRegex = /^[a-z0-9가-힣][a-z0-9가-힣\-]{1,49}$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'slug must be 2-50 characters, alphanumeric/Korean + hyphens only' },
        { status: 400 }
      );
    }

    // Check if slug is taken
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This URL is already taken', suggestion: `${slug}-${Date.now().toString(36).slice(-4)}` },
        { status: 409 }
      );
    }

    // Insert site
    const { data, error } = await supabase
      .from('sites')
      .insert({
        slug,
        title: title || slug,
        description: description || '',
        html_content,
        business_type: business_type || 'general',
        style: style || 'modern',
        owner_id: null, // Anonymous for MVP
      })
      .select('id, slug, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save site' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      site: data,
      url: `/s/${slug}`,
      fullUrl: `https://agentmarket.kr/s/${slug}`,
    });
  } catch (err) {
    console.error('Sites API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/sites?slug=xxx — Check slug availability
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!slug) {
    // Return recent public sites for gallery
    const { data, error } = await supabase
      .from('sites')
      .select('slug, title, business_type, views, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
    }

    return NextResponse.json({ sites: data, count: data?.length || 0 });
  }

  // Check if slug is available
  const { data: existing } = await supabase
    .from('sites')
    .select('id')
    .eq('slug', slug)
    .single();

  return NextResponse.json({
    slug,
    available: !existing,
  });
}
