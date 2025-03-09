'use client';
import './globals.css';
import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {pathname && pathname.startsWith('/dashboard') ? null : <Navbar />}
        {children}
      </body>
    </html>
  );
}
