import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_CLIENT_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_CLIENT_DSN,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
    environment: process.env.NEXTJS_ENVIRONMENT,
  });
}
