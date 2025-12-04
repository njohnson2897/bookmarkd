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
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-primary2">Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
        My Books
      </h1>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {["All", "To-Read", "Currently Reading", "Finished"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded transition ${
              selectedStatus === status
                ? "bg-primary1 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status}
            {status !== "All" &&
              ` (${books.filter((b) => b.status === status).length})`}
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">
            {selectedStatus === "All"
              ? "You haven't added any books to your collection yet."
              : `You don't have any books with status "${selectedStatus}".`}
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((bookStatus, index) => {
            const bookId = bookStatus.book?.google_id;
            const details = bookDetails[bookId] || {};
            const bookDbId = bookStatus.book?._id;

            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition"
              >
                {/* Book Cover */}
                <div
                  className="cursor-pointer mb-3"
                  onClick={() => navigate(`/books/${bookId}`)}
                >
                  {details.coverImage ? (
                    <img
                      src={details.coverImage}
                      alt={details.title}
                      className="w-full h-64 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <h3
                  className="font-bold text-primary2 mb-1 cursor-pointer hover:text-primary1 transition"
                  onClick={() => navigate(`/books/${bookId}`)}
                >
                  {details.title || "Loading..."}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {details.author || "Loading..."}
                </p>

                {/* Status Dropdown */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-primary2 mb-1">
                    Status:
                  </label>
                  <select
                    value={bookStatus.status}
                    onChange={(e) => handleStatusChange(bookDbId, e.target.value)}
                    className="w-full border border-primary1 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary1"
                  >
                    <option value="To-Read">To-Read</option>
                    <option value="Currently Reading">Currently Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>

                {/* Favorite Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() =>
                      handleFavoriteToggle(bookDbId, bookStatus.favorite)
                    }
                    className={`flex items-center gap-1 text-sm transition ${
                      bookStatus.favorite
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-300"
                    }`}
                    aria-label={
                      bookStatus.favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <span className="text-xl">
                      {bookStatus.favorite ? "★" : "☆"}
                    </span>
                    <span className="text-xs">
                      {bookStatus.favorite ? "Favorite" : "Not Favorite"}
                    </span>
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveBook(bookDbId)}
                  className="mt-auto bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBooks;


