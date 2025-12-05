import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_THREAD_REPLY, DELETE_THREAD_REPLY, PIN_THREAD, UNPIN_THREAD, LOCK_THREAD, UNLOCK_THREAD, DELETE_THREAD } from "../utils/mutations.js";
import Auth from "../utils/auth.js";
import { useNavigate } from "react-router-dom";

const DiscussionThread = ({ thread, userId, isOwner, isModerator, refetch }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();

  const [addThreadReply] = useMutation(ADD_THREAD_REPLY);
  const [deleteThreadReply] = useMutation(DELETE_THREAD_REPLY);
  const [pinThread] = useMutation(PIN_THREAD);
  const [unpinThread] = useMutation(UNPIN_THREAD);
  const [lockThread] = useMutation(LOCK_THREAD);
  const [unlockThread] = useMutation(UNLOCK_THREAD);
  const [deleteThread] = useMutation(DELETE_THREAD);

  const isThreadAuthor = thread.author?._id === userId;
  const canModerate = isOwner || isModerator;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await addThreadReply({
        variables: {
          threadId: thread._id,
          userId,
          text: replyText.trim(),
        },
      });
      setReplyText("");
      setShowReplyForm(false);
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Error adding reply. Please try again.");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      await deleteThreadReply({
        variables: {
          threadId: thread._id,
          replyId,
        },
      });
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("Error deleting reply. Please try again.");
    }
  };

  const handlePinToggle = async () => {
    try {
      if (thread.isPinned) {
        await unpinThread({ variables: { threadId: thread._id } });
      } else {
        await pinThread({ variables: { threadId: thread._id } });
      }
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("Error updating thread. Please try again.");
    }
  };

  const handleLockToggle = async () => {
    try {
      if (thread.isLocked) {
        await unlockThread({ variables: { threadId: thread._id } });
      } else {
        await lockThread({ variables: { threadId: thread._id } });
      }
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert("Error updating thread. Please try again.");
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm("Are you sure you want to delete this thread?")) {
      return;
    }

    try {
      await deleteThread({ variables: { threadId: thread._id } });
      if (refetch) await refetch();
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Error deleting thread. Please try again.");
    }
  };

  const getThreadTypeLabel = (type) => {
    const labels = {
      general: "General Discussion",
      chapter: "Chapter Discussion",
      "spoiler-free": "Spoiler-Free",
      spoiler: "Spoiler Discussion",
      qa: "Q&A",
      "book-selection": "Book Selection",
    };
    return labels[type] || type;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${thread.isPinned ? "border-l-4 border-yellow-400" : ""}`}>
      {/* Thread Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {thread.isPinned && (
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            )}
            <h3 className="text-xl font-bold text-primary2">{thread.title}</h3>
            <span className="px-2 py-1 bg-primary1/10 text-primary1 rounded text-xs font-semibold">
              {getThreadTypeLabel(thread.threadType)}
            </span>
            {thread.chapterRange && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {thread.chapterRange}
              </span>
            )}
            {thread.isLocked && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                Locked
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <button
              onClick={() => navigate(`/profile/${thread.author?._id}`)}
              className="font-semibold text-primary2 hover:text-primary1 transition"
            >
              {thread.author?.username || "Anonymous"}
            </button>
            <span>•</span>
            <span>{formatDate(thread.createdAt)}</span>
            {thread.updatedAt !== thread.createdAt && (
              <>
                <span>•</span>
                <span className="text-gray-500">edited {formatDate(thread.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
        {canModerate && (
          <div className="flex gap-2">
            <button
              onClick={handlePinToggle}
              className="p-2 text-gray-600 hover:text-yellow-600 transition"
              title={thread.isPinned ? "Unpin thread" : "Pin thread"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
            <button
              onClick={handleLockToggle}
              className="p-2 text-gray-600 hover:text-red-600 transition"
              title={thread.isLocked ? "Unlock thread" : "Lock thread"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={thread.isLocked ? "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"}
                />
              </svg>
            </button>
            {(isThreadAuthor || canModerate) && (
              <button
                onClick={handleDeleteThread}
                className="p-2 text-gray-600 hover:text-red-600 transition"
                title="Delete thread"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thread Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {thread.content}
        </p>
      </div>

      {/* Replies Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-primary2">
            {thread.replyCount || 0} {thread.replyCount === 1 ? "Reply" : "Replies"}
          </h4>
          {!thread.isLocked && Auth.loggedIn() && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-primary1 hover:text-primary2 font-semibold transition"
            >
              {showReplyForm ? "Cancel" : "Reply"}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && !thread.isLocked && (
          <form onSubmit={handleAddReply} className="mb-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows="3"
              className="w-full border-2 border-primary1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1 mb-2"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary1 text-white px-4 py-2 rounded-lg hover:bg-accent transition font-semibold"
              >
                Post Reply
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Replies List */}
        {thread.replies && thread.replies.length > 0 && (
          <div className="space-y-3">
            {thread.replies.map((reply) => {
              const isReplyAuthor = reply.user?._id === userId;
              const canDelete = isReplyAuthor || isThreadAuthor || canModerate;

              return (
                <div key={reply._id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/profile/${reply.user?._id}`)}
                        className="font-semibold text-primary2 hover:text-primary1 transition text-sm"
                      >
                        {reply.user?.username || "Anonymous"}
                      </button>
                      <span className="text-xs text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteReply(reply._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {reply.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {(!thread.replies || thread.replies.length === 0) && (
          <p className="text-gray-500 text-sm text-center py-4">
            No replies yet. Be the first to reply!
          </p>
        )}
      </div>
    </div>
  );
};

export default DiscussionThread;

