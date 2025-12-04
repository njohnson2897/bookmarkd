import { useQuery, useMutation } from "@apollo/client";
import { QUERY_REVIEWS } from "../utils/queries.js";
import { UPDATE_REVIEW, DELETE_REVIEW, LIKE_REVIEW, UNLIKE_REVIEW, ADD_COMMENT, DELETE_COMMENT } from "../utils/mutations.js";
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
              bookCover: bookData.volumeInfo?.imageLinks?.thumbnail || 
                        bookData.volumeInfo?.imageLinks?.smallThumbnail || "",
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
      const review = reviews.find(r => r._id === reviewId);
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

  if (loading) {
    return (
      <div className="text-center py-10 text-lg text-primary2">Loading reviews...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-lg text-red-500">
        Error loading reviews: {error.message}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
          Book Reviews
        </h1>
        <div className="text-center py-10 text-lg text-gray-500">
          No reviews yet. Be the first to write one!
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
        Book Reviews
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition"
          >
            {review.bookCover ? (
              <img
                src={review.bookCover}
                alt={review.bookTitle}
                className="w-32 h-48 object-cover rounded mb-4 cursor-pointer"
                onClick={() => navigate(`/books/${review.book?.google_id}`)}
              />
            ) : (
              <div className="w-32 h-48 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <h2 className="text-xl font-bold text-primary2 mb-1 text-center">
              {review.bookTitle}
            </h2>
            <p className="text-primary1 font-semibold mb-1">
              By {review.author}
            </p>
            <p className="text-gray-700 mb-1">
              Reviewed by {review.user?.username || "Anonymous"}
            </p>
            {review.title && (
              <h3 className="font-semibold text-primary2 mb-2">{review.title}</h3>
            )}
            {review.description && (
              <p className="text-gray-700 mb-2 text-center text-sm">
                {review.description}
              </p>
            )}
            <div className="flex mb-3">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  role="img"
                  aria-label="star"
                  className={
                    index < Math.round(review.stars)
                      ? "text-yellow-400 text-xl"
                      : "text-gray-300 text-xl"
                  }
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-gray-600">({review.stars})</span>
            </div>

            {/* Like and Comment Actions */}
            <div className="flex items-center gap-4 mb-2">
              {Auth.loggedIn() ? (
                <button
                  onClick={() => handleLikeReview(review._id)}
                  className={`flex items-center gap-1 text-sm transition ${
                    review.isLiked
                      ? "text-red-500 hover:text-red-700"
                      : "text-gray-600 hover:text-primary1"
                  }`}
                >
                  <span className="text-lg">
                    {review.isLiked ? "❤️" : "🤍"}
                  </span>
                  <span>{review.likeCount || 0}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="text-lg">🤍</span>
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
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary1 transition"
              >
                💬 {review.commentCount || 0} comments
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments[review._id] && (
              <div className="w-full mt-3 pt-3 border-t border-gray-200">
                {/* Existing Comments */}
                {review.comments && review.comments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {review.comments.map((comment) => {
                      const isOwnComment = comment.user?._id === userId;
                      return (
                        <div
                          key={comment._id}
                          className="bg-gray-50 rounded p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary2">
                                {comment.user?.username || "Anonymous"}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {isOwnComment && (
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment._id, review._id)
                                }
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1">{comment.text}</p>
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
                      className="flex-1 border border-primary1 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary1"
                    />
                    <button
                      onClick={() => handleAddComment(review._id)}
                      className="bg-primary1 text-white px-4 py-1 rounded text-sm hover:bg-accent transition"
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button 
                className="bg-primary1 text-white px-4 py-1 rounded hover:bg-accent transition"
                onClick={() => navigate(`/books/${review.book?.google_id}`)}
              >
                View Book
              </button>
              {review.user?._id === userId && (
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="bg-red-100 text-red-700 px-4 py-1 rounded hover:bg-red-200 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;


