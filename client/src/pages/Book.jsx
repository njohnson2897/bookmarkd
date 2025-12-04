import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_BOOKGOOGLE } from "../utils/queries.js";
import { ADD_BOOK_STATUS, ADD_BOOK } from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const Book = () => {
  const [book, setBook] = useState({
    coverImage: "",
    title: "Loading...",
    author: "",
    description: "",
  });
  const [bookSaved, setBookSaved] = useState(false);
  const { bookId } = useParams();
  const navigate = useNavigate();

  const { loading, data, refetch } = useQuery(QUERY_BOOKGOOGLE, {
    variables: { googleId: bookId },
    skip: !bookId,
  });

  const [addBook] = useMutation(ADD_BOOK);
  const [addBookStatusMutation] = useMutation(ADD_BOOK_STATUS);

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
      }
    } catch (error) {
      console.error(error);
      alert("Error saving book. Please try again.");
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
            <button
              className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition mt-2 disabled:opacity-50"
              onClick={handleSaveBook}
              disabled={bookSaved}
            >
              {bookSaved ? "Book Saved!" : "Save to My Books"}
            </button>
          ) : (
            <p className="text-gray-600">
              Please sign in to save this book to your collection.
            </p>
          )}

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
