<div align="center">
  <img src="https://github.com/domoinc/domo-node-sdk/blob/master/domo.png?raw=true" width="400" height="400"/>
</div>

# NodeJS - Private Embed with Programmatic Filtering Example Code
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://www.opensource.org/licenses/MIT)


### Support

* Please report any bugs, questions, or issues you have with these code samples to Domo Support.

### About

* Example express server demonstrating private embed with programmatic filtering

### Setup

1. Install Node (https://nodejs.org/en/download/)

2. Install yarn (https://yarnpkg.com/en/docs/install)

3. Locate or create the dashboard or card that you would like to embed in Domo.

4. Embed the card or dashboard using the 'Private' Embed option.

5. Clone or download this repository.

6. In the base folder of the repository run yarn to install the necessary dependencies.
   ```
   yarn
   ```

7. Modify the existing file in the base folder of the project named `.env`

8. Inside of this file change the following configuration settings but using your own values:
  > [!IMPORTANT]  
  > For this specific app, when setting up your client id and secret, be sure to give your app at least the following **scopes**:
  >   - audit
  >   - data
  >   - dashboard
  >   - user

  ```properties
  # The CLIENT_ID and CLIENT_SECRET is used to create the access token which will be used to then create an embed token for use with the private embed.
  # For more information about creating the CLIENT_ID and CLIENT_SECRET see https://developer.domo.com/docs/authentication/overview-4.  
  CLIENT_ID=YOUR_CLIENT_ID
  CLIENT_SECRET=YOUR_CLIENT_SECRET
  
  # The EMBED_ID references the card or the dashboard you are embedding; it will be some alphanumeric identifier like `K2Okl`. Get it from the embedding dialog box.
  EMBED_ID=YOUR_EMBED_ID
  
  # The EMBED_TYPE must be either the word 'dashboard' or 'card' (without quotes).  
  EMBED_TYPE=dashboard
  
  # Optional Settings
  # -----------------
  # Include the USE_XHR setting only if cookie based authentication won't work for the endpoint you create on your server.
  #USE_XHR=true
  
  # If REPLACE_IFRAME is set to true, when a part of a card chart is clicked, it will cause the iframe to be replaced with a message showing the filter object the click generated otherwise the filters will just be reported via browser console messages.
  #REPLACE_IFRAME=true
  
  # You can include multiple embedded cards or dashboards on the sample dashboard as well by configuring more than one EMBEDID in your .env file (e.g. EMBED_ID2, EMBED_ID3). If you add these, you will need to uncomment their corresponding html in the sample.html file however for this to work and you may want to adjust the specified widths and heights of the embedded content again by modifying the sample.html file.
  #EMBED_ID{X}=YOUR_EMBED_ID
  
  # Optional settings for testing the Domo Everywhere edit experience; routing users to specific instances. For more information on the Edit experience, see here: https://domo-support.domo.com/s/article/6523741250455?language=en_US
  # ---
  # The IDP_URL is the Embed URL for Identity Broker, which is the URL that receives authentication, verifies the user, and routes to the correct place. It is found in your primary Domo instance under Admin -> Domo Everywhere -> Embed -> Routing
  #IDP_URL=HTTPS://YOUR_IDP_URL.domo.com
  
  # The JWT_SECRET is the authentication method for authenticating to the IDP. This value should be kept safe. It is found in your primary Domo instance under Admin -> Domo Everywhere -> Embed -> Routing -> Change Authentication Method to JWT Secret, then click "Generate Secret"
  #JWT_SECRET = YOUR_JWT_SECRET
  
  # The KEY_ATTRIBUTE is the variable name that you pass to denote which user gets routed to which instance. The name is customizable, so this variable name must match the value that is defined in Domo. Verify by looking in Admin -> Domo Everywhre -> Embed -> Mapping and seeing the value in the "Key Attribute" section. The defined value in this variable must match what is listed in Domo.
  #KEY_ATTRIBUTE = keyAttributeName
  
  # The MAPPING_VALUE is the value used to route the authenticated user to the correct Domo isntance. It needs to match the defined value for your target instance as shown in Admin -> Domo Everywhere -> Embed -> Mapping next to the Organization domain you wish to route to, listed in the "Attribute Value" column. 
  #MAPPING_VALUE = XXXXXXXXXXXXXX
  ```
9. Start the express server like this in the base folder of the project
   ```
   yarn start
   ```

    - An alternate port can be specified to start the program on by adding -p number to the end of the yarn start command like this:
      
    ```
    yarn start -p 3002
    ```

10. Open App & Verify Embed
    1. **Open App**
        - In your browser go to the url `localhost:3001`
    1. **Login**
        - The available usernames to login with are listed in the express.js file and they are as follows: mike, susan, tom, rachael, and samantha.
        - The password is not verified and so any will work.
        - Logging in as mike, susan, tom, or rachel will show the embedded card or dashboard as defined in the `.env` file.
        - Logging in as **samantha** will display a **full** embedded Domo **instance**, as defined in the `.env` file.
            - :exclamation: For full instance embed to work, you need to have provided, `JWT_SECRET`,`KEY_ATTRIBUTE`, and `MAPPING_VALUE` in your `.env` file.
    1. **Verify**
        -  Once logged in, your card/dashboard should appear embedded on the page.


11. Try Customizing User-level Filtering
    - Open up the `users.js` file in a text editor and modify the filter settings for each user to customize the filtering that each user will have applied to them.
        - Currently each user has an empty filter, `[]`, being applied to them.
        - There are some example filters in the file that are commented out that you can use that give you an idea of the format expected for the filters.
        - Once you make filter changes to the `users.js` file, you will need to save the file, restart the express server, refresh the page, and then log back in to see your filter changes.
        - The complete list of available operators for use in filters are as follows:
            - "IN"
            - "NOT_IN"
            - "EQUALS"
            - "NOT_EQUALS"
            - "GREATER_THAN"
            - "GREAT_THAN_EQUALS_TO"
            - "LESS_THAN"
            - "LESS_THAN_EQUALS_TO"
    - You can also modify the `MAPPING_VALUE` that is defined to route samantha to a different Organization when that user logs in. 

13. Learn More
    - For information on how the JavaScript API works to both send and receive messages from Domo embedded iframes,  see the `public/jsapi.js` file.
    - To test out the API, you can apply a filter to all of the cards by using the forms at the top of the app page.
    - You can also click on the charts and see how the code in the `jsapi.js` file uses procedure calls sent from the iframe to route the iframe to a different url including the filters as part of the new url. 
