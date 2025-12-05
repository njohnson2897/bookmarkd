import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_BOOKGOOGLE, QUERY_USER } from "../utils/queries.js";
import {
  ADD_BOOK_STATUS,
  ADD_BOOK,
  ADD_REVIEW,
  UPDATE_REVIEW,
  DELETE_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  ADD_COMMENT,
  DELETE_COMMENT,
  EDIT_USER_BOOK_STATUS,
  EDIT_USER_BOOK_FAVORITE,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const Book = () => {
  const [book, setBook] = useState({
    coverImage: "",
    title: "Loading...",
    author: "",
    description: "",
  });
  const [bookSaved, setBookSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    stars: 5,
    title: "",
    description: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const { bookId } = useParams();
  const navigate = useNavigate();

  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;

  const { loading, data, refetch } = useQuery(QUERY_BOOKGOOGLE, {
    variables: { googleId: bookId },
    skip: !bookId,
  });

  const { data: userData, refetch: refetchUser } = useQuery(QUERY_USER, {
    variables: { userId },
    skip: !userId || !data?.bookGoogle?._id,
  });

  const [addBook] = useMutation(ADD_BOOK);
  const [addBookStatusMutation] = useMutation(ADD_BOOK_STATUS);
  const [addReview, { error: reviewError }] = useMutation(ADD_REVIEW);
  const [updateReview] = useMutation(UPDATE_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);
  const [likeReview] = useMutation(LIKE_REVIEW);
  const [unlikeReview] = useMutation(UNLIKE_REVIEW);
  const [addComment] = useMutation(ADD_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [editBookStatus] = useMutation(EDIT_USER_BOOK_STATUS);
  const [editBookFavorite] = useMutation(EDIT_USER_BOOK_FAVORITE);

  // Get current book status from user's collection
  const currentBookStatus = userData?.user?.books?.find(
    (bookStatus) => bookStatus.book?._id === data?.bookGoogle?._id
  );

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const bookResponse = await response.json();
        const newBook = {
          coverImage:
            bookResponse.volumeInfo?.imageLinks?.thumbnail ||
            bookResponse.volumeInfo?.imageLinks?.smallThumbnail ||
            "",
          title: bookResponse.volumeInfo?.title || "No title available",
          author: bookResponse.volumeInfo?.authors?.[0] || "Unknown author",
          description: stripHtmlTags(
            bookResponse.volumeInfo?.description || "No description available"
          ),
        };

        setBook(newBook);
      } catch (error) {
        console.error(error);
        setBook({
          coverImage: "",
          title: "Error loading book",
          author: "",
          description:
            "Unable to load book information. Please try again later.",
        });
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  useEffect(() => {
    const checkForBook = async () => {
      if (!data || loading) return;

      try {
        if (!data.bookGoogle) {
          await addBook({ variables: { googleId: bookId } });
          await refetch();
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkForBook();
  }, [data, loading, bookId, addBook, refetch]);

  const getUserId = () => {
    if (!Auth.loggedIn()) return null;
    const decoded = Auth.getProfile();
    return decoded?.data?._id || null;
  };

  const handleSaveBook = async () => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    try {
      const bookData = data?.bookGoogle;
      if (!bookData) {
        // Book doesn't exist in DB yet, create it first
        const { data: newBookData } = await addBook({
          variables: { googleId: bookId },
        });
        if (newBookData?.addBook?._id) {
          await addBookStatusMutation({
            variables: {
              book: newBookData.addBook._id,
              user: userId,
              status: "To-Read",
              favorite: false,
            },
          });
          setBookSaved(true);
          await refetchUser();
        }
      } else {
        await addBookStatusMutation({
          variables: {
            book: bookData._id,
            user: userId,
            status: "To-Read",
            favorite: false,
          },
        });
        setBookSaved(true);
        await refetchUser();
      }
    } catch (error) {
      console.error(error);
      alert("Error saving book. Please try again.");
    }
  };

  const hasUserReviewed = () => {
    if (!Auth.loggedIn() || !data?.bookGoogle?.reviews) return false;
    const userId = getUserId();
    return data.bookGoogle.reviews.some(
      (review) => review.user?._id === userId
    );
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: value,
    });
  };

  const handleStarClick = (rating) => {
    setReviewForm({
      ...reviewForm,
      stars: rating,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const bookData = data?.bookGoogle;
    if (!bookData) {
      alert("Please wait for the book to load, then try again.");
      return;
    }

    // Check if user already reviewed
    if (hasUserReviewed()) {
      alert("You have already reviewed this book.");
      return;
    }

    try {
      await addReview({
        variables: {
          book: bookData._id,
          user: userId,
          stars: parseFloat(reviewForm.stars),
          title: reviewForm.title || null,
          description: reviewForm.description || null,
        },
      });

      // Reset form and hide it
      setReviewForm({ stars: 5, title: "", description: "" });
      setHoveredStar(0);
      setShowReviewForm(false);

      // Refetch book data to show the new review
      await refetch();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      stars: review.stars,
      title: review.title || "",
      description: review.description || "",
    });
    setShowReviewForm(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    try {
      await updateReview({
        variables: {
          reviewId: editingReviewId,
          stars: reviewForm.stars,
          title: reviewForm.title || null,
          description: reviewForm.description || null,
        },
      });

      // Reset form and hide it
      setReviewForm({ stars: 5, title: "", description: "" });
      setHoveredStar(0);
      setEditingReviewId(null);
      setShowReviewForm(false);

      // Refetch book data to show the updated review
      await refetch();
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error updating review. Please try again.");
    }
  };

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

    const currentUserId = getUserId();
    if (!currentUserId) return;

    try {
      const review = data?.bookGoogle?.reviews?.find(r => r._id === reviewId);
      if (review?.isLiked) {
        await unlikeReview({
          variables: { reviewId, userId: currentUserId },
        });
      } else {
        await likeReview({
          variables: { reviewId, userId: currentUserId },
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

    const currentUserId = getUserId();
    if (!currentUserId) return;

    const commentText = commentTexts[reviewId]?.trim();
    if (!commentText) {
      alert("Please enter a comment.");
      return;
    }

    try {
      await addComment({
        variables: {
          reviewId,
          userId: currentUserId,
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
              Loading book details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
      {/* Book Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {book.coverImage && (
          <img
            src={book.coverImage}
              className="w-32 h-48 md:w-40 md:h-60 object-cover rounded-lg shadow-2xl"
            alt={`${book.title} Cover`}
          />
        )}
        <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {book.title}
            </h1>
            <p className="text-xl text-white/90 mb-4">By {book.author}</p>
            {data?.bookGoogle?.reviews && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => {
                    const avgRating =
                      data.bookGoogle.reviews.reduce(
                        (sum, r) => sum + (r.stars || 0),
                        0
                      ) / data.bookGoogle.reviews.length;
                    return (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(avgRating)
                            ? "text-yellow-400 fill-current"
                            : "text-white/30"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-white/90">
                  {data.bookGoogle.reviews.length} review
                  {data.bookGoogle.reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-primary2 mb-4">
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {book.description}
          </p>
          </div>

          {/* Existing Reviews Section */}
          {data?.bookGoogle?.reviews && data.bookGoogle.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-primary2 mb-4">
                Reviews ({data.bookGoogle.reviews.length})
              </h2>
              <div className="space-y-4">
                {data.bookGoogle.reviews.map((review) => {
                  const isOwnReview = review.user?._id === userId;
                  const showComments = expandedComments[review._id];
                  const commentText = commentTexts[review._id] || "";

                  return (
                    <div
                      key={review._id}
                      className="border-l-4 border-primary1 pl-4 py-4 bg-gray-50 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-primary2">
                              {review.user?.username || "Anonymous"}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.round(review.stars)
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
                            {review.createdAt && (
                              <span className="text-gray-500 text-sm">
                                {formatDate(review.createdAt)}
                              </span>
                            )}
                          </div>
                          {review.title && (
                            <h4 className="font-bold text-lg text-primary2 mb-2">
                              {review.title}
                            </h4>
                          )}
                          {review.description && (
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {review.description}
                            </p>
                          )}
                        </div>
                        {isOwnReview && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-primary1 hover:text-primary2 text-sm font-semibold transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Like and Comment Actions */}
                      <div className="flex items-center gap-4 mb-3">
                        {Auth.loggedIn() ? (
                          <button
                            onClick={() => handleLikeReview(review._id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                              review.isLiked
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <svg
                              className={`w-4 h-4 ${
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
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600">
                            <svg
                              className="w-4 h-4 stroke-current"
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
                              [review._id]: !showComments,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                          <svg
                            className="w-4 h-4"
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
                      </div>

                      {/* Comments Section */}
                      {showComments && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {/* Existing Comments */}
                          {review.comments && review.comments.length > 0 && (
                            <div className="space-y-3 mb-4">
                              {review.comments.map((comment) => {
                                const isOwnComment =
                                  comment.user?._id === userId;
                                return (
                                  <div
                                    key={comment._id}
                                    className="bg-white rounded-lg p-3"
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
                                            handleDeleteComment(
                                              comment._id,
                                              review._id
                                            )
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
                                value={commentText}
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
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary2 mb-4">
              Book Actions
            </h3>
            {Auth.loggedIn() ? (
              currentBookStatus ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      In your collection
                    </p>

                    {/* Status Dropdown */}
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-primary2 mb-2">
                        Reading Status:
                      </label>
                      <select
                        value={currentBookStatus.status}
                        onChange={async (e) => {
                          try {
                            await editBookStatus({
                              variables: {
                                bookId: data?.bookGoogle?._id,
                                userId,
                                status: e.target.value,
                              },
                            });
                            await refetchUser();
                          } catch (error) {
                            console.error("Error updating status:", error);
                            alert("Error updating status. Please try again.");
                          }
                        }}
                        className="w-full border-2 border-primary1 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                      >
                        <option value="To-Read">To-Read</option>
                        <option value="Currently Reading">
                          Currently Reading
                        </option>
                        <option value="Finished">Finished</option>
                      </select>
                    </div>

                    {/* Favorite Toggle */}
                    <button
                      onClick={async () => {
                        try {
                          await editBookFavorite({
                            variables: {
                              bookId: data?.bookGoogle?._id,
                              userId,
                              favorite: !currentBookStatus.favorite,
                            },
                          });
                          await refetchUser();
                        } catch (error) {
                          console.error("Error toggling favorite:", error);
                          alert("Error updating favorite. Please try again.");
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition font-semibold ${
                        currentBookStatus.favorite
                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          currentBookStatus.favorite
                            ? "fill-current"
                            : "stroke-current"
                        }`}
                        fill={currentBookStatus.favorite ? "currentColor" : "none"}
                        strokeWidth={currentBookStatus.favorite ? 0 : 2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <span>
                        {currentBookStatus.favorite
                          ? "Favorited"
                          : "Mark as Favorite"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
            <button
                  className="w-full bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg disabled:opacity-50"
              onClick={handleSaveBook}
              disabled={bookSaved}
            >
              {bookSaved ? "Book Saved!" : "Save to My Books"}
            </button>
              )
          ) : (
              <p className="text-gray-600 text-center py-4">
              Please sign in to save this book to your collection.
            </p>
          )}
          </div>

          {/* Review Form Section */}
          {Auth.loggedIn() && !loading && data?.bookGoogle && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-primary2 mb-4">
                Write a Review
              </h3>
              {hasUserReviewed() && !editingReviewId ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-semibold">
                    ✓ You have already reviewed this book.
                  </p>
                </div>
              ) : (
                <>
                  {!showReviewForm ? (
                    <button
                      onClick={() => {
                        setShowReviewForm(true);
                        setEditingReviewId(null);
                        setReviewForm({ stars: 5, title: "", description: "" });
                      }}
                      className="w-full bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                      {editingReviewId ? "Edit Review" : "Write a Review"}
                    </button>
                  ) : (
              <div className="space-y-4">
                      <h4 className="text-lg font-bold text-primary2">
                        {editingReviewId ? "Edit Your Review" : "Write a Review"}
                      </h4>
                      {reviewError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {reviewError.message || "Error submitting review"}
                        </div>
                      )}
                      <form
                        onSubmit={
                          editingReviewId
                            ? handleUpdateReview
                            : handleReviewSubmit
                        }
                        className="space-y-4"
                      >
                        <div>
                          <label className="block font-semibold text-primary2 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled =
                                star <= (hoveredStar || reviewForm.stars);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleStarClick(star)}
                                  onMouseEnter={() => setHoveredStar(star)}
                                  onMouseLeave={() => setHoveredStar(0)}
                                  className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                                  aria-label={`Rate ${star} out of 5 stars`}
                                >
                                  <span
                                    className={
                                      isFilled
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                      </span>
                                </button>
                              );
                            })}
                            <span className="ml-2 text-gray-600 font-semibold">
                              {reviewForm.stars} / 5
                      </span>
                    </div>
                        </div>
                        <div>
                          <label
                            htmlFor="review-title"
                            className="block font-semibold text-primary2 mb-2"
                          >
                            Review Title (optional)
                          </label>
                          <input
                            type="text"
                            id="review-title"
                            name="title"
                            value={reviewForm.title}
                            onChange={handleReviewChange}
                            placeholder="Give your review a title..."
                            className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="review-description"
                            className="block font-semibold text-primary2 mb-2"
                          >
                            Your Review
                          </label>
                          <textarea
                            id="review-description"
                            name="description"
                            value={reviewForm.description}
                            onChange={handleReviewChange}
                            placeholder="Share your thoughts about this book..."
                            rows="6"
                            className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-primary1 text-white px-6 py-2 rounded-lg hover:bg-accent transition font-semibold"
                          >
                            {editingReviewId
                              ? "Update Review"
                              : "Submit Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReviewForm(false);
                              setEditingReviewId(null);
                              setReviewForm({
                                stars: 5,
                                title: "",
                                description: "",
                              });
                              setHoveredStar(0);
                            }}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;


