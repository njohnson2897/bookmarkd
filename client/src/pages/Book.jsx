import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_BOOKGOOGLE, QUERY_USER } from "../utils/queries.js";
import {
  ADD_BOOK_STATUS,
  ADD_BOOK,
  ADD_REVIEW,
  EDIT_USER_BOOK_STATUS,
  EDIT_USER_BOOK_FAVORITE,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const Book = () => {
  const [book, setBook] = useState({
    coverImage: "",
    title: "Loading...",
    author: "",
    description: "",
  });
  const [bookSaved, setBookSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    stars: 5,
    title: "",
    description: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);
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
            bookResponse.volumeInfo?.imageLinks?.smallThumbnail ||
            bookResponse.volumeInfo?.imageLinks?.thumbnail ||
            "",
          title: bookResponse.volumeInfo?.title || "No title available",
          author: bookResponse.volumeInfo?.authors?.[0] || "Unknown author",
          description:
            bookResponse.volumeInfo?.description || "No description available",
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
        {book.coverImage && (
          <img
            src={book.coverImage}
            className="w-40 h-60 object-cover rounded shadow self-start"
            alt={`${book.title} Cover`}
          />
        )}
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-primary2 mt-4 mb-2">
            {book.title}
          </h3>
          <p className="text-primary1 font-semibold mb-4">
            Author: {book.author}
          </p>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">
            {book.description}
          </p>

          {loading ? (
            <div className="text-primary2">Loading...</div>
          ) : Auth.loggedIn() ? (
            currentBookStatus ? (
              <div className="space-y-3 mt-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-3">
                    ✓ This book is in your collection
                  </p>

                  {/* Status Dropdown */}
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-primary2 mb-1">
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
                      className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    >
                      <option value="To-Read">To-Read</option>
                      <option value="Currently Reading">
                        Currently Reading
                      </option>
                      <option value="Finished">Finished</option>
                    </select>
                  </div>

                  {/* Favorite Toggle */}
                  <div className="flex items-center gap-2">
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
                      className={`flex items-center gap-2 px-3 py-2 rounded transition ${
                        currentBookStatus.favorite
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-300"
                          : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-xl">
                        {currentBookStatus.favorite ? "★" : "☆"}
                      </span>
                      <span className="text-sm font-semibold">
                        {currentBookStatus.favorite
                          ? "Favorite"
                          : "Mark as Favorite"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition mt-2 disabled:opacity-50"
                onClick={handleSaveBook}
                disabled={bookSaved}
              >
                {bookSaved ? "Book Saved!" : "Save to My Books"}
              </button>
            )
          ) : (
            <p className="text-gray-600">
              Please sign in to save this book to your collection.
            </p>
          )}

          {/* Review Form Section */}
          {Auth.loggedIn() && !loading && data?.bookGoogle && (
            <div className="mt-8">
              {hasUserReviewed() ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    You have already reviewed this book.
                  </p>
                </div>
              ) : (
                <>
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-primary2 text-white px-6 py-2 rounded hover:bg-primary1 transition"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="text-xl font-bold text-primary2 mb-4">
                        Write a Review
                      </h4>
                      {reviewError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          {reviewError.message || "Error submitting review"}
                        </div>
                      )}
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block font-semibold text-primary2 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center gap-1">
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
                            <span className="ml-2 text-gray-600">
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
                            className="w-full border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
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
                            className="w-full border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
                          >
                            Submit Review
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewForm({
                                stars: 5,
                                title: "",
                                description: "",
                              });
                              setHoveredStar(0);
                            }}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
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

          {/* Existing Reviews Section */}
          {data?.bookGoogle?.reviews && data.bookGoogle.reviews.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xl font-bold text-primary2 mb-4">Reviews</h4>
              <div className="space-y-4">
                {data.bookGoogle.reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-l-4 border-primary1 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {review.user?.username || "Anonymous"}
                      </span>
                      <span className="text-yellow-400">
                        {"★".repeat(Math.round(review.stars))}
                        {"☆".repeat(5 - Math.round(review.stars))}
                      </span>
                    </div>
                    {review.title && (
                      <h5 className="font-semibold text-primary2 mb-1">
                        {review.title}
                      </h5>
                    )}
                    {review.description && (
                      <p className="text-gray-700">{review.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;
