
require('dotenv').config();
const express = require('express')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const path = require('path');
const fs = require('fs');
const embed = require('./embed.js');
const app = express();
const port = 3001;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: false
}))
const users = require('./users.js');

function findUser (username, callback) {
  user = users.find(user => {
    return user.username === username
  })
  if (user) {
    return callback(null, user)
  }
  return callback(null)
}

passport.serializeUser(function (user, cb) {
  cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
  findUser(username, cb)
})

passport.use(new LocalStrategy(
  function(username, password, done) {
    findUser(username, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }
));

function authenticationMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
}

passport.authenticationMiddleware = authenticationMiddleware;

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())



if (!process.env.EMBED_ID || !process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.EMBED_TYPE ) {
  console.log('The following variables must be declared in your .env file: EMBED_ID, CLIENT_ID, CLIENT_SECRET, EMBED_TYPE.');
  return;
}

app.get('/embed/item/1', passport.authenticationMiddleware(), (req, res, next) => {
  embed.handleRequest(req, res, next, req.user.config.visualization1);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'/login.html'));
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/'
}))


app.get('/dashboard', passport.authenticationMiddleware(), (req, res, next) => {
  fs.readFile(path.join(__dirname, process.env.USE_XHR ? 'sample_xhr.html' : 'sample.html'), 'utf8', function(err, contents) {
    let newContents = contents.replace('USER', `${req.user.username}`);
    res.send(newContents);
  });
});

app.use(express.static('public'))

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
