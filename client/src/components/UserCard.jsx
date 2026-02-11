import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { FOLLOW_USER, UNFOLLOW_USER } from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const UserCard = ({ user, refetch }) => {
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;
  const isOwnProfile = userId === user._id;
  const [followUser] = useMutation(FOLLOW_USER);
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  const goToUser = (event) => {
    event.preventDefault();
    navigate(`/profile/${user._id}`);
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    if (!userId) return;

    try {
      if (user.isFollowing) {
        await unfollowUser({
          variables: {
            followerId: userId,
            followingId: user._id,
          },
        });
      } else {
        await followUser({
          variables: {
            followerId: userId,
            followingId: user._id,
          },
        });
      }
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      alert("Error updating follow status. Please try again.");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={goToUser}
    >
      {/* Header */}
      <div className="bg-primary2 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold truncate">{user.username}</h2>
          {!isOwnProfile && Auth.loggedIn() && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFollow(e);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                user.isFollowing
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white text-primary2 hover:bg-white/90"
              }`}
            >
              {user.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
        <p className="text-white/80 text-sm truncate">{user.email}</p>
      </div>

      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary2">
              {user.books?.length || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary2">
              {user.reviews?.length || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary2">
              {user.clubs?.length || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Clubs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary2">
              {user.followerCount || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Followers</div>
          </div>
        </div>

        {/* Follow Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-semibold">{user.followerCount || 0}</span>
              <span className="text-gray-500">followers</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-semibold">{user.followingCount || 0}</span>
              <span className="text-gray-500">following</span>
            </div>
          </div>
        </div>

        {/* View Profile Link */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={goToUser}
            className="w-full bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold text-sm"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;



