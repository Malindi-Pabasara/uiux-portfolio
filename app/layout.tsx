import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from './providers';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'Malindi Pabasara — UI/UX Designer',
  description:
    'HNDIT candidate specialising in UI/UX design — Figma, wireframing, prototyping, user flows, and visual interface design.',
  keywords: ['Malindi Pabasara', 'UI/UX Designer', 'Portfolio', 'Figma', 'Wireframing', 'Prototyping'],
  openGraph: {
    title: 'Malindi Pabasara — UI/UX Designer',
    description: 'Crafting simple, user-friendly digital experiences.',
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
