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

  // Check if we're on the homepage, signin, or signup page
  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/signin' || pathname === '/signup';
  const shouldShowNavbar = isHomePage || isAuthPage;

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {shouldShowNavbar && <Navbar />}
        <div className="container mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
