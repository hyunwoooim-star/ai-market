import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: site } = await supabase
    .from('sites')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!site) return { title: 'Site Not Found' };

  return {
    title: site.title || slug,
    description: site.description || `${slug} — Made with AgentMarket`,
    openGraph: {
      title: site.title || slug,
      description: site.description || `${slug} — Made with AgentMarket`,
    },
  };
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params;

  const { data: site, error } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !site) {
    notFound();
  }

  // Increment views (fire and forget)
  supabase.rpc('increment_site_views', { site_slug: slug }).then(() => {});

  // Inject AgentMarket badge into the HTML
  const badge = `
    <div style="position:fixed;bottom:16px;right:16px;z-index:9999;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
      <a href="https://agentmarket.kr/ko/create" target="_blank" rel="noopener"
         style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,0.95);border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.12);text-decoration:none;color:#4f46e5;font-size:12px;font-weight:600;backdrop-filter:blur(8px);border:1px solid rgba(79,70,229,0.2);transition:all 0.2s;">
        <span style="font-size:14px;">🚀</span>
        <span>Made with AgentMarket</span>
      </a>
    </div>
  `;

  // Insert badge before </body>
  const htmlWithBadge = site.html_content.replace(
    '</body>',
    `${badge}</body>`
  );

  return (
    <iframe
      srcDoc={htmlWithBadge}
      className="w-full h-screen border-0"
      title={site.title || slug}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
