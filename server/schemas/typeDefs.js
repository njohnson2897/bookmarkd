const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    bio: String
    location: String
    favAuthor: String
    favBook: String
    books: [BookStatus]
    reviews: [Review]
    clubs: [Club]
  }

  type Book {
    _id: ID!
    google_id: String!
    reviews: [Review]
  }

  type BookStatus {
    book: Book
    status: String!
    favorite: Boolean!
  }

  type Auth {
    token: ID!
    user: User
  }

  type Review {
    _id: ID!
    book: Book!
    user: User!
    stars: Float!
    title: String
    description: String
  }

  type Club {
    _id: ID!
    name: String!
    owner: User!
    members: [User]
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    books: [Book!]
    book(id: ID!): Book
    bookGoogle(googleId: String!): Book
    reviews: [Review!]
    review(id: ID!): Review
    clubs: [Club!]
    club(id: ID!): Club
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    updateUser(id: ID!, bio: String, location: String, favBook: String, favAuthor: String): User
    addBook(google_id: String!): Book
    addBookStatus(book: ID!, user: ID!, status: String!, favorite: Boolean!): User
    addReview(book: ID!, user: ID!, stars: Float!, title: String, description: String): Review
    addClub(name: String!, owner: ID!): Club
    addClubMember(clubId: ID!, userId: ID!): Club
    removeClubMember(clubId: ID!, userId: ID!): Club
    deleteReview(reviewId: ID!): Review
    deleteClub(clubId: ID!): Club
    removeUserBook(bookId: ID!, userId: ID!): User
    editUserBookStatus(bookId: ID!, userId: ID!, status: String!): User
    editUserBookFavorite(bookId: ID!, userId: ID!, favorite: Boolean!): User
    login(email: String!, password: String!): Auth
  }
`;

export default typeDefs;


