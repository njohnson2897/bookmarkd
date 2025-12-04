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
    followers: [User]
    following: [User]
    followerCount: Int
    followingCount: Int
    isFollowing: Boolean
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
    likes: [Like]
    comments: [Comment]
    likeCount: Int
    commentCount: Int
    isLiked: Boolean
    createdAt: String
  }

  type Club {
    _id: ID!
    name: String!
    owner: User!
    members: [User]
  }

  type Contact {
    _id: ID!
    name: String!
    email: String!
    message: String!
    createdAt: String!
  }

  type Like {
    _id: ID!
    user: User!
    review: Review!
    createdAt: String!
  }

  type Comment {
    _id: ID!
    user: User!
    review: Review!
    text: String!
    createdAt: String!
  }

  type Activity {
    _id: ID!
    type: String!
    user: User!
    review: Review
    book: Book
    club: Club
    createdAt: String!
  }

  type Notification {
    _id: ID!
    user: User!
    type: String!
    fromUser: User!
    review: Review
    comment: Comment
    read: Boolean!
    createdAt: String!
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
    activityFeed(userId: ID!): [Activity]
    notifications(userId: ID!): [Notification]
    unreadNotificationCount(userId: ID!): Int
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
    updateReview(reviewId: ID!, stars: Float, title: String, description: String): Review
    deleteReview(reviewId: ID!): Review
    deleteClub(clubId: ID!): Club
    removeUserBook(bookId: ID!, userId: ID!): User
    editUserBookStatus(bookId: ID!, userId: ID!, status: String!): User
    editUserBookFavorite(bookId: ID!, userId: ID!, favorite: Boolean!): User
    login(email: String!, password: String!): Auth
    submitContact(name: String!, email: String!, message: String!): Contact
    likeReview(reviewId: ID!, userId: ID!): Review
    unlikeReview(reviewId: ID!, userId: ID!): Review
    addComment(reviewId: ID!, userId: ID!, text: String!): Comment
    deleteComment(commentId: ID!): Comment
    followUser(followerId: ID!, followingId: ID!): User
    unfollowUser(followerId: ID!, followingId: ID!): User
    markNotificationAsRead(notificationId: ID!): Notification
    markAllNotificationsAsRead(userId: ID!): Boolean
    deleteNotification(notificationId: ID!): Notification
  }
`;

export default typeDefs;


