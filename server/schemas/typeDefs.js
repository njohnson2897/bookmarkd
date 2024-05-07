const typeDefs = `
type User {
    _id: ID!
    username: String!
}

type Query {
    users: [User]
}
`;

module.exports = typeDefs;