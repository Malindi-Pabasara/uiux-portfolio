import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from './providers';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'Malindi Pabasara — Full-Stack Developer',
  description:
    'IT professional and HNDIT candidate specialising in full-stack web and mobile development — Java, JavaScript, PHP and Flutter.',
  keywords: ['Malindi Pabasara', 'Full-Stack Developer', 'Portfolio', 'Java', 'Flutter', 'PHP'],
  openGraph: {
    title: 'Malindi Pabasara — Full-Stack Developer',
    description: 'Building full-stack systems that work.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CustomCursor />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
