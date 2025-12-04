import { gql } from "@apollo/client";

export const QUERY_USERS = gql`
  query Users {
    users {
      _id
      username
      email
      followerCount
      followingCount
      isFollowing
      books {
        book {
          _id
          google_id
        }
      }
      clubs {
        _id
        name
      }
      reviews {
        _id
      }
    }
  }
`;

export const QUERY_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      _id
      username
      email
      bio
      location
      favBook
      favAuthor
      followerCount
      followingCount
      isFollowing
      books {
        book {
          _id
          google_id
        }
        status
        favorite
      }
      clubs {
        _id
        name
        owner {
          _id
          username
        }
      }
      reviews {
        _id
        title
        description
        stars
        likeCount
        commentCount
        book {
          _id
          google_id
        }
      }
    }
  }
`;

export const QUERY_BOOKS = gql`
  query Books {
    books {
      _id
      google_id
      reviews {
        _id
        stars
        title
        description
        user {
          _id
          username
        }
      }
    }
  }
`;

export const QUERY_BOOKGOOGLE = gql`
  query BookGoogle($googleId: String!) {
    bookGoogle(googleId: $googleId) {
      _id
      google_id
      reviews {
        _id
        description
        stars
        title
        likeCount
        commentCount
        isLiked
        user {
          _id
          username
        }
        comments {
          _id
          user {
            _id
            username
          }
          text
          createdAt
        }
      }
    }
  }
`;

export const QUERY_REVIEWS = gql`
  query Reviews {
    reviews {
      _id
      book {
        _id
        google_id
      }
      user {
        _id
        username
      }
      description
      stars
      title
      likeCount
      commentCount
      isLiked
      comments {
        _id
        user {
          _id
          username
        }
        text
        createdAt
      }
    }
  }
`;

export const QUERY_CLUBS = gql`
  query Clubs {
    clubs {
      _id
      name
      owner {
        _id
        username
      }
      members {
        _id
        username
      }
    }
  }
`;

export const QUERY_CLUB = gql`
  query Club($id: ID!) {
    club(id: $id) {
      _id
      name
      owner {
        _id
        username
      }
      members {
        _id
        username
      }
    }
  }
`;

export const QUERY_ACTIVITY_FEED = gql`
  query ActivityFeed($userId: ID!) {
    activityFeed(userId: $userId) {
      _id
      type
      user {
        _id
        username
      }
      review {
        _id
        stars
        title
        book {
          _id
          google_id
        }
      }
      book {
        _id
        google_id
      }
      createdAt
    }
  }
`;

export const QUERY_NOTIFICATIONS = gql`
  query Notifications($userId: ID!) {
    notifications(userId: $userId) {
      _id
      type
      read
      fromUser {
        _id
        username
      }
      review {
        _id
        title
        book {
          _id
          google_id
        }
      }
      comment {
        _id
        text
      }
      createdAt
    }
  }
`;

export const QUERY_UNREAD_NOTIFICATION_COUNT = gql`
  query UnreadNotificationCount($userId: ID!) {
    unreadNotificationCount(userId: $userId)
  }
`;


