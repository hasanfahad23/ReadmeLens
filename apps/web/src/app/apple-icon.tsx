import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4f46e5',
          borderRadius: '36px',
          color: '#ffffff',
          fontSize: '110px',
          fontWeight: 900,
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
