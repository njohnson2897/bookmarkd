import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { QUERY_CLUB } from "../utils/queries.js";
import { ADD_CLUB_MEMBER, REMOVE_CLUB_MEMBER, DELETE_CLUB } from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;

  const { loading, data, refetch } = useQuery(QUERY_CLUB, {
    variables: { id: clubId },
    skip: !clubId,
  });

  const [addClubMember] = useMutation(ADD_CLUB_MEMBER);
  const [removeClubMember] = useMutation(REMOVE_CLUB_MEMBER);
  const [deleteClub] = useMutation(DELETE_CLUB);

  const club = data?.club;
  const isOwner = club?.owner?._id === userId;
  const isMember = club?.members?.some((member) => member._id === userId) || false;
  const canJoin = !isOwner && !isMember && Auth.loggedIn();

  const handleJoinClub = async () => {
    if (!userId) {
      alert("Please sign in to join a club.");
      navigate("/");
      return;
    }

    try {
      await addClubMember({
        variables: {
          clubId,
          userId,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error joining club:", error);
      alert("Error joining club. Please try again.");
    }
  };

  const handleLeaveClub = async () => {
    if (!userId) return;

    if (!window.confirm("Are you sure you want to leave this club?")) {
      return;
    }

    try {
      await removeClubMember({
        variables: {
          clubId,
          userId,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error leaving club:", error);
      alert("Error leaving club. Please try again.");
    }
  };

  const handleDeleteClub = async () => {
    if (!isOwner) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this club? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteClub({
        variables: {
          clubId,
        },
      });
      navigate("/clubs");
    } catch (error) {
      console.error("Error deleting club:", error);
      alert("Error deleting club. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-primary2">Loading club details...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p className="text-lg text-red-500">Club not found</p>
        <button
          onClick={() => navigate("/clubs")}
          className="mt-4 bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
        >
          Back to Clubs
        </button>
      </div>
    );
  }

  const totalMembers = (club.members?.length || 0) + 1; // +1 for owner

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-semibold">{totalMembers} {totalMembers === 1 ? "member" : "members"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Owner:</span>
                <button
                  onClick={() => navigate(`/profile/${club.owner?._id}`)}
                  className="font-semibold hover:underline"
                >
                  {club.owner?.username || "Unknown"}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {canJoin && (
              <button
                onClick={handleJoinClub}
                className="bg-white text-primary2 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Join Club
              </button>
            )}
            {isMember && !isOwner && (
              <button
                onClick={handleLeaveClub}
                className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition font-semibold"
              >
                Leave Club
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteClub}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
              >
                Delete Club
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">{totalMembers}</div>
          <div className="text-sm text-gray-600 mt-1">Total Members</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">{club.members?.length || 0}</div>
          <div className="text-sm text-gray-600 mt-1">Active Members</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-primary2">
            {isOwner ? "Owner" : isMember ? "Member" : "Visitor"}
          </div>
          <div className="text-sm text-gray-600 mt-1">Your Status</div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary2">
            Club Members
          </h2>
        </div>

        {/* Owner Card */}
        <div className="mb-6 pb-6 border-b-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Owner
          </h3>
          <div
            className="bg-gradient-to-r from-primary1/10 to-primary2/10 rounded-lg p-4 border-2 border-primary1/20 hover:border-primary1/40 transition cursor-pointer"
            onClick={() => navigate(`/profile/${club.owner?._id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary1 text-white flex items-center justify-center text-lg font-bold">
                {club.owner?.username?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary2 text-lg">
                  {club.owner?.username || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">Club Owner</p>
              </div>
              <span className="bg-primary1 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Owner
              </span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Members ({club.members?.length || 0})
          </h3>
          {club.members && club.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {club.members.map((member) => (
                <div
                  key={member._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary1 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/profile/${member._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary2 text-white flex items-center justify-center font-semibold">
                      {member.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary2">
                        {member.username}
                      </p>
                      <p className="text-xs text-gray-600">Member</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-600 font-medium">No members yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Be the first to join this club!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;

