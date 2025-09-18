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
- **EMBED_TYPE**: Specifies the type of embed. Valid values include `dashboard`, `card`, or `page`. Ensure this matches the type of content you are embedding.

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

## Documentation and Resources

Here are some helpful links to get started and learn more:

- [Domo Developer Portal](https://developer.domo.com/): Official documentation and resources for Domo developers.
- [Authentication Guide](https://developer.domo.com/portal/1845fc11bbe5d-api-authentication): Learn how to create `CLIENT_ID` and `CLIENT_SECRET` for authentication.
- [Domo Everywhere](https://domo-support.domo.com/s/article/6523741250455?language=en_US): Information about embedding and routing users with Domo Everywhere.
- [Node.js](https://nodejs.org/en/): Official Node.js documentation.
- [Yarn](https://yarnpkg.com/): Official Yarn package manager documentation.

### Support

- Please report any bugs, questions, or issues you have with these code samples to Domo Support.
