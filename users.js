module.exports = [
    {
      username: 'mike',
      config: {
        visualization1: {
          clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET, embedId: process.env.EMBED_ID,
          //filters: [{"column": "Region", "operator": "IN", "values": ["West"]}]
          filters: []
        }, 
      }
    },
    {
      username: 'susan',
      config: {
        visualization1: {
          clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET, embedId: process.env.EMBED_ID,
          //filters: [{"column": "Region", "operator": "IN", "values": ["Northeast"]}]
          filters: []
        },
      }
    },
    {
      username: 'tom',
      config: {
        visualization1: {
          clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET, embedId: process.env.EMBED_ID,
          //filters: [{"column": "Country", "operator": "IN", "values": ["Canada"]}]
          filters: []
        },
      }
    },
    {
      username: 'rachael',
      config: {
        visualization1: {
          clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET, embedId: process.env.EMBED_ID, 
          //filters: [{"column": "Country", "operator": "IN", "values": ["United States"]}]
          filters: []
        },
      }
    }
  ];