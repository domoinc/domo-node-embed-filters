const API_HOST = 'https://api.domo.com';
const EMBED_HOST = 'https://public.domo.com';

module.exports = {
  ACCESS_TOKEN_URL: `${API_HOST}/oauth/token?grant_type=client_credentials&scope=data%20audit%20user%20dashboard`,
  EMBED_TOKEN_URL_DASHBOARD: `${API_HOST}/v1/stories/embed/auth`,
  EMBED_URL_DASHBOARD: `${EMBED_HOST}/embed/pages/`,
  EMBED_TOKEN_URL_CARD: `${API_HOST}/v1/cards/embed/auth`,
  EMBED_URL_CARD: `${EMBED_HOST}/cards/`,
};
