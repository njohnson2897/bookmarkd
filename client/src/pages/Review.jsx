import { useQuery } from "@apollo/client";
import { QUERY_REVIEWS } from "../utils/queries.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ReviewsPage = () => {
  const { loading, data, error } = useQuery(QUERY_REVIEWS);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

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
            <div className="flex gap-2 mt-2">
              <button 
                className="bg-primary1 text-white px-4 py-1 rounded hover:bg-accent transition"
                onClick={() => navigate(`/books/${review.book?.google_id}`)}
              >
                View Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;


