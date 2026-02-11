import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { QUERY_USER } from "../utils/queries.js";
import {
  UPDATE_USER,
  DELETE_REVIEW,
  FOLLOW_USER,
  UNFOLLOW_USER,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";
import { useState, useEffect } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    favBook: "",
    favAuthor: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [updateUser, { error: updateError }] = useMutation(UPDATE_USER);
  const [deleteReview] = useMutation(DELETE_REVIEW);
  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);
  const token = Auth.getProfile();
  const isOwnProfile = token?.data?._id === profileId;
  const currentUserId = token?.data?._id;

  const { loading, data, refetch } = useQuery(QUERY_USER, {
    variables: { userId: profileId },
    skip: !profileId,
  });

  const user = data?.user || {};
  const [bookDetails, setBookDetails] = useState({});
  const [reviewBookDetails, setReviewBookDetails] = useState({});

  // Calculate reading statistics
  const calculateStats = () => {
    const books = user.books || [];
    const reviews = user.reviews || [];

    const finishedBooks = books.filter((b) => b.status === "Finished").length;
    const currentlyReading = books.filter(
      (b) => b.status === "Currently Reading"
    ).length;
    const toRead = books.filter((b) => b.status === "To-Read").length;
    const favorites = books.filter((b) => b.favorite).length;

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length
        : 0;

    return {
      totalBooks: books.length,
      finishedBooks,
      currentlyReading,
      toRead,
      favorites,
      totalReviews: reviews.length,
      avgRating: avgRating.toFixed(1),
    };
  };

  const stats = calculateStats();

  // Fetch book cover images
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!user.books || user.books.length === 0) return;

      const details = {};
      for (const bookStatus of user.books) {
        if (bookStatus.book?.google_id) {
          const googleId = bookStatus.book.google_id;
          if (!details[googleId]) {
            try {
              const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes/${googleId}`
              );
              if (response.ok) {
                const bookData = await response.json();
                details[googleId] = {
                  title: bookData.volumeInfo?.title || "Unknown Book",
                  author: bookData.volumeInfo?.authors?.[0] || "Unknown Author",
                  coverImage:
                    bookData.volumeInfo?.imageLinks?.thumbnail ||
                    bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                    "",
                };
              }
            } catch (err) {
              console.error("Error fetching book details:", err);
            }
          }
        }
      }
      setBookDetails(details);
    };

    fetchBookDetails();
  }, [user.books]);

  // Fetch review book details
  useEffect(() => {
    const fetchReviewBookDetails = async () => {
      if (!user.reviews || user.reviews.length === 0) return;

      const details = {};
      for (const review of user.reviews) {
        if (review.book?.google_id) {
          const googleId = review.book.google_id;
          if (!details[googleId]) {
            try {
              const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes/${googleId}`
              );
              if (response.ok) {
                const bookData = await response.json();
                details[googleId] = {
                  title: bookData.volumeInfo?.title || "Unknown Book",
                  author: bookData.volumeInfo?.authors?.[0] || "Unknown Author",
                  coverImage:
                    bookData.volumeInfo?.imageLinks?.thumbnail ||
                    bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                    "",
                };
              }
            } catch (err) {
              console.error("Error fetching review book details:", err);
            }
          }
        }
      }
      setReviewBookDetails(details);
    };

    fetchReviewBookDetails();
  }, [user.reviews]);

  // Get user initials for avatar
  const getInitials = (username) => {
    if (!username) return "?";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: { id: profileId, ...formData },
      });
      setIsEditing(false);
      await refetch();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleEditClick = () => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        location: user.location || "",
        favBook: user.favBook || "",
        favAuthor: user.favAuthor || "",
      });
    }
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-lg text-primary2">Loading...</div>
    );
  }

  if (!user || !user._id) {
    return (
      <div className="text-center py-10 text-lg text-red-500">
        User not found
      </div>
    );
  }

  const hasProfileInfo =
    user.bio || user.location || user.favBook || user.favAuthor;

  // Show edit form if it's the user's own profile and they haven't filled it out, or if they're editing
  if (isOwnProfile && (!hasProfileInfo || isEditing)) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-10 mb-10">
        <h3 className="text-2xl font-bold text-primary2 mb-6 text-center">
          {isEditing
            ? "Edit Your Profile"
            : "Please Provide Some Additional Information"}
        </h3>
        {updateError && (
          <div className="text-red-500 text-sm mb-4">
            {updateError.message || "Error updating profile"}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="bio" className="block font-semibold mb-1">
              Tell us about yourself:
            </label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="location" className="block font-semibold mb-1">
              Where are you located?
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="favBook" className="block font-semibold mb-1">
              Your favorite book:
            </label>
            <input
              type="text"
              id="favBook"
              name="favBook"
              className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
              value={formData.favBook}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="favAuthor" className="block font-semibold mb-1">
              Your favorite author:
            </label>
            <input
              type="text"
              id="favAuthor"
              name="favAuthor"
              className="w-full border border-primary1 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
              value={formData.favAuthor}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary1 text-white rounded px-6 py-2 mt-2 hover:bg-accent transition"
            >
              Submit
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 rounded px-6 py-2 mt-2 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  const handleFollow = async () => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    if (!currentUserId) return;

    try {
      if (user.isFollowing) {
        await unfollowUser({
          variables: {
            followerId: currentUserId,
            followingId: profileId,
          },
        });
      } else {
        await followUser({
          variables: {
            followerId: currentUserId,
            followingId: profileId,
          },
        });
      }
      await refetch();
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      alert("Error updating follow status. Please try again.");
    }
  };

  // Show profile view
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white text-primary2 flex items-center justify-center text-3xl font-bold shadow-lg">
            {getInitials(user.username)}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
              {user.location && (
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {user.followerCount || 0} followers
                </span>
                <span className="font-semibold">
                  {user.followingCount || 0} following
                </span>
              </div>
            </div>
            {user.bio && (
              <p className="mt-3 text-white/90 max-w-2xl">{user.bio}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isOwnProfile && Auth.loggedIn() && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg transition font-semibold ${
                  user.isFollowing
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white text-primary2 hover:bg-gray-100"
                }`}
              >
                {user.isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={handleEditClick}
                className="bg-white text-primary2 px-6 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Favorite Book/Author */}
        {(user.favBook || user.favAuthor) && (
          <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap gap-6">
            {user.favBook && (
              <div>
                <span className="text-sm opacity-75">Favorite Book</span>
                <p className="font-semibold">{user.favBook}</p>
              </div>
            )}
            {user.favAuthor && (
              <div>
                <span className="text-sm opacity-75">Favorite Author</span>
                <p className="font-semibold">{user.favAuthor}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">
            {stats.totalBooks}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Books</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">
            {stats.finishedBooks}
          </div>
          <div className="text-sm text-gray-600 mt-1">Finished</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-gray-600 mt-1">Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">
            {stats.avgRating || "0.0"}
          </div>
          <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
        </div>
      </div>

      {/* Books Section */}
      <div className="bg-white rounded-lg shadow mt-6 p-6">
        <h2 className="text-2xl font-bold text-primary2 mb-4">My Books</h2>
        {user.books && user.books.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {user.books.slice(0, 16).map((bookStatus, index) => {
              const bookInfo = bookDetails[bookStatus.book?.google_id] || {};
              return (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() =>
                    navigate(`/books/${bookStatus.book?.google_id}`)
                  }
                >
                  <div className="relative">
                    {bookInfo.coverImage ? (
                      <img
                        src={bookInfo.coverImage}
                        alt={bookInfo.title}
                        className="w-full aspect-[2/3] object-cover rounded shadow-md group-hover:shadow-xl transition"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gray-200 rounded shadow-md flex items-center justify-center text-gray-400 text-xs">
                        No Cover
                      </div>
                    )}
                    {bookStatus.favorite && (
                      <span className="absolute top-1 right-1 text-yellow-400 text-lg">
                        ⭐
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 rounded-b text-center">
                      {bookStatus.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No books in collection yet.
          </p>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow mt-6 p-6">
        <h2 className="text-2xl font-bold text-primary2 mb-4">Reviews</h2>
        {user.reviews && user.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.reviews.map((review) => {
              const bookInfo = reviewBookDetails[review.book?.google_id] || {};
              return (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {bookInfo.coverImage ? (
                      <img
                        src={bookInfo.coverImage}
                        alt={bookInfo.title}
                        className="w-16 h-24 object-cover rounded cursor-pointer"
                        onClick={() =>
                          navigate(`/books/${review.book?.google_id}`)
                        }
                      />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Cover
                      </div>
                    )}
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-primary2 cursor-pointer hover:text-primary1"
                        onClick={() =>
                          navigate(`/books/${review.book?.google_id}`)
                        }
                      >
                        {bookInfo.title || "Unknown Book"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {bookInfo.author || "Unknown Author"}
                      </p>
                      {review.title && (
                        <h4 className="font-medium text-gray-800 mb-1">
                          {review.title}
                        </h4>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400">
                          {"★".repeat(Math.round(review.stars))}
                          {"☆".repeat(5 - Math.round(review.stars))}
                        </span>
                        <span className="text-sm text-gray-600">
                          {review.stars}/5
                        </span>
                      </div>
                      {review.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {review.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            navigate(`/books/${review.book?.google_id}`)
                          }
                          className="text-primary1 hover:text-primary2 text-sm font-semibold"
                        >
                          View Book →
                        </button>
                        {isOwnProfile && (
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this review?"
                                )
                              ) {
                                try {
                                  await deleteReview({
                                    variables: { reviewId: review._id },
                                  });
                                  await refetch();
                                } catch (error) {
                                  console.error(
                                    "Error deleting review:",
                                    error
                                  );
                                  alert(
                                    "Error deleting review. Please try again."
                                  );
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet.</p>
        )}
      </div>

      {/* Clubs Section */}
      {user.clubs && user.clubs.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6 p-6">
          <h2 className="text-2xl font-bold text-primary2 mb-4">Book Clubs</h2>
          <div className="flex flex-wrap gap-3">
            {user.clubs.map((club) => (
              <button
                key={club._id}
                onClick={() => navigate(`/clubs/${club._id}`)}
                className="bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition"
              >
                {club.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

