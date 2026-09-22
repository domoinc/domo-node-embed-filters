<div align="center">
  <img src="https://github.com/domoinc/domo-node-sdk/blob/master/domo.png?raw=true" width="400" height="400" alt="Domo Logo"/>
</div>

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://www.opensource.org/licenses/MIT)

# NodeJS - Private Embed with Programmatic Filtering Example Code

This repository provides an example implementation of a Node.js Express server for embedding Domo dashboards or cards with programmatic filtering. It demonstrates how to securely generate embed tokens and configure private embeds, enabling tailored data views for different users or scenarios. This project is ideal for developers integrating Domo Everywhere into their applications.

## Features

- **Private Embedding**: Securely embed Domo dashboards or cards into your application.
- **Programmatic Filtering**: Dynamically filter data based on user roles or other criteria.
- **Express Server**: Example implementation using Node.js and Express.
- **Domo Everywhere Integration**: Demonstrates how to integrate with Domo's Identity Broker for routing and authentication.

## Setup

Follow these steps to set up the project:

1. **Install Node.js**: Download and install Node.js from [Node.js Downloads](https://nodejs.org/en/download/).

2. **Install Yarn**: Install Yarn by following the instructions at [Yarn Installation Guide](https://yarnpkg.com/en/docs/install). Alternatively, you can use `npm` if Yarn is not available.

3. **Prepare Your Domo Dashboard or Card**: Locate or create the dashboard or card you want to embed in Domo. Use the 'Private' Embed option to generate the embed link.

4. **Install Dependencies**: In the base folder of the repository, run the following command to install the necessary dependencies:

   ```bash
   yarn install
   ```

   If you prefer `npm`, use:

   ```bash
   npm install
   ```

5. **Configure Environment Variables**: Create or modify the `.env` file in the base folder of the project. A sample `.env.example` file is provided in the repository. Copy this file, rename it to `.env`, and update the values with your environment-specific configuration. The `.env` file is excluded from version control to prevent accidental exposure of sensitive credentials.

   Update the following configuration settings with your own values:

   ```env
   CLIENT_ID=YOUR_CLIENT_ID
   CLIENT_SECRET=YOUR_CLIENT_SECRET
   EMBED_ID=YOUR_EMBED_ID
   # dashboard | page | card (card embed v2) | card-v1 (legacy)
   EMBED_TYPE=dashboard

   # Optional settings
   USE_XHR=true
   REPLACE_IFRAME=true
   EMBED_ID{X}=YOUR_EMBED_ID

   # Optional settings for Domo Everywhere edit experience
   IDP_URL=https://YOUR_IDP_URL.domo.com
   JWT_SECRET=YOUR_JWT_SECRET
   KEY_ATTRIBUTE=keyAttributeName
   MAPPING_VALUE=XXXXXXXXXXXXXX
   ```

   For more information about creating the `CLIENT_ID` and `CLIENT_SECRET`, see the [Domo Developer Authentication Guide](https://developer.domo.com/docs/authentication/overview-4).

### Configuration Details

To set up the application, you need to configure the following settings in a `.env` file:

#### Required Settings

- **CLIENT_ID**: The client ID generated in your Domo developer account. This is used to authenticate API requests and must be kept secure.
- **CLIENT_SECRET**: The client secret associated with the `CLIENT_ID`. This acts as a password for API authentication. Never expose this value in client-side code or version control.
- **EMBED_ID**: The unique identifier of the dashboard or card you want to embed. You can find this in the Domo platform when configuring your embed.
- **EMBED_TYPE**: Which embed surface to use. Valid values are `dashboard`, `card`, `card-v1` and `app-studio`. Must match the kind of content `EMBED_ID` names — a mismatch is the usual cause of a 404 inside the iframe. `card` selects **card embed v2**; use `card-v1` only if you specifically need the legacy renderer. See [Embed surfaces and card v1 vs v2](#embed-surfaces-and-card-v1-vs-v2).

#### Optional Settings

- **USE_XHR**: Set to `true` to use XMLHttpRequest (XHR) for embedding instead of iframes. This can be useful for advanced embedding scenarios.
- **REPLACE_IFRAME**: Set to `true` to dynamically replace the iframe content during runtime.
- **EMBED_ID{X}**: Additional embed IDs for embedding multiple dashboards or cards. Replace `{X}` with a unique identifier for each additional embed.

#### Domo Everywhere Edit Experience (Optional)

- **IDP_URL**: The Identity Provider URL used for routing and authenticating users. This is typically provided by your Domo administrator.
- **JWT_SECRET**: A secret key used to sign JSON Web Tokens (JWTs). This ensures the integrity and authenticity of the tokens used for user authentication. Keep this value secure and do not share it publicly.
- **KEY_ATTRIBUTE**: The attribute name used for mapping users in Domo Everywhere. This should match the key defined in your Domo instance under Admin > Domo Everywhere > Embed > Mapping.
- **MAPPING_VALUE**: The value associated with the `KEY_ATTRIBUTE` that routes authenticated users to the correct Domo instance. Verify this value matches the target organization in your Domo configuration.

## Usage

To run and test the application, follow these steps:

1. **Start the Server**: In the base folder of the project, run the following command to start the Express server:

   ```bash
   yarn start
   ```

   Alternatively, if using `npm`, run:

   ```bash
   npm start
   ```

2. **Access the Application**: Open your web browser and navigate to `http://localhost:3000` (or the port specified in your `.env` file).

3. **Test with Alternate Ports**: To start the server on a different port, append the `-p` flag followed by the port number. For example:

   ```bash
   yarn start -p 4000
   ```

4. **Verify Embedding**: Ensure that the embedded dashboard or card is displayed correctly. If you encounter issues, check the `.env` configuration and server logs for errors.

## Embed surfaces and card v1 vs v2

| `EMBED_TYPE` | Render URL | Surface |
|---|---|---|
| `dashboard` | `https://public.domo.com/embed/entities/` | A dashboard. Default. |
| `card` | `https://public.domo.com/embed/entities/` | A single card, **v2** — recommended. |
| `app-studio` | `https://public.domo.com/embed/entities/` | An App Studio app. |
| `card-v1` | `https://public.domo.com/cards/` | A single card, legacy v1. |

**One render URL covers everything except card v1.** The path does not select the surface —
the embed id does. `/embed/entities/` is handled by an endpoint that looks up the id and
renders whatever it points at, so the same URL serves dashboards, cards and App Studio apps.
The practical consequence is that a 404 almost always means the *id* is wrong or the content
is not shared, not that the path is wrong.

`/embed/pages/`, `/embed/cards/`, `/embed/dashboards/` and `/embed/app-studio/` are aliases
of that same endpoint and all still work. They are what Domo's own embed dialog currently
hands out, so use them instead if you want the sample to match the URL you see in the
product — note that an App Studio app is handed out under `/embed/pages/`, not
`/embed/app-studio/`, which is a good illustration of why the path is not a reliable
indicator of the surface.

**Card v1 is the one genuine exception** and keeps `/cards/`. It is a different renderer, not
an alias, so it cannot be served from `/embed/entities/` — that path always renders the
current card experience.

**"Dashboard" and "page" are the same surface**, so there is only one type for it:
`dashboard`. (`page` is still accepted as a deprecated alias, as is `card-v2` for `card`, but
prefer the values above.)

Only cards have a v1/v2 split, and this sample defaults to **v2**:

v2 is served by the same backend as dashboard embed, which is why it supports more than v1:

| | v1 (`/cards/`) | v2 (`/embed/cards/`) |
|---|---|---|
| Card types | Chart and DomoApp only | Chart, DomoApp, plus Notebook/Text |
| JS API events received | `/v1/onDrill`, `/v1/onFiltersChange`, `/v1/onFrameSizeChange` | the same, plus `/v1/onAppData` and `/v1/onAppReady` |
| JS API methods you can call | `/v1/filters/apply` | the same, plus `/v1/appData/apply` |
| Appearance parameters | — | `backgroundColor`, `scaleLineColor`, `textColor` |
| Card image endpoint | `GET /cards/{id}.png` | no drop-in equivalent |

The `public/jsapi.js` example in this repo uses only the events both versions support, so it
works either way.

### Things that trip people up

- **The embed-token endpoint does not select the surface or the version.** Domo resolves the
  entity type from the embed id itself, so either token endpoint mints a working token for
  dashboards, cards (v1 and v2) and App Studio apps alike — only the render URL differs.
  (`/v1/dashboards/embed/auth` is an alias for `/v1/stories/embed/auth`; "stories" is legacy
  terminology.)
- **The JS API silently does nothing unless embed authorized domains are configured** for
  your instance. Add `?debug-js-api` to the embed URL to log why it did not initialise.
- **An unrecognised `EMBED_TYPE` now throws at startup** instead of quietly falling back to
  a dashboard, which is what any unmatched value used to do.

## Documentation and Resources

Here are some helpful links to get started and learn more:

- [Domo Developer Portal](https://developer.domo.com/): Official documentation and resources for Domo developers.
- [Authentication Guide](https://developer.domo.com/portal/1845fc11bbe5d-api-authentication): Learn how to create `CLIENT_ID` and `CLIENT_SECRET` for authentication.
- [Domo Everywhere](https://domo-support.domo.com/s/article/6523741250455?language=en_US): Information about embedding and routing users with Domo Everywhere.
- [Node.js](https://nodejs.org/en/): Official Node.js documentation.
- [Yarn](https://yarnpkg.com/): Official Yarn package manager documentation.

### Support

- Please report any bugs, questions, or issues you have with these code samples to Domo Support.
