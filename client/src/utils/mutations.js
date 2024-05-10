import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                _id
                username
            }
        }
    }`

export const ADD_USER = gql`
mutation Mutation($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        email
        username
      }
    }
  }`

// export const ADD_BOOK = gql`
// `

// export const ADD_BOOK_STATUS = gql`
// `

// export const ADD_REVIEW = gql`
// `

// export const ADD_CLUB = gql`
// `

// export const DELETE_REVIEW = gql`
// `

// export const DELETE_CLUB = gql`
// `

// export const REMOVE_USER_BOOK = gql`
// `