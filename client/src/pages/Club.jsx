import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_CLUBS } from "../utils/queries.js";
import { ADD_CLUB } from "../utils/mutations.js";
import Auth from "../utils/auth.js";
import { useNavigate } from "react-router-dom";

export default function Club() {
  const [clubName, setClubName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { loading, data, refetch } = useQuery(QUERY_CLUBS);
  const [addClub, { error }] = useMutation(ADD_CLUB);
  const navigate = useNavigate();
  const isLoggedIn = Auth.loggedIn();

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
                {clubs.map((club) => (
                  <div
                    key={club._id}
                    className="bg-white rounded-lg shadow p-6 flex flex-col gap-2"
                  >
                    <h3 className="text-xl font-bold text-primary2">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Owner: {club.owner?.username || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Members: {club.members?.length || 0}
                    </p>
                  </div>
                ))}
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

