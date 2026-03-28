export const metadata = {
  title: 'Next.js App - Mono',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: '#f9fafb', fontFamily: 'sans-serif' }}>{children}</body>
    </html>
  );
}
