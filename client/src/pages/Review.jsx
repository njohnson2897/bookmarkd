import { useQuery, useMutation } from "@apollo/client";
import { QUERY_REVIEWS } from "../utils/queries.js";
import {
  UPDATE_REVIEW,
  DELETE_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  ADD_COMMENT,
  DELETE_COMMENT,
} from "../utils/mutations.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Auth from "../utils/auth.js";

const ReviewsPage = () => {
  const { loading, data, error, refetch } = useQuery(QUERY_REVIEWS);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);
  const [likeReview] = useMutation(LIKE_REVIEW);
  const [unlikeReview] = useMutation(UNLIKE_REVIEW);
  const [addComment] = useMutation(ADD_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!data?.reviews || data.reviews.length === 0) return;

      const reviewsWithBookDetails = await Promise.all(
        data.reviews.map(async (review) => {
          if (!review.book?.google_id) return null;

          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${review.book.google_id}`
            );
            if (!response.ok) return null;

            const bookData = await response.json();
            return {
              ...review,
              bookTitle: bookData.volumeInfo?.title || "Unknown Book",
              author: bookData.volumeInfo?.authors?.[0] || "Unknown Author",
              bookCover:
                bookData.volumeInfo?.imageLinks?.thumbnail ||
                bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                "",
            };
          } catch (err) {
            console.error("Error fetching book details:", err);
            return {
              ...review,
              bookTitle: "Unknown Book",
              author: "Unknown Author",
              bookCover: "",
            };
          }
        })
      );

      setReviews(reviewsWithBookDetails.filter(Boolean));
    };

    if (data?.reviews) {
      fetchBookDetails();
    }
  }, [data]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview({
        variables: { reviewId },
      });
      await refetch();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review. Please try again.");
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    if (!userId) return;

    try {
      const review = reviews.find((r) => r._id === reviewId);
      if (review?.isLiked) {
        await unlikeReview({
          variables: { reviewId, userId },
        });
      } else {
        await likeReview({
          variables: { reviewId, userId },
        });
      }
      await refetch();
    } catch (error) {
      console.error("Error liking review:", error);
      alert("Error liking review. Please try again.");
    }
  };

  const handleAddComment = async (reviewId) => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    if (!userId) return;

    const commentText = commentTexts[reviewId]?.trim();
    if (!commentText) {
      alert("Please enter a comment.");
      return;
    }

    try {
      await addComment({
        variables: {
          reviewId,
          userId,
          text: commentText,
        },
      });
      setCommentTexts({ ...commentTexts, [reviewId]: "" });
      setExpandedComments({ ...expandedComments, [reviewId]: true });
      await refetch();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId, reviewId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment({
        variables: { commentId },
      });
      await refetch();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting comment. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-primary1 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg text-primary2 font-semibold">
              Loading reviews...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg text-red-700 font-semibold mb-2">
            Error loading reviews
          </p>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">Book Reviews</h1>
          <p className="text-white/90">
            Discover what the community thinks about their favorite books
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <p className="text-xl text-gray-700 font-semibold mb-2">
            No reviews yet
          </p>
          <p className="text-gray-500 mb-6">
            Be the first to share your thoughts on a book!
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-primary1 text-white px-8 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2">Book Reviews</h1>
        <p className="text-white/90">
          Discover what the community thinks about their favorite books
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Book Cover and Header */}
            <div className="flex gap-4 p-6 border-b border-gray-100">
              {review.bookCover ? (
                <img
                  src={review.bookCover}
                  alt={review.bookTitle}
                  className="w-24 h-36 object-cover rounded-lg cursor-pointer shadow-md hover:shadow-lg transition transform hover:scale-105"
                  onClick={() => navigate(`/books/${review.book?.google_id}`)}
                />
              ) : (
                <div className="w-24 h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center cursor-pointer shadow-md">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold text-primary2 mb-1 cursor-pointer hover:text-primary1 transition line-clamp-2"
                  onClick={() => navigate(`/books/${review.book?.google_id}`)}
                >
                  {review.bookTitle}
                </h2>
                <p className="text-primary1 font-semibold text-sm mb-2">
                  {review.author}
                </p>

                {/* Stars Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-5 h-5 ${
                          index < Math.round(review.stars)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {review.stars}/5
                  </span>
                </div>

                {/* Reviewer Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold text-primary2">
                    {review.user?.username || "Anonymous"}
                  </span>
                  {review.createdAt && (
                    <>
                      <span>•</span>
                      <span>{formatDate(review.createdAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="p-6">
              {review.title && (
                <h3 className="font-bold text-lg text-primary2 mb-3">
                  {review.title}
                </h3>
              )}
              {review.description && (
                <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4">
                  {review.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mb-4">
                {Auth.loggedIn() ? (
                  <button
                    onClick={() => handleLikeReview(review._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      review.isLiked
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        review.isLiked ? "fill-current" : "stroke-current"
                      }`}
                      fill={review.isLiked ? "currentColor" : "none"}
                      strokeWidth={review.isLiked ? 0 : 2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{review.likeCount || 0}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600">
                    <svg
                      className="w-5 h-5 stroke-current"
                      fill="none"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{review.likeCount || 0}</span>
                  </div>
                )}
                <button
                  onClick={() =>
                    setExpandedComments({
                      ...expandedComments,
                      [review._id]: !expandedComments[review._id],
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{review.commentCount || 0}</span>
                </button>
                <button
                  className="ml-auto bg-primary1 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent transition"
                  onClick={() => navigate(`/books/${review.book?.google_id}`)}
                >
                  View Book
                </button>
                {review.user?._id === userId && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition border border-red-200"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Comments Section */}
              {expandedComments[review._id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Existing Comments */}
                  {review.comments && review.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {review.comments.map((comment) => {
                        const isOwnComment = comment.user?._id === userId;
                        return (
                          <div
                            key={comment._id}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary2 text-sm">
                                  {comment.user?.username || "Anonymous"}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              {isOwnComment && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id, review._id)
                                  }
                                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">
                              {comment.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  {Auth.loggedIn() && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentTexts[review._id] || ""}
                        onChange={(e) =>
                          setCommentTexts({
                            ...commentTexts,
                            [review._id]: e.target.value,
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(review._id);
                          }
                        }}
                        className="flex-1 border-2 border-primary1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary1"
                      />
                      <button
                        onClick={() => handleAddComment(review._id)}
                        className="bg-primary1 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-accent transition"
                      >
                        Post
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;


