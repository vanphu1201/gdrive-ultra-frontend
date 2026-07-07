import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
// import { Toaster } from "@/components/ui/sonner" // Will add later

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'GDrive Ultra - Restricted Downloader',
  description: 'Download locked Google Drive videos and documents securely and fast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        {children}
        {/* <Toaster /> */}
      </body>
    </html>
  );
}
