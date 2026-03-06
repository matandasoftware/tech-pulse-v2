import { useAuth } from '../context/AuthContext';
import ArticlesFeed from '../components/ArticlesFeed';

function HomePage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="text-primary-100 text-lg">
                        Discover the latest technology news and insights
                    </p>
                </div>
            </div>

            {/* Articles Feed */}
            <ArticlesFeed />
        </div>
    );
}

export default HomePage;