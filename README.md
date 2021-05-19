Chia-Dashboard-UI
======

The UI powering https://dashboard.chia.foxypool.io. No support for users self-hosting, you are on your own.

### Self-Hosting

#### Requirements

- nodejs >= 12
- at least one oauth provider
- a web server or hosting service (gh-pages, cloudflare-pages, vercel, etc)

#### Setup

The following is a non-exhaustive list of things that need to be done to self-host the chia dashboard ui

- Setup nodejs
- Adjust the [config.ts](src/app/config.ts):
  - Set the oauth client ids you want to use, set the ones you don't want to use to a falsy value.
  - Adjust the `apiBaseUrl` to your dashboard core url.
- Build the ui via `yarn run build`
- Host the result (in `dist`) on your webserver or hosting service. Depending on your choice you might need to setup a catch-all redirect to index.html at the end of your webserver config to allow the SPA to function correctly when calling urls with client side routes.
