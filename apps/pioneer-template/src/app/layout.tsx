'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import { PioneerProvider } from "@coinmasters/pioneer-react";
const inter = Inter({ subsets: ["latin"] });

type RootLayoutProps = {
  children: any; // Use React.ReactNode directly without generics
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <PioneerProvider>
      {children}
    </PioneerProvider>
    </body>
    </html>
  );
}
