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
      className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:bg-primary1 hover:text-white transition border border-gray-200 relative"
      onClick={goToUser}
    >
      {!isOwnProfile && Auth.loggedIn() && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFollow(e);
          }}
          className={`absolute top-2 right-2 px-3 py-1 rounded text-xs transition ${
            user.isFollowing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-primary1 text-white hover:bg-accent"
          }`}
        >
          {user.isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
      <h1 className="text-xl font-bold mb-2">{user.username}</h1>
      <p className="text-sm mb-1">Email: {user.email}</p>
      <p className="text-sm mb-1">Books: {user.books?.length || 0}</p>
      <p className="text-sm mb-1">Clubs: {user.clubs?.length || 0}</p>
      <p className="text-sm mb-1">Reviews: {user.reviews?.length || 0}</p>
      <div className="flex gap-3 text-xs mt-2">
        <span>{user.followerCount || 0} followers</span>
        <span>{user.followingCount || 0} following</span>
      </div>
    </div>
  );
};

export default UserCard;


