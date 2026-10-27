# 🌦 Weather App

A responsive weather app built with React 19, Vite, and the Open-Meteo API. Search
for cities and view current temperature, windspeed, humidity, conditions, and
recent searches.

## Features

- Search for cities and fetch live weather data from Open-Meteo.
- View temperature in Celsius and Fahrenheit, windspeed and direction, humidity,
  and weather conditions.
- See recent searches, loading feedback, and errors for invalid cities or
  network issues.

## New Relic Browser monitoring

Production Browser-agent settings are read at build time from the GitHub
`production` Environment. The `deploy.yml` workflow maps its variables to Vite's
`VITE_` variables before building. Configure `NEW_RELIC_ACCOUNT_ID`,
`NEW_RELIC_APP_ID`, `NEW_RELIC_REGION` (`US` or `EU`), and
`NEW_RELIC_BROWSER_LICENSE_KEY` there. If `NEW_RELIC_AGENT_ID` is not set, the
workflow uses the app ID, matching the current New Relic snippet.

The Browser license key is included in the client bundle. Never expose the New
Relic User API key in frontend code; it remains a GitHub Environment secret for
the source-map upload step. The workflow uploads source maps using the deployed
asset URLs, then removes `.map` files from the public Vercel output. Vercel
deployment also requires the `VERCEL_TOKEN` secret and `VERCEL_ORG_ID` and
`VERCEL_PROJECT_ID` variables in the `production` Environment. Disable Vercel's
automatic Git deployments to avoid deploying the same push twice.

To send one deliberate Browser error after deployment, open the app with
`?newRelicTest=1` in the URL and click **Send one test error to New Relic**.
The button disables after submitting and tags the error with `testError: true`.

## Commands

- `npm install` installs dependencies.
- `npm start` or `npm run dev` starts the Vite development server.
- `npm test` runs tests once; `npm run test:watch` starts Vitest in watch mode.
- `npm run build` creates the production build in `dist`.
- `npm run preview` serves the production build locally.

## Stack

- React 19
- Vite
- Open-Meteo Geocoding and Weather APIs
- Custom CSS
