import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { ZkRentProvider } from '@/context/ZkRentContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const sansFont = Inter({
  variable: '--font-body-sans',
  subsets: ['latin'],
  display: 'swap',
});

const displayFont = Roboto({
  weight: ['400', '500', '700', '900'],
  variable: '--font-display-serif',
  subsets: ['latin'],
  display: 'swap',
});

const monoFont = Inter({
  variable: '--font-data-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZkRent — Privacy-Preserving Zero-Knowledge Rental Protocol',
  description:
    'Prove tenant qualification without exposing pay stubs, bank statements, or tax returns. Powered by Midnight Network zero-knowledge proofs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#231F20]">
        <ZkRentProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ZkRentProvider>
      </body>
    </html>
  );
}
