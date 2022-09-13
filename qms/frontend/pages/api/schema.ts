import { gql } from "@apollo/client/core";

export const typeDefs = gql`
  type Query {
    systems(filter: SystemsFilterInput!): [System]!
    queuedClient(uuid: String!): QueuedClient!
    queuedClients(filter: QueuedClientsFilter!): [QueuedClient]!
  }

  type Mutation {
    queueClient(input: QueueClientInput): QueuedClient
  }

  input QueuedClientsFilter {
    cmdr: String
  }

  input SystemsFilterInput {
    search: String!
  }

  type System {
    name: String
  }

  enum Platform {
    PC
    PS4
    XB
  }

  enum Version {
    HORIZONS3
    HORIZONS4
    ODYSSEY
  }

  input QueueClientInput {
    cmdr: String!
    system: String!
    platform: Platform!
    locale: String!
    codeRed: Boolean!
    version: Version
  }

  type QueuedClient {
    message: String!
    arrivalTime: String!
    pending: Boolean!
    uuid: String!
    platform: Platform!
    inProgress: Boolean!
    locale: String!
    codeRed: Boolean!
    system: String!
    cmdr: String!
    version: Version
    position: Int!
  }
`;
