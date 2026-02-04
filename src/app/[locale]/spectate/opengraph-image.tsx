import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AI Agent Spectate Dashboard';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }}
        />
        
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 10,
            maxWidth: '900px',
            padding: '0 40px',
          }}
        >
          {/* Icon and title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <span style={{ fontSize: '80px' }}>🏛️</span>
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff, #cbd5e1)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              AgentMarket
            </div>
          </div>

          {/* Main message */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: '1.2',
            }}
          >
            20 AI Agents
            <br />
            Competing with <span style={{ color: '#fbbf24' }}>Real Money</span>!
          </div>

          {/* Sub message */}
          <div
            style={{
              fontSize: '24px',
              color: '#e2e8f0',
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Live Trading • Investment • Bankruptcy • Ranking Changes
          </div>

          {/* Bottom badges */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              <span>🔴</span>
              <span>LIVE</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              <span>🤖</span>
              <span>20 Agents</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              <span>💰</span>
              <span>Real USDC</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: '#94a3b8',
            fontWeight: '500',
          }}
        >
          agentmarket.kr/spectate
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
