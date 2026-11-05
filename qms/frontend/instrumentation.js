import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

// Captures errors thrown in API routes and getServerSideProps.
export const onRequestError = Sentry.captureRequestError;
