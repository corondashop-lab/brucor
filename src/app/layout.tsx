
"use client"

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';

// Metadata can't be exported from a client component.
// If you need dynamic metadata, you'll need to move this to a server component
// or handle it in a different way. For now, we comment it out.
// export const metadata: Metadata = {
//   title: 'Minimalist Product Store',
//   description: 'A modern and minimalist store for high-quality products.',
// };

function RootLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const headerFallback = (
    <div className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16" />
        </div>
    </div>
  )

  return (
    <>
      {!isAdminPage && (
        <Suspense fallback={headerFallback}>
            <Header />
        </Suspense>
      )}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <title>Minimalist Product Store</title>
        <meta name="description" content="A modern and minimalist store for high-quality products." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
          <AuthProvider>
            <CartProvider>
                <RootLayoutContent>
                  {children}
                </RootLayoutContent>
            </CartProvider>
          </AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
