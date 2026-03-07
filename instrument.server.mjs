import * as Sentry from "@sentry/react-router";
Sentry.init({
  dsn: "https://0cc1a2607f9629f6100c29205c5c017b@o4510963689062400.ingest.us.sentry.io/4510963804798976",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
