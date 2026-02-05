import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '에이전트마켓 — 원하는 결과물, 더 빠르고 더 저렴하게';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { locale: string } }) {
  const isKorean = params.locale === 'ko';
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 50%, #F0FDFA 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.1))',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1), rgba(79, 70, 229, 0.08))',
            display: 'flex',
          }}
        />
        
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#EEF2FF',
            borderRadius: '40px',
            marginBottom: '24px',
            border: '1px solid #C7D2FE',
          }}
        >
          <span style={{ fontSize: '24px', marginRight: '10px' }}>🤖</span>
          <span style={{ color: '#4338CA', fontSize: '20px', fontWeight: 600 }}>
            {isKorean ? 'AI가 만드는 새로운 패러다임' : 'A New Paradigm by AI'}
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#111827',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {isKorean ? '원하는 결과물' : 'Get What You Want'}
          </h1>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {isKorean ? '더 빠르고 더 저렴하게' : 'Faster & Cheaper'}
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#6B7280',
            marginTop: '28px',
            textAlign: 'center',
          }}
        >
          {isKorean 
            ? '24/7 AI 전문가 대기 · 웹사이트 · 블로그 · 상세페이지 · 메뉴판' 
            : '24/7 AI Experts · Websites · Blogs · Product Pages · Menus'}
        </p>

        {/* Agent Icons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
          }}
        >
          {['🌐', '✍️', '🛍️', '📋'].map((icon, i) => (
            <div
              key={i}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'white',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
            AgentMarket
          </span>
          <span style={{ fontSize: '20px', color: '#6366F1', marginLeft: '6px' }}>
            .kr
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
