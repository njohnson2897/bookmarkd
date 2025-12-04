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
import { useState } from "react";

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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-10 mb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary2">
            {user.username}'s Profile
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>{user.followerCount || 0} followers</span>
            <span>{user.followingCount || 0} following</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isOwnProfile && Auth.loggedIn() && (
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded transition ${
                user.isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-primary1 text-white hover:bg-accent"
              }`}
            >
              {user.isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={handleEditClick}
              className="bg-primary1 text-white px-4 py-2 rounded hover:bg-accent transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {user.bio && (
          <div>
            <h4 className="font-semibold text-primary2 mb-1">Bio:</h4>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}
        {user.location && (
          <div>
            <h4 className="font-semibold text-primary2 mb-1">Location:</h4>
            <p className="text-gray-700">{user.location}</p>
          </div>
        )}
        {user.favBook && (
          <div>
            <h4 className="font-semibold text-primary2 mb-1">Favorite Book:</h4>
            <p className="text-gray-700">{user.favBook}</p>
          </div>
        )}
        {user.favAuthor && (
          <div>
            <h4 className="font-semibold text-primary2 mb-1">
              Favorite Author:
            </h4>
            <p className="text-gray-700">{user.favAuthor}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-primary2 mb-1">
            Books in Collection:
          </h4>
          {user.books && user.books.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {user.books.map((bookStatus, index) => (
                <li key={index}>
                  {bookStatus.status} {bookStatus.favorite && "⭐"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No books in collection yet.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-primary2 mb-1">Reviews:</h4>
          {user.reviews && user.reviews.length > 0 ? (
            <div className="space-y-2">
              {user.reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <span className="text-gray-700">
                      {review.title || "Untitled Review"} - {review.stars} stars
                    </span>
                    {review.book?.google_id && (
                      <button
                        onClick={() =>
                          navigate(`/books/${review.book.google_id}`)
                        }
                        className="ml-2 text-primary1 hover:text-primary2 text-sm"
                      >
                        View Book
                      </button>
                    )}
                  </div>
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
                            console.error("Error deleting review:", error);
                            alert("Error deleting review. Please try again.");
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-primary2 mb-1">Clubs:</h4>
          {user.clubs && user.clubs.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700">
              {user.clubs.map((club) => (
                <li key={club._id}>{club.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Not a member of any clubs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
