"""
Analytics views for user reading statistics and insights.

Provides detailed analytics endpoints for:
- Reading time trends
- Category preferences
- Reading streaks
- Source breakdown
- Activity heatmaps
"""

from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from articles.models import Category, Source
from interactions.models import Note, ReadingHistory, UserArticle


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """
    Get comprehensive analytics overview for the current user.

    Returns:
    - Reading time trends (last 30 days)
    - Category breakdown
    - Source breakdown
    - Reading streak
    - Activity heatmap data
    - Top performing metrics
    """
    user = request.user
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    # 1. Reading Time Trends (last 30 days)
    reading_history = (
        ReadingHistory.objects.filter(user=user, read_at__gte=thirty_days_ago)
        .values("read_at__date")
        .annotate(total_time=Sum("time_spent"), articles_read=Count("id"))
        .order_by("read_at__date")
    )

    # Format for chart
    reading_trends = []
    for entry in reading_history:
        reading_trends.append(
            {
                "date": entry["read_at__date"].isoformat(),
                "time_spent": entry["total_time"],
                "articles_read": entry["articles_read"],
            }
        )

    # 2. Category Breakdown
    category_stats = (
        UserArticle.objects.filter(user=user, is_bookmarked=True)
        .values("article__category__name", "article__category__id")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )

    categories = [
        {
            "name": stat["article__category__name"] or "Uncategorized",
            "count": stat["count"],
            "id": stat["article__category__id"],
        }
        for stat in category_stats
    ]

    # 3. Source Breakdown
    source_stats = (
        UserArticle.objects.filter(user=user, is_bookmarked=True)
        .values("article__source__name", "article__source__id")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
    )

    sources = [
        {
            "name": stat["article__source__name"] or "Unknown",
            "count": stat["count"],
            "id": stat["article__source__id"],
        }
        for stat in source_stats
    ]

    # 4. Reading Streak
    streak_data = calculate_reading_streak(user)

    # 5. Activity Heatmap (last 90 days)
    ninety_days_ago = now - timedelta(days=90)
    activity_data = (
        UserArticle.objects.filter(user=user, created_at__gte=ninety_days_ago)
        .values("created_at__date")
        .annotate(count=Count("id"))
        .order_by("created_at__date")
    )

    heatmap = []
    for entry in activity_data:
        heatmap.append(
            {"date": entry["created_at__date"].isoformat(), "count": entry["count"]}
        )

    # 6. Top Stats
    total_reading_time = (
        ReadingHistory.objects.filter(user=user).aggregate(total=Sum("time_spent"))[
            "total"
        ]
        or 0
    )

    total_bookmarks = UserArticle.objects.filter(user=user, is_bookmarked=True).count()

    total_notes = Note.objects.filter(user=user).count()

    total_articles_read = ReadingHistory.objects.filter(user=user).count()

    # 7. Weekly Summary (last 7 days)
    seven_days_ago = now - timedelta(days=7)
    weekly_reading = ReadingHistory.objects.filter(
        user=user, read_at__gte=seven_days_ago
    ).aggregate(total_time=Sum("time_spent"), articles_count=Count("id"))

    # 8. Most Active Day
    most_active_day = (
        UserArticle.objects.filter(user=user)
        .values("created_at__date")
        .annotate(count=Count("id"))
        .order_by("-count")
        .first()
    )

    # 9. Reading Hours Distribution
    reading_by_hour = (
        ReadingHistory.objects.filter(user=user, read_at__gte=thirty_days_ago)
        .extra(select={"hour": "CAST(strftime('%%H', read_at) AS INTEGER)"})
        .values("hour")
        .annotate(count=Count("id"))
        .order_by("hour")
    )

    hours_distribution = {str(i): 0 for i in range(24)}
    for entry in reading_by_hour:
        hour = str(int(entry["hour"]))
        hours_distribution[hour] = entry["count"]

    return Response(
        {
            "reading_trends": reading_trends,
            "categories": categories,
            "sources": sources,
            "streak": streak_data,
            "heatmap": heatmap,
            "overview": {
                "total_reading_time": total_reading_time,
                "total_bookmarks": total_bookmarks,
                "total_notes": total_notes,
                "total_articles_read": total_articles_read,
                "weekly_reading_time": weekly_reading["total_time"] or 0,
                "weekly_articles": weekly_reading["articles_count"] or 0,
                "most_active_day": (
                    most_active_day["created_at__date"].isoformat()
                    if most_active_day
                    else None
                ),
                "most_active_count": most_active_day["count"] if most_active_day else 0,
            },
            "hours_distribution": hours_distribution,
        }
    )


def calculate_reading_streak(user):
    """
    Calculate the user's reading streak (consecutive days with activity).

    Returns:
    - current_streak: Number of consecutive days (including today)
    - longest_streak: Longest streak ever
    - last_read_date: Last day with activity
    """
    # Get all dates with activity
    activity_dates = (
        UserArticle.objects.filter(user=user)
        .values_list("created_at__date", flat=True)
        .distinct()
        .order_by("-created_at__date")
    )

    if not activity_dates:
        return {"current_streak": 0, "longest_streak": 0, "last_read_date": None}

    activity_dates = list(activity_dates)
    today = timezone.now().date()

    # Calculate current streak
    current_streak = 0
    check_date = today

    for activity_date in activity_dates:
        if activity_date == check_date or activity_date == check_date - timedelta(
            days=1
        ):
            current_streak += 1
            check_date = activity_date - timedelta(days=1)
        else:
            break

    # Calculate longest streak
    longest_streak = 0
    temp_streak = 1
    prev_date = activity_dates[0]

    for i in range(1, len(activity_dates)):
        current_date = activity_dates[i]
        if (prev_date - current_date).days == 1:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1
        prev_date = current_date

    longest_streak = max(longest_streak, temp_streak)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_read_date": activity_dates[0].isoformat() if activity_dates else None,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def category_analytics(request):
    """
    Detailed analytics for reading by category.

    Returns category breakdown with time spent and engagement metrics.
    """
    user = request.user

    categories = (
        Category.objects.annotate(
            bookmark_count=Count(
                "articles__user_interactions",
                filter=Q(
                    articles__user_interactions__user=user,
                    articles__user_interactions__is_bookmarked=True,
                ),
            ),
            note_count=Count("articles__notes", filter=Q(articles__notes__user=user)),
        )
        .filter(bookmark_count__gt=0)
        .order_by("-bookmark_count")
    )

    data = []
    for category in categories:
        data.append(
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "bookmarks": category.bookmark_count,
                "notes": category.note_count,
                "engagement_score": category.bookmark_count + (category.note_count * 2),
            }
        )

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def source_analytics(request):
    """
    Detailed analytics for reading by source.

    Returns source breakdown with articles read and time spent.
    """
    user = request.user

    sources = (
        Source.objects.annotate(
            bookmark_count=Count(
                "articles__user_interactions",
                filter=Q(
                    articles__user_interactions__user=user,
                    articles__user_interactions__is_bookmarked=True,
                ),
            ),
            note_count=Count("articles__notes", filter=Q(articles__notes__user=user)),
        )
        .filter(bookmark_count__gt=0)
        .order_by("-bookmark_count")
    )

    data = []
    for source in sources:
        data.append(
            {
                "id": source.id,
                "name": source.name,
                "website_url": source.website_url,
                "bookmarks": source.bookmark_count,
                "notes": source.note_count,
                "engagement_score": source.bookmark_count + (source.note_count * 2),
            }
        )

    return Response(data)
