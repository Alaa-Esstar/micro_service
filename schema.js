const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Reunion {
    id: ID!
    sujet: String!
    location: String!
    date: String!
    user_ids: [ID!]!
  }

  type Query {
    getUser(id: ID!): User
    getReunion(id: ID!): Reunion
    getUsers: [User]
    getReunions: [Reunion]
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): DeleteUserResponse
    createReunion(sujet: String!, location: String!, date: String!, user_ids: [ID!]!): Reunion
    updateReunion(id: ID!, sujet: String, location: String, date: String, user_ids: [ID!]): Reunion
    deleteReunion(id: ID!): DeleteReunionResponse
  }

  type DeleteUserResponse {
    success: Boolean!
    message: String!
  }

  type DeleteReunionResponse {
    success: Boolean!
    message: String!
  }
`;

module.exports = typeDefs;
