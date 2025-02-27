import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マインスイーパー',
  description: 'Tailwind CSSで作成したマインスイーパーゲーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100">
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
