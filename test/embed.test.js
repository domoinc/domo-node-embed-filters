'use strict';
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// Set required env vars before requiring embed.js
process.env.CLIENT_ID = 'test-client-id';
process.env.CLIENT_SECRET = 'test-client-secret';
process.env.EMBED_TYPE = 'dashboard';

const { getAccessToken, getEmbedToken, secondsSinceEpoch } = require('../embed.js');

// A minimal valid JWS token with an exp field and a non-empty emb array.
// Payload: { exp: <far future>, emb: ['dashboard-id'] }
function makeJwsToken(exp, emb = ['dashboard-id']) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ exp, emb })).toString('base64url');
  return `${header}.${payload}.fakesig`;
}

function makeFetchMock(...responses) {
  let i = 0;
  return async () => {
    const res = responses[i++];
    return {
      ok: res.ok !== false,
      status: res.status || 200,
      json: async () => res.body,
    };
  };
}

afterEach(() => {
  global.fetch = undefined;
});

// ---------------------------------------------------------------------------
// getAccessToken
// ---------------------------------------------------------------------------

test('getAccessToken: uses cached token when not expired', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };

  const config = {
    accessToken: 'cached-token',
    accessTokenExpiration: secondsSinceEpoch() + 300,
  };

  await getAccessToken(config);

  assert.equal(fetchCalled, false, 'fetch should not be called for a valid cached token');
  assert.equal(config.accessToken, 'cached-token');
});

test('getAccessToken: fetches new token when cache is empty', async () => {
  global.fetch = makeFetchMock({
    body: { access_token: 'new-token', expires_in: 3600, userId: 'user-1' },
  });

  const config = {};
  await getAccessToken(config);

  assert.equal(config.accessToken, 'new-token');
  assert.equal(config.userId, 'user-1');
  // Should expire ~60s before the token actually expires
  assert.ok(config.accessTokenExpiration > secondsSinceEpoch() + 3500);
  assert.ok(config.accessTokenExpiration < secondsSinceEpoch() + 3600);
});

test('getAccessToken: fetches new token when existing token is expired', async () => {
  global.fetch = makeFetchMock({
    body: { access_token: 'refreshed-token', expires_in: 3600, userId: 'user-1' },
  });

  const config = {
    accessToken: 'old-token',
    accessTokenExpiration: secondsSinceEpoch() - 10, // expired
  };

  await getAccessToken(config);

  assert.equal(config.accessToken, 'refreshed-token');
});

test('getAccessToken: throws on non-ok response', async () => {
  global.fetch = makeFetchMock({ ok: false, status: 401 });

  await assert.rejects(
    () => getAccessToken({}),
    /Access token request failed: 401/,
  );
});

// ---------------------------------------------------------------------------
// getEmbedToken
// ---------------------------------------------------------------------------

test('getEmbedToken: uses cached embed token when not expired', async () => {
  let fetchCalled = false;
  global.fetch = async () => { fetchCalled = true; };

  const config = {
    embedToken: 'cached-embed-token',
    embedTokenExpiration: secondsSinceEpoch() + 300,
  };

  await getEmbedToken(config);

  assert.equal(fetchCalled, false, 'fetch should not be called for a valid cached embed token');
});

test('getEmbedToken: fetches access token then embed token when cache is empty', async () => {
  const futureExp = secondsSinceEpoch() + 1800;
  const embedJwt = makeJwsToken(futureExp + 60);

  global.fetch = makeFetchMock(
    // First call: access token
    { body: { access_token: 'access-tok', expires_in: 3600, userId: 'u1' } },
    // Second call: embed token
    { body: { authentication: embedJwt } },
  );

  const config = { embedId: 'embed-123', filters: [] };
  await getEmbedToken(config);

  assert.equal(config.embedToken, embedJwt);
  assert.ok(config.embedTokenExpiration > secondsSinceEpoch());
});

test('getEmbedToken: re-uses valid access token when fetching embed token', async () => {
  const futureExp = secondsSinceEpoch() + 1800;
  const embedJwt = makeJwsToken(futureExp + 60);

  let callCount = 0;
  global.fetch = async () => {
    callCount++;
    return { ok: true, json: async () => ({ authentication: embedJwt }) };
  };

  const config = {
    embedId: 'embed-123',
    filters: [],
    // Valid cached access token — should not trigger an extra fetch
    accessToken: 'still-valid',
    accessTokenExpiration: secondsSinceEpoch() + 300,
  };

  await getEmbedToken(config);

  assert.equal(callCount, 1, 'only the embed token fetch should occur');
});

test('getEmbedToken: throws when embed token emb field is empty', async () => {
  const futureExp = secondsSinceEpoch() + 1800;
  const embedJwt = makeJwsToken(futureExp + 60, []); // empty emb array

  global.fetch = makeFetchMock(
    { body: { access_token: 'access-tok', expires_in: 3600, userId: 'u1' } },
    { body: { authentication: embedJwt } },
  );

  await assert.rejects(
    () => getEmbedToken({ embedId: 'embed-123', filters: [] }),
    /emb field in the embed token is empty/,
  );
});

test('getEmbedToken: throws on Domo error response', async () => {
  global.fetch = makeFetchMock(
    { body: { access_token: 'access-tok', expires_in: 3600, userId: 'u1' } },
    { body: { error: 'Unauthorized embed ID' } },
  );

  await assert.rejects(
    () => getEmbedToken({ embedId: 'bad-id', filters: [] }),
    /Unauthorized embed ID/,
  );
});
