import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "./schema";
import systems from "./SystemsResolver";
import queueClient from "./QueueClientMutation";
import queuedClient from "./QueuedClientResolver";

const resolvers = {
  Query: {
    systems,
    queuedClient,
  },
  Mutation: {
    queueClient,
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
