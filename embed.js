const axios = require('axios');
const jws = require('jws');
const {ACCESS_TOKEN_URL, EMBED_TOKEN_URL, EMBED_URL} = require('./constants.js');

function getEmbedToken(req, res, next, config) {
  return new Promise((resolve, reject) => {
    console.log('getting embed token');
    if (config.embedToken && config.embedTokenExpiration && config.embedTokenExpiration > secondsSinceEpoch()) {
      resolve();
    } else {
      console.log('embed token is expired');
      getAccessToken(req, res, next, config).then(() => {
        console.log('creating new embed token');
        axios.post(EMBED_TOKEN_URL,
          { 
            "sessionLength": 1440, 
            "authorizations": [
              {
                "token": config.embedId, 
                "permissions": ["READ", "FILTER", "EXPORT"], 
                "filters": config.filters,
                "policies": config.policies,
                "datasetRedirects": config.datasetRedirects,
                "sqlFilters": config.sqlFilters,
              }
            ]
          },
          {
            headers: {
              'Authorization': 'Bearer ' + config.accessToken,
              'content-type': 'application/json; chartset=utf-8',
              'accept': '*/*'
            }
          })
          .then(function (response) {
            if (response.data.error) {
              console.log(response.data);
              next(Error(response.data.error));
            }
            else {
              config.embedToken = response.data.authentication;
              const decodedToken = jws.decode(config.embedToken);
              if (decodedToken.payload.emb.length === 0) {
                next(Error('The emb field in the embed token is empty. This usually means the user associated with the clientid/clientsecret does not have access to this card.'));
              } else {
                // We'll say it expires 60 seconds before it actually does so that we aren't using an invalid embed token
                config.embedTokenExpiration = decodedToken.payload.exp - 60;
                console.log(`embed token created: valid until ${config.embedTokenExpiration}`);
                resolve();
              }
            }
          }
        )
        .catch(function (error) {
          console.log('error', error);
          next(Error(error));
        })
      });
    }
  });
}

function getAccessToken(req, res, next, config) {
  return new Promise((resolve, reject) => {
    console.log('getting access token');
    if (config.accessToken && config.accessTokenExpiration > secondsSinceEpoch()) {
      console.log(`access token is not expired: still valid for ${config.accessTokenExpiration - secondsSinceEpoch()} seconds`);
      resolve();
    } else {
      console.log('access token is expired');
      console.log('creating new access token');
      axios.get(ACCESS_TOKEN_URL,
      {
        headers: {
          "Authorization": "Basic " + Buffer.from(config.clientId + ":" + config.clientSecret).toString("base64")
        }
      })
      .then(function(response) {
        try {
          // console.log('response for access token is = ', response.data);
          const data = response.data;
          config.userId = data.userId;
          config.accessToken = data.access_token;
          // We'll say it's expired 60 seconds before it actually does to make sure we aren't using an invalid access token.
          config.accessTokenExpiration = Math.floor(Date.now() / 1000) + (data.expires_in - 60);
          console.log('access token created: valid until ' + config.accessTokenExpiration);
          resolve();
        } catch (e) {
          console.log('Exception trying to parse access token response: response = ', response.data, e);
          next('Exception trying to parse access token response: response = ', response.data, e);
        }
      })
      .catch(function (error) {
        console.log('error', error);
        next(Error(error));
      })
    }
  });
}

function secondsSinceEpoch(){ return Math.floor( Date.now() / 1000 ) }

function returnEmbedInfo(req, res, config) {
  console.log('returning embed info');
  if (process.env.USE_XHR) {
    res.send(`{"embedToken": "${config.embedToken}", "embedUrl": "${EMBED_URL}${config.embedId}"}`);
  } else {
    res.send(`
  <html>
    <body>
      <form id="form" action="${EMBED_URL}${config.embedId}?referenceId=${req.params.itemId}" method="post">
        <input type="hidden" name="embedToken" value='${config.embedToken}'>
      </form>
      <script>
        document.getElementById("form").submit();
      </script>
    </body>
  </html>`);
  }
}

function handleRequest(req, res, next, config) {
  getEmbedToken(req, res, next, config).then(() => {
    returnEmbedInfo(req, res, config);
  });
}

function showFilters(req, res) {
  const query = req.query;
  console.log(`query = `, query);
  let message = `Transitioning content based on mouse click for the following filter:`;
  res.send(`
  <html>
    <body>
      <div style="margin: 20px; font-size: 24px; line-height: 30px;">
        ${message}
        <pre id="filters" style="line-height: 20px; font-size: 16px; color: lightslategrey; "></pre>
      </div>
    </body>
    <script>
      const filters = ${req.query.filters};
      const el = document.getElementById("filters"); 
      el.innerText = JSON.stringify(filters, undefined, 4);
   </script>
  </html>
  `);
}

function refreshEmbedToken(req, res, next, config) {
  return getEmbedToken(req, res, next, config);
}

module.exports = {
  handleRequest,
  refreshEmbedToken,
  showFilters,
}
