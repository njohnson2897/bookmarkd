import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  QUERY_NOTIFICATIONS,
  QUERY_UNREAD_NOTIFICATION_COUNT,
} from "../utils/queries.js";
import {
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  DELETE_NOTIFICATION,
} from "../utils/mutations.js";
import Auth from "../utils/auth.js";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userId = Auth.loggedIn() ? Auth.getProfile()?.data?._id : null;

  const { data: notificationsData, refetch: refetchNotifications } = useQuery(
    QUERY_NOTIFICATIONS,
    {
      variables: { userId },
      skip: !userId,
      pollInterval: 30000, // Poll every 30 seconds
    }
  );

  const { data: countData, refetch: refetchCount } = useQuery(
    QUERY_UNREAD_NOTIFICATION_COUNT,
    {
      variables: { userId },
      skip: !userId,
      pollInterval: 30000,
    }
  );

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = notificationsData?.notifications || [];
  const unreadCount = countData?.unreadNotificationCount || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await markAsRead({
          variables: { notificationId: notification._id },
        });
        await refetchNotifications();
        await refetchCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate based on notification type
    if (notification.club?._id) {
      // Club-related notifications
      if (notification.discussionThread?._id) {
        // Navigate to club detail page (threads are shown there)
        navigate(`/clubs/${notification.club._id}`);
      } else {
        // Navigate to club detail page
        navigate(`/clubs/${notification.club._id}`);
      }
    } else if (notification.review?.book?.google_id) {
      navigate(`/books/${notification.review.book.google_id}`);
    } else if (notification.fromUser?._id) {
      navigate(`/profile/${notification.fromUser._id}`);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({
        variables: { userId },
      });
      await refetchNotifications();
      await refetchCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification({
        variables: { notificationId },
      });
      await refetchNotifications();
      await refetchCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationText = (notification) => {
    const username = notification.fromUser?.username || "Someone";
    const clubName = notification.club?.name || "a club";
    
    switch (notification.type) {
      case "like":
        return `${username} liked your review`;
      case "comment":
        return `${username} commented on your review`;
      case "follow":
        return `${username} started following you`;
      case "review":
        return `${username} posted a new review`;
      case "book_assigned":
        return `${username} assigned a new book to ${clubName}`;
      case "book_rotated":
        return `${username} rotated to a new book in ${clubName}`;
      case "thread_created":
        return `${username} created a discussion thread in ${clubName}`;
      case "thread_reply":
        return `${username} replied to your discussion thread`;
      case "checkpoint_added":
        return `${username} added a reading checkpoint to ${clubName}`;
      default:
        return "New notification";
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!Auth.loggedIn()) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-primary1 transition"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-primary2">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary1 hover:text-primary2 transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getNotificationText(notification)}
                      </p>
                      {notification.comment?.text && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          "{notification.comment.text}"
                        </p>
                      )}
                      {notification.discussionThread?.title && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          Thread: {notification.discussionThread.title}
                        </p>
                      )}
                      {notification.club && !notification.discussionThread && (
                        <p className="text-xs text-primary1 mt-1">
                          {notification.club.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                      )}
                      <button
                        onClick={(e) =>
                          handleDeleteNotification(e, notification._id)
                        }
                        className="text-gray-400 hover:text-red-500 transition text-xs"
                        aria-label="Delete notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
