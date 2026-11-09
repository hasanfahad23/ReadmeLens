import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ReadmeLens Pro — Documentation Platform';
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
          background: '#090d16',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '24px',
            background: '#4f46e5',
            fontSize: '56px',
            fontWeight: 800,
            marginBottom: '32px',
          }}
        >
          R
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}
        >
          ReadmeLens Pro
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            maxWidth: '850px',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Documentation Platform: AST Parser, 0-100 Health Scoring, Security Auditing, and Accessible Reading.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
