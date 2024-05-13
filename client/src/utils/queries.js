import { gql } from "@apollo/client";

export const QUERY_USERS = gql`
query Query {
  users {
    _id
    books {
      book {
        _id
        google_id
      }
    }
    clubs {
      name
    }
    email
    reviews {
      _id
    }
    username
  }
}
`

export const QUERY_USER = gql`
query Query($userId: ID!) {
  user(id: $userId) {
    _id
    username
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
      title
      description
    }
    bio
    location
    favBook
    favAuthor
  }
}
`

export const QUERY_BOOKS = gql`
query Books {
    books {
      _id
      google_id
      reviews {
        _id
        book {
          _id
        }
        description
        stars
        title
      }
    }
  }
`

export const QUERY_BOOKGOOGLE = gql`
query Query($googleId: String) {
  bookGoogle(googleId: $googleId) {
    _id
    reviews {
      _id
      description
      stars
      title
      user {
        username
        _id
      }
    }
  }
}
`

export const QUERY_REVIEWS = gql`
query Reviews {
    reviews {
      _id
      book {
        _id
        google_id
      }
      description
      stars
      title
    }
  }
`

export const QUERY_CLUBS = gql`
query Clubs {
    clubs {
      _id
      members {
        _id
        username
      }
      name
      owner {
        _id
        username
      }
    }
  }
`