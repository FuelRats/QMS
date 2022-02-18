import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_SERVER_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_SERVER_DSN,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
    environment: process.env.NEXTJS_ENVIRONMENT,
    // Without this, sentry forces the shutdown, while the default behaviour does not
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onFatalError() {},
  });
}
