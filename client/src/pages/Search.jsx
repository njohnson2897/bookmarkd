import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [searchedBook, setSearchedBook] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const bookTitle = searchQuery.trim();

    if (!bookTitle) {
      setError("Please enter a book title.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        bookTitle
      )}&maxResults=40`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { items } = await response.json();
      
      if (!items || items.length === 0) {
        setError("No books found. Try a different search term.");
        setSearchedBook([]);
        setLoading(false);
        return;
      }

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo?.authors || ["Unknown Author"],
        title: book.volumeInfo?.title || "No title",
        image: book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail || "",
        rating: book.volumeInfo?.averageRating || null,
        publishedDate: book.volumeInfo?.publishedDate || null,
        description: book.volumeInfo?.description || null,
        pageCount: book.volumeInfo?.pageCount || null,
        categories: book.volumeInfo?.categories || [],
      }));

      setSearchedBook(bookData);
    } catch (error) {
      console.error("There was a problem fetching the data:", error);
      setError("Error searching for books. Please try again.");
      setSearchedBook([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-2">Browse Books</h1>
        <p className="text-white/90">
          Discover your next great read from millions of books
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="booksearch" className="block font-semibold text-primary2 mb-2">
                Search for Books
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border-2 border-primary1 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary1 text-lg"
                  id="booksearch"
                  placeholder="Enter book title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-primary1 text-white px-8 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary2 mb-4"></div>
          <p className="text-lg text-primary2 font-semibold">Searching for books...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasSearched && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Start Your Search
          </h3>
          <p className="text-gray-500">
            Enter a book title, author, or ISBN to discover great reads
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && searchedBook.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Books Found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse different keywords
          </p>
        </div>
      )}

      {/* Book Grid */}
      {!loading && searchedBook.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary2">
              Found {searchedBook.length} {searchedBook.length === 1 ? 'book' : 'books'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchedBook.map((book) => (
              <div
                key={book.bookId}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/books/${book.bookId}`)}
              >
                {/* Book Cover */}
                <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
                  {book.image ? (
                    <img
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={book.image}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                      <svg
                        className="w-12 h-12 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="text-xs text-center">No Cover</span>
                    </div>
                  )}
                  {book.rating && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-primary2 text-sm mb-1 line-clamp-2 group-hover:text-primary1 transition">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                    {book.authors.join(", ")}
                  </p>
                  {book.publishedDate && (
                    <p className="text-xs text-gray-500">
                      {new Date(book.publishedDate).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;



