import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { QUERY_USER } from "../utils/queries.js";
import {
  EDIT_USER_BOOK_STATUS,
  EDIT_USER_BOOK_FAVORITE,
  REMOVE_USER_BOOK,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const MyBooks = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [bookDetails, setBookDetails] = useState({});
  const navigate = useNavigate();

  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;

  const { loading, data, refetch } = useQuery(QUERY_USER, {
    variables: { userId },
    skip: !userId,
  });

  const [editBookStatus] = useMutation(EDIT_USER_BOOK_STATUS);
  const [editBookFavorite] = useMutation(EDIT_USER_BOOK_FAVORITE);
  const [removeUserBook] = useMutation(REMOVE_USER_BOOK);

  const user = data?.user || {};
  const books = user.books || [];

  // Calculate statistics
  const stats = {
    total: books.length,
    toRead: books.filter((b) => b.status === "To-Read").length,
    currentlyReading: books.filter((b) => b.status === "Currently Reading").length,
    finished: books.filter((b) => b.status === "Finished").length,
    favorites: books.filter((b) => b.favorite).length,
  };

  // Fetch book details from Google Books API
  useEffect(() => {
    const fetchBookDetails = async () => {
      const details = {};
      for (const bookStatus of books) {
        if (bookStatus.book?.google_id) {
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${bookStatus.book.google_id}`
            );
            if (response.ok) {
              const bookData = await response.json();
              details[bookStatus.book.google_id] = {
                title: bookData.volumeInfo?.title || "Unknown Title",
                author: bookData.volumeInfo?.authors?.[0] || "Unknown Author",
                coverImage:
                  bookData.volumeInfo?.imageLinks?.thumbnail ||
                  bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                  "",
              };
            }
          } catch (error) {
            console.error("Error fetching book details:", error);
          }
        }
      }
      setBookDetails(details);
    };

    if (books.length > 0) {
      fetchBookDetails();
    }
  }, [books]);

  const filteredBooks =
    selectedStatus === "All"
      ? books
      : books.filter((bookStatus) => bookStatus.status === selectedStatus);

  const handleStatusChange = async (bookId, newStatus) => {
    if (!userId) return;

    try {
      await editBookStatus({
        variables: {
          bookId,
          userId,
          status: newStatus,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error updating book status:", error);
      alert("Error updating book status. Please try again.");
    }
  };

  const handleFavoriteToggle = async (bookId, currentFavorite) => {
    if (!userId) return;

    try {
      await editBookFavorite({
        variables: {
          bookId,
          userId,
          favorite: !currentFavorite,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error updating favorite status. Please try again.");
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to remove this book from your collection?")) {
      return;
    }

    try {
      await removeUserBook({
        variables: {
          bookId,
          userId,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error removing book:", error);
      alert("Error removing book. Please try again.");
    }
  };

  if (!Auth.loggedIn()) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-gray-600">
          Please sign in to view your book collection.
        </p>
      </div>
    );
  }

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
            <p className="text-lg text-primary2 font-semibold">Loading your collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2">My Books</h1>
        <p className="text-white/90">
          Manage your personal book collection and reading journey
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition">
          <div className="text-3xl font-bold text-primary2">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Books</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition">
          <div className="text-3xl font-bold text-blue-600">{stats.toRead}</div>
          <div className="text-sm text-gray-600 mt-1">To-Read</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition">
          <div className="text-3xl font-bold text-yellow-600">{stats.currentlyReading}</div>
          <div className="text-sm text-gray-600 mt-1">Reading</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition">
          <div className="text-3xl font-bold text-green-600">{stats.finished}</div>
          <div className="text-sm text-gray-600 mt-1">Finished</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition">
          <div className="text-3xl font-bold text-yellow-500">{stats.favorites}</div>
          <div className="text-sm text-gray-600 mt-1">Favorites</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {["All", "To-Read", "Currently Reading", "Finished"].map((status) => {
            const count =
              status === "All"
                ? stats.total
                : books.filter((b) => b.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  selectedStatus === status
                    ? "bg-primary1 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
                <span className="ml-2 text-sm opacity-90">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-xl text-gray-700 font-semibold mb-2">
            {selectedStatus === "All"
              ? "Your collection is empty"
              : `No books with status "${selectedStatus}"`}
          </p>
          <p className="text-gray-500 mb-6">
            {selectedStatus === "All"
              ? "Start building your collection by adding books you want to read!"
              : "Try selecting a different status or add more books to your collection."}
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-primary1 text-white px-8 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((bookStatus, index) => {
            const bookId = bookStatus.book?.google_id;
            const details = bookDetails[bookId] || {};
            const bookDbId = bookStatus.book?._id;

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group"
              >
                {/* Book Cover */}
                <div
                  className="cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/books/${bookId}`)}
                >
                  {details.coverImage ? (
                    <img
                      src={details.coverImage}
                      alt={details.title}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
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
                  {/* Favorite Badge */}
                  {bookStatus.favorite && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full p-1.5 shadow-lg">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold shadow-md ${
                        bookStatus.status === "Finished"
                          ? "bg-green-500 text-white"
                          : bookStatus.status === "Currently Reading"
                          ? "bg-yellow-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {bookStatus.status}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3
                    className="font-bold text-primary2 mb-1 cursor-pointer hover:text-primary1 transition line-clamp-2 text-sm"
                    onClick={() => navigate(`/books/${bookId}`)}
                    title={details.title || "Loading..."}
                  >
                    {details.title || "Loading..."}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                    {details.author || "Loading..."}
                  </p>

                  {/* Status Dropdown */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-primary2 mb-1.5">
                      Status:
                    </label>
                    <select
                      value={bookStatus.status}
                      onChange={(e) => handleStatusChange(bookDbId, e.target.value)}
                      className="w-full border-2 border-primary1 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary1 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="To-Read">To-Read</option>
                      <option value="Currently Reading">Currently Reading</option>
                      <option value="Finished">Finished</option>
                    </select>
                  </div>

                  {/* Favorite Toggle */}
                  <div className="mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(bookDbId, bookStatus.favorite);
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        bookStatus.favorite
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      aria-label={
                        bookStatus.favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        className={`w-4 h-4 ${
                          bookStatus.favorite ? "fill-current" : "stroke-current"
                        }`}
                        fill={bookStatus.favorite ? "currentColor" : "none"}
                        strokeWidth={bookStatus.favorite ? 0 : 2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      {bookStatus.favorite ? "Favorited" : "Favorite"}
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBook(bookDbId);
                    }}
                    className="w-full bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition border border-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBooks;


