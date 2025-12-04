import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { QUERY_USER } from "../utils/queries.js";
import { UPDATE_USER } from "../utils/mutations.js";
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
  const token = Auth.getProfile();
  const isOwnProfile = token?.data?._id === profileId;

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

  const hasProfileInfo = user.bio || user.location || user.favBook || user.favAuthor;

  // Show edit form if it's the user's own profile and they haven't filled it out, or if they're editing
  if (isOwnProfile && (!hasProfileInfo || isEditing)) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 mt-10">
        <h3 className="text-2xl font-bold text-primary2 mb-6 text-center">
          {isEditing ? "Edit Your Profile" : "Please Provide Some Additional Information"}
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

  // Show profile view
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary2">
          {user.username}'s Profile
        </h1>
        {isOwnProfile && (
          <button
            onClick={handleEditClick}
            className="bg-primary1 text-white px-4 py-2 rounded hover:bg-accent transition"
          >
            Edit Profile
          </button>
        )}
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
            <h4 className="font-semibold text-primary2 mb-1">Favorite Author:</h4>
            <p className="text-gray-700">{user.favAuthor}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-primary2 mb-1">Books in Collection:</h4>
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
            <ul className="list-disc list-inside text-gray-700">
              {user.reviews.map((review) => (
                <li key={review._id}>
                  {review.title || "Untitled Review"} - {review.stars} stars
                </li>
              ))}
            </ul>
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


