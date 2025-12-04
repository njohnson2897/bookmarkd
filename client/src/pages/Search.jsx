import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const [searchedBook, setSearchedBook] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const bookTitle = document.getElementById("booksearch")?.value.trim();

    if (!bookTitle) {
      setError("Please enter a book title.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        bookTitle
      )}&maxResults=9`;

      // Note: Google Books API doesn't support year/genre/rating filters in the query string
      // These would need to be filtered client-side if needed
      // For now, we'll just use the search query

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
        authors: book.volumeInfo?.authors || ["No author to display"],
        title: book.volumeInfo?.title || "No title",
        image: book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail || "",
        rating: book.volumeInfo?.averageRating || null,
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
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
        Browse Books
      </h1>
      <form
        className="flex flex-wrap gap-6 mb-8 bg-white rounded-lg shadow p-6"
        onSubmit={handleFormSubmit}
      >
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="booksearch" className="block font-semibold mb-1">
            Enter a book title here:
          </label>
          <input
            type="text"
            className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
            id="booksearch"
            placeholder="Search for books..."
            required
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="yearFilter" className="block font-semibold mb-1">
            Filter by Year (optional):
          </label>
          <input
            type="text"
            className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
            id="yearFilter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Enter a year"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="genreFilter" className="block font-semibold mb-1">
            Filter by Genre (optional):
          </label>
          <input
            type="text"
            className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
            id="genreFilter"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            placeholder="Enter a genre"
          />
        </div>
        <button
          type="submit"
          className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition self-end"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-lg text-primary2">Loading...</div>
      )}

      {!loading && searchedBook.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {searchedBook.map((book) => (
            <div
              key={book.bookId}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/books/${book.bookId}`)}
            >
              {book.image ? (
                <img
                  alt={book.title}
                  className="w-32 h-48 object-cover rounded mb-3"
                  src={book.image}
                />
              ) : (
                <div className="w-32 h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <p className="font-bold text-primary2 mb-1 text-center">{book.title}</p>
              <p className="text-sm text-gray-700 mb-1 text-center">
                Author(s): {book.authors.join(", ")}
              </p>
              {book.rating && (
                <p className="text-sm text-primary1">Rating: {book.rating}/5</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;


