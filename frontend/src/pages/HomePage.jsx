import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 transition-colors duration-200">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to Tech Pulse! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Hello, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.username}</span>!
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Your personalized tech news feed is coming soon.
                </p>
            </div>

            {/* Placeholder for articles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Latest Articles
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Articles feed coming soon...
                </p>
            </div>
        </div>
    );
}

export default HomePage;