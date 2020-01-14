## Example express server showing how private embed with programmatic filtering works

### Installation

1. Install nodejs https://nodejs.org/en/download/
2. Install yarn - https://yarnpkg.com/en/docs/install


### Setup

1. Locate or create the dashboard or card that you would like to embed in Domo.

2. Embed the card or dashboard using the 'Private' Embed option.

3. In the root of the repository run yarn to install the necessary dependencies.
   ```
   # cd programmatic-filtering-example-using-xhr-master
   # yarn
   ```

4. Create a file in the root of the project named .env

5. Inside of this file add the following configuration settings but using your own values:
   ```
   CLIENT_ID=e2c2f94D-2472-4Ec5-bfb7-0ff22207a5ba
   CLIENT_SECRET=9a6a04b8f65ab3f26e1f8ce812dc55071619cea90a34874a06d09675c43beeee
   EMBED_ID=bMV5b
   EMBED_TYPE=dashboard

   # optional settings
   USE_XHR=true
   ```
 
   The CLIENT_ID and CLIENT_SECRET is used to create the access token which will be used to then create an embed token for use with the private embed.
   For more information about creating the CLIENT_ID and CLIENT_SECRET see https://developer.domo.com/docs/authentication/overview-4.
   The EMBED_ID represents the public or private identifier for either the card or the dashboard depending on what you are embedding.
   The EMBED_TYPE must be either the word 'dashboard' or 'card' (without the quotes).
   Include the USE_XHR setting only if cookie based authentication won't work for then endpoint you create on your server. 

6. Start the express server like this in the root of the project
   ```
   # yarn start
   ```

7. In your browser go to the url localhost:3001 and verify that you are able to see you the card or dashboard appearing there after you login. The available usernames to login with are listed in the express.js file and they are as follows: mike, susan, tom and rachael. The password is not verified and so any will work.

8. Once you have verified your card or dashboard is showing up in the example site, open up the file users.js in a text editor and modify the filter settings for each user to customize the filtering that each user will have applied to them. Currently each user has an empty filter being applied to them "[]". There are some example filters in the file that are commented out that you can use that give you an idea of the format expected for the filters. Once you make filter changes to the users.js file, you will need to save the file, restart the express server, refresh the page, and then log back in to see your filter changes. The complete list of available operators for use in filters are as follows: "IN", "NOT_IN", "EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREAT_THAN_EQUALS_TO", "LESS_THAN", "LESS_THAN_EQUALS_TO".
