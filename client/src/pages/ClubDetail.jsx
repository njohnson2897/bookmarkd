import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { QUERY_CLUB, QUERY_CLUB_THREADS } from "../utils/queries.js";
import {
  ADD_CLUB_MEMBER,
  REMOVE_CLUB_MEMBER,
  DELETE_CLUB,
  ASSIGN_CLUB_BOOK,
  ROTATE_CLUB_BOOK,
  CREATE_DISCUSSION_THREAD,
  ADD_READING_CHECKPOINT,
  UPDATE_READING_CHECKPOINT,
  UPDATE_CLUB,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";
import DiscussionThread from "../components/DiscussionThread.jsx";

const ClubDetail = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;

  const [showAssignBookModal, setShowAssignBookModal] = useState(false);
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [selectedBookGoogleId, setSelectedBookGoogleId] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [threadForm, setThreadForm] = useState({
    title: "",
    content: "",
    threadType: "general",
    chapterRange: "",
  });
  const [checkpointForm, setCheckpointForm] = useState({
    title: "",
    date: "",
    chapters: "",
  });
  const [editingCheckpointIndex, setEditingCheckpointIndex] = useState(null);

  const { loading, data, refetch } = useQuery(QUERY_CLUB, {
    variables: { id: clubId },
    skip: !clubId,
  });

  const { data: threadsData, refetch: refetchThreads } = useQuery(
    QUERY_CLUB_THREADS,
    {
      variables: {
        clubId,
        bookGoogleId: data?.club?.currentBookGoogleId || null,
      },
      skip: !clubId || !data?.club,
    }
  );

  const [addClubMember] = useMutation(ADD_CLUB_MEMBER);
  const [removeClubMember] = useMutation(REMOVE_CLUB_MEMBER);
  const [deleteClub] = useMutation(DELETE_CLUB);
  const [assignClubBook] = useMutation(ASSIGN_CLUB_BOOK);
  const [rotateClubBook] = useMutation(ROTATE_CLUB_BOOK);
  const [createDiscussionThread] = useMutation(CREATE_DISCUSSION_THREAD);
  const [addReadingCheckpoint] = useMutation(ADD_READING_CHECKPOINT);
  const [updateReadingCheckpoint] = useMutation(UPDATE_READING_CHECKPOINT);
  const [updateClub] = useMutation(UPDATE_CLUB);

  const club = data?.club;
  const threads = threadsData?.clubThreads || [];
  const isOwner = club?.isOwner || false;
  const isModerator = club?.isModerator || false;
  const isMember = club?.isMember || false;
  // Can join if: logged in, not owner, not member, and club is not invite-only (unless already member)
  const canJoin =
    !isOwner && !isMember && Auth.loggedIn() && club?.privacy !== "invite-only";
  const canManage = isOwner || isModerator;

  // Fetch book details for current book
  const [currentBookDetails, setCurrentBookDetails] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (club?.currentBookGoogleId) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${club.currentBookGoogleId}`
          );
          if (response.ok) {
            const bookData = await response.json();
            setCurrentBookDetails({
              title: bookData.volumeInfo?.title || "Unknown",
              author: bookData.volumeInfo?.authors?.[0] || "Unknown",
              coverImage:
                bookData.volumeInfo?.imageLinks?.thumbnail ||
                bookData.volumeInfo?.imageLinks?.smallThumbnail ||
                "",
              description: bookData.volumeInfo?.description || "",
            });
          }
        } catch (error) {
          console.error("Error fetching book details:", error);
        }
      } else {
        setCurrentBookDetails(null);
      }
    };

    fetchBookDetails();
  }, [club?.currentBookGoogleId]);

  const handleJoinClub = async () => {
    if (!userId) {
      alert("Please sign in to join a club.");
      navigate("/");
      return;
    }

    // Check privacy settings
    if (club.privacy === "invite-only") {
      alert(
        "This club is invite-only. You must be invited by a member to join."
      );
      return;
    }

    // For private clubs, we'll allow direct join for now (can add request system later)
    if (club.privacy === "private") {
      if (
        !window.confirm(
          "This is a private club. Would you like to request to join?"
        )
      ) {
        return;
      }
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

  const handleSearchBooks = async (e) => {
    e.preventDefault();
    if (!bookSearchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          bookSearchQuery
        )}&maxResults=10`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(
          data.items?.map((item) => ({
            id: item.id,
            title: item.volumeInfo?.title || "Unknown",
            author: item.volumeInfo?.authors?.[0] || "Unknown",
            coverImage:
              item.volumeInfo?.imageLinks?.thumbnail ||
              item.volumeInfo?.imageLinks?.smallThumbnail ||
              "",
          })) || []
        );
      }
    } catch (error) {
      console.error("Error searching books:", error);
      alert("Error searching for books. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleAssignBook = async (bookGoogleId) => {
    if (!bookGoogleId) return;

    try {
      // First ensure book exists in our database by checking Google Books API
      const bookResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookGoogleId}`
      );
      if (!bookResponse.ok) {
        throw new Error("Book not found");
      }

      // Resolver will find or create book by google_id
      await assignClubBook({
        variables: {
          clubId,
          bookId: club.currentBook?._id || null, // Resolver will find/create by google_id
          bookGoogleId,
          startDate: new Date().toISOString(),
        },
      });
      setShowAssignBookModal(false);
      setBookSearchQuery("");
      setSearchResults([]);
      await refetch();
      await refetchThreads();
    } catch (error) {
      console.error("Error assigning book:", error);
      alert("Error assigning book. Please try again.");
    }
  };

  const handleRotateBook = async () => {
    if (
      !window.confirm(
        "Are you sure you want to move to the next book? This will clear the current book and reading checkpoints."
      )
    ) {
      return;
    }

    try {
      await rotateClubBook({
        variables: {
          clubId,
        },
      });
      await refetch();
      await refetchThreads();
    } catch (error) {
      console.error("Error rotating book:", error);
      alert("Error rotating book. Please try again.");
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!threadForm.title.trim() || !threadForm.content.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!club?.currentBook?._id && !club?.currentBookGoogleId) {
      alert("No book is currently assigned to this club.");
      return;
    }

    try {
      await createDiscussionThread({
        variables: {
          clubId,
          bookId: club.currentBook?._id || null, // Resolver will find/create by google_id
          bookGoogleId: club.currentBookGoogleId,
          title: threadForm.title.trim(),
          content: threadForm.content.trim(),
          threadType: threadForm.threadType,
          chapterRange: threadForm.chapterRange.trim() || null,
        },
      });
      setShowCreateThreadModal(false);
      setThreadForm({
        title: "",
        content: "",
        threadType: "general",
        chapterRange: "",
      });
      await refetchThreads();
    } catch (error) {
      console.error("Error creating thread:", error);
      alert("Error creating thread. Please try again.");
    }
  };

  const handleAddCheckpoint = async (e) => {
    e.preventDefault();
    if (!checkpointForm.title.trim() || !checkpointForm.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addReadingCheckpoint({
        variables: {
          clubId,
          title: checkpointForm.title.trim(),
          date: checkpointForm.date,
          chapters: checkpointForm.chapters.trim() || null,
        },
      });
      setShowCheckpointModal(false);
      setCheckpointForm({ title: "", date: "", chapters: "" });
      await refetch();
    } catch (error) {
      console.error("Error adding checkpoint:", error);
      alert("Error adding checkpoint. Please try again.");
    }
  };

  const handleUpdateCheckpoint = async (index, completed) => {
    try {
      await updateReadingCheckpoint({
        variables: {
          clubId,
          checkpointIndex: index,
          completed,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error updating checkpoint:", error);
      alert("Error updating checkpoint. Please try again.");
    }
  };

  const handleUpdatePrivacy = async (newPrivacy) => {
    if (!isOwner) return;

    try {
      await updateClub({
        variables: {
          clubId,
          privacy: newPrivacy,
        },
      });
      await refetch();
    } catch (error) {
      console.error("Error updating privacy:", error);
      alert("Error updating privacy setting. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-primary1 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg text-primary2 font-semibold">
              Loading club details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-lg text-red-700 font-semibold mb-4">
            Club not found
          </p>
          <button
            onClick={() => navigate("/clubs")}
            className="bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold"
          >
            Back to Clubs
          </button>
        </div>
      </div>
    );
  }

  const totalMembers = club.memberCount || (club.members?.length || 0) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
            {club.description && (
              <p className="text-white/90 mb-3">{club.description}</p>
            )}
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-semibold">
                  {totalMembers} {totalMembers === 1 ? "member" : "members"}
                </span>
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
              <div className="flex items-center gap-2">
                <span className="capitalize">
                  {club.privacy === "public" && "🌐 Public"}
                  {club.privacy === "private" && "🔒 Private"}
                  {club.privacy === "invite-only" && "🔐 Invite-Only"}
                </span>
                {isOwner && (
                  <select
                    value={club.privacy || "public"}
                    onChange={(e) => handleUpdatePrivacy(e.target.value)}
                    className="ml-2 bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="public" className="text-gray-900">
                      Public
                    </option>
                    <option value="private" className="text-gray-900">
                      Private
                    </option>
                    <option value="invite-only" className="text-gray-900">
                      Invite-Only
                    </option>
                  </select>
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Book Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary2">Current Book</h2>
              {canManage && (
                <div className="flex gap-2">
                  {club.currentBookGoogleId && (
                    <button
                      onClick={handleRotateBook}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold text-sm"
                    >
                      Move to Next Book
                    </button>
                  )}
                  <button
                    onClick={() => setShowAssignBookModal(true)}
                    className="bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold text-sm"
                  >
                    {club.currentBookGoogleId ? "Change Book" : "Assign Book"}
                  </button>
                </div>
              )}
            </div>

            {club.currentBookGoogleId && currentBookDetails ? (
              <div className="flex gap-6">
                {currentBookDetails.coverImage && (
                  <img
                    src={currentBookDetails.coverImage}
                    alt={currentBookDetails.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                    onClick={() =>
                      navigate(`/books/${club.currentBookGoogleId}`)
                    }
                  />
                )}
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold text-primary2 mb-2 cursor-pointer hover:text-primary1 transition"
                    onClick={() =>
                      navigate(`/books/${club.currentBookGoogleId}`)
                    }
                  >
                    {currentBookDetails.title}
                  </h3>
                  <p className="text-primary1 font-semibold mb-3">
                    {currentBookDetails.author}
                  </p>
                  {club.currentBookStartDate && (
                    <p className="text-sm text-gray-600 mb-3">
                      Started:{" "}
                      {new Date(club.currentBookStartDate).toLocaleDateString()}
                    </p>
                  )}
                  {currentBookDetails.description && (
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {currentBookDetails.description.replace(/<[^>]*>/g, "")}
                    </p>
                  )}
                </div>
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
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-gray-600 font-medium mb-2">
                  No book assigned yet
                </p>
                {canManage && (
                  <button
                    onClick={() => setShowAssignBookModal(true)}
                    className="bg-primary1 text-white px-6 py-2 rounded-lg hover:bg-accent transition font-semibold mt-2"
                  >
                    Assign a Book
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reading Checkpoints */}
          {club.currentBookGoogleId && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary2">
                  Reading Schedule
                </h2>
                {canManage && (
                  <button
                    onClick={() => setShowCheckpointModal(true)}
                    className="bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold text-sm"
                  >
                    Add Checkpoint
                  </button>
                )}
              </div>

              {club.readingCheckpoints && club.readingCheckpoints.length > 0 ? (
                <div className="space-y-3">
                  {club.readingCheckpoints.map((checkpoint, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                        checkpoint.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary2 mb-1">
                          {checkpoint.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {checkpoint.date && (
                            <span>
                              Due:{" "}
                              {new Date(checkpoint.date).toLocaleDateString()}
                            </span>
                          )}
                          {checkpoint.chapters && (
                            <span>Chapters: {checkpoint.chapters}</span>
                          )}
                        </div>
                      </div>
                      {isMember && (
                        <button
                          onClick={() =>
                            handleUpdateCheckpoint(index, !checkpoint.completed)
                          }
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            checkpoint.completed
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {checkpoint.completed ? "Completed" : "Mark Complete"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No reading checkpoints set yet.
                </p>
              )}
            </div>
          )}

          {/* Discussion Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary2">
                Discussion Feed
              </h2>
              {isMember && club.currentBookGoogleId && (
                <button
                  onClick={() => setShowCreateThreadModal(true)}
                  className="bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold text-sm"
                >
                  New Thread
                </button>
              )}
            </div>

            {threads.length > 0 ? (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <DiscussionThread
                    key={thread._id}
                    thread={thread}
                    userId={userId}
                    isOwner={isOwner}
                    isModerator={isModerator}
                    refetch={refetchThreads}
                  />
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
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-600 font-medium mb-2">
                  No discussions yet
                </p>
                {isMember && club.currentBookGoogleId && (
                  <button
                    onClick={() => setShowCreateThreadModal(true)}
                    className="bg-primary1 text-white px-6 py-2 rounded-lg hover:bg-accent transition font-semibold mt-2"
                  >
                    Start a Discussion
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-primary2">
                {totalMembers}
              </div>
              <div className="text-xs text-gray-600 mt-1">Members</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-primary2">
                {threads.length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Threads</div>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary2 mb-4">Members</h3>

            {/* Owner */}
            <div
              className="mb-4 pb-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition"
              onClick={() => navigate(`/profile/${club.owner?._id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary1 text-white flex items-center justify-center font-bold">
                  {club.owner?.username?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary2">
                    {club.owner?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-600">Owner</p>
                </div>
              </div>
            </div>

            {/* Moderators */}
            {club.moderators && club.moderators.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                  Moderators
                </h4>
                <div className="space-y-2">
                  {club.moderators.map((moderator) => (
                    <div
                      key={moderator._id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition"
                      onClick={() => navigate(`/profile/${moderator._id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary2 text-white flex items-center justify-center text-sm font-semibold">
                        {moderator.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-primary2">
                          {moderator.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                Members ({club.members?.length || 0})
              </h4>
              {club.members && club.members.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {club.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition"
                      onClick={() => navigate(`/profile/${member._id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                        {member.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-primary2">
                          {member.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No members yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Book Modal */}
      {showAssignBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-primary2">
                  Assign Book to Club
                </h3>
                <button
                  onClick={() => {
                    setShowAssignBookModal(false);
                    setBookSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSearchBooks} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="Search for a book..."
                    className="flex-1 border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-primary1 text-white px-6 py-2 rounded-lg hover:bg-accent transition font-semibold disabled:opacity-50"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      className="flex gap-4 p-3 border border-gray-200 rounded-lg hover:border-primary1 hover:shadow-md transition cursor-pointer"
                      onClick={() => handleAssignBook(book.id)}
                    >
                      {book.coverImage && (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary2">
                          {book.title}
                        </h4>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Thread Modal */}
      {showCreateThreadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-primary2">
                  Create Discussion Thread
                </h3>
                <button
                  onClick={() => {
                    setShowCreateThreadModal(false);
                    setThreadForm({
                      title: "",
                      content: "",
                      threadType: "general",
                      chapterRange: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Thread Title *
                  </label>
                  <input
                    type="text"
                    value={threadForm.title}
                    onChange={(e) =>
                      setThreadForm({ ...threadForm, title: e.target.value })
                    }
                    placeholder="Enter thread title..."
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Thread Type *
                  </label>
                  <select
                    value={threadForm.threadType}
                    onChange={(e) =>
                      setThreadForm({
                        ...threadForm,
                        threadType: e.target.value,
                      })
                    }
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                  >
                    <option value="general">General Discussion</option>
                    <option value="chapter">Chapter Discussion</option>
                    <option value="spoiler-free">Spoiler-Free</option>
                    <option value="spoiler">Spoiler Discussion</option>
                    <option value="qa">Q&A</option>
                    <option value="book-selection">Book Selection</option>
                  </select>
                </div>

                {threadForm.threadType === "chapter" && (
                  <div>
                    <label className="block font-semibold text-primary2 mb-2">
                      Chapter Range (optional)
                    </label>
                    <input
                      type="text"
                      value={threadForm.chapterRange}
                      onChange={(e) =>
                        setThreadForm({
                          ...threadForm,
                          chapterRange: e.target.value,
                        })
                      }
                      placeholder="e.g., Chapters 1-5"
                      className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={threadForm.content}
                    onChange={(e) =>
                      setThreadForm({ ...threadForm, content: e.target.value })
                    }
                    placeholder="Write your discussion post..."
                    rows="8"
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold"
                  >
                    Create Thread
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateThreadModal(false);
                      setThreadForm({
                        title: "",
                        content: "",
                        threadType: "general",
                        chapterRange: "",
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Checkpoint Modal */}
      {showCheckpointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-primary2">
                  Add Reading Checkpoint
                </h3>
                <button
                  onClick={() => {
                    setShowCheckpointModal(false);
                    setCheckpointForm({ title: "", date: "", chapters: "" });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddCheckpoint} className="space-y-4">
                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Checkpoint Title *
                  </label>
                  <input
                    type="text"
                    value={checkpointForm.title}
                    onChange={(e) =>
                      setCheckpointForm({
                        ...checkpointForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g., First Quarter Discussion"
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={checkpointForm.date}
                    onChange={(e) =>
                      setCheckpointForm({
                        ...checkpointForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary2 mb-2">
                    Chapters (optional)
                  </label>
                  <input
                    type="text"
                    value={checkpointForm.chapters}
                    onChange={(e) =>
                      setCheckpointForm({
                        ...checkpointForm,
                        chapters: e.target.value,
                      })
                    }
                    placeholder="e.g., Chapters 1-5"
                    className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold"
                  >
                    Add Checkpoint
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckpointModal(false);
                      setCheckpointForm({ title: "", date: "", chapters: "" });
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetail;
