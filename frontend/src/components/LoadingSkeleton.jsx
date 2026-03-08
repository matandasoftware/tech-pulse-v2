/**
 * Loading Skeleton Components
 * 
 * Reusable skeleton loaders for different content types
 */

export function ArticleCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
            
            {/* Content skeleton */}
            <div className="p-6 space-y-4">
                {/* Category badge */}
                <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                
                {/* Title */}
                <div className="space-y-2">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                
                {/* Summary */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
                
                {/* Meta info */}
                <div className="flex items-center justify-between pt-4">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="flex space-x-4">
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ArticleListSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            
            {/* Follow-ups skeleton */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function NoteSkeleton() {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg animate-pulse space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
        </div>
    );
}

export function NoteListSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <NoteSkeleton key={i} />
            ))}
        </div>
    );
}
