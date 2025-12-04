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
    <section className="bg-gradient-to-r from-primary2 to-primary1 min-h-[60vh] flex flex-col justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6 items-start">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join A Book Club!
            </h2>
            {isLoggedIn && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-primary2 px-6 py-2 rounded shadow hover:bg-primary1 hover:text-white transition"
              >
                {showForm ? "Cancel" : "Create New Club"}
              </button>
            )}
            {showForm && isLoggedIn && (
              <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-primary2 mb-4">
                  Create New Book Club
                </h3>
                {error && (
                  <div className="text-red-500 text-sm mb-4">
                    {error.message || "Error creating club"}
                  </div>
                )}
                <form onSubmit={handleCreateClub} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Club Name"
                    className="rounded px-3 py-2 border border-primary1 focus:outline-none focus:ring-2 focus:ring-primary1"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-primary1 text-white rounded px-4 py-2 mt-2 hover:bg-accent transition"
                  >
                    Create Club
                  </button>
                </form>
              </div>
            )}
            {loading ? (
              <div className="text-white">Loading clubs...</div>
            ) : clubs.length > 0 ? (
              <div className="grid gap-6 w-full max-w-2xl">
                {clubs.map((club) => {
                  const isMember = isMemberOfClub(club);
                  const isOwner = isOwnerOfClub(club);
                  const canJoin = !isMember && !isOwner && isLoggedIn;

                  return (
                    <div
                      key={club._id}
                      className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 hover:shadow-lg transition cursor-pointer"
                      onClick={() => navigate(`/clubs/${club._id}`)}
                    >
                      <div>
                        <h3 className="text-xl font-bold text-primary2 mb-2">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Owner:{" "}
                          <span className="font-semibold">
                            {club.owner?.username || "Unknown"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Members: {club.members?.length || 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isOwner && (
                          <span className="bg-primary1 text-white px-3 py-1 rounded text-sm">
                            Owner
                          </span>
                        )}
                        {isMember && !isOwner && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                            Member
                          </span>
                        )}
                        {canJoin && (
                          <button
                            onClick={(e) => handleJoinClub(club._id, e)}
                            className="bg-primary1 text-white px-4 py-1 rounded text-sm hover:bg-accent transition"
                          >
                            Join
                          </button>
                        )}
                        {isMember && !isOwner && (
                          <button
                            onClick={(e) => handleLeaveClub(club._id, e)}
                            className="bg-red-100 text-red-700 px-4 py-1 rounded text-sm hover:bg-red-200 transition"
                          >
                            Leave
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                  No book clubs yet. {isLoggedIn ? "Create one to get started!" : "Sign in to create one!"}
                </p>
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/images/books.jpeg"
              alt="Book Club"
              className="w-80 h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


