<div align="center">
  <img src="https://github.com/domoinc/domo-node-sdk/blob/master/domo.png?raw=true" width="400" height="400"/>
</div>

# NodeJS - Private Embed with Programmatic Filtering Example Code
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://www.opensource.org/licenses/MIT)

### About

* Example express server demonstrating private embed with programmatic filtering

### Setup

1. Install nodejs https://nodejs.org/en/download/

2. Install yarn - https://yarnpkg.com/en/docs/install

2. Locate or create the dashboard or card that you would like to embed in Domo.

3. Embed the card or dashboard using the 'Private' Embed option.

4. In the base folder of the repository run yarn to install the necessary dependencies.
   ```
   # yarn
   ```

5. Create a file in the base folder of the project named .env

6. Inside of this file add the following configuration settings but using your own values:
   ```
   CLIENT_ID=YOUR_CLIENT_ID
   CLIENT_SECRET=YOUR_CLIENT_SECRET
   EMBED_ID=YOUR_EMBED_ID
   EMBED_TYPE=dashboard

   # optional settings
   USE_XHR=true
   # these settings are used for optional additional embedded cards that appear on the sample page
   EMBED_ID2=YOUR_EMBED_ID
   EMBED_ID3=YOUR_EMBED_ID
   EMBED_ID4=YOUR_EMBED_ID
   EMBED_ID5=YOUR_EMBED_ID
   ```
 
   The CLIENT_ID and CLIENT_SECRET is used to create the access token which will be used to then create an embed token for use with the private embed.
   For more information about creating the CLIENT_ID and CLIENT_SECRET see https://developer.domo.com/docs/authentication/overview-4.  
   The EMBED_ID references the card or the dashboard you are embedding.  
   The EMBED_TYPE must be either the word 'dashboard' or 'card' (without the quotes).  
   Include the USE_XHR setting only if cookie based authentication won't work for the endpoint you create on your server.  

7. Start the express server like this in the base folder of the project
   ```
   # yarn start
   ```

8. In your browser go to the url localhost:3001 and verify that you are able to see you the card or dashboard appearing there after you login. The available usernames to login with are listed in the express.js file and they are as follows: mike, susan, tom and rachael. The password is not verified and so any will work.

9. Once you have verified your card or dashboard is showing up in the example site, open up the file users.js in a text editor and modify the filter settings for each user to customize the filtering that each user will have applied to them. Currently each user has an empty filter being applied to them "[]". There are some example filters in the file that are commented out that you can use that give you an idea of the format expected for the filters. Once you make filter changes to the users.js file, you will need to save the file, restart the express server, refresh the page, and then log back in to see your filter changes. The complete list of available operators for use in filters are as follows: "IN", "NOT_IN", "EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREAT_THAN_EQUALS_TO", "LESS_THAN", "LESS_THAN_EQUALS_TO".

10. For information on how the javascript api works to both send and receive messages from Domo embedded iframes see the jsapi.js file. To test out the api you can apply a filter to all of the cards by using the forms at the top of the page. You can also click on the charts and see how the code in the jsapi.js file uses events sent from the iframe to route the iframe to a different url including the filters as part of the new url.