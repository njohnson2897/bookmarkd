import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        email
        username
      }
    }
  }
`;

export const ADD_BOOK = gql`
  mutation AddBook($googleId: String!) {
    addBook(google_id: $googleId) {
      _id
      google_id
    }
  }
`;

export const ADD_BOOK_STATUS = gql`
  mutation AddBookStatus($book: ID!, $user: ID!, $status: String!, $favorite: Boolean!) {
    addBookStatus(book: $book, user: $user, status: $status, favorite: $favorite) {
      _id
      username
      books {
        book {
          _id
          google_id
        }
        status
        favorite
      }
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation AddReview($book: ID!, $user: ID!, $stars: Float!, $title: String, $description: String) {
    addReview(book: $book, user: $user, stars: $stars, title: $title, description: $description) {
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

export const ADD_CLUB = gql`
  mutation AddClub($name: String!, $owner: ID!) {
    addClub(name: $name, owner: $owner) {
      _id
      name
      owner {
        _id
        username
      }
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId) {
      _id
      book {
        _id
        google_id
      }
    }
  }
`;

export const DELETE_CLUB = gql`
  mutation DeleteClub($clubId: ID!) {
    deleteClub(clubId: $clubId) {
      _id
      name
      owner {
        _id
        username
      }
    }
  }
`;

export const REMOVE_USER_BOOK = gql`
  mutation RemoveUserBook($bookId: ID!, $userId: ID!) {
    removeUserBook(bookId: $bookId, userId: $userId) {
      _id
      books {
        book {
          _id
          google_id
        }
        status
        favorite
      }
      username
    }
  }
`;

export const EDIT_USER_BOOK_FAVORITE = gql`
  mutation EditUserBookFavorite($bookId: ID!, $userId: ID!, $favorite: Boolean!) {
    editUserBookFavorite(bookId: $bookId, userId: $userId, favorite: $favorite) {
      _id
      books {
        book {
          _id
          google_id
        }
        favorite
        status
      }
      username
    }
  }
`;

export const EDIT_USER_BOOK_STATUS = gql`
  mutation EditUserBookStatus($bookId: ID!, $userId: ID!, $status: String!) {
    editUserBookStatus(bookId: $bookId, userId: $userId, status: $status) {
      _id
      books {
        book {
          _id
          google_id
        }
        favorite
        status
      }
      username
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $bio: String, $location: String, $favBook: String, $favAuthor: String) {
    updateUser(id: $id, bio: $bio, location: $location, favBook: $favBook, favAuthor: $favAuthor) {
      _id
      username
      bio
      location
      favBook
      favAuthor
    }
  }
`;


