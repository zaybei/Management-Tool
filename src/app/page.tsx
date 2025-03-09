export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">
        Plooma
      </h1>
      <p className="text-lg mb-8">
        Organize, track, and manage your projects efficiently with our powerful tool.
      </p>
      <div className="flex space-x-4">
        <a
          href="/signup"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Sign Up
        </a>
        <a
          href="/signin"
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
