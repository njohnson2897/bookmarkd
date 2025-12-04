import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_ACTIVITY_FEED } from "../utils/queries.js";
import Auth from "../utils/auth.js";

const ActivityFeed = () => {
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;
  const [bookDetails, setBookDetails] = useState({});

  const { loading, data, error } = useQuery(QUERY_ACTIVITY_FEED, {
    variables: { userId },
    skip: !userId,
  });

  const activities = data?.activityFeed || [];

  // Fetch book details from Google Books API
  useEffect(() => {
    const fetchBookDetails = async () => {
      const details = {};
      for (const activity of activities) {
        if (activity.review?.book?.google_id) {
          const googleId = activity.review.book.google_id;
          if (!details[googleId]) {
            try {
              const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes/${googleId}`
              );
              if (response.ok) {
                const bookData = await response.json();
                details[googleId] = {
                  title: bookData.volumeInfo?.title || "Unknown Book",
                  author: bookData.volumeInfo?.authors?.[0] || "Unknown Author",
                  coverImage:
                    bookData.volumeInfo?.imageLinks?.thumbnail ||
                    bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                    "",
                };
              }
            } catch (err) {
              console.error("Error fetching book details:", err);
            }
          }
        }
      }
      setBookDetails(details);
    };

    if (activities.length > 0) {
      fetchBookDetails();
    }
  }, [activities]);

  if (!Auth.loggedIn()) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">
          Please sign in to view your activity feed.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-primary2">Loading activity feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-red-500">
          Error loading activity feed: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
        Activity Feed
      </h1>

      {activities.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">
            No activity yet. Start following users to see their reviews and activity!
          </p>
          <button
            onClick={() => navigate("/users")}
            className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
          >
            Browse Users
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            if (activity.type !== "review" || !activity.review) return null;

            const bookId = activity.review.book?.google_id;
            const bookInfo = bookDetails[bookId] || {};

            return (
              <div
                key={activity._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
                  {bookInfo.coverImage && (
                    <img
                      src={bookInfo.coverImage}
                      alt={bookInfo.title}
                      className="w-20 h-32 object-cover rounded cursor-pointer"
                      onClick={() => navigate(`/books/${bookId}`)}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-primary2">
                        {activity.user?.username || "Anonymous"}
                      </span>
                      <span className="text-gray-500 text-sm">reviewed</span>
                      <button
                        onClick={() => navigate(`/books/${bookId}`)}
                        className="font-semibold text-primary1 hover:text-primary2 transition"
                      >
                        {bookInfo.title || "Loading..."}
                      </button>
                    </div>
                    {activity.review.title && (
                      <h3 className="font-semibold text-primary2 mb-1">
                        {activity.review.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">
                        {"★".repeat(Math.round(activity.review.stars))}
                        {"☆".repeat(5 - Math.round(activity.review.stars))}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      {activity.review.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <button
                        onClick={() =>
                          navigate(`/profile/${activity.user?._id}`)
                        }
                        className="hover:text-primary1 transition"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => navigate(`/books/${bookId}`)}
                        className="hover:text-primary1 transition"
                      >
                        View Book
                      </button>
                      <span>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

