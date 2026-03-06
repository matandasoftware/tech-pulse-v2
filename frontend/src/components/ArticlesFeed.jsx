import { useState, useEffect } from 'react';
import ArticleCard from './ArticleCard';
import api from '../services/api';

function ArticlesFeed() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = selectedCategory ? { category: selectedCategory } : {};
            const response = await api.get('/articles/', { params });
            setArticles(response.data.results || response.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    };

    const handleBookmarkChange = (articleId, isBookmarked) => {
        setArticles(prevArticles =>
            prevArticles.map(article =>
                article.id === articleId
                    ? { ...article, is_bookmarked: isBookmarked }
                    : article
            )
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Latest Tech News
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Stay updated with the latest technology trends and news
                </p>
            </div>

            {categories.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategoryFilter(null)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === null
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        All Articles
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryFilter(category.id)}
                            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                            key={n}
                            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 animate-pulse"
                        />
                    ))}
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                        ⚠️ Error loading articles: {error}
                    </p>
                    <button
                        onClick={fetchArticles}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && articles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            onBookmarkChange={handleBookmarkChange}
                        />
                    ))}
                </div>
            )}

            {!loading && !error && articles.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        📰 No articles found
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 mt-2">
                        {selectedCategory
                            ? 'Try selecting a different category'
                            : 'Check back later for new content'}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ArticlesFeed;