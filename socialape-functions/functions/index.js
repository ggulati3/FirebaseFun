const functions = require('firebase-functions');

const app = require('express')();

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');

const FBAuth = require('./util/fireBaseAuth');

// Get Scream Documents From Firebase DB
app.get('/screams', getAllScreams);

// Post One Scream
app.post('/scream', FBAuth, postOneScream);

// Signup New User Route
app.post('/signup', signup);

// Login Existing User Route
app.post('/login', login)

exports.api = functions.https.onRequest(app);