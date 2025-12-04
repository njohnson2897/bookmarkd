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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary2 mb-2">
              {club.name}
            </h1>
            <p className="text-gray-600">
              Owner:{" "}
              <span className="font-semibold text-primary1">
                {club.owner?.username || "Unknown"}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {canJoin && (
              <button
                onClick={handleJoinClub}
                className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
              >
                Join Club
              </button>
            )}
            {isMember && !isOwner && (
              <button
                onClick={handleLeaveClub}
                className="bg-red-100 text-red-700 px-6 py-2 rounded hover:bg-red-200 transition"
              >
                Leave Club
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteClub}
                className="bg-red-100 text-red-700 px-6 py-2 rounded hover:bg-red-200 transition"
              >
                Delete Club
              </button>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary2 mb-4">
            Members ({club.members?.length || 0})
          </h2>
          {club.members && club.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {club.members.map((member) => (
                <div
                  key={member._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary1 transition cursor-pointer"
                  onClick={() => navigate(`/profile/${member._id}`)}
                >
                  <p className="font-semibold text-primary2">
                    {member.username}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No members yet. Be the first to join!</p>
          )}
        </div>

        {/* Owner is automatically included in member count but shown separately */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Note:</span> The owner is automatically
            part of the club but is not listed as a member.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;

