const functions = require('firebase-functions');
const admin = require('firebase-admin');

// admin.initializeApp();

// Comment Line 5 and Uncomment below to test endpoints locally before deploying -- run 'firebase serve'
const serviceAccount = require('/Users/gauravgulati/Desktop/socialape-3be06-firebase-adminsdk-k4y2y-dcd2544adb.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-3be06.firebaseio.com"
});

const express = require('express');
const app = express();

// get scream documents 
app.get('/screams', (req,res) => {
    admin
        .firestore()
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

    admin
        .firestore()
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

// https://baseurl.com/screams --> bad 
// https://baseurl.com/api/screams --> good

exports.api = functions.https.onRequest(app);