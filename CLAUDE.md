# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js Express demonstration application showing how to implement Domo private embedding with programmatic filtering. The app uses OAuth2 for Domo API authentication, generates secure embed tokens, and demonstrates two-way communication between parent pages and embedded Domo content via MessageChannel postMessage API.

## Development Commands

```bash
# Install dependencies (use Yarn, as project has yarn.lock)
yarn install

# Start development server (default port 3001)
yarn start

# Start on custom port
yarn start -p 4000

# Alternative using npm (though Yarn is preferred)
npm start
```

**Note**: This repository has no test suite, linting, or build process configured.

## Configuration

Required `.env` file (copy from `.env.example`):
- `CLIENT_ID` / `CLIENT_SECRET`: Domo OAuth credentials from developer account
- `EMBED_ID`: Dashboard/card/page ID to embed
- `EMBED_TYPE`: One of `dashboard`, `card`, or `page`

Optional settings:
- `USE_XHR=true`: Switches from standard iframe to XHR-based embedding (serves `sample_xhr.html` instead of `sample.html`)
- `REPLACE_IFRAME=true`: Dynamically replaces iframe src on filter changes
- `EMBED_ID2-6`: Additional embed IDs for multi-item embeds
- `IDP_URL`, `JWT_SECRET`, `KEY_ATTRIBUTE`, `MAPPING_VALUE`: Domo Everywhere identity broker configuration

## Architecture

### Entry Point & Flow
- Entry: `scripts/start` → runs `node express.js`
- Default port: 3001 (configurable via `-p` flag)
- Flow: Login (`login.html`) → Passport auth → Dashboard (`sample.html` or `sample_xhr.html`) → Embedded Domo content

### Key Files & Responsibilities

**Server Layer**:
- `express.js`: Main Express server, routes, session management, authentication middleware
- `embed.js`: Token lifecycle management (OAuth access tokens + embed tokens with caching)
- `constants.js`: Domo API endpoint definitions
- `users.js`: Hardcoded user database with per-user embed configs and filter rules

**Client Layer**:
- `public/jsapi.js`: **Core PostMessage API** - Establishes MessageChannel communication between parent page and embedded iframe for bidirectional filter/drill events
- `public/clientScript.js`: XHR-based embedding helper (used when `USE_XHR=true`)
- `login.html`: Login page
- `sample.html`: Standard iframe embedding example
- `sample_xhr.html`: XHR-based embedding example

### Token Generation Flow

1. **getAccessToken()** (embed.js)
   - Uses CLIENT_ID:CLIENT_SECRET (Basic Auth)
   - Calls: `https://api.domo.com/oauth/token`
   - Returns: `access_token` (cached with expiration tracking)

2. **getEmbedToken()** (embed.js)
   - Uses access_token from step 1
   - Calls: `/v1/stories/embed/auth` (dashboard) or `/v1/cards/embed/auth` (card)
   - Payload includes: sessionLength, filters, policies, datasetRedirects
   - Returns: JWT embed token (cached with 60-second expiration buffer)

3. **Token Refresh Logic**
   - Access tokens auto-refresh when expired
   - Embed tokens regenerated per request or when cached token expires

### PostMessage Communication (jsapi.js)

**Architecture**: Uses MessageChannel for secure cross-origin iframe ↔ parent communication

**RPC Methods from Domo** (received by parent):
- `/v1/onDrill`: User drills into data → receives filters array
- `/v1/onFiltersChange`: Dashboard filters changed → receives filters array
- `/v1/onFrameSizeChange`: Iframe dimensions change → receives width/height

**Filter Application** (sent to Domo):
- Method: `/v1/filters/apply`
- Payload: `{ filters: [{column, operand, values}] }`

**Filter Format** (simplified for PostMessage API):
```javascript
{
  column: "Region",
  operand: "IN",  // Note: Can be "operand" or "operator" depending on context
  values: ["Northeast", "West"]
}
```

**Complete Filter Format** (for iframe URL `analyzer` parameter):
```javascript
{
  column: "Colony Code",
  operand: "IN",
  values: ["Kalvari Nagar"],
  dataType: "string",           // Data type of the column
  label: "Colony Code",          // Display label
  key: "Colony Code:",           // Filter key identifier
  dataSourceId: "6fc864a0-62d9-47be-9ec2-3faba7cd514d"  // Dataset ID
}
```

When filters are applied via iframe src updates, they're passed as a URL-encoded JSON array in the `analyzer` query parameter:
```
https://{embed-id}.domoapps.prod2.domo.com/?analyzer=[{...filter objects...}]&userId=...&userEmail=...
```

### Embedding Methods

1. **Standard iframe** (`sample.html`): Server returns HTML form that POSTs embedToken to Domo
2. **XHR-based** (`sample_xhr.html`): Client fetches `{embedToken, embedUrl}` JSON, dynamically injects iframe with srcdoc

### Authentication

- **Strategy**: Passport LocalStrategy (username-only, no password validation)
- **Session Store**: In-memory (not production-ready)
- **Cookie Settings**: `httpOnly: false`, `sameSite: 'lax'` for localhost compatibility
- **Sample Users**: mike, susan, tom, rachael, samantha (in users.js)
- **Special User**: "samantha" redirects to IDP_URL with JWT for Domo Everywhere edit experience

### API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | None | Login page |
| POST | `/login` | Passport | Authenticate user |
| GET | `/dashboard` | Required | Serves sample.html or sample_xhr.html |
| GET | `/embed/items/:itemId` | Required | Returns embed token (iframe form HTML) |
| GET | `/embed/page` | Required | Shows applied filters |
| GET | `/api/embed-token/:embedId` | None | Get embed token without auth |
| GET | `/logout` | Required | Destroy session |

### Important Implementation Details

**Per-User Filtering**:
- Each user in `users.js` has a `config` object with embed IDs and filter arrays
- Filters are embedded in the token payload during `getEmbedToken()` call
- This applies **data-level** filtering (different from UI-level PostMessage filters)

**Dynamic Iframe Replacement**:
- When `EMBED_TYPE=dashboard` and user drills/filters change:
  - jsapi.js detects filter change and updates iframe src: `/embed/items/1?filters={JSON}`
  - Server parses filters from query string
  - Server **regenerates embed token with new filters in the authorization payload** (not URL parameters)
  - Embed token includes filters at: `authorizations[0].filters = [dynamic filters]`
  - Dashboard reloads with new token that has filters baked in server-side
- **Cards**: Handled automatically by Domo platform, no reload needed

**CORS**:
- Enabled for localhost:3000 and localhost:3001
- Allows cross-origin requests during development

## Common Modifications

**Adding a new embed**:
1. Set `EMBED_IDX` in .env (e.g., `EMBED_ID4=12345`)
2. Add corresponding entry to user config in users.js
3. Reference in UI via itemId parameter

**Modifying filters**:
- **Server-side**: Update filter arrays in users.js config objects
- **Client-side**: Call `jsapi.applyFilters(filters)` from parent page

**Switching embedding mode**:
- Set `USE_XHR=true` in .env to use XHR-based embedding
- Set `USE_XHR=false` for standard iframe embedding

## Security Considerations

- CLIENT_SECRET must stay in .env (never commit to git)
- Sessions use in-memory store (not suitable for production multi-instance deployments)
- MessageChannel prevents unauthorized iframe communication
- Token caching reduces API calls but requires proper expiration handling
