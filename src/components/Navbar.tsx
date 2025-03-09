import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Plooma
        </Link>
        <div className="flex space-x-4">
          <Link href="/signin" className="text-white hover:text-gray-300">
            Sign In
          </Link>
          <Link href="/signup" className="text-white hover:text-gray-300">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
