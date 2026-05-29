// Per-user embed configuration. Each user maps to one or more visualizations.
// clientId and clientSecret are service-account credentials loaded from the
// environment in embed.js — they are intentionally absent here because they
// are the same for every user and are not part of the per-user security model.
//
// The filters array IS the per-user security boundary: it enforces row-level
// access control in the embed token and cannot be overridden by the client.
module.exports = [
  {
    username: 'mike',
    config: {
      visualization1: {
        embedId: process.env.EMBED_ID,
        filters: [{ column: 'client_company', operator: 'IN', values: ['Nimbus Forge'] }],
      },
      visualization2: { embedId: process.env.EMBED_ID2 },
      visualization3: { embedId: process.env.EMBED_ID3 },
      visualization4: { embedId: process.env.EMBED_ID4 },
      visualization5: { embedId: process.env.EMBED_ID5 },
      visualization6: { embedId: process.env.EMBED_ID6 },
    },
  },
  {
    username: 'susan',
    config: {
      visualization1: {
        embedId: process.env.EMBED_ID,
        // Example: restrict to a single region
        // filters: [{ column: 'Region', operator: 'IN', values: ['Northeast'] }],
        filters: [],
      },
    },
  },
  {
    username: 'tom',
    config: {
      visualization1: {
        embedId: process.env.EMBED_ID,
        // Example: restrict to a single country
        // filters: [{ column: 'Country', operator: 'IN', values: ['Canada'] }],
        filters: [],
      },
    },
  },
  {
    username: 'rachael',
    config: {
      visualization1: {
        embedId: process.env.EMBED_ID,
        // Example: restrict to a single country
        // filters: [{ column: 'Country', operator: 'IN', values: ['United States'] }],
        filters: [],
      },
    },
  },
  {
    username: 'samantha',
    config: {
      visualization1: {
        embedId: process.env.EMBED_ID,
        filters: [],
      },
    },
  },
];
