const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('/Users/gauravgulati/Desktop/socialape-3be06-firebase-adminsdk-k4y2y-dcd2544adb.json')
const config = require('./config')
const app = require('express')();
const firebase = require('firebase')
const helpers = require('./validateHelpers')
firebase.initializeApp(config)

// admin.initializeApp();
// admin w/ credentials for testing locally -- take out credentials to deploy
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-3be06.firebaseio.com"
});

const db = admin.firestore();

// get scream documents 
app.get('/screams', (req,res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = []
            data.forEach((doc) => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err))
})


app.post('/scream', (req, res) => {

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt : new Date().toISOString()
    }

    db
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully `})    
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong'})
            console.error('your errors is', err)
        })
})

// Signup routes
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

    let errors = {};

    if(helpers.isEmpty(newUser.email)) {
        errors.email = 'Must not be empty.'
    } else if(!helpers.isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }

    if(helpers.isEmpty(newUser.password)) errors.password = "Must not be empty";
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Passwords must match";
    if(helpers.isEmpty(newUser.handle)) errors.hanlde = "Must not be empty";

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    //validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then((doc) => {
            if(doc.exists) {
                return res.status(400).json({ hanlde : 'this handle is alraeady taken'})
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken()
        })
        .then((idToken) => {
            token = idToken;
            const userCredenitals = {
                handle : newUser.handle,
                email : newUser.email,
                createdAt : new Date().toISOString(),
                userId : userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredenitals) // create users document in collection of firebase db
        })
        .then(() => {
            return res.status(201).json({ token: token});
        })
        .catch((err) => {
            console.error(err);
            if(err.code === "auth/email-already-in-use") {
                return res.status(400).json({email : "Email already in use."})
            } else {
                return res.status(500).json({error : err.code})
            }
        })
})

app.post('/login', (req,res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {}

    if(helpers.isEmpty(user.email)) errors.email = 'Must not be empty';
    if(helpers.isEmpty(user.password)) errors.password = 'Must not be empty';
      
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return res.json({token: token})
        })
        .catch((err) => {
            console.log(err);
            if(err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again.'})
            }
            else {
                return res.status(500).json({ error: err.code });
            }
        });
})

exports.api = functions.https.onRequest(app);