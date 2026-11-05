import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "./schema";
import systems from "./SystemsResolver";
import queueClient from "./QueueClientMutation";
import queuedClient from "./QueuedClientResolver";
import queuedClients from "./QueuedClientsResolver";
import * as Sentry from "@sentry/nextjs";
import { ApolloError } from "@apollo/client";

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

const plugins = [];
if (process.env.SENTRY_SERVER_DSN) {
  plugins.push({
    async requestDidStart() {
      return {
        async didEncounterErrors(ctx) {
          // If we couldn't parse the operation, don't
          // do anything here
          if (!ctx.operation) {
            return;
          }

          for (const err of ctx.errors) {
            // Only report internal server errors,
            // all errors extending ApolloError should be user-facing
            if (err instanceof ApolloError) {
              continue;
            }

            // Add scoped report details and send to Sentry
            Sentry.withScope((scope) => {
              // Annotate whether failing operation was query/mutation/subscription
              scope.setTag("kind", ctx.operation.operation);

              // Log query and variables as extras (make sure to strip out sensitive data!)
              scope.setExtra("query", ctx.request.query);
              scope.setExtra("variables", ctx.request.variables);

              if (err.path) {
                // We can also add the path as breadcrumb
                scope.addBreadcrumb({
                  category: "query-path",
                  message: err.path.join(" > "),
                  level: "debug",
                });
              }

              Sentry.captureException(err);
            });
          }
        },
      };
    },
  });
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins,
  // Error responses carry only message, locations, path and extensions.code:
  // resolver errors wrap axios errors whose request config holds the
  // backend's bearer token.
  includeStacktraceInErrorResponses: false,
});

export default Sentry.wrapApiHandlerWithSentry(
  startServerAndCreateNextHandler(apolloServer),
  "/api/graphql"
);
