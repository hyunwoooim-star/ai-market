import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Same setup as /s/[slug]/page.tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || 'test1';

  try {
    // Exact same query as page.tsx
    const { data: hostedPage, error: hostedError } = await supabase
      .from('hosted_pages')
      .select('slug, title, description, html_content')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (hostedPage) {
      return NextResponse.json({
        success: true,
        source: 'hosted_pages',
        slug: hostedPage.slug,
        title: hostedPage.title,
        htmlLength: hostedPage.html_content?.length || 0,
        hasHtml: !!hostedPage.html_content,
      });
    }

    // Fallback to sites
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('slug, title, description, html_content')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (site) {
      return NextResponse.json({
        success: true,
        source: 'sites',
        slug: site.slug,
        title: site.title,
        htmlLength: site.html_content?.length || 0,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'not found',
      hostedError: hostedError?.message,
      siteError: siteError?.message,
      slug,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}
