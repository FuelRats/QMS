import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "./schema";
import systems from "./SystemsResolver";
import queueClient from "./QueueClientMutation";
import queuedClient from "./QueuedClientResolver";
import queuedClients from "./QueuedClientsResolver";

const resolvers = {
  Query: {
    systems,
    queuedClient,
    queuedClients,
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
