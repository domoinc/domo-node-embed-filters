require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const fs = require('fs');
const embed = require('./embed.js');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json()); // Parse JSON payloads

const users = require('./users.js');
const yargs = require('yargs');

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'Specify which port to listen on',
    default: 3001,
    type: 'number',
  })
  .help()
  .alias('help', 'h').argv;

// Enable CORS with detailed logging
app.use((req, res, next) => {
  console.log(`CORS Debug: Origin - ${req.headers.origin}, Path - ${req.path}`);
  next();
});

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true, // Enable credentials for cookie support
  }),
);

// Handle pre-flight requests explicitly
app.options('*', cors());

// Allow static file requests explicitly
app.use((req, res, next) => {
  if (!req.headers.origin && req.path.startsWith('/styles.css')) {
    return next();
  }
  next();
});

// Add in the variables for routing to the identity broker
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

function findUser(username, callback) {
  let user = users.find((user) => {
    return user.username === username;
  });
  if (user) {
    return callback(null, user);
  }
  return callback(null);
}

passport.serializeUser(function (user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
  findUser(username, cb);
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    findUser(username, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }),
);

function authenticationMiddleware() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };
}

passport.authenticationMiddleware = authenticationMiddleware;

app.use(
  session({
    // DEMO NOTE: In production, load this secret from an environment variable.
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true, // Create session even if not modified
    name: 'connect.sid', // Keep default Express session cookie name
    cookie: {
      secure: false, // Set to true if using HTTPS
      // httpOnly must be false so the jsapi.js PostMessage bridge can read the
      // session cookie when communicating with the embedded Domo iframe.
      // This is intentional for the demo embedding pattern; set to true in
      // production if the PostMessage flow is handled server-side.
      httpOnly: false,
      sameSite: 'lax', // Change from 'none' to 'lax' for localhost
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

if (
  !process.env.EMBED_ID ||
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.EMBED_TYPE
) {
  console.log(
    'The following variables must be declared in your .env file: EMBED_ID, CLIENT_ID, CLIENT_SECRET, EMBED_TYPE.',
  );
  return;
}

// DEMO NOTE: No rate limiting is applied below. Add express-rate-limit before
// deploying to a shared or production environment.

// New simple token API - no authentication required, accepts embed_id directly
app.get('/api/embed-token/:embedId', (req, res, next) => {
  console.log('Token API: Request for embed ID', req.params.embedId);

  const embedId = req.params.embedId;

  // Basic validation - ensure embedId is provided and looks valid
  if (!embedId || embedId.length < 3) {
    return res.status(400).json({ error: 'Valid embed ID required' });
  }

  // Create a simple config without user-specific data
  const config = {
    embedId: embedId,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    filters: [], // No filters for now
    policies: [], // No policies for now
  };

  embed.handleRequest(req, res, next, config);
});

// Keep the original authenticated endpoint for backwards compatibility
app.get(
  '/embed/items/:itemId',
  passport.authenticationMiddleware(),
  (req, res, next) => {
    const config = req.user.config['visualization' + req.params.itemId];
    if (config.embedId) {
      embed.handleRequest(
        req,
        res,
        next,
        req.user.config['visualization' + req.params.itemId],
      );
    } else {
      next(
        `The EMBED_ID${req.params.itemId} environment variable in your .env file is not set. Please set this in order to view content here.`,
      );
    }
  },
);

app.get(
  '/embed/page',
  passport.authenticationMiddleware(),
  (req, res, next) => {
    embed.showFilters(req, res);
  },
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'));
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
  }),
);

// This section will draw the differnet content based on the user that logs in. It is currently hardcoded embed the platform when samantha logs in, but embed individual cards when anyone else logs in

app.get('/dashboard', passport.authenticationMiddleware(), (req, res, next) => {
  fs.readFile(
    path.join(
      __dirname,
      process.env.USE_XHR === 'true' ? 'sample_xhr.html' : 'sample.html',
    ),
    'utf8',
    function (err, contents) {
      let newContents = contents.replace('USER', `${req.user.username}`);
      newContents = newContents.replace(
        'REPLACE_IFRAME_FROM_ENV',
        process.env.REPLACE_IFRAME,
      );

      if (req.user.username === 'samantha') {
        // Here we generate the URL using the info passed
        const jwtBody = {
          sub: 1,
          name: req.user.username,
          email: req.user.username.concat('@domo.com'),
          jti: uuid.v4(),
        };

        jwtBody[process.env.KEY_ATTRIBUTE] = process.env.MAPPING_VALUE;

        const token = jwt.sign(jwtBody, process.env.JWT_SECRET, {
          expiresIn: '5m',
        });
        const url = process.env.IDP_URL + '/jwt?token=' + token;

        newContents = newContents.replace('/embed/items/1', url);
      }

      res.send(newContents);
    },
  );
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(argv.port, () =>
  console.log(`Example app listening on port ${argv.port}!`),
);
