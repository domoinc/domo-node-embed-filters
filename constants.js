const API_HOST = 'https://api.domo.com';
const EMBED_HOST = 'https://public.domo.com';

const ACCESS_TOKEN_URL = `${API_HOST}/oauth/token?grant_type=client_credentials&scope=data%20audit%20user%20dashboard`;

// Embed-token endpoints.
//
// These do NOT select the card version. Domo resolves the entity type from the
// embed id itself, so the card endpoint is correct for both card v1 and v2 --
// only the render URL below differs. They are kept separate to match the
// published docs for each surface.
const EMBED_TOKEN_URL_DASHBOARD = `${API_HOST}/v1/stories/embed/auth`;
// `${API_HOST}/v1/dashboards/embed/auth` is an alias for the line above with
// clearer naming; "stories" is legacy terminology for dashboards.
const EMBED_TOKEN_URL_CARD = `${API_HOST}/v1/cards/embed/auth`;

// Render URLs -- the generated form POSTs the embed token to one of these.

// Every surface except card embed v1 is served by a single endpoint that resolves
// the entity type from the embed id, so dashboards, cards (v2) and App Studio apps
// all share one render URL. The `pages`, `cards`, `dashboards` and `app-studio`
// paths are aliases of this same endpoint and are what Domo's own embed dialog
// currently hands out; they continue to work if you prefer to match it.
const EMBED_URL_ENTITIES = `${EMBED_HOST}/embed/entities/`;

// Card embed v1 -- legacy, kept for existing integrations. This is the one surface
// that genuinely needs its own path: it is a different renderer, handling chart and
// DomoApp cards only, with a JS API limited to /v1/onDrill, /v1/onFiltersChange,
// /v1/onFrameSizeChange and /v1/filters/apply. It cannot be served from
// /embed/entities/, which always renders the current card experience.
const EMBED_URL_CARD_V1 = `${EMBED_HOST}/cards/`;

const EMBED_TYPE = (process.env.EMBED_TYPE || 'dashboard').toLowerCase();

let EMBED_TOKEN_URL = EMBED_TOKEN_URL_DASHBOARD;
let EMBED_URL = EMBED_URL_ENTITIES;

switch (EMBED_TYPE) {
    // 'card' means v2. Use 'card-v1' to opt back in to the legacy renderer.
    case 'card':
    case 'card-v2':
        EMBED_TOKEN_URL = EMBED_TOKEN_URL_CARD;
        break;
    case 'card-v1':
        EMBED_TOKEN_URL = EMBED_TOKEN_URL_CARD;
        EMBED_URL = EMBED_URL_CARD_V1;
        break;
    case 'app-studio':
        break;
    // 'page' is a deprecated alias -- a dashboard and a page are the same
    // surface, so there is only one type for it. Prefer 'dashboard'.
    case 'dashboard':
    case 'page':
        break;
    default:
        // Fail loudly rather than silently embedding a dashboard, which is what
        // an unrecognised value used to do.
        throw new Error(
            `Unrecognised EMBED_TYPE "${process.env.EMBED_TYPE}" in your .env file. ` +
            `Valid values are: dashboard, card (v2), card-v1, app-studio.`,
        );
}

module.exports = {
    ACCESS_TOKEN_URL,
    EMBED_TOKEN_URL,
    EMBED_URL,
    EMBED_TYPE,
};
