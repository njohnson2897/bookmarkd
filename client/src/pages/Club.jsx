import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_CLUBS } from "../utils/queries.js";
import { ADD_CLUB, ADD_CLUB_MEMBER, REMOVE_CLUB_MEMBER } from "../utils/mutations.js";
import Auth from "../utils/auth.js";
import { useNavigate } from "react-router-dom";

export default function Club() {
  const [clubName, setClubName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { loading, data, refetch } = useQuery(QUERY_CLUBS);
  const [addClub, { error }] = useMutation(ADD_CLUB);
  const [addClubMember] = useMutation(ADD_CLUB_MEMBER);
  const [removeClubMember] = useMutation(REMOVE_CLUB_MEMBER);
  const navigate = useNavigate();
  const isLoggedIn = Auth.loggedIn();
  const userId = isLoggedIn ? Auth.getProfile()?.data?._id : null;

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please sign in to create a book club.");
      navigate("/");
      return;
    }

    const token = Auth.getProfile();
    if (!token?.data?._id) {
      alert("Error: Unable to get user information.");
      return;
    }

    try {
      await addClub({
        variables: {
          name: clubName,
          owner: token.data._id,
        },
      });
      setClubName("");
      setShowForm(false);
      await refetch();
      alert("Book club created successfully!");
    } catch (err) {
      console.error("Error creating club:", err);
      alert("Error creating book club. Please try again.");
    }
  };

  const clubs = data?.clubs || [];

  const isMemberOfClub = (club) => {
    if (!userId || !club.members) return false;
    return club.members.some((member) => member._id === userId);
  };

  const isOwnerOfClub = (club) => {
    if (!userId || !club.owner) return false;
    return club.owner._id === userId;
  };

  const handleJoinClub = async (clubId, e) => {
    e.stopPropagation();
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

  const handleLeaveClub = async (clubId, e) => {
    e.stopPropagation();
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Book Clubs</h1>
            <p className="text-white/90">
              Join a community of readers and discover your next favorite book
            </p>
          </div>
          {isLoggedIn && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-primary2 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition font-semibold"
            >
              {showForm ? "Cancel" : "+ Create Club"}
            </button>
          )}
        </div>
      </div>

      {/* Create Club Form */}
      {showForm && isLoggedIn && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-primary2 mb-4">
            Create New Book Club
          </h3>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
              {error.message || "Error creating club"}
            </div>
          )}
          <form onSubmit={handleCreateClub} className="flex flex-col gap-4">
            <div>
              <label htmlFor="clubName" className="block font-semibold text-primary2 mb-2">
                Club Name
              </label>
              <input
                type="text"
                id="clubName"
                placeholder="Enter club name..."
                className="w-full rounded-lg px-4 py-3 border-2 border-primary1 focus:outline-none focus:ring-2 focus:ring-primary1 text-lg"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary1 text-white rounded-lg px-6 py-3 hover:bg-accent transition font-semibold self-start"
            >
              Create Club
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary2 mb-4"></div>
          <p className="text-lg text-primary2 font-semibold">Loading clubs...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && clubs.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Book Clubs Yet
          </h3>
          <p className="text-gray-500 mb-4">
            {isLoggedIn
              ? "Be the first to create a book club and start a reading community!"
              : "Sign in to create your first book club!"}
          </p>
        </div>
      )}

      {/* Clubs Grid */}
      {!loading && clubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary2">
              {clubs.length} {clubs.length === 1 ? "Club" : "Clubs"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const isMember = isMemberOfClub(club);
              const isOwner = isOwnerOfClub(club);
              const canJoin = !isMember && !isOwner && isLoggedIn;
              const totalMembers = (club.members?.length || 0) + (isOwner ? 1 : 0);

              return (
                <div
                  key={club._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => navigate(`/clubs/${club._id}`)}
                >
                  {/* Club Header */}
                  <div className="bg-gradient-to-r from-primary1 to-primary2 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold">{club.name}</h3>
                      {isOwner && (
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Owner
                        </span>
                      )}
                      {isMember && !isOwner && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Member
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{totalMembers} {totalMembers === 1 ? "member" : "members"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Club Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Owner</p>
                      <p
                        className="font-semibold text-primary2 hover:text-primary1 transition cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${club.owner?._id}`);
                        }}
                      >
                        {club.owner?.username || "Unknown"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {canJoin && (
                        <button
                          onClick={(e) => handleJoinClub(club._id, e)}
                          className="flex-1 bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold"
                        >
                          Join Club
                        </button>
                      )}
                      {isMember && !isOwner && (
                        <button
                          onClick={(e) => handleLeaveClub(club._id, e)}
                          className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition font-semibold"
                        >
                          Leave
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clubs/${club._id}`);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


