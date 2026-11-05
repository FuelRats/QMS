const { i18n } = require("./next-i18next.config");
const { withSentryConfig } = require("@sentry/nextjs/config");
const moduleExports = {
  i18n,
  output: "standalone",
  // Bundle the MUI SSR helpers with the server code. Loaded as an external
  // package they get Node's own copy of @emotion/react, so AppCacheProvider's
  // cache never reaches the bundled MUI components and their styles end up
  // inline in <body> instead of in <head>.
  transpilePackages: ["@mui/material-nextjs"],
  compiler: {
    // Apollo Client 3.8+ runs its development-only checks and logging unless
    // globalThis.__DEV__ is false.
    define: {
      "globalThis.__DEV__": process.env.NODE_ENV !== "production",
    },
  },
};

// Runtime error reporting is configured in instrumentation.js and
// instrumentation-client.js. The build never talks to Sentry: no source map
// upload, no release creation and no build telemetry, so SENTRY_AUTH_TOKEN is
// not needed (and is ignored if set).
const SentryBuildOptions = {
  silent: true,
  telemetry: false,
  sourcemaps: {
    disable: true,
  },
  release: {
    create: false,
    finalize: false,
  },
};

module.exports = withSentryConfig(moduleExports, SentryBuildOptions);
