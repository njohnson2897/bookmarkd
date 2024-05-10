const typeDefs = `
type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
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
    book: Book!
    status: String
    favorite: Boolean
}

type Auth {
    token: ID!
    user: User
}

type Review {
    _id: ID!
    book: Book!
    user: User!
    stars: Int!
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
    user(id: ID!): User!
    userByName(name: String!): User!
    books: [Book!]
    reviews: [Review!]
    clubs: [Club!]
}

type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    addBook(google_id: String!): Book
    addBookStatus(book: ID!, user: ID!, status: String!, favorite: Boolean!): User
    addReview(book: ID!, user: ID!, stars: Int!, title: String, description: String): Review
    addClub(name: String!, owner: ID!): Club
    deleteReview(reviewId: ID!): Review
    deleteClub(clubId: ID!): Club
    removeUserBook(bookId: ID!, userId: ID!): User
    login(email: String!, password: String!): Auth
}
`;

module.exports = typeDefs;