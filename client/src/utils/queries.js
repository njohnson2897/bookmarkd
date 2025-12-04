import { gql } from "@apollo/client";

export const QUERY_USERS = gql`
  query Users {
    users {
      _id
      username
      email
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
        user {
          _id
          username
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


