export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white px-4">
      {/* Hero Section */}
      <h1 className="text-5xl md:text-6xl font-bold tracking-wide mb-4">
        Plooma
      </h1>
      <p className="text-lg md:text-xl text-gray-300 max-w-lg text-center leading-relaxed mb-8">
        Organize, track, and manage your projects efficiently with this powerful tool.
      </p>
      <div className="flex space-x-4">
        <a
          href="/signup"
          className="bg-blue-500 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-105 transition-transform"
        >
          Sign Up
        </a>
        <a
          href="/signin"
          className="bg-green-500 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:bg-green-600 hover:shadow-xl hover:scale-105 transition-transform"
        >
          Sign In
        </a>
      </div>

      {/* Features Section */}
      <div className="mt-16 max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Plooma?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Task Management', description: 'Organize and track tasks effortlessly.' },
            { title: 'Team Collaboration', description: 'Assign tasks and work together.' },
            { title: 'Real-time Updates', description: 'Stay updated with instant notifications.' },
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-300 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-700 text-gray-400 w-full text-center">
        <p>© {new Date().getFullYear()} Plooma. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
}
