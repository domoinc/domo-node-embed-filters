const jws = require('jws');
const {
  ACCESS_TOKEN_URL,
  EMBED_TOKEN_URL_DASHBOARD,
  EMBED_TOKEN_URL_CARD,
  EMBED_URL_DASHBOARD,
  EMBED_URL_CARD,
} = require('./constants.js');

function secondsSinceEpoch() {
  return Math.floor(Date.now() / 1000);
}

function convertToLocalTimestamp(seconds) {
  return new Date(seconds * 1000).toLocaleString();
}

function getEmbedUrls() {
  const isCard = process.env.EMBED_TYPE === 'card';
  return {
    embedTokenUrl: isCard ? EMBED_TOKEN_URL_CARD : EMBED_TOKEN_URL_DASHBOARD,
    embedUrl: isCard ? EMBED_URL_CARD : EMBED_URL_DASHBOARD,
  };
}

// Fetches and caches a Domo OAuth access token on the config object.
// CLIENT_ID and CLIENT_SECRET are service-account credentials shared across
// all users — they are not per-user and should never appear in user config.
async function getAccessToken(config) {
  if (config.accessToken && config.accessTokenExpiration > secondsSinceEpoch()) {
    console.log(
      `access token valid for ${config.accessTokenExpiration - secondsSinceEpoch()} more seconds`,
    );
    return;
  }

  console.log('fetching new access token');
  const response = await fetch(ACCESS_TOKEN_URL, {
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
        ).toString('base64'),
    },
  });

  if (!response.ok) {
    throw new Error(`Access token request failed: ${response.status}`);
  }

  const data = await response.json();
  config.accessToken = data.access_token;
  config.userId = data.userId;
  // Expire 60 seconds early to avoid using a token right as it expires
  config.accessTokenExpiration = secondsSinceEpoch() + data.expires_in - 60;
  console.log(`access token created: valid until ${convertToLocalTimestamp(config.accessTokenExpiration)}`);
}

// Fetches and caches a Domo embed token on the config object.
// The filters array here is the row-level security boundary — it controls
// what data the embedded user can see and cannot be overridden by the client.
async function getEmbedToken(config) {
  if (
    config.embedToken &&
    config.embedTokenExpiration &&
    config.embedTokenExpiration > secondsSinceEpoch()
  ) {
    return;
  }

  console.log('embed token expired or missing, refreshing');
  await getAccessToken(config);

  const { embedTokenUrl } = getEmbedUrls();

  const response = await fetch(embedTokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionLength: 1440,
      authorizations: [
        {
          token: config.embedId,
          permissions: ['READ', 'FILTER', 'EXPORT'],
          filters: config.filters,
          policies: config.policies,
          datasetRedirects: config.datasetRedirects,
          sqlFilters: config.sqlFilters,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Embed token request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  config.embedToken = data.authentication;
  const decoded = jws.decode(config.embedToken);
  const payload = typeof decoded.payload === 'string'
    ? JSON.parse(decoded.payload)
    : decoded.payload;

  if (!payload.emb || payload.emb.length === 0) {
    throw new Error(
      'The emb field in the embed token is empty. The service account may not have access to this content.',
    );
  }

  // Expire 60 seconds early to avoid serving a token right as it expires
  config.embedTokenExpiration = payload.exp - 60;
  console.log(`embed token created: valid until ${convertToLocalTimestamp(config.embedTokenExpiration)}`);
}

function returnEmbedInfo(req, res, config) {
  const { embedUrl } = getEmbedUrls();

  if (process.env.USE_XHR === 'true') {
    res.json({ embedToken: config.embedToken, embedUrl: `${embedUrl}${config.embedId}` });
  } else {
    // referenceId is an integer item index — coerce to avoid injection
    const referenceId = parseInt(req.params.itemId, 10) || '';
    res.send(`
<html>
  <body>
    <form id="form" action="${embedUrl}${config.embedId}?referenceId=${referenceId}" method="post">
      <input type="hidden" name="embedToken" value="${config.embedToken}">
    </form>
    <script>document.getElementById("form").submit();</script>
  </body>
</html>`);
  }
}

async function handleRequest(req, res, next, config) {
  try {
    await getEmbedToken(config);
    returnEmbedInfo(req, res, config);
  } catch (err) {
    next(err);
  }
}

function showFilters(req, res) {
  // Parse server-side so untrusted input never lands raw in a script block
  let filtersData;
  try {
    filtersData = JSON.parse(req.query.filters || '[]');
  } catch (e) {
    filtersData = [];
  }

  res.send(`
<html>
  <body>
    <div style="margin: 20px; font-size: 24px; line-height: 30px;">
      Transitioning content based on filter selection:
      <pre id="filters" style="line-height: 20px; font-size: 16px; color: lightslategrey;"></pre>
    </div>
  </body>
  <script>
    const filters = ${JSON.stringify(filtersData)};
    document.getElementById("filters").innerText = JSON.stringify(filters, undefined, 4);
  </script>
</html>`);
}

module.exports = {
  handleRequest,
  showFilters,
  // Exported for testing
  getAccessToken,
  getEmbedToken,
  secondsSinceEpoch,
};
